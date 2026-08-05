const { validationResult } = require("express-validator");

const handleRegisterValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("signIn", {
      errors: errors.array(),
      user: null,
    });
  }

  next();
};

module.exports = handleRegisterValidation;
