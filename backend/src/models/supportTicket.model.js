const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    // ==========================
    // Ticket Number
    // ==========================

    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // ==========================
    // Ticket Owner
    // ==========================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================
    // Ticket Information
    // ==========================

    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 3000,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "ACCOUNT",
        "UNBLOCK_REQUEST",
        "PAYMENT",
        "WITHDRAWAL",
        "REFERRAL",
        "PROFILE",
        "TECHNICAL",
        "BUG",
        "FEATURE_REQUEST",
        "OTHER",
      ],
    },

    // ==========================
    // Priority
    // ==========================

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },

    // ==========================
    // Status
    // ==========================

    status: {
      type: String,
      enum: [
        "OPEN",
        "IN_PROGRESS",
        "WAITING_FOR_USER",
        "RESOLVED",
        "CLOSED",
      ],
      default: "OPEN",
    },

    // ==========================
    // Last Message
    // ==========================

    lastMessage: {
      type: String,
      default: "",
      trim: true,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    lastRepliedBy: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },

    // ==========================
    // Unread Count
    // ==========================

    unreadForUser: {
      type: Number,
      default: 0,
      min: 0,
    },

    unreadForAdmin: {
      type: Number,
      default: 0,
      min: 0,
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
    // Admin Notes
    // ==========================

    adminNotes: {
      type: String,
      default: "",
      maxlength: 3000,
    },

    // ==========================
    // Assigned Admin
    // ==========================

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ==========================
    // Resolved / Closed
    // ==========================

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: {
  type: Date,
  default: null,
},

    closedAt: {
      type: Date,
      default: null,
    },

    // ==========================
    // Soft Delete
    // ==========================

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================
// Auto Generate Ticket Number
// ==========================

supportTicketSchema.pre("validate", async function () {
  if (!this.ticketNumber) {
    const count = await mongoose
      .model("SupportTicket")
      .countDocuments();

    this.ticketNumber = `TKT-${String(count + 1).padStart(6, "0")}`;
  }
});

// ==========================
// Indexes
// ==========================

supportTicketSchema.index({
  user: 1,
  createdAt: -1,
});

supportTicketSchema.index({
  status: 1,
  priority: 1,
});

const supportTicketModel = mongoose.model(
  "SupportTicket",
  supportTicketSchema
);

module.exports = supportTicketModel;