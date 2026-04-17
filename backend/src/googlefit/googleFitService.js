const axios = require("axios");
const UserToken = require("../models/UserToken");

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_FIT_AGG_URL = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate";

const SCOPES = [
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.oxygen_saturation.read",
  "https://www.googleapis.com/auth/fitness.body.read",
  "profile",
  "email",
];

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const LIVE_WINDOW_MS = 24 * 60 * 60 * 1000; // Look back up to 24 hours to find the latest synced reading
const LIVE_BUCKET_MS = 60 * 60 * 1000; // Group data in 1-hour buckets for payload efficiency

function getStartOfTodayMillis() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start.getTime();
}

function buildGoogleAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES.join(" "),
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

async function exchangeCodeForTokens(code) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const response = await axios.post(GOOGLE_TOKEN_URL, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return response.data;
}

async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await axios.post(GOOGLE_TOKEN_URL, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return response.data;
}

async function getValidAccessToken(userId) {
  const tokenDoc = await UserToken.findOne({ userId });

  if (!tokenDoc) {
    throw new Error("No token found for user. Please complete Google login first.");
  }

  const now = Date.now();
  const expiry = new Date(tokenDoc.tokenExpiryDate).getTime();

  if (expiry - now > 60 * 1000) {
    return tokenDoc.accessToken;
  }

  const refreshed = await refreshAccessToken(tokenDoc.refreshToken);
  tokenDoc.accessToken = refreshed.access_token;
  tokenDoc.tokenExpiryDate = new Date(now + (refreshed.expires_in || 3600) * 1000);
  await tokenDoc.save();

  return tokenDoc.accessToken;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getMetricKind(dataset = {}, point = {}) {
  const source = `${dataset.dataSourceId || ""} ${point.dataTypeName || ""}`.toLowerCase();
  if (source.includes("step_count")) return "steps";
  if (source.includes("heart_rate") || source.includes("bpm")) return "heartRate";
  if (source.includes("oxygen_saturation") || source.includes("spo2") || source.includes("oxygen")) return "oxygenSaturation";
  if (source.includes("respiratory") || source.includes("breathing")) return "respiratoryRate";
  return "unknown";
}

function normalizeSpO2(rawValue) {
  const safe = toNumber(rawValue);
  if (safe <= 0) return 0;
  const normalized = safe <= 1 ? safe * 100 : safe;
  return Math.max(0, Math.min(100, normalized));
}

function parseAggregateResponse(aggResponse = {}) {
  let totalSteps = 0;
  const heartRatePoints = [];
  const oxygenPoints = [];
  const respiratoryRatePoints = [];
  let latestTimestampMs = 0;

  const buckets = Array.isArray(aggResponse.bucket) ? aggResponse.bucket : [];

  for (const bucket of buckets) {
    const bucketEndMs = toNumber(bucket.endTimeMillis);
    latestTimestampMs = Math.max(latestTimestampMs, bucketEndMs);

    const datasets = Array.isArray(bucket.dataset) ? bucket.dataset : [];
    for (const dataset of datasets) {
      const points = Array.isArray(dataset.point) ? dataset.point : [];
      for (const point of points) {
        const kind = getMetricKind(dataset, point);
        const values = Array.isArray(point.value) ? point.value : [];
        const pointTimestampMs = toNumber(point.endTimeNanos) / 1e6 || bucketEndMs;
        latestTimestampMs = Math.max(latestTimestampMs, pointTimestampMs);

        for (const value of values) {
          if (kind === "steps") {
            totalSteps += toNumber(value.intVal ?? value.fpVal ?? 0);
          }
          if (kind === "heartRate") {
            const safeHr = toNumber(value.fpVal ?? value.intVal ?? 0);
            if (safeHr > 0) heartRatePoints.push({ value: safeHr, timestamp: pointTimestampMs });
          }
          if (kind === "oxygenSaturation") {
            const spO2Value = normalizeSpO2(value.fpVal ?? value.intVal ?? 0);
            if (spO2Value > 0) oxygenPoints.push({ value: spO2Value, timestamp: pointTimestampMs });
          }
          if (kind === "respiratoryRate") {
            const rrValue = toNumber(value.fpVal ?? value.intVal ?? 0);
            if (rrValue > 0) respiratoryRatePoints.push({ value: rrValue, timestamp: pointTimestampMs });
          }
        }
      }
    }
  }

  const latestHeartRate = heartRatePoints.length
    ? heartRatePoints.reduce((l, c) => (c.timestamp > l.timestamp ? c : l)).value : 0;
  const averageHeartRate = heartRatePoints.length
    ? Math.round(heartRatePoints.reduce((s, i) => s + i.value, 0) / heartRatePoints.length) : 0;
  const resolvedHeartRate = latestHeartRate || averageHeartRate;

  const latestSpO2 = oxygenPoints.length
    ? oxygenPoints.reduce((l, c) => (c.timestamp > l.timestamp ? c : l)).value : 0;
  const latestRespiratoryRate = respiratoryRatePoints.length
    ? respiratoryRatePoints.reduce((l, c) => (c.timestamp > l.timestamp ? c : l)).value : 0;

  return {
    steps: Math.max(0, Math.round(totalSteps)),
    heartRate: Math.max(0, Math.round(resolvedHeartRate)),
    oxygenSaturation: Math.round(latestSpO2),
    respiratoryRate: Math.round(latestRespiratoryRate),
    timestamp: latestTimestampMs ? new Date(latestTimestampMs) : new Date(),
  };
}

function buildAggregateBody() {
  const endTimeMillis = Date.now();
  const startTimeMillis = endTimeMillis - LIVE_WINDOW_MS;

  return {
    aggregateBy: [
      { dataTypeName: "com.google.step_count.delta" },
      { dataTypeName: "com.google.heart_rate.bpm" },
      { dataTypeName: "com.google.oxygen_saturation" }
    ],
    bucketByTime: { durationMillis: LIVE_BUCKET_MS },
    startTimeMillis,
    endTimeMillis,
  };
}

async function fetchGoogleFitData(accessToken) {
  const body = buildAggregateBody();
  const response = await axios.post(GOOGLE_FIT_AGG_URL, body, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  console.log("[GoogleFit] Raw aggregate response:", JSON.stringify(response.data, null, 2));
  return parseAggregateResponse(response.data);
}

async function getTodaySteps(accessToken) {
  const startTimeMillis = getStartOfTodayMillis();
  const endTimeMillis = Date.now();

  const body = {
    aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
    bucketByTime: { durationMillis: ONE_DAY_MS },
    startTimeMillis,
    endTimeMillis,
  };

  const response = await axios.post(GOOGLE_FIT_AGG_URL, body, {
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
  });

  const buckets = Array.isArray(response.data?.bucket) ? response.data.bucket : [];
  const firstBucket = buckets[0] || {};
  const datasets = Array.isArray(firstBucket.dataset) ? firstBucket.dataset : [];

  const datasetTotals = datasets.map((dataset) => {
    const dataSourceId = String(dataset?.dataSourceId || "");
    const points = Array.isArray(dataset?.point) ? dataset.point : [];
    const total = points.reduce((sum, point) => {
      const values = Array.isArray(point?.value) ? point.value : [];
      return sum + values.reduce((acc, v) => acc + toNumber(v?.intVal ?? v?.fpVal ?? 0), 0);
    }, 0);
    return { dataSourceId, total, isMergedDerived: dataSourceId.includes("merge_step_deltas") };
  });

  const mergedDerived = datasetTotals.find((item) => item.isMergedDerived);
  const maxTotal = datasetTotals.reduce((max, item) => Math.max(max, item.total), 0);
  return { steps: Math.max(0, Math.round(mergedDerived?.total ?? maxTotal)) };
}

async function fetchAggregatedHealthData(userId) {
  const accessToken = await getValidAccessToken(userId);
  const data = await fetchGoogleFitData(accessToken);
  
  try {
    // Explicitly pull steps from midnight today to override the 24h rolling window sum
    const stepsData = await getTodaySteps(accessToken);
    if (stepsData && stepsData.steps) {
      data.steps = stepsData.steps;
    }
  } catch (err) {
    console.warn(`[GoogleFit] exact daily steps fetch failed, using rolling 24h sum: ${err.message}`);
  }
  
  return data;
}

function generateMockData() {
  return {
    heartRate: Math.floor(65 + Math.random() * 35),
    steps: Math.floor(20 + Math.random() * 120),
    oxygenSaturation: Math.floor(95 + Math.random() * 5),
    respiratoryRate: Math.floor(12 + Math.random() * 7),
    timestamp: new Date(),
  };
}

async function isUserConnected(userId) {
  const token = await UserToken.findOne({ userId });
  return !!token;
}

module.exports = {
  SCOPES,
  buildGoogleAuthUrl,
  exchangeCodeForTokens,
  getValidAccessToken,
  fetchGoogleFitData,
  getTodaySteps,
  fetchAggregatedHealthData,
  generateMockData,
  isUserConnected,
};
