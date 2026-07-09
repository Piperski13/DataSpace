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
  static async create({ name, description, user }) {
    return Workspace.create(name, description, user.id);
  }
  static async update({ workspaceId, name, description }) {
    const workspace = await Workspace.update(workspaceId, name, description);

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    return workspace;
  }
  static async remove({ workspaceId }) {
    const workspace = await Workspace.remove(workspaceId);

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    return workspace;
  }
}
module.exports = WorkspaceService;
