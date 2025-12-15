// src/lib/socket.js
import { io } from "socket.io-client";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:4000";

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
