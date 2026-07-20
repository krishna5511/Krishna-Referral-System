const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // ==========================
    // Receiver
    // ==========================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================
    // Notification Content
    // ==========================

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // ==========================
    // Notification Type
    // ==========================

    type: {
      type: String,
      required: true,
      enum: [
        "WELCOME",

        "EMAIL_VERIFIED",

        "PROFILE_COMPLETED",

        "REFERRAL_JOINED",

        "REFERRAL_REWARD",

        "AMBASSADOR_LEVEL_UP",

        "WITHDRAWAL_REQUESTED",

        "WITHDRAWAL_APPROVED",

        "WITHDRAWAL_REJECTED",

        "WITHDRAWAL_PAID",

        "SUPPORT_CREATED",

        "SUPPORT_REPLY",

        "ACCOUNT_BLOCKED",

        "ACCOUNT_UNBLOCKED",

        "ADMIN_ANNOUNCEMENT",

        "LOGIN_ALERT",

        "PASSWORD_CHANGED",
      ],
    },

    // ==========================
    // Status
    // ==========================

    isRead: {
      type: Boolean,
      default: false,
    },

    // ==========================
    // Optional Redirect URL
    // ==========================

    redirectUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================
    // Extra Data
    // ==========================

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// ==========================
// Indexes
// ==========================

notificationSchema.index({ user: 1, isRead: 1 });

notificationSchema.index({ createdAt: -1 });

const notificationModel = mongoose.model(
  "Notification",
  notificationSchema
);

module.exports = notificationModel;