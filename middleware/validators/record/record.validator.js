const { body, param } = require("express-validator");

const validateRecordBody = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("Title must be between 2 and 20 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Description must be max 200 characters"),
];

const validateRecordIdParam = [
  param("recordId").isInt().withMessage("Record ID must be a number").toInt(),
];

module.exports = {
  validateRecordBody,
  validateRecordIdParam,
};
