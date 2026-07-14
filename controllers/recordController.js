const Record = require("../model/recordsModel.js");
const File = require("../model/files-repository.js");
const fs = require("fs");
const path = require("path");
const { body, validationResult } = require("express-validator");
const { showAddRecord } = require("./viewController.js");

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 2 and 15 characters.";

const validateUser = [
  body("nazivelektrane")
    .trim()
    .isLength({ min: 2, max: 15 })
    .withMessage(`Nazivel Ektrane ${lengthErr}`),
  body("mesto")
    .trim()
    .isLength({ min: 2, max: 15 })
    .withMessage(`Mesto ${lengthErr}`),
  body("adresa")
    .trim()
    .isLength({ min: 2, max: 15 })
    .withMessage(`Adresa ${lengthErr}`),
];

const addRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return showAddRecord(req, res, [], errors.array());
    }

    const {
      nazivelektrane,
      mesto,
      adresa,
      datumpustanjaurad,
      sifravrstepogona,
    } = req.body;

    const user_id = req.user.id;

    const record = await Record.add({
      nazivelektrane,
      mesto,
      adresa,
      datumpustanjaurad,
      sifravrstepogona,
      user_id,
    });

    if (req.files && req.files.length > 0) {
      const fileRows = req.files.map((file) => ({
        record_id: record.id,
        user_id,
        filename: file.filename,
        original_name: file.originalname,
        path: file.path.replace(/\\/g, "/"),
        mimetype: file.mimetype,
        size: file.size,
      }));

      await File.addMany(fileRows);
    }

    res.redirect("/viewPage/recordsViewPage");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const recordId = parseInt(req.params.id);

    const files = await File.getByRecordId(recordId);

    files.forEach((file) => {
      const filePath = path.join(process.env.UPLOADS_PATH, file.filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await File.deleteByRecordId(recordId);

    const results = await Record.deleteById(recordId);

    if (results.rowCount === 0) {
      res
        .status(404)
        .json({ message: `Record with ${recordId} was not found ` });
    }
    res.redirect("/viewPage/recordsViewPage");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return showAddRecord(req, res, [], errors.array());
    }

    const recordId = parseInt(req.params.id);
    const {
      nazivelektrane,
      mesto,
      adresa,
      datumpustanjaurad,
      sifravrstepogona,
    } = req.body;

    await Record.updateById({
      recordId,
      nazivelektrane,
      mesto,
      adresa,
      datumpustanjaurad,
      sifravrstepogona,
    });

    const user_id = req.user.id;

    if (req.files && req.files.length > 0) {
      const fileRows = req.files.map((file) => ({
        record_id: recordId,
        user_id,
        filename: file.filename,
        original_name: file.originalname,
        path: file.path.replace(/\\/g, "/"),
        mimetype: file.mimetype,
        size: file.size,
      }));
      await File.addMany(fileRows);
    }

    res.redirect("/viewPage/recordsViewPage");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;

    const file = await File.getByFileId(fileId);
    if (!file) {
      return res.status(404).send("File not found");
    }

    try {
      fs.unlinkSync(file.path);
    } catch (e) {
      console.log("File already missing from disk, skipping");
      console.error(e);
    }

    await File.deleteByFileId(fileId);

    res.redirect(`/viewPage/addRecord/${file.record_id}`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal server error");
  }
};

module.exports = {
  addRecord,
  deleteRecord,
  updateRecord,
  deleteFile,
  validateUser,
};
