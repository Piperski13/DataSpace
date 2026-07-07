const { validationResult } = require("express-validator");

const handleWorkspaceValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("workspace-form", {
      workspace: {
        id: req.params.workspaceId,
        ...req.body,
      },
      errors: errors.array(),
      user: req.user,
    });
  }

  next();
};

module.exports = handleWorkspaceValidation;
