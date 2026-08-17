const WorkspaceService = require("../services/workspace/workspace.service.js");
const CollectionService = require("../services/collection/collection.service.js");

const asyncHandler = require("../middleware/errors/asyncHandler.js");

const show = asyncHandler(async (req, res) => {
  const title = req.query.title || "";
  const user = req.user;
  const { workspaceId, collectionId } = req.params;

  const workspace = await WorkspaceService.requireViewableWorkspace({
    workspaceId,
    user,
  });

  const details = await CollectionService.getDetails({
    workspaceId,
    collectionId,
    filter: title,
  });

  res.render("collection-details", {
    workspace,
    collection: details.collection,
    records: details.records,
    user,
    title,
  });
});

const newCollection = asyncHandler(async (req, res) => {
  const user = req.user;
  const { workspaceId } = req.params;

  const workspace = await WorkspaceService.requireOwnerWorkspace({
    workspaceId,
    user,
  });

  res.render("collection-form", {
    user,
    workspace,
    collection: null,
    fieldErrors: [],
  });
});

const create = asyncHandler(async (req, res) => {
  const user = req.user;
  const { workspaceId } = req.params;
  const { name, description } = req.body;

  await CollectionService.create({ workspaceId, user, name, description });

  res.redirect(`/workspaces/${workspaceId}`);
});

const edit = asyncHandler(async (req, res) => {
  const user = req.user;
  const { workspaceId, collectionId } = req.params;

  const workspace = await WorkspaceService.requireOwnerWorkspace({
    workspaceId,
    user,
  });

  const details = await CollectionService.getDetails({
    workspaceId,
    collectionId,
    user,
  });

  res.render("collection-form", {
    user,
    collection: details.collection,
    workspace,
    fieldErrors: [],
  });
});

const update = asyncHandler(async (req, res) => {
  const user = req.user;
  const { workspaceId, collectionId } = req.params;
  const { name, description } = req.body;

  const workspace = await WorkspaceService.requireOwnerWorkspace({
    workspaceId,
    user,
  });

  await CollectionService.update({
    name,
    description,
    workspaceId,
    collectionId,
  });

  res.redirect(`/workspaces/${workspaceId}`);
});

const remove = asyncHandler(async (req, res) => {
  const user = req.user;
  const { workspaceId, collectionId } = req.params;

  const workspace = await WorkspaceService.requireOwnerWorkspace({
    workspaceId,
    user,
  });

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
