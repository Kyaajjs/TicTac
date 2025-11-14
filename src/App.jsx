import { useState, useEffect } from "react";

const INVASION_THRESHOLD = 5; 


function Square({ value, onSquareClick, useImages, imgX, imgO }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {useImages && value === "X" && <img src={imgX} width="50" />}
      {useImages && value === "O" && <img src={imgO} width="50" />}
      {!useImages && value}
    </button>
  );
}

// --- Componente Board (Sin cambios mayores, solo recibe nuevas props) ---
function Board({ xIsNext, squares, onPlay, useImages, imgX, imgO, movesMade }) {
  const [easterShown, setEasterShown] = useState(false);

  function handleClick(i) {
    // Si la IA está jugando o si la casilla ya está ocupada o ya hay un ganador, salir
    if (calculateWinner(squares) || squares[i]) return;

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares, i); // 🆕 onPlay ahora recibe la casilla jugada (i)
  }

  const winner = calculateWinner(squares);

  // 🎉 EASTER EGG CLAVADO
  if (winner === "X" && !easterShown) {
    setEasterShown(true);
    alert("BOMBA PA\nAlumno: Ulises Zárate Concha\nMatrícula: 66575");
  } else if (!winner && easterShown) {
    setEasterShown(false);
  }

  const status = winner
    ? "Winner: " + winner
    : "Next player: " + (xIsNext ? "X" : "O");

  return (
    <>
      <div className="status">{status}</div>

      {[0, 3, 6].map((start) => (
        <div key={start} className="board-row">
          {[0, 1, 2].map((offset) => {
            const i = start + offset;
            return (
              <Square
                key={i}
                value={squares[i]}
                onSquareClick={() => handleClick(i)}
                useImages={useImages}
                imgX={imgX}
                imgO={imgO}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

// --- Componente App (Maneja el estado del juego, el historial de movimientos de "invasión" y la IA) ---
export default function App() {
  // 🔄 ESTADOS SIMPLIFICADOS
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  // 💥 NUEVO ESTADO PARA CONTROLAR LA INVASIÓN
  // Guarda el índice de la casilla jugada en cada turno: [casilla_t1, casilla_t2, casilla_t3, ...]
  const [moveHistory, setMoveHistory] = useState([]);
  const movesMade = moveHistory.length; // Cuenta total de movimientos

  // --- IA Y CONFIGURACIÓN (Mantenida) ---
  const [useImages, setUseImages] = useState(false);
  const [gameMode, setGameMode] = useState("playerVsPlayer");

  const imgX = "https://emoji.aranja.com/static/emoji-data/img-apple-160/274c.png";
  const imgO = "https://emoji.aranja.com/static/emoji-data/img-apple-160/2b55.png";

  // 🔄 FUNCIÓN PRINCIPAL DE JUEGO CON LÓGICA DE INVASIÓN
  function handlePlay(nextSquares, playedIndex) {
    // 1. Lógica de Invasión (Borrando la casilla más antigua)
    const nextMoveHistory = [...moveHistory, playedIndex];

    if (nextMoveHistory.length > INVASION_THRESHOLD) {
      const oldestIndex = nextMoveHistory.shift(); // Saca el primer elemento (el más antiguo)
      nextSquares[oldestIndex] = null; // Borra el marcador de la casilla más antigua
    }

    // 2. Actualizar el Estado
    setSquares(nextSquares);
    setMoveHistory(nextMoveHistory);
    setXIsNext(!xIsNext);
  }

  // --- Lógica de la IA (Mantenida, ahora usa handlePlay) ---
  useEffect(() => {
    const winner = calculateWinner(squares);
    const isBoardFull = squares.every((square) => square !== null);

    if (
      gameMode === "playerVsAI" &&
      !xIsNext && // Es el turno de 'O' (la IA)
      !winner &&
      !isBoardFull
    ) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [movesMade, gameMode, xIsNext, squares]);

  const makeAIMove = () => {
    const emptySquares = squares
      .map((sq, index) => (sq === null ? index : null))
      .filter((index) => index !== null);

    if (emptySquares.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptySquares.length);
      const chosenSquare = emptySquares[randomIndex];

      const nextSquares = squares.slice();
      nextSquares[chosenSquare] = "O";
      handlePlay(nextSquares, chosenSquare); // 🆕 Llamada a handlePlay con el índice
    }
  };

  // 🔄 FUNCIÓN DE REINICIO GLOBAL
  function handleRestart() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setMoveHistory([]); // Reiniciar el historial de invasión
  }

  return (
    <div className="game">
      <h1>Tic-Tac-Toe</h1>

      {/* 🆕 CONTROL DEL MODO DE JUEGO */}
      <div style={{ marginBottom: "15px", fontSize: "14px" }}>
        Modo de Juego:{" "}
        <select value={gameMode} onChange={(e) => {
          setGameMode(e.target.value);
          handleRestart();
        }}>
          <option value="playerVsPlayer">Jugador vs Jugador</option>
          <option value="playerVsAI">Jugador vs FEDO (Aleatorio)</option>
        </select>
      </div>

      {/* 🔧 CONFIGURACIÓN */}
      <label style={{ fontSize: "14px", marginBottom: "10px", display: "block" }}>
        <input
          type="checkbox"
          checked={useImages}
          onChange={() => setUseImages(!useImages)}
        />{" "}
        Usar imágenes en lugar de X y O
      </label>

      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={squares}
          onPlay={handlePlay}
          useImages={useImages}
          imgX={imgX}
          imgO={imgO}
        />
        
        {/* 💥 INDICADOR DE INVASIÓN */}
        <p style={{ marginTop: "15px", fontSize: "14px", fontWeight: "bold" }}>
          Movimientos totales: {movesMade}. 
          Casillas desaparecen después de {INVASION_THRESHOLD} turnos.
        </p>

        <button
          onClick={handleRestart}
          style={{
            marginTop: "10px",
            padding: "10px 15px",
            fontSize: "16px",
            cursor: "pointer",
            display: "block",
          }}
        >
          Reiniciar Juego
        </button>
      </div>
    </div>
  );
}

// --- Función calculateWinner (Sin cambios) ---
function calculateWinner(squares) {
  // ... (cuerpo de la función calculateWinner sin cambios)
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
    [0, 4, 8], [2, 4, 6],           // Diagonal
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];

    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }

  return null;
}