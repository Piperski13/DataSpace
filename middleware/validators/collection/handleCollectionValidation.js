const { validationResult } = require("express-validator");

const handleCollectionValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("collection-form", {
      workspace: {
        id: req.params.workspaceId,
      },
      collection: {
        id: req.params.collectionId,
        ...req.body,
      },
      errors: errors.array(),
      user: req.user,
    });
  }

  next();
};

module.exports = handleCollectionValidation;
