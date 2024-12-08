import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import sheep from "./Assets/sheep.png";
import boyWithBasket from "./Assets/boy_with_basket.png";
import Story from "./Components/Story/Story";
import happySheep from "./Assets/cute_sheep.png"
import beautiful_village from "./Assets/beautiful_village.png"
import mad_scientist from "./Assets/mad_scientist.png"
import sheep_in_cell from "./Assets/sheep_in_cell.png"
import backgroundMusic from './Assets/bgm.mp3';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [fallingObjects, setFallingObjects] = useState([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const maxMissed = 10;
  const [gameOver, setGameOver] = useState(false);
  const [storyStarted, setStoryStarted] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showDifficultyPopup, setShowDifficultyPopup] = useState(false);
  const [spawnInterval, setSpawnInterval] = useState(1000);

  const handleDifficultySelection = (level) => {
    if (level === "Easy") setSpawnInterval(1000); 
    if (level === "Medium") setSpawnInterval(800); 
    if (level === "Hard") setSpawnInterval(600); 
    setShowDifficultyPopup(false);
    setStoryStarted(true); 
  };

  const audioRef = useRef(new Audio(backgroundMusic));

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
    { image: {beautiful_village}, text: "In a small, unsuspecting village ..." },
    { image: {happySheep}, text: "There lived a magical sheep ..." },
    { image: {mad_scientist}, text: "An evil mad scientist, driven by his wild experiments ... kidnaps the sheep for his sinister plans ..." },
    { image: {sheep_in_cell}, text: "The sheep was kept in a cell hidden in a dungeon .... But a courageous boy, armed with only a basket, sets out on a mission to save the falling sheep and thwart the scientist's plans." },
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

  useEffect(() => {
    
    if (storyStarted || gameStarted) {
      audioRef.current.play();
      audioRef.current.loop = true; 
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; 
    }

    return () => {
      audioRef.current.pause();
    };
  }, [storyStarted, gameStarted]);
  
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
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentStoryIndex(0);
  };

  const quitGame = () => {
    setGameStarted(false);
    setScore(0);
    setMissed(0);
    setFallingObjects([]);
    setGameOver(false);
    basketPositionRef.current = 50;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentStoryIndex(0);
  };

  return (
    <div className="app">
      {!storyStarted && !gameStarted && (
        <div className="landing">
          <h1>Catch It</h1>
          <button onClick={() => setShowDifficultyPopup(true)}>Play</button>
          {glowingSpots.map((spot, index) => (
            <div
              key={index}
              className="glowing-spot"
              style={{ left: `${spot.left}%`, top: `${spot.top}%` }}
            ></div>
          ))}
        </div>
      ) }

    {showDifficultyPopup && (
        <div className="difficulty-popup">
          <div className="modal-content">
          <h2>Select Difficulty</h2>
          <button onClick={() => handleDifficultySelection("Easy")}>Easy</button>
          <button onClick={() => handleDifficultySelection("Medium")}>Medium</button>
          <button onClick={() => handleDifficultySelection("Hard")}>Hard</button>
          </div>
        </div>
      )}
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
