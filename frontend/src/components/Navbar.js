import React from "react";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">PhishingBlock</div>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#scan">Scan</a>
          <a href="#features">Features</a>
          <a href="#howto">How</a>
          <a href="Dev">Dev</a>
        </nav>
      </div>
    </header>
  );
}
