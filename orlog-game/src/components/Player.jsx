import React from 'react';
import { INITIAL_HP } from '../gameLogic';
import './Player.css';

const Player = ({ player, isActive, showDamage, showHeal }) => {
  const hpPercentage = (player.hp / INITIAL_HP) * 100;
  
  return (
    <div className={`player-info ${isActive ? 'active' : ''} ${showDamage ? 'damage-flash' : ''} ${showHeal ? 'heal-flash' : ''}`}>
      <div className="player-header">
        <h2 className="player-name">{player.name}</h2>
        {isActive && <div className="active-indicator">⚡ Active Turn</div>}
      </div>
      
      <div className="stat-container">
        <div className="stat">
          <div className="stat-label">Health</div>
          <div className="hp-bar">
            <div 
              className="hp-fill" 
              style={{ width: `${hpPercentage}%` }}
            />
            <div className="hp-text">{player.hp} / {INITIAL_HP}</div>
          </div>
        </div>
        
        <div className="stat">
          <div className="stat-label">Tokens</div>
          <div className="token-display">
            {Array(player.tokens).fill('♦️').join(' ')}
            <span className="token-count"> ({player.tokens})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
