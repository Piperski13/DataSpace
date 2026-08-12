const { body, param } = require("express-validator");

const validateUserBody = [
  body("first_name")
    .trim()
    .isAlpha()
    .withMessage(`Fristname must only contain letters.`)
    .isLength({ min: 2, max: 12 })
    .withMessage(`Firstname must be between 2 and 15 characters.`),
  body("last_name")
    .trim()
    .isAlpha()
    .withMessage(`Lastname must only contain letters.`)
    .isLength({ min: 2, max: 12 })
    .withMessage(`Lastname must be between 2 and 15 characters.`),
  body("email").isEmail().withMessage("Invalid email address"),
];

const validateUserIdParam = [
  param("id").isInt().withMessage("Workspace ID must be a number").toInt(),
];

module.exports = {
  validateUserBody,
  validateUserIdParam,
};
