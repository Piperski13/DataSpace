const express = require("express");

const {
  validateRegisterBody,
} = require("../middleware/validators/auth/otp/register.validator");

const handleRegisterValidation = require("../middleware/validators/auth/otp/handleRegisterValidation");

const {
  showLogin,
  login,
  logout,
  generateOtp,
  verifyOtp,
  showRegister,
} = require("../controllers/loginController");

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

// GET  /forgot-password
// POST /forgot-password

// GET  /reset-password/:resetLink
// POST /reset-password/:selector/:token

module.exports = router;
