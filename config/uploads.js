const fs = require("node:fs");
const path = require("node:path");

const uploadsPath = path.resolve(process.env.UPLOADS_PATH);

fs.mkdirSync(uploadsPath, { recursive: true });

module.exports = {
  uploadsPath,
};
