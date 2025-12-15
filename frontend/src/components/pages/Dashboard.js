// src/components/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import StockCard from "../StockCard";
import { connectSocket, getSocket } from "../../lib/socket";

const SUPPORTED = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];

export default function Dashboard() {
  const [socketReady, setSocketReady] = useState(false);
  const [subscriptions, setSubscriptions] = useState(() => {
    // saved subscriptions per email
    try {
      const email = localStorage.getItem("escrow_user_email") || "";
      const key = `subs_${email}`;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [prices, setPrices] = useState({}); // ticker -> price & pct

  useEffect(() => {
    const email = localStorage.getItem("escrow_user_email");
    const s = connectSocket(email);
    s.on("connect", () => setSocketReady(true));
    // initial subscription responses
    s.on("subscribed", (payload) => {
      setPrices(prev => ({ ...prev, [payload.ticker]: { price: payload.price, pctChange: 0 } }));
    });
    // price updates arrive in real time
    s.on("price_update", (data) => {
      setPrices(prev => ({ ...prev, [data.ticker]: { price: data.price, pctChange: data.pctChange } }));
      // also dispatch a DOM CustomEvent so StockCard can render its own tiny canvas update
      window.dispatchEvent(new CustomEvent(`price_update_${data.ticker}`, { detail: data }));
    });
    return () => {
      try { const so = getSocket(); if (so) so.off("price_update"); } catch(e){}
    };
  }, []);

  useEffect(() => {
    // persist subscriptions per user
    const email = localStorage.getItem("escrow_user_email") || "";
    const key = `subs_${email}`;
    localStorage.setItem(key, JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
  if (!socketReady) return;

  const s = getSocket();

  // auto-subscribe previously saved stocks
  subscriptions.forEach(ticker => {
    s.emit("subscribe", { ticker });
  });

}, [socketReady]);   // 🔑 runs once socket is ready

  function toggleSubscribe(ticker) {
    const s = getSocket();
    const isSub = subscriptions.includes(ticker);
    if (!isSub) {
      // subscribe
      s.emit("subscribe", { ticker });
      setSubscriptions(prev => [...prev, ticker]);
    } else {
      s.emit("unsubscribe", { ticker });
      setSubscriptions(prev => prev.filter(t => t !== ticker));
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: "18px auto" }}>
      <h1 style={{ marginTop: 0 }}>Real-time Stock Dashboard</h1>
      <p style={{ color: "#cfece4" }}>Supported tickers: {SUPPORTED.join(" • ")}</p>

      <section style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
        {SUPPORTED.map(t => (
          <StockCard
            key={t}
            ticker={t}
            initial={(prices[t] && prices[t].price) || 0}
            subscribed={subscriptions.includes(t)}
            onToggleSubscribe={toggleSubscribe}
          />
        ))}
      </section>

      <section style={{ marginTop: 20 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 10 }}>
          <h3 style={{ margin: 0 }}>Your Subscriptions</h3>
          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {subscriptions.length === 0 && <div style={{ color: "#d6f6ee" }}>No subscriptions yet — click Sub on a card.</div>}
            {subscriptions.map(t => {
              const p = prices[t] || { price: 0, pctChange: 0 };
              return (
                <div key={t} style={{ minWidth: 160, background: "rgba(0,0,0,0.15)", padding: 8, borderRadius: 8 }}>
                  <div style={{ fontWeight: 800 }}>{t}</div>
                  <div>${(p.price || 0).toFixed(2)} <span style={{ color: p.pctChange >= 0 ? "#86efac" : "#fb7185" }}>{p.pctChange >= 0 ? `+${p.pctChange}%` : `${p.pctChange}%`}</span></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
