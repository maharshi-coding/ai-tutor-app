import React, { useState, useEffect } from 'react';
import Player from './components/Player';
import Dice from './components/Dice';
import BlessingPanel from './components/BlessingPanel';
import VictoryScreen from './components/VictoryScreen';
import CombatLog from './components/CombatLog';
import {
  createPlayer,
  rollDice,
  resolveRound,
  countFaces,
  DICE_COUNT,
  MAX_REROLLS,
  GODS_FAVORS,
  BLESSINGS,
  makeAIDecision
} from './gameLogic';
import './App.css';

const GAME_PHASES = {
  ROLL: 'roll',
  AI_TURN: 'ai_turn',
  RESOLVE: 'resolve',
  GAME_OVER: 'game_over'
};

function App() {
  // Game state
  const [humanPlayer, setHumanPlayer] = useState(createPlayer('You', false));
  const [aiPlayer, setAIPlayer] = useState(createPlayer('AI Opponent', true));
  const [currentPlayer, setCurrentPlayer] = useState('human');
  const [gamePhase, setGamePhase] = useState(GAME_PHASES.ROLL);
  
  // Dice state
  const [humanDice, setHumanDice] = useState(rollDice());
  const [aiDice, setAIDice] = useState(rollDice());
  const [selectedDice, setSelectedDice] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [rerollsLeft, setRerollsLeft] = useState(MAX_REROLLS);
  
  // UI state
  const [message, setMessage] = useState('Roll your dice!');
  const [showDamage, setShowDamage] = useState({ human: false, ai: false });
  const [showHeal, setShowHeal] = useState({ human: false, ai: false });
  const [winner, setWinner] = useState(null);
  const [lastResolution, setLastResolution] = useState(null);
  const [showCombatLog, setShowCombatLog] = useState(false);
  
  // Check for game over
  useEffect(() => {
    if (humanPlayer.hp <= 0 || aiPlayer.hp <= 0) {
      setGamePhase(GAME_PHASES.GAME_OVER);
      setWinner(humanPlayer.hp > 0 ? humanPlayer : aiPlayer);
    }
  }, [humanPlayer.hp, aiPlayer.hp]);
  
  // AI turn logic
  useEffect(() => {
    if (gamePhase === GAME_PHASES.AI_TURN && currentPlayer === 'ai') {
      setTimeout(() => {
        executeAITurn();
      }, 1000);
    }
  }, [gamePhase, currentPlayer]);
  
  const handleRollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setMessage('Rolling...');
    
    setTimeout(() => {
      const newDice = rollDice();
      setHumanDice(newDice);
      setIsRolling(false);
      setRerollsLeft(MAX_REROLLS);
      setMessage(`You have ${MAX_REROLLS} rerolls. Select dice to reroll or end turn.`);
    }, 500);
  };
  
  const handleReroll = () => {
    if (selectedDice.length === 0 || rerollsLeft === 0 || isRolling) return;
    
    setIsRolling(true);
    setMessage('Rerolling selected dice...');
    
    setTimeout(() => {
      const newDice = [...humanDice];
      selectedDice.forEach(index => {
        newDice[index] = rollDice()[0];
      });
      
      setHumanDice(newDice);
      setSelectedDice([]);
      setRerollsLeft(prev => prev - 1);
      setIsRolling(false);
      
      const remaining = rerollsLeft - 1;
      if (remaining > 0) {
        setMessage(`${remaining} reroll${remaining > 1 ? 's' : ''} remaining.`);
      } else {
        setMessage('No rerolls left. End your turn or use a blessing.');
      }
    }, 500);
  };
  
  const toggleDiceSelection = (index) => {
    if (isRolling || rerollsLeft === 0) return;
    
    setSelectedDice(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };
  
  const handleUseBlessing = (favor) => {
    if (humanPlayer.tokens < favor.cost) return;
    
    setHumanPlayer(prev => ({
      ...prev,
      tokens: prev.tokens - favor.cost
    }));
    
    if (favor.id === 'idun') {
      const healed = favor.effect(humanPlayer);
      setHumanPlayer(healed);
      setShowHeal(prev => ({ ...prev, human: true }));
      setTimeout(() => setShowHeal(prev => ({ ...prev, human: false })), 500);
      setMessage(`You used ${favor.name}! Healed 3 HP.`);
    } else if (favor.id === 'thor') {
      const damaged = favor.effect(humanPlayer, aiPlayer);
      setAIPlayer(damaged);
      setShowDamage(prev => ({ ...prev, ai: true }));
      setTimeout(() => setShowDamage(prev => ({ ...prev, ai: false })), 500);
      setMessage(`You used ${favor.name}! Dealt 2 direct damage.`);
    } else if (favor.id === 'ullr') {
      setRerollsLeft(prev => prev + 1);
      setMessage(`You used ${favor.name}! You can reroll once more.`);
    } else if (favor.id === 'bragi') {
      const updated = favor.effect(humanPlayer);
      setHumanPlayer(updated);
      setMessage(`You used ${favor.name}! Gained 2 tokens.`);
    } else if (favor.id === 'frigg') {
      const result = favor.effect(humanPlayer, aiPlayer);
      setHumanPlayer(result.player);
      setAIPlayer(result.opponent);
      setShowHeal(prev => ({ ...prev, human: true }));
      setShowDamage(prev => ({ ...prev, ai: true }));
      setTimeout(() => {
        setShowHeal(prev => ({ ...prev, human: false }));
        setShowDamage(prev => ({ ...prev, ai: false }));
      }, 500);
      setMessage(`You used ${favor.name}! Dealt 3 damage and healed 2 HP.`);
    } else if (favor.id === 'heimdall') {
      setMessage(`You used ${favor.name}! Defense will be boosted during resolution.`);
      // Store for resolution phase
      setHumanPlayer(prev => ({ ...prev, heimdallActive: true }));
    }
  };
  
  const handleEndTurn = () => {
    setMessage('Calculating damage...');
    setCurrentPlayer('ai');
    setGamePhase(GAME_PHASES.AI_TURN);
  };
  
  const executeAITurn = () => {
    // AI rolls dice
    setMessage('AI is rolling dice...');
    const aiRolledDice = rollDice();
    setAIDice(aiRolledDice);
    
    setTimeout(() => {
      // AI makes decisions
      let currentAIDice = [...aiRolledDice];
      let aiRerollsLeft = MAX_REROLLS;
      let currentAIPlayer = { ...aiPlayer };
      
      const decision = makeAIDecision(aiPlayer, humanPlayer, currentAIDice, humanDice, aiRerollsLeft);
      
      // AI rerolls if needed
      if (decision.shouldReroll && decision.rerollIndices.length > 0) {
        setMessage('AI is rerolling some dice...');
        decision.rerollIndices.forEach(idx => {
          currentAIDice[idx] = rollDice()[0];
        });
        setAIDice(currentAIDice);
        aiRerollsLeft--;
      }
      
      setTimeout(() => {
        // AI uses favor if decided
        if (decision.favor) {
          setMessage(`AI used ${decision.favor.name}!`);
          currentAIPlayer.tokens -= decision.favor.cost;
          
          if (decision.favor.id === 'idun') {
            const healed = decision.favor.effect(currentAIPlayer);
            currentAIPlayer = healed;
            setShowHeal(prev => ({ ...prev, ai: true }));
            setTimeout(() => setShowHeal(prev => ({ ...prev, ai: false })), 500);
          } else if (decision.favor.id === 'thor') {
            const damaged = decision.favor.effect(currentAIPlayer, humanPlayer);
            setHumanPlayer(damaged);
            setShowDamage(prev => ({ ...prev, human: true }));
            setTimeout(() => setShowDamage(prev => ({ ...prev, human: false })), 500);
          } else if (decision.favor.id === 'bragi') {
            const updated = decision.favor.effect(currentAIPlayer);
            currentAIPlayer = updated;
          } else if (decision.favor.id === 'frigg') {
            const result = decision.favor.effect(currentAIPlayer, humanPlayer);
            currentAIPlayer = result.player;
            setHumanPlayer(result.opponent);
            setShowHeal(prev => ({ ...prev, ai: true }));
            setShowDamage(prev => ({ ...prev, human: true }));
            setTimeout(() => {
              setShowHeal(prev => ({ ...prev, ai: false }));
              setShowDamage(prev => ({ ...prev, human: false }));
            }, 500);
          } else if (decision.favor.id === 'heimdall') {
            currentAIPlayer.heimdallActive = true;
          }
          
          setAIPlayer(currentAIPlayer);
        }
        
        setTimeout(() => {
          resolveCombat(currentAIDice);
        }, 1000);
      }, 1000);
    }, 1500);
  };
  
  const resolveCombat = (finalAIDice) => {
    setMessage('Resolving round...');
    setGamePhase(GAME_PHASES.RESOLVE);
    
    // Use the new resolution logic from gameLogic.js
    const resolution = resolveRound(humanDice, finalAIDice, humanPlayer.tokens, aiPlayer.tokens);
    
    // Store resolution for combat log
    setLastResolution(resolution);
    setShowCombatLog(true);
    
    // Extract results
    const humanResult = resolution.attacker;
    const aiResult = resolution.defender;
    
    setTimeout(() => {
      // STEP 1 & 2: Update tokens (gained + stolen - lost)
      const humanTokenChange = humanResult.tokensGained + humanResult.tokensStolen - humanResult.tokensLost;
      const aiTokenChange = aiResult.tokensGained + aiResult.tokensStolen - aiResult.tokensLost;
      
      setHumanPlayer(prev => ({ 
        ...prev, 
        tokens: Math.max(0, prev.tokens + humanTokenChange),
        heimdallActive: false
      }));
      setAIPlayer(prev => ({ 
        ...prev, 
        tokens: Math.max(0, prev.tokens + aiTokenChange)
      }));
      
      setMessage('Tokens updated! Applying damage...');
      
      setTimeout(() => {
        // STEP 3 & 4: Apply damage
        if (humanResult.damage > 0) {
          setAIPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - humanResult.damage) }));
          setShowDamage(prev => ({ ...prev, ai: true }));
          setTimeout(() => setShowDamage(prev => ({ ...prev, ai: false })), 500);
        }
        
        if (aiResult.damage > 0) {
          setHumanPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - aiResult.damage) }));
          setShowDamage(prev => ({ ...prev, human: true }));
          setTimeout(() => setShowDamage(prev => ({ ...prev, human: false })), 500);
        }
        
        const resultMessage = `Round complete! You dealt ${humanResult.damage} damage, AI dealt ${aiResult.damage} damage.`;
        setMessage(resultMessage);
        
        setTimeout(() => {
          // Start new round
          setShowCombatLog(false);
          setCurrentPlayer('human');
          setGamePhase(GAME_PHASES.ROLL);
          setRerollsLeft(MAX_REROLLS);
          setSelectedDice([]);
          setMessage('New round! Roll your dice.');
        }, 3000);
      }, 1500);
    }, 1000);
  };
  
  const handleRestart = () => {
    setHumanPlayer(createPlayer('You', false));
    setAIPlayer(createPlayer('AI Opponent', true));
    setCurrentPlayer('human');
    setGamePhase(GAME_PHASES.ROLL);
    setHumanDice(rollDice());
    setAIDice(rollDice());
    setSelectedDice([]);
    setRerollsLeft(MAX_REROLLS);
    setMessage('Roll your dice!');
    setWinner(null);
    setLastResolution(null);
    setShowCombatLog(false);
  };
  
  const canRoll = gamePhase === GAME_PHASES.ROLL && currentPlayer === 'human' && !isRolling;
  const canReroll = canRoll && rerollsLeft > 0 && selectedDice.length > 0;
  const canEndTurn = canRoll && !isRolling;
  const canUseBlessing = canRoll && !isRolling;
  
  return (
    <div className="app">
      <div className="game-container">
        <h1 className="game-title">⚔️ ORLOG ⚔️</h1>
        <p className="game-subtitle">Assassin's Creed Valhalla</p>
        
        <div className="players-container">
          <Player 
            player={humanPlayer} 
            isActive={currentPlayer === 'human'}
            showDamage={showDamage.human}
            showHeal={showHeal.human}
          />
          <div className="vs-divider">VS</div>
          <Player 
            player={aiPlayer} 
            isActive={currentPlayer === 'ai'}
            showDamage={showDamage.ai}
            showHeal={showHeal.ai}
          />
        </div>
        
        <div className="message-box">{message}</div>
        
        <div className="dice-area">
          <div className="dice-section">
            <h3 className="dice-label">Your Dice</h3>
            <div className="dice-container">
              {humanDice.map((die, index) => (
                <Dice
                  key={index}
                  die={die}
                  isRolling={isRolling}
                  isSelected={selectedDice.includes(index)}
                  onClick={() => toggleDiceSelection(index)}
                  canSelect={canRoll && rerollsLeft > 0}
                />
              ))}
            </div>
          </div>
          
          <div className="dice-section">
            <h3 className="dice-label">AI Dice</h3>
            <div className="dice-container">
              {aiDice.map((die, index) => (
                <Dice
                  key={index}
                  die={die}
                  isRolling={false}
                  isSelected={false}
                  canSelect={false}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="controls">
          <button
            className="action-btn primary"
            onClick={handleRollDice}
            disabled={!canRoll || rerollsLeft < MAX_REROLLS}
          >
            🎲 Roll Dice
          </button>
          
          <button
            className="action-btn secondary"
            onClick={handleReroll}
            disabled={!canReroll}
          >
            🔄 Reroll Selected ({rerollsLeft})
          </button>
          
          <button
            className="action-btn success"
            onClick={handleEndTurn}
            disabled={!canEndTurn}
          >
            ✅ End Turn
          </button>
        </div>
        
        <BlessingPanel
          player={humanPlayer}
          onUseBlessing={handleUseBlessing}
          disabled={!canUseBlessing}
        />
        
        {showCombatLog && lastResolution && (
          <CombatLog resolution={lastResolution} />
        )}
      </div>
      
      {winner && (
        <VictoryScreen winner={winner} onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;
