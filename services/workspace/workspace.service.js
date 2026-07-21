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
  static async getDetails(data) {
    const workspace = await this.requireWorkspace(data);

    this.requireViewAccess({ workspace, user: data.user });

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
    await this.requireOwner(data);

    const workspace = await Workspace.update(data);

    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    return workspace;
  }
  static async remove(data) {
    await this.requireOwner(data);

    const files = await FileService.getByWorkspace(data.workspaceId);

    const workspace = await Workspace.remove(data);

    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    await FileService.unlink(files);

    return workspace;
  }
  static requireViewAccess({ workspace, user }) {
    if (workspace.visibility === "private" && workspace.owner_id !== user.id) {
      throw new NotFoundError("Workspace not found");
    }
  }

  static async requireOwner(data) {
    const workspace = await this.requireWorkspace(data);

    if (workspace.owner_id !== data.user.id) {
      throw new NotFoundError("Workspace not found");
    }

    return workspace;
  }
}
module.exports = WorkspaceService;
