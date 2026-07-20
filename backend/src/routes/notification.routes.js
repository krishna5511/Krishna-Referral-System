const express = require("express");
const routes = express.Router();

const notificationController = require("../controller/notification.controller");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

// ==========================
// User Notifications
// ==========================

// Get My Notifications
routes.get(
  "/",
  authMiddleware.authMiddleware,
  notificationController.getMyNotifications
);

// Get Unread Notification Count
routes.get(
  "/unread-count",
  authMiddleware.authMiddleware,
  notificationController.getUnreadNotificationCount
);

// Mark Notification As Read
routes.patch(
  "/read/:notificationId",
  authMiddleware.authMiddleware,
  notificationController.markNotificationAsRead
);

// Mark All Notifications As Read
routes.patch(
  "/read-all",
  authMiddleware.authMiddleware,
  notificationController.markAllNotificationsAsRead
);

// Delete Notification
routes.delete(
  "/:notificationId",
  authMiddleware.authMiddleware,
  notificationController.deleteNotification
);

// ==========================
// Admin Notifications
// ==========================

// Send Notification To Single User
routes.post(
  "/send",
  authMiddleware.authMiddleware,
  adminMiddleware,
  notificationController.sendNotification
);

// Send Notification To All Users
routes.post(
  "/send-all",
  authMiddleware.authMiddleware,
  adminMiddleware,
  notificationController.sendNotificationToAll
);

module.exports = routes;