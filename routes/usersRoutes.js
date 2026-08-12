const express = require("express");
const {
  updateUser,
  deleteUser,
  showUsers,
  showUpdateUser,
} = require("../controllers/usersController.js");

const {
  validateUserBody,
  validateUserIdParam,
} = require("../middleware/validators/user/user.validator.js");
const handleUserValidation = require("../middleware/validators/user/handleUserValidation.js");

const isAdmin = require("../middleware/auth/isAdmin.js");

const router = express.Router();

router.route("/").get(isAdmin, showUsers);
router.route("/:id/edit").get(isAdmin, validateUserIdParam, showUpdateUser);

router
  .route("/:id")
  .post(
    isAdmin,
    validateUserIdParam,
    validateUserBody,
    handleUserValidation,
    updateUser,
  );

router.route("/:id/delete").post(isAdmin, validateUserIdParam, deleteUser);

module.exports = router;
