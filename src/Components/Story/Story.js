import React from "react";
import "./Story.css"


export default function Story({ currentStory, onNext, onSkip, isLastStory }) {
  console.log(Object.values(currentStory.image)[0])
  return (
    <div className="story-container">
      <img
        src={Object.values(currentStory.image)[0]}
        alt="Story Visual"
        className="story-image"
      />
      <div className="story-text-box">
        <p>{currentStory.text}</p>
      </div>
      <div className="story-buttons">
        <button onClick={onNext} disabled={isLastStory}>
          {isLastStory ? "Start Game" : "Next"}
        </button>
        <button onClick={onSkip}>Skip</button>
      </div>
    </div>
  );
}
