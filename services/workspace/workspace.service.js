const Workspace = require("../../model/workspace.repository");
const Collection = require("../../model/collection.repository.js");

const FileService = require("../record/file.service.js");

const NotFoundError = require("../../errors/not-found.error.js");

class WorkspaceService {
  static async list({ filter, user }) {
    return Workspace.showList({ filter, user });
  }
  static async requireWorkspace(data) {
    const workspace = await Workspace.get(data);

    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    return workspace;
  }
  static async getCollections(data) {
    const collections = await Collection.findMany(data);

    return collections;
  }
  static async create(data) {
    return Workspace.create(data);
  }
  static async update(data) {
    const updatedWorkspace = await Workspace.update(data);

    if (!updatedWorkspace) {
      throw new NotFoundError("Workspace not found");
    }

    return updatedWorkspace;
  }
  static async remove(data) {
    const files = await FileService.getByWorkspace(data.workspaceId);

    const removedWorkspace = await Workspace.remove(data);

    if (!removedWorkspace) {
      throw new NotFoundError("Workspace not found");
    }

    await FileService.unlink(files);

    return removedWorkspace;
  }
  static assertCanView({ workspace, user }) {
    if (workspace.visibility === "private" && workspace.owner_id !== user.id) {
      throw new NotFoundError("Workspace not found");
    }
  }

  static assertOwner({ workspace, user }) {
    if (workspace.owner_id !== user.id) {
      throw new NotFoundError("Workspace not found");
    }
  }

  static async requireOwnerWorkspace(data) {
    const workspace = await this.requireWorkspace(data);

    this.assertOwner({
      workspace,
      user: data.user,
    });

    return workspace;
  }

  static async requireViewableWorkspace(data) {
    const workspace = await this.requireWorkspace(data);

    this.assertCanView({
      workspace,
      user: data.user,
    });

    return workspace;
  }
}
module.exports = WorkspaceService;
