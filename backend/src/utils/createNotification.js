const notificationModel = require("../models/notification.model");

// ==========================
// Create Notification
// ==========================

async function createNotification({
  user,
  title,
  message,
  type,
  redirectUrl = "",
  metadata = {},
}) {
  try {
    if (!user || !title || !message || !type) {
      throw new Error("Missing required notification fields.");
    }

    const notification = await notificationModel.create({
      user,
      title: title.trim(),
      message: message.trim(),
      type,
      redirectUrl,
      metadata,
    });

    return notification;
  } catch (error) {
    console.error("Create Notification Error:", error);
    throw error;
  }
}

// ==========================
// Create Notification For Multiple Users
// ==========================

async function createBulkNotifications({
  users,
  title,
  message,
  type,
  redirectUrl = "",
  metadata = {},
}) {
  try {
    if (!Array.isArray(users) || users.length === 0) {
      return;
    }

    const notifications = users.map((userId) => ({
      user: userId,
      title: title.trim(),
      message: message.trim(),
      type,
      redirectUrl,
      metadata,
    }));

    await notificationModel.insertMany(notifications);

    return true;
  } catch (error) {
    console.error("Bulk Notification Error:", error);
    throw error;
  }
}

module.exports = {
  createNotification,
  createBulkNotifications,
};