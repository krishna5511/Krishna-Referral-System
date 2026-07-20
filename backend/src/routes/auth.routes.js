const express = require("express");
const routes = express.Router();

const authController = require("../controller/auth.controller");
const authMiddleware = require("../middleware/auth.middleware")

// ==========================
// Authentication
// ==========================

routes.post("/signup", authController.signUpControllers);

routes.post("/login", authController.logInControllers);

routes.post("/logout", authController.logOutControllers);

routes.post("/google", authController.googleAuthControllers);

// ==========================
// Email Verification
// ==========================

routes.get(
  "/verify-email/:token",
  authController.verifyEmailController
);
routes.get(
    "/me",
    authMiddleware.authMiddleware,
    authController.getCurrentUserController
);

routes.post(
  "/send-verification-email",
  authMiddleware.authMiddleware,
  authController.sendVerificationEmailController
);

// ==========================
// Password Reset
// ==========================

routes.post(
  "/forgot-password",
  authController.forgotPasswordController
);

routes.post(
  "/reset-password/:token",
  authController.resetPasswordController
);

module.exports = routes;