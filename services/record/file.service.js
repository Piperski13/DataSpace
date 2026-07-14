const File = require("../../model/files.repository.js");

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
}
module.exports = FileService;
