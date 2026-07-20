const userModel = require("../models/user.models");

async function getReferralDashboard(req, res) {
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

    const referralLink = `${process.env.CLIENT_URL}/signup?ref=${user.referralCode}`;

    return res.status(200).json({
      success: true,
      message: "Referral dashboard fetched successfully.",
     dashboard: {
    referralCode: user.referralCode,

    referralLink,

    rewardPoints: user.rewardPoints,

    totalReferrals: user.totalReferrals,

    ambassadorLevel: user.ambassadorLevel,

    todayReferrals: 0,

    totalEarnings: user.rewardPoints,

    rank: 0,
},
    });
  } catch (error) {
    console.error("Referral Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

async function getMyReferralLink(req, res) {
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

    const referralLink = `${process.env.CLIENT_URL}/signup?ref=${user.referralCode}`;

    return res.status(200).json({
      success: true,
      message: "Referral link fetched successfully.",
      referral: {
        referralCode: user.referralCode,
        referralLink,
      },
    });
  } catch (error) {
    console.error("Get Referral Link Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

async function getMyReferrals(req, res) {
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

    const totalReferrals = await userModel.countDocuments({
      referredBy: user.referralCode,
    });

    const referrals = await userModel
      .find(
        {
          referredBy: user.referralCode,
        },
        {
          userName: 1,
          name: 1,
          email: 1,
          profileImage: 1,
          createdAt: 1,
          isVerified: 1,
        }
      )
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Referral list fetched successfully.",

      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReferrals / limit),
        totalReferrals,
        limit,
      },

      referrals,
    });

  } catch (error) {
    console.error("My Referrals Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

async function getReferralStats(req, res) {
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

    return res.status(200).json({
      success: true,
      message: "Referral statistics fetched successfully.",
      stats: {
        rewardPoints: user.rewardPoints,
        totalReferrals: user.totalReferrals,
        ambassadorLevel: user.ambassadorLevel,
      },
    });
  } catch (error) {
    console.error("Referral Stats Error:", error);

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
  getReferralDashboard,
  getMyReferralLink,
  getMyReferrals,
  getReferralStats,
  getLeaderboard,
};