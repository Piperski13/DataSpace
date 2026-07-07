const express = require("express");
const viewController = require("../controllers/viewController.js");
const isAdmin = require("../middleware/auth/isAdmin.js");
const router = express.Router();

router.route("/recordsViewPage").get(viewController.generateView);
router.route("/welcome").get(viewController.showWelcome);
router.route("/chat").get(viewController.showChat);
router.route("/users").get(isAdmin, viewController.showUsers);
router.route("/addRecord").get(viewController.showAddRecord);
router.route("/addRecord/:id").get(viewController.showAddRecord);
router.route("/updateUser/:id").get(viewController.showUpdateUser);

module.exports = router;
