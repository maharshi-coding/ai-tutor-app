import React from 'react';
import './VictoryScreen.css';

const VictoryScreen = ({ winner, onRestart }) => {
  return (
    <div className="victory-overlay">
      <div className="victory-modal">
        <h1 className="victory-title">
          {winner.isAI ? '💀 Defeat!' : '⚔️ Victory!'}
        </h1>
        <p className="victory-message">
          {winner.isAI 
            ? 'The AI has bested you in combat!' 
            : 'You have proven your worth in the halls of Valhalla!'}
        </p>
        <div className="victory-stats">
          <div className="stat-item">
            <span className="stat-label">Winner:</span>
            <span className="stat-value">{winner.name}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Remaining HP:</span>
            <span className="stat-value">{winner.hp}</span>
          </div>
        </div>
        <button className="restart-btn" onClick={onRestart}>
          ⚔️ Play Again
        </button>
      </div>
    </div>
  );
};

export default VictoryScreen;
