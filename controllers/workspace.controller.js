const Workspace = require("../model/workspace.repository.js");

const index = async (req, res) => {
  try {
    const name = req.query.name || "";
    const { id: user_id, is_admin } = req.user;

    const effectiveUserId = is_admin ? null : user_id;

    const workspaces = await Workspace.showList(name, effectiveUserId);
    //we const collections = await Workspace.getCollections(workspaceId);

    res.render("workspace-list", {
      name,
      workspaces,
      user: req.user,
    });
  } catch (error) {
    console.error("Error processing request:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const show = async (req, res) => {
  try {
    const name = req.query.name || "";
    const { workspaceId } = req.params;

    const workspace = await Workspace.get(workspaceId);
    //const collections = await Workspace.getCollections(workspaceId);

    res.render("workspace-details", {
      workspace,
      user: req.user,
      name,
      collections: null,
    });
  } catch (error) {
    console.error("Error processing request:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const showDashboard = async (req, res) => {
  res.render("dashboard", { user: req.user });
};

const newWorkspace = async (req, res) => {
  try {
    res.render("workspace-form", {
      user: req.user,
      workspace: null,
      errors: [],
    });
  } catch (error) {
    console.error("Error in newWorkspace:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const create = async (req, res) => {
  try {
    const { name, description } = req.body;

    const owner_id = req.user.id;

    const workspace = await Workspace.create({
      name,
      description,
      owner_id,
    }); // remove unecesserty () {}

    res.redirect("/workspaces");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const edit = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    let workspace = null;

    if (workspaceId) {
      workspace = await Workspace.get(workspaceId);
    }

    res.render("workspace-form", {
      user: req.user,
      workspace,
      errors: [],
    });
  } catch (error) {
    console.error("Workspace controller ( edit ):", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const update = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    // const workspaceId = parseInt(req.params.workspaceId);
    const { name, description } = req.body;

    await Workspace.update({
      workspaceId,
      name,
      description,
    });

    res.redirect("/workspaces");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    // const workspaceId = parseInt(req.params.workspaceId);

    const results = await Workspace.remove(workspaceId);

    if (results.rowCount === 0) {
      res
        .status(404)
        .json({ message: `Record with ${workspaceId} was not found ` });
    }
    res.redirect("/workspaces");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
