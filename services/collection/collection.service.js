const Collection = require("../../model/collection.repository.js");
const Record = require("../../model/record.repository.js");
const WorkspaceService = require("../workspace/workspace.service.js");
const FileService = require("../record/file.service.js");

const NotFoundError = require("../../errors/not-found.error.js");

class CollectionService {
  static async requireCollection(data) {
    const collection = await Collection.findOne(data);

    if (!collection) {
      throw new NotFoundError("Collection not found");
    }
    return collection;
  }
  static async getDetails(data) {
    const collection = await this.requireCollection(data);

    const records = await Record.findMany(data);

    return {
      collection,
      records,
    };
  }
  static async create(data) {
    await WorkspaceService.requireOwnerWorkspace(data);

    return Collection.create(data);
  }
  static async update(data) {
    await this.requireCollection(data);

    const collection = await Collection.update(data);

    if (!collection) {
      throw new NotFoundError("Collection not found");
    }

    return collection;
  }
  static async remove(data) {
    await this.requireCollection(data);

    const files = await FileService.getByCollection(data.collectionId);

    const collection = await Collection.remove(data);

    if (!collection) {
      throw new NotFoundError("Collection not found");
    }

    await FileService.unlink(files);

    return collection;
  }
}
module.exports = CollectionService;
