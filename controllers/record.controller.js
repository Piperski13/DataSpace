const WorkspaceService = require("../services/workspace/workspace.service.js");
const CollectionService = require("../services/collection/collection.service.js");
const RecordService = require("../services/record/record.service.js");

const asyncHandler = require("../middleware/errors/asyncHandler.js");

const show = asyncHandler(async (req, res) => {
  const name = req.query.name || "";
  const { workspaceId, collectionId, recordId } = req.params;

  const details = await RecordService.getDetails({
    workspaceId,
    collectionId,
    recordId,
  });

  res.render("record-details", {
    workspace: details.workspace,
    collection: details.collection,
    record: details.record,
    user: req.user,
    name,
  });
});

const newRecord = asyncHandler(async (req, res) => {
  const { workspaceId, collectionId } = req.params;

  const workspace = await WorkspaceService.requireWorkspace({ workspaceId });

  const collection = await CollectionService.requireCollection({
    collectionId,
  });

  res.render("record-form", {
    user: req.user,
    workspace,
    collection,
    record: null,
    files: null,
    errors: [],
  });
});

const create = asyncHandler(async (req, res) => {
  const { workspaceId, collectionId } = req.params;
  const { title, description } = req.body;

  await RecordService.create({ workspaceId, collectionId, title, description });

  res.redirect(`/workspaces/${workspaceId}/collections/${collectionId}`);
});

const edit = asyncHandler(async (req, res) => {
  const { workspaceId, collectionId, recordId } = req.params;

  const details = await RecordService.getDetails({
    workspaceId,
    collectionId,
    recordId,
  });

  res.render("record-form", {
    user: req.user,
    collection: details.collection,
    workspace: details.workspace,
    record: details.record,
    files: null,
    errors: [],
  });
});

const update = asyncHandler(async (req, res) => {
  const { workspaceId, collectionId, recordId } = req.params;
  const { title, description } = req.body;

  await RecordService.update({
    title,
    description,
    workspaceId,
    collectionId,
    recordId,
  });

  res.redirect(`/workspaces/${workspaceId}/collections/${collectionId}`);
});

const remove = asyncHandler(async (req, res) => {
  const { workspaceId, collectionId, recordId } = req.params;

  const recordRemoved = await RecordService.remove({
    workspaceId,
    collectionId,
    recordId,
  });

  res.redirect(`/workspaces/${workspaceId}/collections/${collectionId}`);
});

module.exports = {
  show,
  newRecord,
  create,
  edit,
  update,
  remove,
};
