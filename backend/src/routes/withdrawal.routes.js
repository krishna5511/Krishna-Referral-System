const express = require("express");
const routes = express.Router();

const withdrawalController = require("../controller/withdrawal.controller");
const authMiddleware = require("../middleware/auth.middleware");

// ==========================
// User Withdrawal
// ==========================

// Request Withdrawal
routes.post(
  "/request",
  authMiddleware.authMiddleware,
  withdrawalController.requestWithdrawal
);

// Get My Withdrawal History
routes.get(
  "/history",
  authMiddleware.authMiddleware,
  withdrawalController.getMyWithdrawals
);

// Cancel Pending Withdrawal
routes.patch(
  "/cancel/:withdrawalId",
  authMiddleware.authMiddleware,
  withdrawalController.cancelWithdrawal
);

// ==========================
// Admin Withdrawal
// (Admin Middleware Later)
// ==========================

// Get All Withdrawal Requests
routes.get(
  "/all",
  authMiddleware.authMiddleware,
  withdrawalController.getAllWithdrawals
);

// Approve Withdrawal
routes.patch(
  "/approve/:withdrawalId",
  authMiddleware.authMiddleware,
  withdrawalController.approveWithdrawal
);

// Reject Withdrawal
routes.patch(
  "/reject/:withdrawalId",
  authMiddleware.authMiddleware,
  withdrawalController.rejectWithdrawal
);

// Mark as Paid
routes.patch(
  "/paid/:withdrawalId",
  authMiddleware.authMiddleware,
  withdrawalController.markWithdrawalPaid
);

module.exports = routes;