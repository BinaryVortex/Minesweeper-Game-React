import React from "react";
import Minesweeper from "./Minesweeper";
import "./index.css";

function App() {
  return (
    <div className="app-bg">
      <h1>MineSweeper</h1>
      <Minesweeper />
    </div>
  );
}

export default App;