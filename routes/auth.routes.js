const express = require("express");

const {
  validateRegisterBody,
} = require("../middleware/validators/auth/otp/register.validator");

const handleRegisterValidation = require("../middleware/validators/auth/otp/handleRegisterValidation");

const {
  validatePassword,
} = require("../middleware/validators/auth/forgotPassword/password.validator");

const handlePasswordValidation = require("../middleware/validators/auth/forgotPassword/handlePasswordValidation");

const {
  showLogin,
  login,
  logout,
  generateOtp,
  verifyOtp,
  showRegister,
  showForgotPage,
  requestPasswordReset,
  showResetForm,
  handleResetPassword,
} = require("../controllers/auth.controller");

const router = express.Router();

router.route("/login").get(showLogin);
router.route("/login").post(login);
router.route("/logout").get(logout);

router.route("/register").get(showRegister);
router.post(
  "/register/otp",
  validateRegisterBody,
  handleRegisterValidation,
  generateOtp,
);
router.post("/register/verify", verifyOtp);

router.get("/forgot-password", showForgotPage);
router.post("/forgot-password", requestPasswordReset);
router.get("/reset-password/:selector/:token", showResetForm);
router.post(
  "/reset-password/:selector/:token",
  validatePassword,
  handlePasswordValidation,
  handleResetPassword,
);

module.exports = router;
