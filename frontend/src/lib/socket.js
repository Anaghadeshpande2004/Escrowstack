// src/lib/socket.js
import { io } from "socket.io-client";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "https://escrowstack-backend.onrender.com";

let socket = null;
export function connectSocket(email) {
  if (socket && socket.connected) return socket;
  socket = io(SERVER_URL, { autoConnect: true });
  socket.on("connect", () => {
    socket.emit("identify", { email: email || localStorage.getItem("escrow_user_email") });
  });
  return socket;
}

export function getSocket() {
  return socket;
}
