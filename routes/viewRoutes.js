const express = require("express");
const viewController = require("../controllers/viewController.js");
const isAdmin = require("../middleware/auth/isAdmin.js");
const router = express.Router();

router.route("/chat").get(viewController.showChat);
router.route("/users").get(isAdmin, viewController.showUsers);
router.route("/updateUser/:id").get(viewController.showUpdateUser);

module.exports = router;
