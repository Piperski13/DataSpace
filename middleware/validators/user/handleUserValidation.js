const { validationResult } = require("express-validator");

const handleUserValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const profile = req.params.id
      ? {
          id: req.params.id,
          ...req.body,
        }
      : null;

    return res.status(400).render("updateUser", {
      fieldErrors: errors.array(),
      profile,
      user: req.user,
    });
  }

  next();
};

module.exports = handleUserValidation;
