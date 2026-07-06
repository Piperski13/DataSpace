const { validationResult } = require("express-validator");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("workspace-form", {
      workspace: req.body,
      errors: errors.array(),
      user: req.user,
    });
  }

  next();
};

module.exports = handleValidation;
