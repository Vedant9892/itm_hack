const express = require("express");
const HealthData = require("../models/HealthData");
const { getTodaySteps, getValidAccessToken, isUserConnected } = require("./googleFitService");

const router = express.Router();

// GET /api/googlefit/data/latest
// Returns the most recent health record
router.get("/latest", async (req, res) => {
  try {
    const userId = req.query.userId || "default-user";
    const latest = await HealthData.findOne({ userId }).sort({ timestamp: -1 });

    if (!latest) {
      return res.json({ message: "No data available yet", data: null });
    }
    return res.json({ data: latest });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/googlefit/data/history
// Returns last N health records (default 50)
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
// Returns today's aggregated data (avg HR, max HR, total steps)
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
    } catch (stepErr) {
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
// Returns connection status
router.get("/status", async (req, res) => {
  try {
    const connected = await isUserConnected("default-user");
    return res.json({ connected });
  } catch (err) {
    return res.json({ connected: false });
  }
});

module.exports = router;
