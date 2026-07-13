const express = require("express");

const {
  validateWorkspaceIdParam,
} = require("../middleware/validators/workspace/workspace.validator");

const {
  validateCollectionIdParam,
} = require("../middleware/validators/collection/collection.validator");

const {
  validateRecordBody,
  validateRecordIdParam,
} = require("../middleware/validators/record/record.validator");

const { upload } = require("../config/multer");

const handleRecordValidation = require("../middleware/validators/record/handleRecordValidation");

const {
  show,
  newRecord,
  create,
  edit,
  update,
  remove,
} = require("../controllers/record.controller");

const router = express.Router({
  mergeParams: true,
});

router.get("/records/new", newRecord);

router.post(
  "/records/create",
  upload.array("myFile", 3),
  validateWorkspaceIdParam,
  validateCollectionIdParam,
  validateRecordBody,
  handleRecordValidation,
  create,
);

router.get(
  "/records/:recordId",
  validateWorkspaceIdParam,
  validateCollectionIdParam,
  validateRecordIdParam,
  show,
);

router.get(
  "/records/:recordId/edit",
  validateWorkspaceIdParam,
  validateCollectionIdParam,
  validateRecordIdParam,
  edit,
);

router.post(
  "/records/:recordId/update",
  upload.array("myFile", 3),
  validateWorkspaceIdParam,
  validateCollectionIdParam,
  validateRecordIdParam,
  validateRecordBody,
  handleRecordValidation,
  update,
);
router.post(
  "/records/:recordId/delete",
  validateWorkspaceIdParam,
  validateCollectionIdParam,
  validateRecordIdParam,
  remove,
);

module.exports = router;
