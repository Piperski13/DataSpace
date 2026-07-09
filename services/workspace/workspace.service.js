const Workspace = require("../../model/workspace.repository");
const Collection = require("../../model/collection.repository.js");

class WorkspaceService {
  static async list({ filter, user }) {
    const userId = user.is_admin ? null : user.id;

    return Workspace.showList({ filter, userId });
  }
  static async requireWorkspace(data) {
    const workspace = await Workspace.get(data);

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    return workspace;
  }
  static async getDetails(data) {
    const workspace = await this.requireWorkspace(data);

    const collections = await Collection.findMany(data);

    return {
      workspace,
      collections,
    };
  }
  static async create(data) {
    return Workspace.create(data);
  }
  static async update(data) {
    const workspace = await Workspace.update(data);

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    return workspace;
  }
  static async remove(data) {
    const workspace = await Workspace.remove(data);

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    return workspace;
  }
}
module.exports = WorkspaceService;
