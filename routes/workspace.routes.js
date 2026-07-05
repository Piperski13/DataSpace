const express = require("express");
const {
  //   index,
  //   show,
  showDashboard,
  //   new: newWorkspace,
  //   create,
  //   edit,
  //   update,
  //   remove,
} = require("../controllers/workspace.controller");

const router = express.Router();

router.get("/dashboard", showDashboard);

// router.get("/", index);
// router.get("/new", newWorkspace);
// router.post("/create", create);

// router.get("/:workspaceId", show);
// router.get("/:workspaceId/edit", edit);

// router.post("/:workspaceId/update", update);
// router.post("/:workspaceId/delete", remove);

module.exports = router;

// WORKSPACE SKELET

// Pages (EJS)
// GET  /workspaces                      -> workspace list
// GET  /workspaces/new                  -> workspace form (create)
// GET  /workspaces/:workspaceId/edit   -> workspace form (update)
// GET  /workspaces/:workspaceId        -> workspace details

// Actions (POST)
// POST /workspaces/create
// POST /workspaces/:workspaceId/update
// POST /workspaces/:workspaceId/delete
