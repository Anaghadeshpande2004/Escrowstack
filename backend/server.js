// backend/server.js
// Simple Express + Socket.IO server that simulates stock prices
// Supported tickers: GOOG, TSLA, AMZN, META, NVDA

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, methods: ["GET", "POST"] },
});

const PORT = process.env.PORT || 4000;

// Supported tickers and initial baseline prices
const TICKERS = {
  GOOG: { price: 1400 },
  TSLA: { price: 300 },
  AMZN: { price: 3200 },
  META: { price: 300 },
  NVDA: { price: 500 },
};

// Keep last N prices for quick history (client-side can maintain too)
const HISTORY_LENGTH = 60;
const history = {};
for (const t of Object.keys(TICKERS)) history[t] = [TICKERS[t].price];

function gaussianRandom() {
  // Box-Muller transform
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function updatePrices() {
  // small volatility per tick
  const sigma = 0.005; // 0.5% std dev per second
  for (const t of Object.keys(TICKERS)) {
    const old = TICKERS[t].price;
    const z = gaussianRandom();
    const pct = z * sigma;
    let next = old * (1 + pct);
    if (next < 0.01) next = 0.01;
    // round to 2 decimals
    next = Math.round(next * 100) / 100;
    const change = Math.round((next - old) * 100) / 100;
    const pctChange = old === 0 ? 0 : Math.round((change / old) * 10000) / 100;

    TICKERS[t].price = next;
    history[t].push(next);
    if (history[t].length > HISTORY_LENGTH) history[t].shift();

    // emit to the room for that ticker
    io.to(`TICKER_${t}`).emit("price_update", {
      ticker: t,
      price: next,
      change: change,
      pctChange: pctChange,
      timestamp: Date.now(),
    });
  }
}

// Run price updater every 1 second
setInterval(updatePrices, 1000);

// Simple route
app.get("/", (req, res) => {
  res.json({ ok: true, supported: Object.keys(TICKERS) });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  // The client may send "identify" after connecting with an email
  socket.on("identify", (payload) => {
    // payload = { email: "user@example.com" } optional
    const email = payload && payload.email ? payload.email : "unknown";
    socket.data.email = email;
    console.log(`socket ${socket.id} identified as ${email}`);
  });

  // subscribe to ticker
  socket.on("subscribe", ({ ticker }) => {
    if (!ticker || !TICKERS[ticker]) return;
    socket.join(`TICKER_${ticker}`);
    // send current price and small history on subscription
    socket.emit("subscribed", {
      ticker,
      price: TICKERS[ticker].price,
      history: history[ticker].slice(-30),
    });
    console.log(`socket ${socket.id} subscribed to ${ticker}`);
  });

  // unsubscribe
  socket.on("unsubscribe", ({ ticker }) => {
    if (!ticker) return;
    socket.leave(`TICKER_${ticker}`);
    console.log(`socket ${socket.id} unsubscribed from ${ticker}`);
  });

  // disconnect
  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
