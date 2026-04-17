const cron = require("node-cron");
const HealthData = require("../models/HealthData");
const UserToken = require("../models/UserToken");
const { fetchAggregatedHealthData, generateMockData } = require("./googleFitService");

async function fetchAndStoreForUser(userId) {
  try {
    const payload = await fetchAggregatedHealthData(userId);

    const doc = await HealthData.create({
      userId,
      heartRate: payload.heartRate,
      oxygenSaturation: payload.oxygenSaturation,
      respiratoryRate: payload.respiratoryRate,
      steps: payload.steps,
      timestamp: payload.timestamp,
      source: "google_fit",
    });

    console.log(`[GoogleFit Poller] Stored data for ${userId}:`, {
      heartRate: doc.heartRate,
      steps: doc.steps,
      oxygenSaturation: doc.oxygenSaturation,
    });
    return doc;
  } catch (error) {
    console.warn(`[GoogleFit Poller] Google Fit fetch failed for ${userId}, using mock data:`, error.message);

    const mock = generateMockData();
    const doc = await HealthData.create({
      userId,
      heartRate: mock.heartRate,
      oxygenSaturation: mock.oxygenSaturation,
      respiratoryRate: mock.respiratoryRate,
      steps: mock.steps,
      timestamp: mock.timestamp,
      source: "mock",
    });

    return doc;
  }
}

function startPolling(io) {
  const schedule = process.env.POLL_CRON || "*/15 * * * * *"; // Every 15 seconds

  cron.schedule(schedule, async () => {
    const users = await UserToken.find({});

    if (!users.length) {
      console.log("[GoogleFit Poller] No authenticated users. Skipping poll cycle.");
      return;
    }

    for (const user of users) {
      const saved = await fetchAndStoreForUser(user.userId);
      // Emit to all connected sockets
      io.emit("googlefit_update", saved);
    }
  });

  console.log("[GoogleFit Poller] Started polling schedule:", schedule);
}

module.exports = { startPolling, fetchAndStoreForUser };
