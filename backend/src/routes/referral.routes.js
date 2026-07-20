const express = require("express");
const routes = express.Router();

const referralController = require("../controller/referral.controller");
const authMiddleware = require("../middleware/auth.middleware");

// ==========================
// Referral Dashboard
// ==========================

routes.get(
  "/dashboard",
  authMiddleware.authMiddleware,
  referralController.getReferralDashboard
);

// ==========================
// My Referral Link
// ==========================

routes.get(
  "/my-link",
  authMiddleware.authMiddleware,
  referralController.getMyReferralLink
);

// ==========================
// My Referrals
// ==========================

routes.get(
  "/my-referrals",
  authMiddleware.authMiddleware,
  referralController.getMyReferrals
);

// ==========================
// Referral Statistics
// ==========================

routes.get(
  "/stats",
  authMiddleware.authMiddleware,
  referralController.getReferralStats
);

// ==========================
// Leaderboard
// ==========================

routes.get(
  "/leaderboard",
  authMiddleware.authMiddleware,
  referralController.getLeaderboard
);

module.exports = routes;