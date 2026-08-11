const { validationResult } = require("express-validator");

const handleRegisterValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("register", {
      fieldErrors: errors.array(),
      user: null,
      appError: "",
    });
  }

  next();
};

module.exports = handleRegisterValidation;
