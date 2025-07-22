import React, { useState, useEffect } from "react";
import "./Minesweeper.scss";

const ROWS = 10;
const COLS = 10;
const MINES = 20;

function createEmptyGrid() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );
}

// Randomly plant mines and calculate adjacent counts
function generateMines(grid) {
  let minesPlaced = 0;
  while (minesPlaced < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!grid[r][c].mine) {
      grid[r][c].mine = true;
      minesPlaced++;
    }
  }
  // Calculate adjacent numbers
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!grid[r][c].mine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (
              nr >= 0 &&
              nr < ROWS &&
              nc >= 0 &&
              nc < COLS &&
              grid[nr][nc].mine
            ) {
              count++;
            }
          }
        }
        grid[r][c].adjacent = count;
      }
    }
  }
  return grid;
}

function cloneGrid(grid) {
  return grid.map(row => row.map(cell => ({ ...cell })));
}

export default function Minesweeper() {
  const [grid, setGrid] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Initialize the grid
  useEffect(() => {
    resetGame();
    // eslint-disable-next-line
  }, []);

  function resetGame() {
    let newGrid = createEmptyGrid();
    newGrid = generateMines(newGrid);
    setGrid(newGrid);
    setGameOver(false);
    setGameWon(false);
  }

  function revealCell(r, c, gridCopy = null) {
    if (gameOver || gameWon) return;
    let g = gridCopy ? gridCopy : cloneGrid(grid);
    const cell = g[r][c];
    if (cell.revealed || cell.flagged) return g;
    cell.revealed = true;
    if (cell.mine) {
      setGameOver(true);
      // Reveal all mines
      for (let i = 0; i < ROWS; i++)
        for (let j = 0; j < COLS; j++)
          if (g[i][j].mine) g[i][j].revealed = true;
      setGrid(g);
      return g;
    }
    // Recursive reveal if no adjacent mines
    if (cell.adjacent === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (
            nr >= 0 &&
            nc >= 0 &&
            nr < ROWS &&
            nc < COLS &&
            !(dr === 0 && dc === 0)
          ) {
            if (!g[nr][nc].revealed && !g[nr][nc].mine) {
              revealCell(nr, nc, g);
            }
          }
        }
      }
    }
    setGrid(g);
    return g;
  }

  function handleCellClick(r, c) {
    if (gameOver || gameWon) return;
    if (grid[r][c].flagged) return;
    revealCell(r, c);
    checkGameComplete();
  }

  function handleRightClick(e, r, c) {
    e.preventDefault();
    if (gameOver || gameWon) return;
    let g = cloneGrid(grid);
    if (!g[r][c].revealed) {
      g[r][c].flagged = !g[r][c].flagged;
      setGrid(g);
      checkGameComplete();
    }
  }

  function checkGameComplete() {
    let complete = true;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = grid[r][c];
        if (!cell.mine && !cell.revealed) {
          complete = false;
        }
      }
    }
    if (complete && !gameOver) {
      setGameWon(true);
      // Reveal all mines
      let g = cloneGrid(grid);
      for (let i = 0; i < ROWS; i++)
        for (let j = 0; j < COLS; j++)
          if (g[i][j].mine) g[i][j].revealed = true;
      setGrid(g);
    }
  }

  return (
    <div>
      <table className="minesweeper-board">
        <tbody>
          {grid.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={
                    cell.revealed
                      ? cell.mine
                        ? "mine"
                        : "active"
                      : ""
                  }
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={e => handleRightClick(e, r, c)}
                  style={{
                    userSelect: "none",
                    cursor: gameOver || gameWon ? "not-allowed" : "pointer",
                  }}
                >
                  {cell.revealed
                    ? cell.mine
                      ? "💣"
                      : cell.adjacent || ""
                    : cell.flagged
                    ? "🚩"
                    : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button className="reset-btn" onClick={resetGame}>
        Reset Game
      </button>
      {(gameOver || gameWon) && (
        <div style={{ marginTop: 10, fontWeight: "bold" }}>
          {gameOver ? "Game Over!" : "You Found All Mines!"}
        </div>
      )}
    </div>
  );
}