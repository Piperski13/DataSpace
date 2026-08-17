const File = require("../../model/files.repository.js");
const fs = require("fs/promises");
const path = require("path");
const NotFoundError = require("../../errors/not-found.error.js");

class FileService {
  static async create({ files, recordId }) {
    if (!files || files.length === 0) {
      return;
    }

    const fileRows = files.map((file) => ({
      record_id: recordId,
      filename: file.filename,
      original_name: file.originalname,
      path: file.path.replace(/\\/g, "/"),
      mimetype: file.mimetype,
      size: file.size,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    return File.create(fileRows);
  }
  static async removeMany({ deletedFiles }) {
    if (!deletedFiles || deletedFiles.length === 0) {
      return;
    }
    const removedFiles = await File.removeMany(deletedFiles);

    await this.unlink(removedFiles);

    return removedFiles;
  }
  static async getByRecordId(recordId) {
    const files = await File.getByRecordId(recordId);
    return files;
  }
  static async getByCollection(collectionId) {
    const files = await File.getByCollectionId(collectionId);
    return files;
  }
  static async getByWorkspace(workspaceId) {
    const files = await File.getByWorkspaceId(workspaceId);
    return files;
  }
  static async unlink(files) {
    for (const file of files) {
      try {
        await fs.unlink(file.path);
      } catch (error) {
        console.error(error.message);
      }
    }
  }
}
module.exports = FileService;
