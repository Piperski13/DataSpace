const { body, param } = require("express-validator");

const validateRegisterBody = [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("Firstname is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("Firstname must be between 2 and 20 characters"),

  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("Lastname is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("Lastname must be between 2 and 20 characters"),

  body("email").isEmail().withMessage("Invalid email address"),
  body("password").isLength({ min: 2 }).withMessage("Password too short"),
];

module.exports = {
  validateRegisterBody,
};
