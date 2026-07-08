const express = require("express");
const {
  validateWorkspaceBody,
  validateWorkspaceIdParam,
} = require("../middleware/validators/workspace/workspace.validator");
const handleWorkspaceValidation = require("../middleware/validators/workspace/handleWorkspaceValidation");

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

router.post(
  "/create",
  validateWorkspaceBody,
  handleWorkspaceValidation,
  create,
);

router.get("/:workspaceId", validateWorkspaceIdParam, show);
router.get("/:workspaceId/edit", validateWorkspaceIdParam, edit);

router.post(
  "/:workspaceId/update",
  validateWorkspaceIdParam,
  validateWorkspaceBody,
  handleWorkspaceValidation,
  update,
);
router.post("/:workspaceId/delete", validateWorkspaceIdParam, remove);

module.exports = router;
