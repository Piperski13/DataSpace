const express = require("express");
const { showChat, deleteAll } = require("../controllers/chatController");
const isAdmin = require("../middleware/auth/isAdmin");

const router = express.Router();

router.get("/", showChat);
router.route("/messages").post(isAdmin, deleteAll);
module.exports = router;
