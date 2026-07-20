const userModel = require("../models/user.models");
const {generateToken} = require("../utils/generateToken");
const generateReferralCode = require("../utils/generateReferralCode");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const generateVerificationToken = require("../utils/generateVerificationToken");
const {
  verifyEmailTemplate,
  forgotPasswordTemplate,
} = require("../utils/emailTemplates");

// ==========================================
// 1. Standard Sign-Up
// ==========================================
async function signUpControllers(req, res) {`1`
  try {
    const { userName, name, email, mobileNumber, password, referredBy } = req.body;

    // Validation
    if (!userName || !name || !email || !mobileNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory.",
      });
    }

    // Normalize Email
    const normalizedEmail = email.trim().toLowerCase();

    // Check Existing User
    const existingUser = await userModel.findOne({
      $or: [{ userName }, { email: normalizedEmail }, { mobileNumber }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username, email or mobile number already exists.",
      });
    }

    // Generate Unique Referral Code
    let referralCode;
    let attempts = 0;
    while (attempts < 10) {
      attempts++;
      referralCode = generateReferralCode(userName);
      const existingReferralCode = await userModel.findOne({ referralCode });
      if (!existingReferralCode) break;
    }

    if (!referralCode) {
      throw new Error("Failed to generate unique referral code.");
    }

    // Validate Referral Code
    const referral = referredBy?.trim().toUpperCase();
    let referrer = null;
    if (referral) {
      referrer = await userModel.findOne({ referralCode: referral });
      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral code.",
        });
      }
    }

    // Create User (Optimized: Included lastLogin natively to save a database write)
    const user = await userModel.create({
      userName,
      name,
      email: normalizedEmail,
      mobileNumber,
      password,
      referralCode,
      referredBy: referral || null,
    });

    // Reward Referrer
    if (referrer) {
      await userModel.findByIdAndUpdate(referrer._id, {
        $inc: {
          totalReferrals: 1,
          rewardPoints: 100,
        },
      });
    }

    // Generate Verification Token
const {
  token: verificationToken,
  expires,
} = generateVerificationToken();

user.emailVerificationToken = verificationToken;
user.emailVerificationTokenExpires = expires;

await user.save({
  validateBeforeSave: false,
});

