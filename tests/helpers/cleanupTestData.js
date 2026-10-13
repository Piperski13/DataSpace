const User = require("../../model/user.repository");
const Workspace = require("../../model/workspace.repository");

async function cleanupTestData({ workspaceId, owner, otherUser }) {
  if (workspaceId) {
    await Workspace.remove({ workspaceId });
  }

  if (owner) {
    await User.deleteById(owner.id);
  }

  if (otherUser) {
    await User.deleteById(otherUser.id);
  }
}

module.exports = cleanupTestData;
