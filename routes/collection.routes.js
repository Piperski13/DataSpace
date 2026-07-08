const express = require("express");
const {
  validateWorkspaceIdParam,
} = require("../middleware/validators/workspace/workspace.validator");
const {
  validateCollectionBody,
  validateCollectionIdParam,
} = require("../middleware/validators/collection/collection.validator");
const handleCollectionValidation = require("../middleware/validators/collection/handleCollectionValidation");

const {
  show,
  newCollection,
  create,
  edit,
  update,
  remove,
} = require("../controllers/collection.controller");

const router = express.Router({
  mergeParams: true,
});

router.get("/collections/new", newCollection);

router.post(
  "/collections/create",
  validateWorkspaceIdParam,
  validateCollectionBody,
  handleCollectionValidation,
  create,
);

router.get(
  "/collections/:collectionId",
  validateWorkspaceIdParam,
  validateCollectionIdParam,
  show,
);

router.get(
  "/collections/:collectionId/edit",
  validateWorkspaceIdParam,
  validateCollectionIdParam,
  edit,
);

router.post(
  "/collections/:collectionId/update",
  validateWorkspaceIdParam,
  validateCollectionIdParam,
  validateCollectionBody,
  handleCollectionValidation,
  update,
);
router.post(
  "/collections/:collectionId/delete",
  validateWorkspaceIdParam,
  validateCollectionIdParam,
  remove,
);

module.exports = router;
