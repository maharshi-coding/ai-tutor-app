// Game constants
export const DICE_FACES = {
  AXE: 'axe',
  ARROW: 'arrow',
  SHIELD: 'shield',
  HELMET: 'helmet',
  HAND: 'hand',
  TOKEN: 'token'
};

export const DICE_SYMBOLS = {
  axe: '⚔️',
  arrow: '🏹',
  shield: '🛡️',
  helmet: '🪖',
  hand: '✋',
  token: '♦️'
};

export const INITIAL_HP = 15;
export const INITIAL_TOKENS = 0;
export const DICE_COUNT = 6;
export const MAX_REROLLS = 3;

// Dice probabilities matching AC Valhalla Orlog
// Each die has 6 faces with varied distribution
export const DICE_POOL = [
  DICE_FACES.AXE,
  DICE_FACES.ARROW,
  DICE_FACES.SHIELD,
  DICE_FACES.HELMET,
  DICE_FACES.HAND,
  DICE_FACES.TOKEN
];

// Roll a single die with optional gold border
export const rollDie = () => {
  const face = DICE_POOL[Math.floor(Math.random() * DICE_POOL.length)];
  // 20% chance for gold border (grants +1 token)
  const isGold = Math.random() < 0.2;
  return { face, isGold };
};

// Roll multiple dice
export const rollDice = (count = DICE_COUNT) => {
  return Array(count).fill(null).map(() => rollDie());
};

// Count faces in dice array
export const countFaces = (dice) => {
  return {
    axes: dice.filter(d => d.face === DICE_FACES.AXE).length,
    arrows: dice.filter(d => d.face === DICE_FACES.ARROW).length,
    shields: dice.filter(d => d.face === DICE_FACES.SHIELD).length,
    helmets: dice.filter(d => d.face === DICE_FACES.HELMET).length,
    hands: dice.filter(d => d.face === DICE_FACES.HAND).length,
    tokens: dice.filter(d => d.face === DICE_FACES.TOKEN).length,
    goldTokens: dice.filter(d => d.isGold).length
  };
};

// Resolution following AC Valhalla Orlog rules
// Returns: { damage, tokensGained, tokensStolen, details }
export const resolveRound = (attackerDice, defenderDice, attackerTokens, defenderTokens) => {
  const attackerCounts = countFaces(attackerDice);
  const defenderCounts = countFaces(defenderDice);
  
  // STEP 1: Token Gain (including gold bonuses)
  const attackerTokensGained = attackerCounts.tokens + attackerCounts.goldTokens;
  const defenderTokensGained = defenderCounts.tokens + defenderCounts.goldTokens;
  
  // STEP 2: Hand Resolution (steal tokens)
  const tokensStolen = Math.min(attackerCounts.hands, defenderTokens + defenderTokensGained);
  const tokensLost = Math.min(defenderCounts.hands, attackerTokens + attackerTokensGained);
  
  // STEP 3: Defense Assignment
  // Shields ONLY block Axes
  const axesBlocked = Math.min(attackerCounts.axes, defenderCounts.shields);
  const unblockedAxes = attackerCounts.axes - axesBlocked;
  
  // Helmets ONLY block Arrows
  const arrowsBlocked = Math.min(attackerCounts.arrows, defenderCounts.helmets);
  const unblockedArrows = attackerCounts.arrows - arrowsBlocked;
  
  // Mirror for defender
  const defenderAxesBlocked = Math.min(defenderCounts.axes, attackerCounts.shields);
  const defenderUnblockedAxes = defenderCounts.axes - defenderAxesBlocked;
  
  const defenderArrowsBlocked = Math.min(defenderCounts.arrows, attackerCounts.helmets);
  const defenderUnblockedArrows = defenderCounts.arrows - defenderArrowsBlocked;
  
  // STEP 4: Damage Resolution
  const attackerDamage = unblockedAxes + unblockedArrows;
  const defenderDamage = defenderUnblockedAxes + defenderUnblockedArrows;
  
  return {
    attacker: {
      damage: attackerDamage,
      tokensGained: attackerTokensGained,
      tokensStolen: tokensStolen,
      tokensLost: tokensLost,
      details: {
        axes: attackerCounts.axes,
        arrows: attackerCounts.arrows,
        axesBlocked,
        arrowsBlocked,
        unblockedAxes,
        unblockedArrows
      }
    },
    defender: {
      damage: defenderDamage,
      tokensGained: defenderTokensGained,
      tokensStolen: tokensLost,
      tokensLost: tokensStolen,
      details: {
        axes: defenderCounts.axes,
        arrows: defenderCounts.arrows,
        axesBlocked: defenderAxesBlocked,
        arrowsBlocked: defenderArrowsBlocked,
        unblockedAxes: defenderUnblockedAxes,
        unblockedArrows: defenderUnblockedArrows
      }
    }
  };
};

