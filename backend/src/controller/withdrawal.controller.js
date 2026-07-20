const withdrawalModel = require("../models/withdrawal.model");
const userModel = require("../models/user.models");

async function requestWithdrawal(req, res) {
  try {
    const {
  points,
  paymentMethod,

} = req.body;

    // ==========================
    // Validation
    // ==========================

    if (!points || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Points and payment method are required.",
      });
    }

    if (points < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum withdrawal is 100 reward points.",
      });
    }

    if (!["UPI", "BANK"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    // ==========================
    // Find User
    // ==========================

    const user = await userModel.findById(req.user._id);

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

    // ==========================
    // Reward Points Check
    // ==========================

    if (user.rewardPoints < points) {
      return res.status(400).json({
        success: false,
        message: "Insufficient reward points.",
      });
    }

    // ==========================
    // Existing Pending Request
    // ==========================

    const pendingWithdrawal = await withdrawalModel.findOne({
      user: user._id,
      status: "PENDING",
    });

    if (pendingWithdrawal) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending withdrawal request.",
      });
    }

    // ==========================
    // Payment Validation
    // ==========================

if (paymentMethod === "UPI" && !user.upiId) {
  return res.status(400).json({
    success: false,
    message: "Please update your UPI ID in profile.",
  });
}

if (paymentMethod === "BANK") {
  if (
    !user.bankDetails?.accountHolderName ||
    !user.bankDetails?.accountNumber ||
    !user.bankDetails?.ifscCode ||
    !user.bankDetails?.bankName
  ) {
    return res.status(400).json({
      success: false,
      message: "Please update your bank details in profile.",
    });
  }
}

    // ==========================
    // Create Withdrawal
    // ==========================

const withdrawal = await withdrawalModel.create({
  user: user._id,
  points,
  amount: points,
  paymentMethod,

  upiId:
    paymentMethod === "UPI"
      ? user.upiId
      : null,

  bankDetails:
    paymentMethod === "BANK"
      ? {
          accountHolderName:
            user.bankDetails.accountHolderName,
          accountNumber:
            user.bankDetails.accountNumber,
          ifscCode:
            user.bankDetails.ifscCode,
          bankName:
            user.bankDetails.bankName,
        }
      : undefined,
});

    // Deduct Reward Points
    user.rewardPoints -= points;

    await user.save({
      validateBeforeSave: false,
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully.",
      withdrawal,
    });
  } catch (error) {
    console.error("Request Withdrawal Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

async function getMyWithdrawals(req, res) {
  try {
    const withdrawals = await withdrawalModel
      .find({
        user: req.user._id,
      })
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Withdrawal history fetched successfully.",
      totalWithdrawals: withdrawals.length,
      withdrawals,
    });
  } catch (error) {
    console.error("Get Withdrawals Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

async function cancelWithdrawal(req, res) {
  try {
    const { withdrawalId } = req.params;

    const withdrawal = await withdrawalModel.findById(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal request not found.",
      });
    }

    // User Ownership Check
    if (withdrawal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    // Only Pending Withdrawal Can Be Cancelled
    if (withdrawal.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending withdrawal can be cancelled.",
      });
    }

    // Return Reward Points
    const user = await userModel.findById(req.user._id);

    user.rewardPoints += withdrawal.points;

    await user.save({
      validateBeforeSave: false,
    });

    // Delete Withdrawal Request
    withdrawal.status = "CANCELLED";

    await withdrawal.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      message: "Withdrawal request cancelled successfully.",
    });
  } catch (error) {
    console.error("Cancel Withdrawal Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

async function getAllWithdrawals(req, res) {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      status,
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = {};

    // Status Filter
    if (status) {
      query.status = status.toUpperCase();
    }

    // Search User
    if (search.trim()) {
      const users = await userModel.find(
        {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { userName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
        "_id"
      );

      query.user = {
        $in: users.map((user) => user._id),
      };
    }

    const totalWithdrawals =
      await withdrawalModel.countDocuments(query);

    const withdrawals = await withdrawalModel
      .find(query)
      .populate(
        "user",
        "userName name email profileImage rewardPoints"
      )
      .populate(
        "approvedBy",
        "userName name"
      )
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: "All withdrawal requests fetched successfully.",

      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalWithdrawals / limit),
        totalWithdrawals,
        limit,
      },

      withdrawals,
    });

  } catch (error) {
    console.error("Get All Withdrawals Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}
async function approveWithdrawal(req, res) {
  try {
    const { withdrawalId } = req.params;

    const withdrawal = await withdrawalModel.findById(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal request not found.",
      });
    }

    if (withdrawal.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending withdrawal can be approved.",
      });
    }

    withdrawal.status = "APPROVED";
    withdrawal.approvedBy = req.user._id;
    withdrawal.approvedAt = new Date();

    await withdrawal.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      message: "Withdrawal approved successfully.",
      withdrawal,
    });

  } catch (error) {
    console.error("Approve Withdrawal Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

async function rejectWithdrawal(req, res) {
  try {
    const { withdrawalId } = req.params;
    const { rejectionReason } = req.body;

    const withdrawal = await withdrawalModel.findById(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal request not found.",
      });
    }

    if (withdrawal.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending withdrawal can be rejected.",
      });
    }

    // Return Reward Points
    const user = await userModel.findById(withdrawal.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.rewardPoints += withdrawal.points;

    await user.save({
      validateBeforeSave: false,
    });

    // Update Withdrawal
    withdrawal.status = "REJECTED";
    withdrawal.rejectionReason =
      rejectionReason || "Rejected by admin.";
    withdrawal.approvedBy = req.user._id;
    withdrawal.approvedAt = new Date();

    await withdrawal.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      message: "Withdrawal rejected successfully.",
      withdrawal,
    });

  } catch (error) {
    console.error("Reject Withdrawal Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

async function markWithdrawalPaid(req, res) {
  try {
    const { withdrawalId } = req.params;

    const withdrawal = await withdrawalModel.findById(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal request not found.",
      });
    }

    if (withdrawal.status !== "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Only approved withdrawal can be marked as paid.",
      });
    }

    withdrawal.status = "PAID";

    await withdrawal.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      message: "Withdrawal marked as paid successfully.",
      withdrawal,
    });

  } catch (error) {
    console.error("Mark Withdrawal Paid Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

module.exports = {
  requestWithdrawal,
  getMyWithdrawals,
  cancelWithdrawal,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  markWithdrawalPaid,
};
