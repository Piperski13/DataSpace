const Workspace = require("../../model/workspace.repository");

class WorkspaceService {
  static async list({ filter, user }) {
    const userId = user.is_admin ? null : user.id;

    return Workspace.showList(filter, userId);
  }
}
module.exports = WorkspaceService;
