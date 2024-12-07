import React from "react";


export default function Story({ currentStory, onNext, onSkip, isLastStory }) {
  return (
    <div className="story-container">
      <img
        src={currentStory.image}
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
