const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    // ==========================
    // User
    // ==========================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================
    // Withdrawal Details
    // ==========================

    points: {
      type: Number,
      required: true,
      min: 100,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    // ==========================
    // Payment Details
    // ==========================

    paymentMethod: {
      type: String,
      enum: ["UPI", "BANK"],
      required: true,
    },

    upiId: {
      type: String,
      default: null,
      trim: true,
    },

    bankDetails: {
      accountHolderName: {
        type: String,
        default: null,
      },

      accountNumber: {
        type: String,
        default: null,
      },

      ifscCode: {
        type: String,
        default: null,
      },

      bankName: {
        type: String,
        default: null,
      },
    },

    // ==========================
    // Status
    // ==========================

    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "PAID",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    // ==========================
    // Admin
    // ==========================

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================
// Indexes
// ==========================

withdrawalSchema.index({
  status: 1,
  createdAt: -1,
});

withdrawalSchema.index({
  user: 1,
  status: 1,
});

module.exports = mongoose.model(
  "Withdrawal",
  withdrawalSchema
);