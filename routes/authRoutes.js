const express = require("express");
const {
  showLogin,
  login,
  logout,
} = require("../controllers/loginController");

const router = express.Router();

router.route("/").get(showLogin);
router.route("/logout").get(logout);
router.route("/login").post(login);

module.exports = router;
