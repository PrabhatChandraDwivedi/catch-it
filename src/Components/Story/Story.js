import React, { useEffect, useState } from "react";
import "./Story.css"


export default function Story({ currentStory, onNext, onSkip, isLastStory }) {

  const [displayedText, setDisplayedText] = useState("");
  const typingSpeed = 100;
  useEffect(() => {
    let currentCharIndex = 0;
    const text = currentStory.text;
    setDisplayedText(""); 
    let displayedTextInc = "";
    const typingInterval = setInterval(() => {
      if (currentCharIndex < text.length) {
        displayedTextInc = displayedTextInc+text[currentCharIndex]
        setDisplayedText(displayedTextInc);
        
        currentCharIndex++;
      } else {
        clearInterval(typingInterval); 
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval); 
  }, [currentStory.text]);

  return (
    <div className="story-container">
      <img
        src={Object.values(currentStory.image)[0]}
        alt="Story Visual"
        className="story-image"
      />
      <div className="story-text-box">
        <span>{displayedText}</span>
        <span className="typing-cursor"></span>
      </div>
      <div className="story-buttons">
        <button onClick={onNext}>
          {isLastStory ? "Start Game" : "Next"}
        </button>
        <button onClick={onSkip} style={{ display: isLastStory ? "none" : "block" }}>
          Skip
        </button>
      </div>
    </div>
  );
}
