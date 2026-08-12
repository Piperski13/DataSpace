const pool = require("../db/pool");
const Chat = require("../model/chat.repository");
const Redis = require("redis");

const redisClient = require("../config/redisClient");

async function handleNewMessage(socket, msg, io) {
  try {
    const TTL = Number(process.env.TIME_WINDOW) || 5;
    const key = socket.id;
    const currentCount = await redisClient.get(key);

    if (!currentCount) {
      redisClient.setEx(key, TTL, "1");
    } else {
      await redisClient.incr(key);
    }

    const count = currentCount ? Number(currentCount) : 0;

    if (count >= Number(process.env.MESSAGE_LIMIT)) {
      socket.emit("rate-limit", {
        message: "Too many messages. Slow down.",
      });
      return;
    }

    const insertedMessage = await Chat.createMessage(
      msg.userId,
      msg.user,
      msg.text,
    );

    // broadcast to clients
    io.emit("recieved-message", insertedMessage);
  } catch (error) {
    console.error(error);
  }
}
module.exports = { handleNewMessage };