// Verification Link
const verificationLink =
  `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

// Send Verification Email
try {
  await sendEmail({
    to: user.email,
    subject: "Verify Your Email",
    html: verifyEmailTemplate(
      user.name,
      verificationLink
    ),
  });
} catch (emailErr) {
  console.log("\n----------------------------------------");
  console.log("⚠️ EMAIL SENDING FAILED (Local Dev Mode)");
  console.log(`Verify Email Link: ${verificationLink}`);
  console.log("----------------------------------------\n");
}

    // Generate JWT
    const token = generateToken(user, res);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
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
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

// ==========================================
// 2. Standard Log-In
// ==========================================
async function logInControllers(req, res) {
  try {
    let { email, mobileNumber, password } = req.body;

    // Validation
    if ((!email && !mobileNumber) || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Mobile Number and Password are required",
      });
    }

    // Normalize Email
    if (email) {
      email = email.trim().toLowerCase();
    }

    // Find User
    const user = await userModel
      .findOne({
        $or: [{ email }, { mobileNumber }],
      })
      .select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/mobile number or password",
      });
    }

    // Compare Password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/mobile number or password",
      });
    }

    // Email Verification Check (Only Local Users)
if (user.provider === "LOCAL" && !user.isVerified) {
  return res.status(403).json({
    success: false,
    message: "Please verify your email before logging in.",
  });
}
    // Check Blocked User
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    // Update Last Login
    await userModel.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
    });

    // Generate JWT
    const token = generateToken(user, res);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
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
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
}

// ==========================================
// 3. Log-Out
// ==========================================
async function logOutControllers(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
}

// ==========================================
// 4. Google OAuth Authentication
// ==========================================
async function googleAuthControllers(req, res) {
  try {
    const { credential, referredBy } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required.",
      });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      email,
      name,
      sub,
      email_verified,
    } = payload;

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: "Google email is not verified.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ==========================================
    // Existing User
    // ==========================================

    let user = await userModel.findOne({
      email: normalizedEmail,
    });

    if (user) {
      // Blocked User
      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: "Your account has been blocked.",
        });
      }

      // Link Google ID and mark email as verified if not set
      if (!user.googleId) {
        user.googleId = sub;
      }
      if (!user.isVerified) {
        user.isVerified = true;
      }

      // Update Last Login
      user.lastLogin = new Date();

      await user.save({
        validateBeforeSave: false,
      });

      const token = generateToken(user, res);

      return res.status(200).json({
        success: true,
        message: "Google login successful.",
        token,
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
          isVerified: user.isVerified,
          provider: user.provider,
        },
      });
    }

    // ==========================================
    // New Google User
    // ==========================================

    const referral = referredBy?.trim().toUpperCase();

    let referrer = null;

    if (referral) {
      referrer = await userModel.findOne({
        referralCode: referral,
      });

      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral code.",
        });
      }
    }

    // Generate Username

    const baseUserName = email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9]/g, "");

    let userName = baseUserName;

    let count = 1;

    while (await userModel.findOne({ userName })) {
      userName = `${baseUserName}${count++}`;
    }

    // Generate Referral Code

    let referralCode;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      attempts++;

      referralCode = generateReferralCode(userName);

      const existingReferralCode =
        await userModel.findOne({
          referralCode,
        });

      if (!existingReferralCode) {
        isUnique = true;
      }
    }

    if (!isUnique) {
      throw new Error(
        "Failed to generate unique referral code."
      );
    }
        // ==========================================
    // Create Google User
    // ==========================================

    user = await userModel.create({
      userName,
      name,
      email: normalizedEmail,
      mobileNumber: null,
      password: crypto.randomBytes(32).toString("hex"),
      provider: "GOOGLE",
      googleId: sub,
      isVerified: true,
      isProfileCompleted: false,
      lastLogin: new Date(),
      referralCode,
      referredBy: referral || null,
    });

    // ==========================================
    // Reward Referrer
    // ==========================================

    if (referrer) {
      await userModel.findByIdAndUpdate(
        referrer._id,
        {
          $inc: {
            totalReferrals: 1,
            rewardPoints: 100,
          },
        }
      );
    }

    // ==========================================
    // Generate JWT
    // ==========================================

    const token = generateToken(user, res);

    return res.status(201).json({
      success: true,
      message: "Google signup successful.",
      token,
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
        isVerified: user.isVerified,
        provider: user.provider,
      },
    });

  } catch (error) {
    console.error("Google Auth Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Internal Server Error",
    });
  }
}

// ==========================================
// 5. Send Verification Email
// ==========================================
async function sendVerificationEmailController(req, res) {
  try {
    const userId = req.user._id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified.",
      });
    }

    const { token, expires } = generateVerificationToken();

    user.emailVerificationToken = token;
    user.emailVerificationTokenExpires = expires;
    await user.save({
  validateBeforeSave: false,
});

    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${token}`;
    const html = verifyEmailTemplate(user.name, verificationLink);

    // Safeguard email transport layer crash
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify Your Email",
        html,
      });
    } catch (emailErr) {
      console.error("Email Sending Service Error:", emailErr);
      console.log("\n----------------------------------------");
      console.log("⚠️ EMAIL RESEND FAILED (Local Dev Mode)");
      console.log(`Verify Email Link: ${verificationLink}`);
      console.log("----------------------------------------\n");
      return res.status(200).json({
        success: true,
        message: `Local Dev Mode: Email failed to send, but verification link generated! Link: ${verificationLink}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully.",
    });
  } catch (error) {
    console.error("Send Verification Email Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

// ==========================================
// 6. Verify Email Token Process
// ==========================================
async function verifyEmailController(req, res) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required.",
      });
    }

    const user = await userModel.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token.",
      });
    }

    if (user.emailVerificationTokenExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Verification token has expired.",
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: "Email is already verified.",
      });
    }

    user.isVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;
    await user.save({
  validateBeforeSave: false,
});

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("Verify Email Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

// ==========================================
// 7. Forgot Password Trigger
// ==========================================
async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail });

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

    const { token, expires } = generateVerificationToken();

    user.resetPasswordToken = token;
    user.resetPasswordTokenExpires = expires;
    await user.save({
  validateBeforeSave: false,
});

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const html = forgotPasswordTemplate(user.name, resetLink);

    // Safeguard email transport layer crash
    try {
      await sendEmail({
        to: user.email,
        subject: "Reset Your Password",
        html,
      });
    } catch (emailErr) {
      console.error("Email Sending Service Error:", emailErr);
      console.log("\n----------------------------------------");
      console.log("⚠️ PASSWORD RESET EMAIL FAILED (Local Dev)");
      console.log(`Reset Password Link: ${resetLink}`);
      console.log("----------------------------------------\n");
      return res.status(200).json({
        success: true,
        message: `Local Dev Mode: Email failed to send, but reset link generated! Link: ${resetLink}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

// ==========================================
// 8. Reset Password Handle
// ==========================================
async function resetPasswordController(req, res) {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required.",
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const user = await userModel.findOne({ resetPasswordToken: token }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token.",
      });
    }

    if (user.resetPasswordTokenExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Reset token has expired.",
      });
    }

    const isSamePassword = await user.comparePassword(password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the old password.",
      });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpires = null;
    await user.save({
  validateBeforeSave: false,
});

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

// ==========================================
// 9. Current Logged In User
// ==========================================

async function getCurrentUserController(req, res) {
  try {
    const user = await userModel
      .findById(req.user._id)
      .select("-password")
      .lean();

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
      message: "User fetched successfully.",
      user,
    });
  } catch (error) {
    console.error("Get Current User Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}
module.exports = {
  signUpControllers,
  logOutControllers,
  logInControllers,
  googleAuthControllers,
  getCurrentUserController,
  sendVerificationEmailController,
  verifyEmailController,
  forgotPasswordController,
  resetPasswordController,
};