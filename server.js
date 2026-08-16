const { createServer } = require("http");
const { Server } = require("socket.io");
const { handleNewMessage } = require("./services/chat/socket.service.js");
const app = require("./app.js");

require("dotenv").config("./env");

const httpServer = createServer(app);
const port = process.env.PORT || 3000;

const io = new Server(httpServer, {});

io.on("connection", (socket) => {
  socket.on("newMessage", async (message) => {
    await handleNewMessage(socket, message, io);
  });
  socket.on("DeleteAllMessages", async () => {
    io.emit("MessagesDeleted");
  });
});

httpServer.listen(port, () => {
  console.log(`App running on port ${port}`);
});
