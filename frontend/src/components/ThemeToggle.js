import React from "react";

function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? "🌙 다크 모드" : "☀ 라이트 모드"}
    </button>
  );
}

export default ThemeToggle;
