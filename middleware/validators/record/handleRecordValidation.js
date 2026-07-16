const { validationResult } = require("express-validator");

const handleRecordValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("record-form", {
      workspace: {
        id: req.params.workspaceId,
      },
      collection: {
        id: req.params.collectionId,
      },
      record: {
        id: req.params.recordId,
        ...req.body,
      },
      errors: errors.array(),
      user: req.user,
    });
  }

  next();
};

module.exports = handleRecordValidation;
