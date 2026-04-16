import React from "react";
import "./RiskGauge.css";

export default function RiskGauge({ probability = 0 }) {
  const p = Math.max(0, Math.min(1, probability));

  let label = "안전";
  let color = "var(--safe)";
  if (p >= 0.7) {
    label = "위험";
    color = "var(--danger)";
  } else if (p >= 0.2) {
    label = "주의";
    color = "var(--warn)";
  }

  return (
    <div className="gauge-box">
      <div className="bar">
        <div className="fill" style={{ width: `${p * 100}%`, background: color }} />
      </div>
      <div className="level">
        <span className="chip" style={{ borderColor: color, color }}>
          {label}
        </span>
        <span className="pct">{(p * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}
