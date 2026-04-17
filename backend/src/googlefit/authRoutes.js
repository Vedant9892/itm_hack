const express = require("express");
const UserToken = require("../models/UserToken");
const { buildGoogleAuthUrl, exchangeCodeForTokens } = require("./googleFitService");

const router = express.Router();

// GET /api/googlefit/auth/google
// Redirects user to Google OAuth consent screen
router.get("/google", (req, res) => {
  const authUrl = buildGoogleAuthUrl();
  res.redirect(authUrl);
});

// GET /api/googlefit/auth/google/callback
// Handles OAuth callback, stores tokens in MongoDB
router.get("/google/callback", async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      console.error("[GoogleFit Auth] OAuth error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5174";
      return res.redirect(`${frontendUrl}/smart-devices?auth=error&reason=${error}`);
    }

    if (!code) {
      return res.status(400).json({ message: "Missing OAuth code" });
    }

    const tokens = await exchangeCodeForTokens(code);
    const userId = "default-user";

    const tokenExpiryDate = new Date(Date.now() + (tokens.expires_in || 3600) * 1000);

    await UserToken.findOneAndUpdate(
      { userId },
      {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || (await UserToken.findOne({ userId }))?.refreshToken,
        tokenExpiryDate,
      },
      { upsert: true, new: true }
    );

    console.log("[GoogleFit Auth] Token stored successfully for user:", userId);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5174";
    return res.redirect(`${frontendUrl}/smart-devices?auth=success`);
  } catch (err) {
    console.error("[GoogleFit Auth] OAuth callback failed:", err.response?.data || err.message);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5174";
    return res.redirect(`${frontendUrl}/smart-devices?auth=error&reason=server_error`);
  }
});

// GET /api/googlefit/auth/status
// Returns whether the default user has connected Google Fit
router.get("/status", async (req, res) => {
  try {
    const token = await UserToken.findOne({ userId: "default-user" });
    return res.json({ connected: !!token });
  } catch (err) {
    return res.json({ connected: false });
  }
});

// DELETE /api/googlefit/auth/disconnect
// Removes stored tokens (disconnect Google Fit)
router.delete("/disconnect", async (req, res) => {
  try {
    await UserToken.deleteOne({ userId: "default-user" });
    return res.json({ success: true, message: "Disconnected from Google Fit" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
