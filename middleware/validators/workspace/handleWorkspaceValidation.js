const { validationResult } = require("express-validator");

const handleWorkspaceValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const workspace = req.params.workspaceId
      ? {
          id: req.params.workspaceId,
          ...req.body,
        }
      : null;

    return res.status(400).render("workspace-form", {
      workspace,
      fieldErrors: errors.array(),
      user: req.user,
    });
  }

  next();
};

module.exports = handleWorkspaceValidation;
