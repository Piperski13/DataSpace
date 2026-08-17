const { validationResult } = require("express-validator");

const handleRecordValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const record = req.params.recordId
      ? {
          id: req.params.recordId,
          ...req.body,
        }
      : null;

    return res.status(400).render("record-form", {
      workspace: {
        id: req.params.workspaceId,
      },
      collection: {
        id: req.params.collectionId,
      },
      record,
      fieldErrors: errors.array(),
      user: req.user,
    });
  }

  next();
};

module.exports = handleRecordValidation;
