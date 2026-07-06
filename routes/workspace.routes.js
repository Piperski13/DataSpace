const express = require("express");
const {
  validateWorkspaceBody,
  validateWorkspaceIdParam,
} = require("../middleware/validators/workspace.validator");
const handleValidation = require("../middleware/handleValidation");

const {
  index,
  show,
  showDashboard,
  newWorkspace,
  create,
  edit,
  update,
  remove,
} = require("../controllers/workspace.controller");

const router = express.Router();

router.get("/dashboard", showDashboard);

router.get("/", index);
router.get("/new", newWorkspace);
router.post("/create", validateWorkspaceBody, handleValidation, create);

router.get(
  "/:workspaceId/edit",
  validateWorkspaceIdParam,
  handleValidation,
  edit,
);
router.get("/:workspaceId", validateWorkspaceIdParam, handleValidation, show);

router.post(
  "/:workspaceId/update",
  validateWorkspaceBody,
  validateWorkspaceIdParam,
  handleValidation,
  update,
);
router.post(
  "/:workspaceId/delete",
  validateWorkspaceIdParam,
  handleValidation,
  remove,
);

module.exports = router;
