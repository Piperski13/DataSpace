const { validationResult } = require("express-validator");

const handleRegisterValidation = (req, res, next) => {
  const errors = validationResult(req);
  const selector = req.params.selector;
  const token = req.params.token;

  if (!errors.isEmpty()) {
    return res.status(400).render("reset-password", {
      fieldErrors: errors.array(),
      user: null,
      selector,
      token,
    });
  }

  next();
};

module.exports = handleRegisterValidation;
