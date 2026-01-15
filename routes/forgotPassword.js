const express = require("express");
const {
  handleForgotPassword,
  showResetForm,
  showForgotPage,
  handleResetPassword,
  validateUser,
} = require("../controllers/forgotPasswordController");

const router = express.Router();

router.get("/password", showForgotPage);
router.post("/password", handleForgotPassword);

router.get("/reset-password/:resetLink", showResetForm);
router.post("/reset-password/:selector/:token", validateUser, handleResetPassword);


module.exports = router;
