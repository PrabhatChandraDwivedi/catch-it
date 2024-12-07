import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import sheep from "./Assets/sheep.png";
import boyWithBasket from "./Assets/boy_with_basket.png";
import Story from "./Components/Story/Story";

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [fallingObjects, setFallingObjects] = useState([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const maxMissed = 10;
  const [gameOver, setGameOver] = useState(false);
  const [storyStarted, setStoryStarted] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

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
  const storyData = [
    { image: "/images/story1.png", text: "This is how it all began..." },
    { image: "/images/story2.png", text: "You are on an adventure." },
    { image: "/images/story3.png", text: "Danger is lurking nearby..." },
    { image: "/images/story4.png", text: "Get ready to catch it!" },
  ];
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") movementRef.current = -2.5;
      if (e.key === "ArrowRight" || e.key === "d") movementRef.current = 2.5;
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
        { id: Date.now(), position: Math.random() * 100, top: 0, rotation: Math.random() * 360 },
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
            const isWithinHorizontalBounds =
              obj.position >= basketPositionRef.current - 10 &&
              obj.position <= basketPositionRef.current + 10;
  
            const isAtBasketHeight = obj.top >= 70; 
            if (isWithinHorizontalBounds && isAtBasketHeight) {
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
  
  const startGame = () => {
    setStoryStarted(false);
    setGameStarted(true);
  };

  const nextStory = () => {
    if (currentStoryIndex < storyData.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      startGame();
    }
  };
  

  useEffect(() => {
    if (missed >= maxMissed) {
      setGameOver(true);
      setGameStarted(false);
      setFallingObjects([]);
    }
  }, [missed]);

  const restartGame = () => {
    setGameStarted(true);
    setScore(0);
    setMissed(0);
    setFallingObjects([]);
    setGameOver(false);
    basketPositionRef.current = 50; 
  };

  const quitGame = () => {
    setGameStarted(false);
    setScore(0);
    setMissed(0);
    setFallingObjects([]);
    setGameOver(false);
    basketPositionRef.current = 50;
  };

  return (
    <div className="app">
      {!storyStarted && !gameStarted && (
        <div className="landing">
          <h1>Catch It</h1>
          <button onClick={() => setStoryStarted(true)}>Play</button>
          {glowingSpots.map((spot, index) => (
            <div
              key={index}
              className="glowing-spot"
              style={{ left: `${spot.left}%`, top: `${spot.top}%` }}
            ></div>
          ))}
        </div>
      ) }
      {storyStarted && !gameStarted && (
        <Story
          currentStory={storyData[currentStoryIndex]}
          onNext={nextStory}
          onSkip={startGame}
          isLastStory={currentStoryIndex === storyData.length - 1}
        />
      )}

       {gameStarted && (
        <div className="game-container">
          <img
            src={boyWithBasket}
            alt="Boy with Basket"
            className="basket"
            style={{ left: `${basketPositionRef.current}%` }}
          />
          {fallingObjects.map((obj) => (
            <div
              key={obj.id}
              className="falling-object"
              style={{
                left: `${obj.position}%`,
                top: `${obj.top}%`,
                transform: `rotate(${obj.rotation}deg)`,
              }}
            >
              <img src={sheep} alt="Sheep" className="sheep" />
            </div>
          ))}
          <div className="score-board">Score: {score}</div>
          <div className="missed-board">Missed: {missed}</div>
        </div>
      )}

      {gameOver && (
        <div className="game-over-modal">
          <div className="modal-content">
            <h2>Game Over</h2>
            <p>Your Score: {score}</p>
            <button onClick={restartGame}>Restart</button>
            <button onClick={quitGame}>Quit</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
