const WorkspaceService = require("../services/workspace/workspace.service.js");
const CollectionService = require("../services/collection/collection.service.js");

const asyncHandler = require("../middleware/errors/asyncHandler.js");

const show = asyncHandler(async (req, res) => {
  const name = req.query.name || "";
  const { workspaceId, collectionId } = req.params;

  const details = await CollectionService.getDetails({
    workspaceId,
    collectionId,
  });

  res.render("collection-details", {
    workspace: details.workspace,
    collection: details.collection,
    records: details.records,
    user: req.user,
    name,
  });
});

const newCollection = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const workspace = await WorkspaceService.requireWorkspace({ workspaceId });

  res.render("collection-form", {
    user: req.user,
    workspace,
    collection: null,
    errors: [],
  });
});

const create = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { name, description } = req.body;

  await CollectionService.create({ workspaceId, name, description });

  res.redirect(`/workspaces/${workspaceId}`);
});

const edit = asyncHandler(async (req, res) => {
  const { workspaceId, collectionId } = req.params;

  const details = await CollectionService.getDetails({
    workspaceId,
    collectionId,
  });

  res.render("collection-form", {
    user: req.user,
    collection: details.collection,
    workspace: details.workspace,
    errors: [],
  });
});

const update = asyncHandler(async (req, res) => {
  const { workspaceId, collectionId } = req.params;
  const { name, description } = req.body;

  await CollectionService.update({
    name,
    description,
    workspaceId,
    collectionId,
  });

  res.redirect(`/workspaces/${workspaceId}`);
});

const remove = asyncHandler(async (req, res) => {
  const { workspaceId, collectionId } = req.params;

  const collectionRemoved = await CollectionService.remove({
    workspaceId,
    collectionId,
  });

  res.redirect(`/workspaces/${workspaceId}`);
});

module.exports = {
  show,
  newCollection,
  create,
  edit,
  update,
  remove,
};
