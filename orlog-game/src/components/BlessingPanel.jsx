import React from 'react';
import { BLESSINGS } from '../gameLogic';
import './BlessingPanel.css';

const BlessingPanel = ({ player, onUseBlessing, disabled }) => {
  return (
    <div className="blessing-panel">
      <h3 className="blessing-title">⚡ Blessings of the Gods</h3>
      <div className="blessing-list">
        {Object.values(BLESSINGS).map(blessing => {
          const canAfford = player.tokens >= blessing.cost;
          const isDisabled = disabled || !canAfford;
          
          return (
            <button
              key={blessing.id}
              className={`blessing-btn ${!canAfford ? 'cannot-afford' : ''}`}
              onClick={() => onUseBlessing(blessing)}
              disabled={isDisabled}
            >
              <div className="blessing-header">
                <span className="blessing-name">{blessing.name}</span>
                <span className="blessing-cost">
                  {Array(blessing.cost).fill('♦️').join('')}
                </span>
              </div>
              <div className="blessing-description">{blessing.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BlessingPanel;
