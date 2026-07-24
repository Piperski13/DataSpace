const WorkspaceService = require("../services/workspace/workspace.service.js");
const asyncHandler = require("../middleware/errors/asyncHandler.js");

const index = asyncHandler(async (req, res) => {
  const name = req.query.name || "";

  const workspaces = await WorkspaceService.list({
    filter: name,
    user: req.user,
  });

  res.render("workspace-list", {
    name,
    workspaces,
    user: req.user,
  });
});

const show = asyncHandler(async (req, res) => {
  const user = req.user;
  const name = req.query.name || "";
  const { workspaceId } = req.params;

  const workspace = await WorkspaceService.requireViewableWorkspace({
    workspaceId,
    user,
  });

  const collections = await WorkspaceService.getCollections({
    workspaceId,
    filter: name,
  });

  res.render("workspace-details", {
    workspace,
    collections,
    user,
    name,
  });
});

const showDashboard = async (req, res) => {
  res.render("dashboard", { user: req.user });
};

const newWorkspace = asyncHandler(async (req, res) => {
  res.render("workspace-form", {
    user: req.user,
    workspace: null,
    errors: [],
  });
});

const create = asyncHandler(async (req, res) => {
  const { name, description, visibility } = req.body;

  const createdWorkspace = await WorkspaceService.create({
    name,
    description,
    visibility,
    user: req.user,
  });

  res.redirect("/workspaces");
});

const edit = asyncHandler(async (req, res) => {
  const user = req.user;
  const { workspaceId } = req.params;

  const workspace = await WorkspaceService.requireOwnerWorkspace({
    workspaceId,
    user,
  });

  res.render("workspace-form", {
    user,
    workspace,
    errors: [],
  });
});

const update = asyncHandler(async (req, res) => {
  const user = req.user;
  const { workspaceId } = req.params;
  const { name, description } = req.body;

  const workspace = await WorkspaceService.requireOwnerWorkspace({
    workspaceId,
    user,
  });

  const updatedWorkspace = await WorkspaceService.update({
    workspaceId,
    name,
    description,
    user,
  });

  res.redirect("/workspaces");
});

const remove = asyncHandler(async (req, res) => {
  const user = req.user;
  const { workspaceId } = req.params;

  const workspace = await WorkspaceService.requireOwnerWorkspace({
    workspaceId,
    user,
  });

  const removedWorkspace = await WorkspaceService.remove({
    workspaceId,
  });

  res.redirect("/workspaces");
});

module.exports = {
  index,
  show,
  showDashboard,
  newWorkspace,
  create,
  edit,
  update,
  remove,
};
