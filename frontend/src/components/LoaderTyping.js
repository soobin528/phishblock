import React from "react";
import "./LoaderTyping.css";

function LoaderTyping() {
  return (
    <div className="typing-container">
      <span>AI 분석 중…</span>
      <div className="dots">
        <div></div><div></div><div></div>
      </div>
    </div>
  );
}

export default LoaderTyping;
