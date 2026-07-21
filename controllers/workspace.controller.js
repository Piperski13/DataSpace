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
  const name = req.query.name || "";
  const { workspaceId } = req.params;

  const details = await WorkspaceService.getDetails({
    workspaceId,
    filter: name,
    user: req.user,
  });

  res.render("workspace-details", {
    workspace: details.workspace,
    collections: details.collections,
    user: req.user,
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

  const workspace = await WorkspaceService.create({
    name,
    description,
    visibility,
    user: req.user,
  });

  res.redirect("/workspaces");
});

const edit = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const workspace = await WorkspaceService.requireOwner({
    workspaceId,
    user: req.user,
  });

  res.render("workspace-form", {
    user: req.user,
    workspace,
    errors: [],
  });
});

const update = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { name, description } = req.body;

  const workspace = await WorkspaceService.update({
    workspaceId,
    name,
    description,
    user: req.user,
  });

  res.redirect("/workspaces");
});

const remove = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const removedWorksapces = await WorkspaceService.remove({
    workspaceId,
    user: req.user,
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
