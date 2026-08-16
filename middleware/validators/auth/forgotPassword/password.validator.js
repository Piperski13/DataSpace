const { body, param } = require("express-validator");

const validatePassword = [
  body("password").isLength({ min: 2 }).withMessage("Password too short"),
];

module.exports = {
  validatePassword,
};
