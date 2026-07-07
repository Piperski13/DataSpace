const express = require("express");
const { deleteAll } = require("../controllers/chatController");
const isAdmin = require("../middleware/auth/isAdmin");

const router = express.Router();

router.route("/deleteAll").get(isAdmin, deleteAll);

module.exports = router;
