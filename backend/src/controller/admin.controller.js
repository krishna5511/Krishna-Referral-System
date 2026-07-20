const userModel = require("../models/user.models");

async function getDashboard(req, res) {
  try {
    const [
      totalUsers,
      totalAmbassadors,
      totalAdmins,
      totalVerifiedUsers,
      totalBlockedUsers,
      totalRewardPoints,
    ] = await Promise.all([
      userModel.countDocuments(),
      userModel.countDocuments({ role: "AMBASSADOR" }),
      userModel.countDocuments({ role: "ADMIN" }),
      userModel.countDocuments({ isVerified: true }),
      userModel.countDocuments({ isBlocked: true }),
      userModel.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: "$rewardPoints",
            },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      message: "Admin dashboard fetched successfully.",
      dashboard: {
        totalUsers,
        totalAmbassadors,
        totalAdmins,
        totalVerifiedUsers,
        totalBlockedUsers,
        totalRewardPoints:
          totalRewardPoints.length > 0
            ? totalRewardPoints[0].total
            : 0,
      },
    });

  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

async function getAllUsers(req, res) {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = {};

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobileNumber: { $regex: search, $options: "i" } },
      ];
    }

    const totalUsers = await userModel.countDocuments(query);

    const users = await userModel
      .find(query)
      .select("-password")
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully.",

      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit,
      },

      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

async function getSingleUser(req, res) {
  try {
    const { userId } = req.params;

    const user = await userModel
      .findById(userId)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully.",
      user,
    });

  } catch (error) {
    console.error("Get Single User Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

async function blockUser(req, res) {
  try {
    const { userId } = req.params;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
  return res.status(400).json({
    success: false,
    message: "You cannot block your own account.",
  });
}
    // Prevent Blocking Admin
    if (user.role === "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Admin account cannot be blocked.",
      });
    }

    if (user.isBlocked) {
      return res.status(400).json({
        success: false,
        message: "User is already blocked.",
      });
    }

    user.isBlocked = true;

    await user.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      message: "User blocked successfully.",
    });

  } catch (error) {
    console.error("Block User Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

async function unblockUser(req, res) {
  try {
    const { userId } = req.params;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Admin account cannot be modified.",
      });
    }

    if (!user.isBlocked) {
      return res.status(400).json({
        success: false,
        message: "User is already active.",
      });
    }

    user.isBlocked = false;

    await user.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully.",
    });

  } catch (error) {
    console.error("Unblock User Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Admin account cannot be deleted.",
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });

  } catch (error) {
    console.error("Delete User Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

async function getAnalytics(req, res) {
  try {
    const [
      totalUsers,
      totalVerifiedUsers,
      totalBlockedUsers,
      totalAdmins,
      totalAmbassadors,
      totalRewardPoints,
      totalReferrals,
    ] = await Promise.all([
      userModel.countDocuments(),

      userModel.countDocuments({
        isVerified: true,
      }),

      userModel.countDocuments({
        isBlocked: true,
      }),

      userModel.countDocuments({
        role: "ADMIN",
      }),

      userModel.countDocuments({
        role: "AMBASSADOR",
      }),

      userModel.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: "$rewardPoints",
            },
          },
        },
      ]),

      userModel.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: "$totalReferrals",
            },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      message: "Analytics fetched successfully.",
      analytics: {
        totalUsers,
        totalVerifiedUsers,
        totalBlockedUsers,
        totalAdmins,
        totalAmbassadors,
        totalRewardPoints:
          totalRewardPoints.length > 0
            ? totalRewardPoints[0].total
            : 0,
        totalReferrals:
          totalReferrals.length > 0
            ? totalReferrals[0].total
            : 0,
      },
    });

  } catch (error) {
    console.error("Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

async function getLeaderboard(req, res) {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = Number(page);
    limit = Number(limit);

    const totalUsers = await userModel.countDocuments({
      isBlocked: false,
    });

    const leaderboard = await userModel
      .find(
        {
          isBlocked: false,
        },
        {
          userName: 1,
          name: 1,
          profileImage: 1,
          rewardPoints: 1,
          totalReferrals: 1,
          ambassadorLevel: 1,
        }
      )
      .sort({
        rewardPoints: -1,
        totalReferrals: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const rankedLeaderboard = leaderboard.map((user, index) => ({
      rank: (page - 1) * limit + index + 1,
      ...user,
    }));

    return res.status(200).json({
      success: true,
      message: "Leaderboard fetched successfully.",

      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit,
      },

      leaderboard: rankedLeaderboard,
    });
  } catch (error) {
    console.error("Leaderboard Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

module.exports = {
  getDashboard,
  getAllUsers,
  getSingleUser,
  blockUser,
  unblockUser,
  deleteUser,
  getAnalytics,
  getLeaderboard,
};