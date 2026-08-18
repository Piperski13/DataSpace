const Chat = require("../../model/chat.repository.js");
const { redisClient } = require("../../config/redisClient.js");

class ChatService {
  static async getMessages() {
    return Chat.getMessages();
  }

  static async deleteAllMessages() {
    return Chat.deleteAllMessages();
  }
  static async createMessage({ userId, user, text, rateLimitKey }) {
    const ttl = Number(process.env.TIME_WINDOW) || 5;
    const limit = Number(process.env.MESSAGE_LIMIT);

    const currentCount = await redisClient.get(rateLimitKey);

    if (!currentCount) {
      await redisClient.setEx(rateLimitKey, ttl, "1");
    } else {
      await redisClient.incr(rateLimitKey);
    }

    const count = currentCount ? Number(currentCount) : 0;

    if (count >= limit) {
      return null;
    }

    return Chat.createMessage(userId, user, text);
  }
}

module.exports = ChatService;
