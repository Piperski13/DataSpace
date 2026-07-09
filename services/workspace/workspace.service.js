const Workspace = require("../../model/workspace.repository");
const Collection = require("../../model/collection.repository.js");

class WorkspaceService {
  static async list({ filter, user }) {
    const userId = user.is_admin ? null : user.id;

    return Workspace.showList(filter, userId);
  }
  static async requireWorkspace(workspaceId) {
    const workspace = await Workspace.get(workspaceId);

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    return workspace;
  }
  static async getDetails(id) {
    const workspace = await this.requireWorkspace(id);

    const collections = await Collection.findMany(id);

    return {
      workspace,
      collections,
    };
  }
}
module.exports = WorkspaceService;
