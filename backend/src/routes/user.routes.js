const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const userController = require("../controller/user.controller");

const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
});

// ==========================
// User Profile
// ==========================

router.get( "/profile", authMiddleware.authMiddleware, userController.getProfile);

router.patch( "/profile", authMiddleware.authMiddleware, upload.single("profileImage"), userController.updateProfile
);

// ==========================
// Password
// ==========================

router.patch( "/change-password", authMiddleware.authMiddleware, userController.changePassword);

// ==========================
// Profile Image
// ==========================

router.delete(
  "/profile-image",
  authMiddleware.authMiddleware,
  userController.deleteProfileImage
);

// ==========================
// Delete Account
// ==========================

router.delete(
  "/delete-account",
  authMiddleware.authMiddleware,
  userController.deleteAccount
);

module.exports = router;