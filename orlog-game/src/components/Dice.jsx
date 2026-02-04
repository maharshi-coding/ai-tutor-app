import React from 'react';
import { DICE_SYMBOLS } from '../gameLogic';
import './Dice.css';

const Dice = ({ die, isRolling, isSelected, onClick, canSelect }) => {
  // Support both old format (string) and new format (object)
  const dieData = typeof die === 'string' ? { face: die, isGold: false } : die;
  const { face, isGold } = dieData;
  
  return (
    <div
      className={`die ${isRolling ? 'rolling' : ''} ${isSelected ? 'selected' : ''} ${canSelect ? 'selectable' : ''} ${isGold ? 'gold-border' : ''}`}
      onClick={canSelect ? onClick : undefined}
    >
      <div className="die-face">
        {DICE_SYMBOLS[face]}
      </div>
      {isGold && <div className="gold-indicator">♦️</div>}
    </div>
  );
};

export default Dice;
