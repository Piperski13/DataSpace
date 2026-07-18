const View = require("../model/viewModel.js");
const Users = require("../model/usersModel.js");
const File = require("../model/files.repository.js");
const Chat = require("../model/chatModel.js");
const {
  formatSimpleMessengerTime,
} = require("../public/scripts/websocket/serverUtils.js");

const path = require("path");

const showChat = async (req, res) => {
  const messages = await Chat.getMessages();
  res.render("chat", {
    user: req.user,
    messages,
    formatDate: formatSimpleMessengerTime,
  });
};

const showUsers = async (req, res) => {
  const email = req.query.email || "";
  const data = await View.filterUsers(email);

  res.render("users", { user: req.user, data, email });
};

const showUpdateUser = async (req, res, next, errors = []) => {
  try {
    const { id } = req.params;
    let profile = null;

    if (id) {
      profile = await Users.getById(id);
    }

    res.render("updateUser", {
      user: req.user,
      profile,
      errors,
    });
  } catch (error) {
    console.error("Error in showUpdateUser:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  showChat,
  showUsers,
  showUpdateUser,
};
