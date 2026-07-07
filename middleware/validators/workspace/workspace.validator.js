const { body, param } = require("express-validator");

const validateWorkspaceBody = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("Name must be between 2 and 20 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Description must be max 200 characters"),
];

const validateWorkspaceIdParam = [
  param("workspaceId")
    .isInt()
    .withMessage("Workspace ID must be a number")
    .toInt(),
];

module.exports = {
  validateWorkspaceBody,
  validateWorkspaceIdParam,
};
