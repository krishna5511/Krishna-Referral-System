const userModel = require("../models/user.models");
const { uploadFile, deleteFile } = require("../service/storage.service");
async function getProfile(req, res) {
  try {
    const user = await userModel.findById(req.user._id).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      user: {
        id: user._id,
        userName: user.userName,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        profileImage: user.profileImage,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        rewardPoints: user.rewardPoints,
        totalReferrals: user.totalReferrals,
        role: user.role,
        ambassadorLevel: user.ambassadorLevel,
        provider: user.provider,
        isVerified: user.isVerified,
        isProfileCompleted: user.isProfileCompleted,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        upiId: user.upiId,
        bankDetails: user.bankDetails,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}
async function updateProfile(req, res) {
  try {
    const {
  userName,
  name,
  mobileNumber,
  upiId,
  accountHolderName,
  accountNumber,
  ifscCode,
  bankName,
} = req.body;

    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    if (upiId) {
      const upiRegex = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;

      if (!upiRegex.test(upiId.trim())) {
        return res.status(400).json({
          success: false,
          message: "Invalid UPI ID.",
        });
      }

      user.upiId = upiId.trim().toLowerCase();
    }
    if (
  accountHolderName ||
  accountNumber ||
  ifscCode ||
  bankName
) {
  user.bankDetails = {
    accountHolderName:
      accountHolderName?.trim() ||
      user.bankDetails.accountHolderName,

    accountNumber:
      accountNumber?.trim() ||
      user.bankDetails.accountNumber,

    ifscCode:
      ifscCode?.trim().toUpperCase() ||
      user.bankDetails.ifscCode,

    bankName:
      bankName?.trim() ||
      user.bankDetails.bankName,
  };
}
    // Blocked User
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    // Username Already Exists
    if (userName && userName !== user.userName) {
      const existingUser = await userModel.findOne({
        userName: userName.toLowerCase(),
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Username already exists.",
        });
      }

      user.userName = userName.toLowerCase().trim();
    }

    // Mobile Number Already Exists
    if (mobileNumber && mobileNumber !== user.mobileNumber) {
      const existingMobile = await userModel.findOne({
        mobileNumber,
      });

      if (existingMobile) {
        return res.status(409).json({
          success: false,
          message: "Mobile number already exists.",
        });
      }

      user.mobileNumber = mobileNumber.trim();
    }

    // Name
    if (name) {
      user.name = name.trim();
    }
    // ==========================
    // Profile Image Upload
    // ==========================

    if (req.file) {
      if (user.profileImage?.fileId) {
        await deleteFile(user.profileImage.fileId);
      }

      const uploadedImage = await uploadFile(req.file);

      user.profileImage = {
        url: uploadedImage.url,
        fileId: uploadedImage.fileId,
      };
    }
    // Profile Completion
    user.isProfileCompleted = !!(
  user.name &&
  user.userName &&
  user.mobileNumber &&
  user.upiId &&
  user.bankDetails?.accountHolderName &&
  user.bankDetails?.accountNumber &&
  user.bankDetails?.ifscCode &&
  user.bankDetails?.bankName &&
  user.profileImage?.url
);

    await user.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        userName: user.userName,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        profileImage: user.profileImage,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        rewardPoints: user.rewardPoints,
        totalReferrals: user.totalReferrals,
        role: user.role,
        ambassadorLevel: user.ambassadorLevel,
        provider: user.provider,
        isVerified: user.isVerified,
        isProfileCompleted: user.isProfileCompleted,
        upiId: user.upiId,
        bankDetails: user.bankDetails,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const user = await userModel.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Blocked User
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    // Google User
    if (user.provider === "GOOGLE") {
      return res.status(400).json({
        success: false,
        message:
          "Google account doesn't have a password. Please login using Google.",
      });
    }

    // Check Current Password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Prevent Same Password
    const isSamePassword = await user.comparePassword(newPassword);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the current password.",
      });
    }

    // Update Password
    user.password = newPassword;

    await user.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}
async function deleteProfileImage(req, res) {
  try {
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

    if (!user.profileImage?.fileId) {
      return res.status(400).json({
        success: false,
        message: "Profile image not found.",
      });
    }

    await deleteFile(user.profileImage.fileId);

    user.profileImage = {
      url: "",
      fileId: "",
    };

    user.isProfileCompleted = !!(
      user.name &&
      user.userName &&
      user.mobileNumber &&
      user.profileImage?.url
    );

    await user.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      message: "Profile image deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Profile Image Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}
async function deleteAccount(req, res) {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.profileImage?.fileId) {
      await deleteFile(user.profileImage.fileId);
    }
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }
    await user.deleteOne();

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Account Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}
module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteProfileImage,
  deleteAccount,
};
