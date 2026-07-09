const WorkspaceService = require("../services/workspace/workspace.service.js");
const CollectionService = require("../services/collection/collection.service.js");

const show = async (req, res) => {
  //works
  try {
    const name = req.query.name || "";
    const { workspaceId, collectionId } = req.params;

    const details = await CollectionService.getDetails({
      workspaceId,
      collectionId,
    });

    //const records = await Records.getRecords(workspaceId,collectionId);

    res.render("collection-details", {
      workspace: details.workspace,
      collection: details.collection,
      records: null, // not null
      user: req.user,
      name,
      collections: null,
    });
  } catch (error) {
    console.error("Error processing request:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const newCollection = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await WorkspaceService.requireWorkspace({ workspaceId });

    res.render("collection-form", {
      user: req.user,
      workspace,
      collection: null,
      errors: [],
    });
  } catch (error) {
    console.error("Error in newWorkspace:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const create = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description } = req.body;

    await CollectionService.create({ workspaceId, name, description });

    res.redirect(`/workspaces/${workspaceId}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const edit = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Collection controller ( edit ):", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const update = async (req, res) => {
  try {
    const { workspaceId, collectionId } = req.params;
    const { name, description } = req.body;

    await CollectionService.update({
      name,
      description,
      workspaceId,
      collectionId,
    });

    res.redirect(`/workspaces/${workspaceId}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { workspaceId, collectionId } = req.params;

    const collectionRemoved = await CollectionService.remove({
      workspaceId,
      collectionId,
    });

    res.redirect(`/workspaces/${workspaceId}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  show,
  newCollection,
  create,
  edit,
  update,
  remove,
};
