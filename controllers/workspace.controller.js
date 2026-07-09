const Workspace = require("../model/workspace.repository.js");
const Collection = require("../model/collection.repository.js");
const WorkspaceService = require("../services/workspace/workspace.service.js");

const index = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error processing request:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const show = async (req, res) => {
  try {
    const name = req.query.name || "";
    const { workspaceId } = req.params;

    const details = await WorkspaceService.getDetails(workspaceId);

    res.render("workspace-details", {
      workspace: details.workspace,
      collections: details.collections,
      user: req.user,
      name,
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

    const workspace = await Workspace.create(name, description, owner_id); //bussiness logic -> service layer

    res.redirect("/workspaces");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const edit = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.get(workspaceId); //bussiness logic -> service layer

    if (!workspace) {
      return res.status(404).render("pages/404"); //bussiness logic -> service layer
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
    const { name, description } = req.body;

    const workspace = await Workspace.update(workspaceId, name, description); //bussiness logic -> service layer

    if (!workspace) {
      return res.status(404).render("pages/404"); //bussiness logic -> service layer
    }

    res.redirect("/workspaces");
  } catch (error) {
    console.error("Workspace controller (update):", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const remove = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.remove(workspaceId); //bussiness logic -> service layer

    if (!workspace) {
      return res.status(404).json({
        message: `Workspace ${workspaceId} was not found`,
      });
    } //bussiness logic -> service layer
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
