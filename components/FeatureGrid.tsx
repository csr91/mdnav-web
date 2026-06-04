"use client";

import { useEffect, useRef, useState } from "react";

export type Feature = { icon: string; label: string; title: string; desc: string };

const VISIBLE   = 6;
const INTERVAL  = 3500;
const FADE_MS   = 420;

export default function FeatureGrid({ features }: { features: readonly Feature[] }) {
  const [shown,  setShown]  = useState<number[]>(() => Array.from({ length: VISIBLE }, (_, i) => i));
  const [fading, setFading] = useState<Set<number>>(new Set());
  const shownRef = useRef(shown);
  shownRef.current = shown;

  useEffect(() => {
    if (features.length <= VISIBLE) return;

    const timer = setInterval(() => {
      const current = shownRef.current;
      const pos     = Math.floor(Math.random() * VISIBLE);
      const pool    = features.map((_, i) => i).filter(i => !current.includes(i));
      if (!pool.length) return;

      const next = pool[Math.floor(Math.random() * pool.length)];

      setFading(prev => new Set([...prev, pos]));

      setTimeout(() => {
        setShown(prev => { const s = [...prev]; s[pos] = next; return s; });
        setTimeout(() => setFading(prev => { const s = new Set(prev); s.delete(pos); return s; }), 40);
      }, FADE_MS);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [features]);

  return (
    <div className="grid grid-2">
      {shown.map((fi, pos) => {
        const f = features[fi];
        return (
          <div
            key={pos}
            className="card"
            style={{ opacity: fading.has(pos) ? 0 : 1, transition: `opacity ${FADE_MS}ms ease` }}
          >
            <div className="feat-icon">{f.icon}</div>
            <p className="kicker" style={{ marginBottom: "6px" }}>{f.label}</p>
            <h3 style={{ margin: "0 0 8px", fontSize: "16px" }}>{f.title}</h3>
            <p className="muted" style={{ margin: 0, fontSize: "14px", lineHeight: "1.6" }}>{f.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
