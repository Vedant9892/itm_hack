const express = require("express");
const axios = require("axios");
const HealthData = require("../models/HealthData");
const { getTodaySteps, getValidAccessToken, isUserConnected } = require("./googleFitService");

const router = express.Router();

// GET /api/googlefit/data/latest
router.get("/latest", async (req, res) => {
  try {
    const userId = req.query.userId || "default-user";
    const latest = await HealthData.findOne({ userId }).sort({ timestamp: -1 });
    if (!latest) return res.json({ message: "No data available yet", data: null });
    return res.json({ data: latest });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/googlefit/data/history
router.get("/history", async (req, res) => {
  try {
    const userId = req.query.userId || "default-user";
    const limit = Number(req.query.limit || 50);
    const history = await HealthData.find({ userId }).sort({ timestamp: -1 }).limit(limit);
    return res.json({ count: history.length, data: history.reverse() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/googlefit/data/summary/today
router.get("/summary/today", async (req, res) => {
  try {
    const userId = req.query.userId || "default-user";
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const todayData = await HealthData.find({ userId, timestamp: { $gte: start } });

    let totalSteps = 0;
    try {
      const accessToken = await getValidAccessToken(userId);
      const fitSteps = await getTodaySteps(accessToken);
      totalSteps = fitSteps.steps;
    } catch {
      const latestLocal = todayData.reduce((latest, item) => {
        if (!latest) return item;
        return new Date(item.timestamp) > new Date(latest.timestamp) ? item : latest;
      }, null);
      totalSteps = latestLocal?.steps || 0;
    }

    if (!todayData.length) {
      return res.json({ avgHeartRate: 0, maxHeartRate: 0, totalSteps, records: 0 });
    }

    const heartRates = todayData.map((item) => item.heartRate || 0).filter(Boolean);
    const avgHeartRate = heartRates.length
      ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
      : 0;
    const maxHeartRate = heartRates.length ? Math.max(...heartRates) : 0;

    return res.json({ avgHeartRate, maxHeartRate, totalSteps, records: todayData.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/googlefit/data/status
router.get("/status", async (req, res) => {
  try {
    const connected = await isUserConnected("default-user");
    return res.json({ connected });
  } catch (err) {
    return res.json({ connected: false });
  }
});

// POST /api/googlefit/data/stress
// Gathers real Google Fit biometrics → sends to n8n stress-calc webhook → returns result
router.post("/stress", async (req, res) => {
  const userId = req.body.userId || "default-user";
  const webhookUrl = process.env.N8N_STRESS_WEBHOOK || "http://localhost:5678/webhook/stress-calc";

  try {
    // 1. Pull today's records from MongoDB
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const todayData = await HealthData.find({ userId, timestamp: { $gte: start } });
    const allData = await HealthData.find({ userId }).sort({ timestamp: -1 }).limit(100);

    // 2. Avg Heart Rate (today, or fall back to latest reading)
    const heartRates = todayData.map((d) => d.heartRate || 0).filter(Boolean);
    const avg_heart_rate = heartRates.length
      ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
      : allData.find((d) => d.heartRate)?.heartRate || 75;

    // 3. Resting HR = lowest HR of the day as a proxy
    const resting_heart_rate = heartRates.length
      ? Math.min(...heartRates)
      : Math.round(avg_heart_rate * 0.75);

    // 4. Steps via Google Fit API directly (most accurate)
    let total_steps = 0;
    try {
      const accessToken = await getValidAccessToken(userId);
      const stepsData = await getTodaySteps(accessToken);
      total_steps = stepsData.steps;
    } catch {
      const latest = todayData.reduce((l, c) =>
        !l || new Date(c.timestamp) > new Date(l.timestamp) ? c : l, null);
      total_steps = latest?.steps || 0;
    }

    // 5. Activity level derived from steps
    let activity_level = "low";
    if (total_steps > 8000) activity_level = "high";
    else if (total_steps > 4000) activity_level = "moderate";

    // 6. Build n8n payload matching watch.json schema
    const n8nPayload = {
      avg_heart_rate,
      resting_heart_rate,
      total_steps,
      activity_level,
      avg_sleep_duration: req.body.avg_sleep_duration || 420, // Google Fit doesn't expose sleep via this API
    };

    console.log("[Stress] → n8n payload:", n8nPayload);

    // 7. POST to n8n
    const n8nRes = await axios.post(webhookUrl, n8nPayload, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    console.log("[Stress] ← n8n result:", n8nRes.data);

    return res.json({ success: true, input: n8nPayload, result: n8nRes.data });

  } catch (err) {
    console.error("[Stress] Error calling n8n:", err.message);

    // Fallback: run the same algorithm locally (mirrors watch.json Compute Stress node)
    const todayData = await HealthData.find({ userId, timestamp: { $gte: (() => { const s = new Date(); s.setHours(0,0,0,0); return s; })() } }).catch(() => []);
    const allData = await HealthData.find({ userId }).sort({ timestamp: -1 }).limit(10).catch(() => []);

    const heartRates = todayData.map((d) => d.heartRate || 0).filter(Boolean);
    const hr = heartRates.length
      ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
      : allData.find((d) => d.heartRate)?.heartRate || 75;
    const rhr = heartRates.length ? Math.min(...heartRates) : Math.round(hr * 0.75);
    const latest = todayData.reduce((l, c) => !l || new Date(c.timestamp) > new Date(l.timestamp) ? c : l, null);
    const steps = latest?.steps || 0;
    const sleep = 420;
    const activity = steps > 8000 ? "high" : steps > 4000 ? "moderate" : "low";

    let stressScore = 0;
    const hrRatio = hr / rhr;
    if (hrRatio >= 1.6) stressScore += 45;
    else if (hrRatio >= 1.3) stressScore += 30;
    else if (hrRatio >= 1.1) stressScore += 15;
    else stressScore += 5;
    if (sleep < 240) stressScore += 30;
    else if (sleep < 360) stressScore += 20;
    else if (sleep < 420) stressScore += 10;
    if (activity === "high") stressScore -= 10;
    else if (activity === "moderate") stressScore -= 5;
    else stressScore += 15;
    if (steps < 2000) stressScore += 15;
    else if (steps < 5000) stressScore += 10;
    stressScore = Math.max(0, Math.min(100, Math.round(stressScore)));

    let level = "low";
    let recommendation = "You are maintaining a good balance. Keep it up.";
    if (stressScore > 75) { level = "high"; recommendation = "High stress detected. Take a break, hydrate, and try breathing exercises."; }
    else if (stressScore > 45) { level = "moderate"; recommendation = "Moderate stress. A short walk or relaxation may help."; }

    return res.json({
      success: false,
      n8n_error: err.message,
      input: { avg_heart_rate: hr, resting_heart_rate: rhr, total_steps: steps, activity_level: activity },
      result: { success: true, stress_score: stressScore, stress_level: level, recommendation },
    });
  }
});

module.exports = router;
