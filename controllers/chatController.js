const ChatService = require("../services/chat/chat.service.js");
const asyncHandler = require("../middleware/errors/asyncHandler");
const {
  formatSimpleMessengerTime,
} = require("../public/scripts/websocket/serverUtils.js");

const path = require("path");

const showChat = asyncHandler(async (req, res) => {
  const messages = await ChatService.getMessages();

  return res.render("chat", {
    user: req.user,
    messages,
    formatDate: formatSimpleMessengerTime,
  });
});

const deleteAllMessages = asyncHandler(async (req, res) => {
  await ChatService.deleteAllMessages();

  return res.sendStatus(204);
});

module.exports = {
  showChat,
  deleteAllMessages,
};
