import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [fallingObjects, setFallingObjects] = useState([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const maxMissed = 5;

  const basketPositionRef = useRef(50);
  const movementRef = useRef(0); 
  const glowingSpots = Array.from({ length: 50 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
  }));

  const animationFrameRefs = useRef({
    moveBasket: null,
    fallLoop: null,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") movementRef.current = -1;
      if (e.key === "ArrowRight" || e.key === "d") movementRef.current = 1;
    };

    const handleKeyUp = () => {
      movementRef.current = 0;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const moveBasket = () => {
      basketPositionRef.current = Math.max(
        0,
        Math.min(100, basketPositionRef.current + movementRef.current * 0.5)
      );
      animationFrameRefs.current.moveBasket = requestAnimationFrame(moveBasket);
    };

    animationFrameRefs.current.moveBasket = requestAnimationFrame(moveBasket);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrameRefs.current.moveBasket);
    };
  }, []);

  useEffect(() => {
    if (!gameStarted) return;

    const spawnInterval = 1000; 
    let spawnTimeout;

    const spawnFallingObjects = () => {
      setFallingObjects((prev) => [
        ...prev,
        { id: Date.now(), position: Math.random() * 100, top: 0 },
      ]);
      spawnTimeout = setTimeout(spawnFallingObjects, spawnInterval);
    };

    spawnFallingObjects(); 

    return () => {
      clearTimeout(spawnTimeout);
    };
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted) return;

    const fallObjects = () => {
      setFallingObjects((prev) =>
        prev
          .map((obj) => ({ ...obj, top: obj.top + 1 }))
          .filter((obj) => {
            if (
              obj.top >= 90 &&
              obj.position >= basketPositionRef.current - 10 &&
              obj.position <= basketPositionRef.current + 10
            ) {
              setScore((prev) => prev + 1);
              return false;
            }
            if (obj.top > 100) {
              setMissed((prev) => prev + 1);
              return false;
            }
            return true;
          })
      );
      animationFrameRefs.current.fallLoop = requestAnimationFrame(fallObjects);
    };

    animationFrameRefs.current.fallLoop = requestAnimationFrame(fallObjects);

    return () => {
      cancelAnimationFrame(animationFrameRefs.current.fallLoop);
    };
  }, [gameStarted]);

  useEffect(() => {
    if (missed >= maxMissed) {
      alert(`Game Over! Your Score: ${score}`);
      setGameStarted(false);
      setScore(0);
      setMissed(0);
      setFallingObjects([]);
    }
  }, [missed, score]);

  return (
    <div className="app">
      {!gameStarted ? (
        <div className="landing">
          <h1>Catch It</h1>
          <button onClick={() => setGameStarted(true)}>Play</button>
          {glowingSpots.map((spot, index) => (
            <div
              key={index}
              className="glowing-spot"
              style={{ left: `${spot.left}%`, top: `${spot.top}%` }}
            ></div>
          ))}
        </div>
      ) : (
        <div className="game-container">
          <div
            className="basket"
            style={{ left: `${basketPositionRef.current}%` }}
          ></div>
          {fallingObjects.map((obj) => (
            <div
              key={obj.id}
              className="falling-object"
              style={{
                left: `${obj.position}%`,
                top: `${obj.top}%`,
              }}
            ></div>
          ))}
          <div className="score-board">Score: {score}</div>
          <div className="missed-board">Missed: {missed}</div>
        </div>
      )}
    </div>
  );
}

export default App;