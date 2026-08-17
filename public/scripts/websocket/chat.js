import { formatSimpleMessengerTime } from "./clientUtils.js";

const socket = io(); // connects to the same server

const chatBox = document.getElementById("chat-box");
const message = document.getElementById("msgInput");
const buttonSend = document.getElementById("btnSend");
const buttonDeleteAll = document.getElementById("btnDeleteAll");
const rateLimit = document.getElementById("rate-limit");
const noMessage = document.getElementById("noMsg");

function isUserNearBottom(threshold = 50) {
  return (
    chatBox.scrollTop + chatBox.clientHeight >= chatBox.scrollHeight - threshold
  );
}

function sendingMessage(buttonElement) {
  if (!message.value.trim()) return;

  const first_name = buttonElement.dataset.first_name;
  const userId = buttonElement.dataset.id;

  socket.emit("newMessage", {
    userId: userId,
    user: first_name,
    text: message.value,
  });
  message.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
  toggleSendButton();
}

function toggleSendButton() {
  if (message.value.trim().length > 0) {
    buttonSend.classList.add("enabled");
  } else {
    buttonSend.classList.remove("enabled");
  }
}

function removeLimiter() {
  message.classList.remove("input-rate-limit");
  rateLimit.classList.add("hidden");
}

function noChatMessage() {
  const messageCount = chatBox.childElementCount;
  if (messageCount > 2) {
    noMessage.classList.add("hidden");
  } else {
    noMessage.classList.remove("hidden");
  }
}

window.addEventListener("load", () => {
  chatBox.scrollTop = chatBox.scrollHeight;
  noChatMessage();
});

message.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendingMessage(this);
  }
});

buttonSend.addEventListener("click", function () {
  sendingMessage(this);
});

message.addEventListener("input", toggleSendButton);

if (buttonDeleteAll) {
  buttonDeleteAll.addEventListener("click", async function () {
    if (!confirm("Are you sure you want to clear all messages?")) return;

    try {
      const response = await fetch("/chat/messages", {
        method: "POST",
      });

      if (response.ok) {
        socket.emit("DeleteAllMessages");
      } else {
        console.error(
          `Server Error: ${response.status} ${response.statusText}`,
        );
        alert("Failed to delete messages.");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  });
}

socket.on("MessagesDeleted", () => {
  const messages = chatBox.querySelectorAll(".single-message");
  messages.forEach((msg) => msg.remove());
  noChatMessage();
});

socket.on("connect", () => {
  console.log("Connected with socket id:", socket.id);
});

socket.on("recieved-message", (data) => {
  removeLimiter();
  const shouldAutoScroll = isUserNearBottom();

  const formattedTime = formatSimpleMessengerTime(data.created_at);

  const div = document.createElement("div");
  div.classList.add("single-message");

  const usernameSpan = document.createElement("span");
  usernameSpan.classList.add("username");
  usernameSpan.textContent = `${data.username}: `;

  div.appendChild(usernameSpan);
  div.append(`${data.message} (${formattedTime})`);

  chatBox.appendChild(div);

  if (shouldAutoScroll) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  noChatMessage();
});

socket.on("rate-limit", (data) => {
  rateLimit.classList.remove("hidden");
  rateLimit.textContent = `${data.message}`;
  message.classList.add("input-rate-limit");
});
