const express = require("express");
const {
  showChat,
  deleteAllMessages,
} = require("../controllers/chatController");
const isAdmin = require("../middleware/auth/isAdmin");

const router = express.Router();

router.get("/", showChat);
router.route("/messages").post(isAdmin, deleteAllMessages);
module.exports = router;