// Gods' Favors (Blessings)
export const GODS_FAVORS = {
  THOR: {
    id: 'thor',
    name: 'Thor\'s Strike',
    cost: 4,
    description: 'Deal 2 direct damage (ignores defense)',
    timing: 'immediate',
    effect: (player, opponent) => ({ ...opponent, hp: Math.max(0, opponent.hp - 2) })
  },
  IDUN: {
    id: 'idun',
    name: 'Idun\'s Rejuvenation',
    cost: 3,
    description: 'Heal 3 HP',
    timing: 'immediate',
    effect: (player) => ({ ...player, hp: Math.min(INITIAL_HP, player.hp + 3) })
  },
  ULLR: {
    id: 'ullr',
    name: 'Ullr\'s Aim',
    cost: 2,
    description: 'Reroll any dice once more',
    timing: 'immediate',
    effect: null // Handled separately
  },
  HEIMDALL: {
    id: 'heimdall',
    name: 'Heimdall\'s Watch',
    cost: 3,
    description: 'Add 2 shields and 2 helmets',
    timing: 'before_damage',
    effect: null // Handled in resolution
  },
  BRAGI: {
    id: 'bragi',
    name: 'Bragi\'s Gift',
    cost: 1,
    description: 'Gain 2 extra tokens',
    timing: 'immediate',
    effect: (player) => ({ ...player, tokens: player.tokens + 2 })
  },
  FRIGG: {
    id: 'frigg',
    name: 'Frigg\'s Sight',
    cost: 5,
    description: 'Deal 3 damage and heal 2 HP',
    timing: 'immediate',
    effect: (player, opponent) => ({
      player: { ...player, hp: Math.min(INITIAL_HP, player.hp + 2) },
      opponent: { ...opponent, hp: Math.max(0, opponent.hp - 3) }
    })
  }
};

// Legacy support - map old BLESSINGS to new GODS_FAVORS
export const BLESSINGS = GODS_FAVORS;

// AI decision making with new mechanics
export const makeAIDecision = (aiPlayer, humanPlayer, aiDice, humanDice, rerollsLeft) => {
  const aiCounts = countFaces(aiDice);
  const humanCounts = countFaces(humanDice);
  
  const decision = {
    shouldReroll: false,
    rerollIndices: [],
    favor: null
  };
  
  // Decide on rerolls (if available)
  if (rerollsLeft > 0) {
    const rerollIndices = [];
    
    // Strategic reroll logic based on opponent's dice
    aiDice.forEach((die, idx) => {
      const face = die.face;
      
      // Reroll tokens if we have plenty already (>= 6)
      if (face === DICE_FACES.TOKEN && aiPlayer.tokens >= 6) {
        rerollIndices.push(idx);
      }
      // Prefer helmets if opponent has many arrows
      else if (face === DICE_FACES.SHIELD && humanCounts.arrows > humanCounts.axes) {
        rerollIndices.push(idx);
      }
      // Prefer shields if opponent has many axes
      else if (face === DICE_FACES.HELMET && humanCounts.axes > humanCounts.arrows) {
        rerollIndices.push(idx);
      }
      // Reroll hands if opponent has no tokens
      else if (face === DICE_FACES.HAND && humanPlayer.tokens === 0) {
        rerollIndices.push(idx);
      }
      // If losing badly, prioritize offense
      else if (aiPlayer.hp < humanPlayer.hp - 5 && (face === DICE_FACES.SHIELD || face === DICE_FACES.HELMET)) {
        if (aiCounts.axes + aiCounts.arrows < 3) {
          rerollIndices.push(idx);
        }
      }
    });
    
    // Limit rerolls to 3 dice max
    if (rerollIndices.length > 3) {
      rerollIndices.length = 3;
    }
    
    if (rerollIndices.length > 0) {
      decision.shouldReroll = true;
      decision.rerollIndices = rerollIndices;
    }
  }
  
  // Decide on God's Favors (prioritize based on situation)
  if (aiPlayer.tokens >= GODS_FAVORS.IDUN.cost && aiPlayer.hp <= 4) {
    // Critical HP - heal immediately
    decision.favor = GODS_FAVORS.IDUN;
  } else if (aiPlayer.tokens >= GODS_FAVORS.THOR.cost && humanPlayer.hp <= 3) {
    // Can finish opponent with direct damage
    decision.favor = GODS_FAVORS.THOR;
  } else if (aiPlayer.tokens >= GODS_FAVORS.FRIGG.cost && aiPlayer.hp <= 8 && humanPlayer.hp <= 8) {
    // Both damaged - use combo favor
    decision.favor = GODS_FAVORS.FRIGG;
  } else if (aiPlayer.tokens >= GODS_FAVORS.HEIMDALL.cost && humanCounts.axes + humanCounts.arrows >= 4) {
    // Opponent has strong offense - boost defense
    decision.favor = GODS_FAVORS.HEIMDALL;
  } else if (aiPlayer.tokens >= GODS_FAVORS.ULLR.cost && rerollsLeft === 0 && aiCounts.axes + aiCounts.arrows < 2) {
    // Poor offense and no rerolls - get another chance
    decision.favor = GODS_FAVORS.ULLR;
  } else if (aiPlayer.tokens >= GODS_FAVORS.BRAGI.cost && aiPlayer.tokens < 5) {
    // Low tokens - invest to gain more
    decision.favor = GODS_FAVORS.BRAGI;
  }
  
  return decision;
};

// Initialize player
export const createPlayer = (name, isAI = false) => ({
  name,
  hp: INITIAL_HP,
  tokens: INITIAL_TOKENS,
  isAI
});
