const jwt = require("jsonwebtoken");
const userModel = require("../models/user.models");

async function authMiddleware(req, res, next) {
  try {
    // ==========================
    // Get Token
    // ==========================

    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Token is missing.",
      });
    }

    // ==========================
    // Verify Token
    // ==========================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRETKEY
    );

    // ==========================
    // Find User
    // ==========================

    const user = await userModel
      .findById(decoded.id)
      .select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // ==========================
    // Blocked User
    // ==========================

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    // ==========================
    // Attach User
    // ==========================

    req.user = user;

    next();
  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired.",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

module.exports = {
  authMiddleware,
};