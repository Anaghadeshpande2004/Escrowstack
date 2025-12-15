import React, { useEffect, useState, useRef } from "react";

/*
  Stock card with:
  - Real-time price
  - Percent change
  - Smooth, realistic sparkline using canvas
*/

export default function StockCard({ ticker, initial, onToggleSubscribe, subscribed }) {
  const [price, setPrice] = useState(initial || 0);
  const [pct, setPct] = useState(0);

  const canvasRef = useRef(null);
  const historyRef = useRef([]);

  // Seed initial history
  useEffect(() => {
    if (initial) {
      historyRef.current = Array.from({ length: 30 }, () => initial);
      draw();
    }
    // eslint-disable-next-line
  }, []);

  // Listen for price updates
  useEffect(() => {
    const key = `price_update_${ticker}`;

    function handler(ev) {
      const data = ev.detail;

      setPrice(data.price);
      setPct(data.pctChange);

      // Add realistic jitter so graph doesn't look flat
      const noise = (Math.random() - 0.5) * 1.2;
      historyRef.current.push(data.price + noise);

      if (historyRef.current.length > 40) {
        historyRef.current.shift();
      }

      draw();
    }

    window.addEventListener(key, handler);
    return () => window.removeEventListener(key, handler);
    // eslint-disable-next-line
  }, [ticker]);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.width = 220;
    const h = canvas.height = 60;

    ctx.clearRect(0, 0, w, h);

    const data = historyRef.current;
    if (data.length < 2) return;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const pad = 6;

    const scaleX = (i) =>
      pad + (i / (data.length - 1)) * (w - pad * 2);

    const scaleY = (v) =>
      h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);

    // Gradient line
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, pct >= 0 ? "#22c55e" : "#fb7185");
    gradient.addColorStop(1, "#60a5fa");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.shadowBlur = 8;
    ctx.shadowColor = pct >= 0 ? "#22c55e" : "#fb7185";

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = scaleX(i);
      const y = scaleY(v);
      if (i === 0) ctx.moveTo(x, y);
      else {
        const px = scaleX(i - 1);
        const py = scaleY(data[i - 1]);
        ctx.quadraticCurveTo(px, py, x, y);
      }
    });
    ctx.stroke();

    // Remove glow for future draws
    ctx.shadowBlur = 0;
  }

  return (
    <div
      style={{
        background: "linear-gradient(180deg,#0b1c33,#091427)",
        borderRadius: 14,
        padding: 14,
        width: 260,
        boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        color: "#eafaf6",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{ticker}</div>
        <button
          onClick={() => onToggleSubscribe(ticker)}
          style={{
            borderRadius: 8,
            padding: "6px 10px",
            border: "none",
            background: subscribed ? "#ef4444" : "#10b981",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {subscribed ? "Unsub" : "Sub"}
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>
          ${price.toFixed(2)}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: pct >= 0 ? "#86efac" : "#fb7185",
          }}
        >
          {pct >= 0 ? `+${pct}%` : `${pct}%`}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: 60 }}
      />
    </div>
  );
}
