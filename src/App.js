import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [gameStarted, setGameStarted] = useState(false); 
  const [basketPosition, setBasketPosition] = useState(50); 
  const [fallingObjects, setFallingObjects] = useState([]); 
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0); 
  const maxMissed = 5; 

 
  useEffect(() => {
    let movement = 0;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") movement = -1;
      if (e.key === "ArrowRight" || e.key === "d") movement = 1;
    };

    const handleKeyUp = (e) => {
      if (
        e.key === "ArrowLeft" ||
        e.key === "a" ||
        e.key === "ArrowRight" ||
        e.key === "d"
      ) {
        movement = 0;
      }
    };

    const moveBasket = () => {
      setBasketPosition((prev) => {
        let newPosition = prev + movement * 0.5; 
        return Math.max(0, Math.min(100, newPosition)); 
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const interval = setInterval(moveBasket, 10); 

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      clearInterval(interval);
    };
  }, []);

  
  useEffect(() => {
    if (!gameStarted) return;

    const interval = setInterval(() => {
      setFallingObjects((prev) => [
        ...prev,
        {
          id: Date.now(),
          position: Math.random() * 100,
          top: 0,
        },
      ]);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted]);

  
  useEffect(() => {
    if (!gameStarted) return;

    const interval = setInterval(() => {
      setFallingObjects((prev) =>
        prev
          .map((obj) => ({
            ...obj,
            top: obj.top + 0.5, 
          }))
          .filter((obj) => {
            if (
              obj.top >= 90 && 
              obj.position >= basketPosition - 10 && 
              obj.position <= basketPosition + 10
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
    }, 10);

    return () => clearInterval(interval);
  }, [gameStarted, basketPosition]);


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
        </div>
      ) : (
        <div className="game-container">
          <div
            className="basket"
            style={{ left: `${basketPosition}%` }}
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
