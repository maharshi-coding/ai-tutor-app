import React from 'react';
import './CombatLog.css';

const CombatLog = ({ resolution, playerName = 'You', opponentName = 'AI' }) => {
  if (!resolution) return null;
  
  const humanResult = resolution.attacker;
  const aiResult = resolution.defender;
  
  return (
    <div className="combat-log">
      <h4 className="log-title">⚔️ Combat Resolution</h4>
      
      <div className="log-section">
        <div className="log-player">
          <h5>{playerName}</h5>
          <div className="log-details">
            <div className="log-line">
              <span className="icon">⚔️</span> {humanResult.details.axes} Axes - {humanResult.details.axesBlocked} blocked = {humanResult.details.unblockedAxes} damage
            </div>
            <div className="log-line">
              <span className="icon">🏹</span> {humanResult.details.arrows} Arrows - {humanResult.details.arrowsBlocked} blocked = {humanResult.details.unblockedArrows} damage
            </div>
            <div className="log-line total">
              <strong>Total Damage: {humanResult.damage}</strong>
            </div>
            {humanResult.tokensGained > 0 && (
              <div className="log-line success">
                <span className="icon">♦️</span> +{humanResult.tokensGained} tokens gained
              </div>
            )}
            {humanResult.tokensStolen > 0 && (
              <div className="log-line success">
                <span className="icon">✋</span> +{humanResult.tokensStolen} tokens stolen
              </div>
            )}
            {humanResult.tokensLost > 0 && (
              <div className="log-line warning">
                <span className="icon">✋</span> -{humanResult.tokensLost} tokens stolen by opponent
              </div>
            )}
          </div>
        </div>
        
        <div className="log-divider">VS</div>
        
        <div className="log-player">
          <h5>{opponentName}</h5>
          <div className="log-details">
            <div className="log-line">
              <span className="icon">⚔️</span> {aiResult.details.axes} Axes - {aiResult.details.axesBlocked} blocked = {aiResult.details.unblockedAxes} damage
            </div>
            <div className="log-line">
              <span className="icon">🏹</span> {aiResult.details.arrows} Arrows - {aiResult.details.arrowsBlocked} blocked = {aiResult.details.unblockedArrows} damage
            </div>
            <div className="log-line total">
              <strong>Total Damage: {aiResult.damage}</strong>
            </div>
            {aiResult.tokensGained > 0 && (
              <div className="log-line success">
                <span className="icon">♦️</span> +{aiResult.tokensGained} tokens gained
              </div>
            )}
            {aiResult.tokensStolen > 0 && (
              <div className="log-line success">
                <span className="icon">✋</span> +{aiResult.tokensStolen} tokens stolen
              </div>
            )}
            {aiResult.tokensLost > 0 && (
              <div className="log-line warning">
                <span className="icon">✋</span> -{aiResult.tokensLost} tokens stolen by opponent
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="log-footer">
        <div className="rule-reminder">
          🛡️ Shields block Axes only | 🪖 Helmets block Arrows only
        </div>
      </div>
    </div>
  );
};

export default CombatLog;
