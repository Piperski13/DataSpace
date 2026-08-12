const express = require("express");
const viewController = require("../controllers/viewController.js");
const router = express.Router();

router.route("/chat").get(viewController.showChat);

module.exports = router;
