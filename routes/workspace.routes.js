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

router.get(
  "/:workspaceId/edit",
  validateWorkspaceIdParam,
  handleWorkspaceValidation,
  edit,
);
router.get(
  "/:workspaceId",
  validateWorkspaceIdParam,
  handleWorkspaceValidation,
  show,
);

router.post(
  "/:workspaceId/update",
  validateWorkspaceBody,
  validateWorkspaceIdParam,
  handleWorkspaceValidation,
  update,
);
router.post(
  "/:workspaceId/delete",
  validateWorkspaceIdParam,
  handleWorkspaceValidation,
  remove,
);

module.exports = router;
