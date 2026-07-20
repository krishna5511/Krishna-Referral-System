const mongoose = require("mongoose");

const supportMessageSchema = new mongoose.Schema(
  {
    // ==========================
    // Support Ticket
    // ==========================

    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportTicket",
      required: true,
      index: true,
    },

    // ==========================
    // Sender
    // ==========================

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderRole: {
      type: String,
      enum: ["USER", "ADMIN"],
      required: true,
    },

    // ==========================
    // Message
    // ==========================

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    // ==========================
    // Attachment
    // ==========================

    attachment: {
      url: {
        type: String,
        default: "",
      },

      fileId: {
        type: String,
        default: "",
      },

      fileName: {
        type: String,
        default: "",
      },
    },

    // ==========================
    // Message Status
    // ==========================

    isEdited: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ==========================
// Indexes
// ==========================

supportMessageSchema.index({
  ticket: 1,
  createdAt: 1,
});

const supportMessageModel = mongoose.model(
  "SupportMessage",
  supportMessageSchema
);

module.exports = supportMessageModel;