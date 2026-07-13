const Record = require("../../model/record.repository.js");
const WorkspaceService = require("../workspace/workspace.service.js");
const CollectionService = require("../collection/collection.service.js");

const NotFoundError = require("../../errors/not-found.error.js");

class RecordService {
  static async requireRecord(data) {
    const record = await Record.findOne(data);

    if (!record) {
      throw new NotFoundError("Record not found");
    }
    return record;
  }
  static async getDetails(data) {
    const workspace = await WorkspaceService.requireWorkspace(data);

    const collection = await CollectionService.requireCollection(data);

    const record = await this.requireRecord(data);

    return {
      workspace,
      collection,
      recrod,
    };
  }
  static async create(data) {
    await WorkspaceService.requireWorkspace(data);
    await CollectionService.requireCollection(data);

    return Record.create(data);
  }
  static async update(data) {
    await this.getDetails(data);

    const record = await Record.update(data);

    if (!record) {
      throw new NotFoundError("Record not found");
    }

    return record;
  }
  static async remove(data) {
    await this.getDetails(data);

    const record = await Record.remove(data);

    if (!record) {
      throw new NotFoundError("Record not found");
    }

    return record;
  }
}
module.exports = RecordService;
