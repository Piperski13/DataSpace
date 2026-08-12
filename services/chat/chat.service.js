const Chat = require("../../model/chat.repository.js");

class ChatService {
  static async getMessages() {
    return Chat.getMessages();
  }

  static async deleteAllMessages() {
    return Chat.deleteAllMessages();
  }
}

module.exports = ChatService;
