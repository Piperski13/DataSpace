const ChatService = require("./chat.service");

async function handleNewMessage(socket, message, io) {
  try {
    const insertedMessage = await ChatService.createMessage({
      userId: message.userId,
      user: message.user,
      text: message.text,
      rateLimitKey: socket.id,
    });

    if (!insertedMessage) {
      socket.emit("rate-limit", {
        message: "Too many messages. Slow down.",
      });
      return;
    }

    io.emit("recieved-message", insertedMessage);
  } catch (error) {
    console.error(error);

    socket.emit("chat-error", {
      message: "Unable to send message.",
    });
  }
}

module.exports = {
  handleNewMessage,
};
