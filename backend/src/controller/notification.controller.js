const notificationModel = require("../models/notification.model");
const userModel = require("../models/user.models");

// ==========================
// Get My Notifications
// ==========================

async function getMyNotifications(req, res) {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = Number(page);
    limit = Number(limit);

    const user = await userModel.findById(req.user._id).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    const totalNotifications = await notificationModel.countDocuments({
      user: req.user._id,
    });

    const notifications = await notificationModel
      .find({
        user: req.user._id,
      })
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully.",

      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalNotifications / limit),
        totalNotifications,
        limit,
      },

      notifications,
    });

  } catch (error) {
    console.error("Get Notifications Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

// ==========================
// Get Unread Notification Count
// ==========================

async function getUnreadNotificationCount(req, res) {
  try {
    const user = await userModel.findById(req.user._id).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    const unreadCount = await notificationModel.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      message: "Unread notification count fetched successfully.",
      unreadCount,
    });

  } catch (error) {
    console.error("Unread Notification Count Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

// ==========================
// Mark Notification As Read
// ==========================

async function markNotificationAsRead(req, res) {
  try {
    const { notificationId } = req.params;

    const notification = await notificationModel.findOne({
      _id: notificationId,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    if (notification.isRead) {
      return res.status(400).json({
        success: false,
        message: "Notification is already marked as read.",
      });
    }

    notification.isRead = true;

    await notification.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read successfully.",
      notification,
    });

  } catch (error) {
    console.error("Mark Notification Read Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

// ==========================
// Mark All Notifications As Read
// ==========================

async function markAllNotificationsAsRead(req, res) {
  try {
    const user = await userModel.findById(req.user._id).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    const result = await notificationModel.updateMany(
      {
        user: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read successfully.",
      modifiedCount: result.modifiedCount,
    });

  } catch (error) {
    console.error("Mark All Notifications Read Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

// ==========================
// Delete Notification
// ==========================

async function deleteNotification(req, res) {
  try {
    const { notificationId } = req.params;

    const notification = await notificationModel.findOne({
      _id: notificationId,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    await notification.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Notification Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

// ==========================
// Send Notification To Single User
// ==========================

async function sendNotification(req, res) {
  try {
    const {
      userId,
      title,
      message,
      type,
      redirectUrl,
      metadata,
    } = req.body;

    if (!userId || !title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory.",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const notification = await notificationModel.create({
      user: user._id,
      title: title.trim(),
      message: message.trim(),
      type,
      redirectUrl: redirectUrl || "",
      metadata: metadata || {},
    });

    return res.status(201).json({
      success: true,
      message: "Notification sent successfully.",
      notification,
    });

  } catch (error) {
    console.error("Send Notification Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

// ==========================
// Send Notification To All Users
// ==========================

async function sendNotificationToAll(req, res) {
  try {
    const {
      title,
      message,
      type,
      redirectUrl,
      metadata,
    } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory.",
      });
    }

    const users = await userModel
      .find(
        {
          isBlocked: false,
        },
        {
          _id: 1,
        }
      )
      .lean();

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active users found.",
      });
    }

    const notifications = users.map((user) => ({
      user: user._id,
      title: title.trim(),
      message: message.trim(),
      type,
      redirectUrl: redirectUrl || "",
      metadata: metadata || {},
    }));

    await notificationModel.insertMany(notifications);

    return res.status(201).json({
      success: true,
      message: "Notification sent to all users successfully.",
      totalUsers: notifications.length,
    });

  } catch (error) {
    console.error("Send Notification To All Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}



module.exports = {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  sendNotification,
  sendNotificationToAll,
};