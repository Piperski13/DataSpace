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

const deleteAll = async (req, res) => {
  try {
    await Chat.DeleteAllMessages();

    return res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = {
  showChat,
  deleteAll,
};
