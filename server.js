require("dotenv").config();

const { createServer } = require("http");
const { Server } = require("socket.io");

const app = require("./app.js");
const { connectRedis } = require("./config/redisClient");
const { handleNewMessage } = require("./services/chat/socket.service.js");

const httpServer = createServer(app);
const port = Number(process.env.PORT) || 3000;

const io = new Server(httpServer, {});

io.on("connection", (socket) => {
  socket.on("newMessage", async (message) => {
    await handleNewMessage(socket, message, io);
  });
  socket.on("DeleteAllMessages", async () => {
    io.emit("MessagesDeleted");
  });
});

const startServer = async () => {
  await connectRedis();

  httpServer.listen(port, () => {
    console.log(`App running on port ${port}`);
  });
};

startServer();
