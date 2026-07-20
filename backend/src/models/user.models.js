const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // ==========================
    // Basic Information
    // ==========================

    userName: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      unique: true,
      lowercase: true,
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        "Please enter a valid email address",
      ],
    },

    mobileNumber: {
      type: String,
      required: function () {
        return this.provider === "LOCAL";
      },
      unique: true,
      sparse: true,
      trim: true,
      default: null,
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid mobile number"],
    },
    // ==========================
    // Authentication
    // ==========================

    provider: {
      type: String,
      enum: ["LOCAL", "GOOGLE"],
      default: "LOCAL",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    password: {
      type: String,
      required: function () {
        return this.provider === "LOCAL";
      },
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },

    // ==========================
    // Email Verification
    // ==========================

    emailVerificationToken: {
      type: String,
      select: false,
      default: null,
    },

    emailVerificationTokenExpires: {
      type: Date,
      select: false,
      default: null,
    },

    // ==========================
    // Forgot Password
    // ==========================

    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordTokenExpires: {
      type: Date,
      default: null,
      select: false,
    },

    // ==========================
    // Profile
    // ==========================

    profileImage: {
      url: {
        type: String,
        default: "",
      },
      fileId: {
        type: String,
        default: "",
      },
    },

    isProfileCompleted: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },
    // ==========================
    // Referral System
    // ==========================

    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    referredBy: {
      type: String,
      default: null,
      uppercase: true,
      trim: true,
    },

    totalReferrals: {
      type: Number,
      default: 0,
      min: 0,
    },

    rewardPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================
    // User Role
    // ==========================

    role: {
      type: String,
      enum: ["USER", "AMBASSADOR", "ADMIN"],
      default: "USER",
    },

    ambassadorLevel: {
      type: String,
      enum: ["BRONZE", "SILVER", "GOLD", "PLATINUM"],
      default: "BRONZE",
    },

    upiId: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/, "Invalid UPI ID."],
      default: null,
    },
    bankDetails: {
      accountHolderName: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 50,
        default: null,
      },
      accountNumber: {
        type: String,
        trim: true,
        minlength: 8,
        maxlength: 20,
        match: [/^[0-9]+$/, "Invalid account number."],
        default: null,
      },

      ifscCode: {
        type: String,
        trim: true,
        uppercase: true,
        match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code."],
        default: null,
      },

      bankName: {
  type: String,
  trim: true,
  minlength: 2,
  maxlength: 50,
  default: null,
},
    },
  },
  {
    timestamps: true,
  },
);

// ==========================
// Password Hashing
// ==========================

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ==========================
// Compare Password
// ==========================

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ==========================
// Indexes
// ==========================
userSchema.index({ rewardPoints: -1 });
userSchema.index({ totalReferrals: -1 });

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
