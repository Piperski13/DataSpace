const Workspace = require("../model/workspace.repository.js");
const Collection = require("../model/collection.repository.js");

const show = async (req, res) => {
  try {
    const name = req.query.name || "";
    const { workspaceId, collectionId } = req.params;

    const workspace = await Workspace.get(workspaceId);

    if (!workspace) {
      return res.status(404).render("pages/404");
    }

    const collection = await Collection.findOne(workspaceId, collectionId);

    if (!collection) {
      return res.status(404).render("pages/404"); //incorrect
    }
    //const records = await Records.getRecords(workspaceId,collectionId);

    res.render("collection-details", {
      workspace,
      collection,
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
    const workspace = await Workspace.get(workspaceId);

    if (!workspace) {
      return res.status(404).render("pages/404");
    }

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

    const workspace = await Workspace.get(workspaceId);

    if (!workspace) {
      return res.status(404).render("pages/404");
    }

    await Collection.create(workspaceId, name, description);

    res.redirect(`/workspaces/${workspaceId}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const edit = async (req, res) => {
  try {
    const { workspaceId, collectionId } = req.params;

    const workspace = await Workspace.get(workspaceId);

    if (!workspace) {
      return res.status(404).render("pages/404");
    }

    const collection = await Collection.findOne(workspaceId, collectionId);

    if (!collection) {
      return res.status(404).render("pages/404");
    }

    res.render("collection-form", {
      user: req.user,
      collection,
      workspace,
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

    const workspace = await Workspace.get(workspaceId);

    if (!workspace) {
      return res.status(404).render("pages/404");
    }

    const collection = await Collection.findOne(workspaceId, collectionId);

    if (!collection) {
      return res.status(404).render("pages/404");
    }

    await Collection.update(name, description, workspaceId, collectionId);

    res.redirect(`/workspaces/${workspaceId}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { workspaceId, collectionId } = req.params;

    const workspace = await Workspace.get(workspaceId);

    if (!workspace) {
      return res.status(404).render("pages/404");
    }

    const collection = Collection.findOne(workspaceId, collectionId);

    if (!collection) {
      return res.status(404).render("pages/404");
    }
    const collectionRemoved = await Collection.remove(
      workspaceId,
      collectionId,
    );

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
