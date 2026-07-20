const express = require("express");
const routes = express.Router();

const adminController = require("../controller/admin.controller");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

// ==========================
// Dashboard
// ==========================

routes.get(
  "/dashboard",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.getDashboard
);

// ==========================
// User Management
// ==========================

routes.get(
  "/users",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.getAllUsers
);

routes.get(
  "/users/:userId",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.getSingleUser
);

routes.patch(
  "/users/block/:userId",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.blockUser
);

routes.patch(
  "/users/unblock/:userId",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.unblockUser
);

routes.delete(
  "/users/:userId",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.deleteUser
);

// ==========================
// Analytics
// ==========================

routes.get(
  "/analytics",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.getAnalytics
);

// ==========================
// Leaderboard
// ==========================

routes.get(
  "/leaderboard",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.getLeaderboard
);

module.exports = routes;