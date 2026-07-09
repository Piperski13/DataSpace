const Collection = require("../../model/collection.repository.js");
const WorkspaceService = require("../workspace/workspace.service.js");

class CollectionService {
  static async requireCollection(data) {
    const collection = await Collection.findOne(data);

    if (!collection) {
      throw new Error("Collection not found");
    }
    return collection;
  }
  static async getDetails(data) {
    const workspace = await WorkspaceService.requireWorkspace(data);

    const collection = await this.requireCollection(data);

    return {
      workspace,
      collection,
    };
  }
  static async create(data) {
    await WorkspaceService.requireWorkspace(data);

    return Collection.create(data);
  }
  static async update(data) {
    await this.getDetails(data);

    const collection = await Collection.update(data);

    if (!collection) {
      throw new Error("Collection not found");
    }

    return collection;
  }
  static async remove(data) {
    await this.getDetails(data);

    const collection = await Collection.remove(data);

    if (!collection) {
      throw new Error("Collection not found");
    }

    return collection;
  }
}
module.exports = CollectionService;
