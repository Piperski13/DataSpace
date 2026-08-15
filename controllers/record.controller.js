const WorkspaceService = require("../services/workspace/workspace.service.js");
const CollectionService = require("../services/collection/collection.service.js");
const RecordService = require("../services/record/record.service.js");
const FileService = require("../services/record/file.service.js");

const asyncHandler = require("../middleware/errors/asyncHandler.js");

const show = asyncHandler(async (req, res) => {
  const user = req.user;
  const name = req.query.name || "";
  const { workspaceId, collectionId, recordId } = req.params;

  const workspace = await WorkspaceService.requireViewableWorkspace({
    workspaceId,
    user,
  });

  const details = await RecordService.getDetails({
    workspaceId,
    collectionId,
    recordId,
  });

  res.render("record-details", {
    workspace,
    collection: details.collection,
    record: details.record,
    user,
    name,
  });
});

const newRecord = asyncHandler(async (req, res) => {
  const user = req.user;
  const { workspaceId, collectionId } = req.params;

  const workspace = await WorkspaceService.requireOwnerWorkspace({
    workspaceId,
    user,
  });

  const collection = await CollectionService.requireCollection({
    workspaceId,
    collectionId,
  });

  res.render("record-form", {
    user,
    workspace,
    collection,
    record: null,
    files: null,
    fieldErrors: [],
  });
});

const create = asyncHandler(async (req, res) => {
  const user = req.user;
  const { workspaceId, collectionId } = req.params;
  const { title, description } = req.body;
  const { files } = req;

  try {
    await WorkspaceService.requireOwnerWorkspace({
      workspaceId,
      user,
    });
    await RecordService.create({
      workspaceId,
      collectionId,
      title,
      description,
      files,
    });

    res.redirect(`/workspaces/${workspaceId}/collections/${collectionId}`);
  } catch (error) {
    await FileService.unlink(files);

    throw error;
  }
});

const edit = asyncHandler(async (req, res) => {
  const user = req.user;
  const { workspaceId, collectionId, recordId } = req.params;

  const workspace = await WorkspaceService.requireOwnerWorkspace({
    workspaceId,
    user,
  });

  const details = await RecordService.getDetails({
    workspaceId,
    collectionId,
    recordId,
  });

  res.render("record-form", {
    user: req.user,
    collection: details.collection,
    workspace,
    record: details.record,
    files: null,
    fieldErrors: [],
  });
});

const update = asyncHandler(async (req, res) => {
  const user = req.user;
  const { workspaceId, collectionId, recordId } = req.params;
  const { title, description, deletedFiles } = req.body;
  const { files } = req;

  try {
    await WorkspaceService.requireOwnerWorkspace({
      workspaceId,
      user,
    });
    await RecordService.update({
      title,
      description,
      deletedFiles,
      workspaceId,
      collectionId,
      recordId,
      files,
    });

    res.redirect(`/workspaces/${workspaceId}/collections/${collectionId}`);
  } catch (error) {
    await FileService.unlink(files);

    throw error;
  }
});

const remove = asyncHandler(async (req, res) => {
  const user = req.user;
  const { workspaceId, collectionId, recordId } = req.params;

  await WorkspaceService.requireOwnerWorkspace({
    workspaceId,
    user,
  });

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
