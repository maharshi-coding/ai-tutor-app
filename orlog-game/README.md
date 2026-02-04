# ⚔️ Orlog - Assassin's Creed Valhalla Dice Game

A fully playable browser-based implementation of the Orlog dice game from Assassin's Creed Valhalla, built with React.

![Orlog Game](https://via.placeholder.com/800x400/16213e/d4af37?text=Orlog+Game)

## 🎮 Game Overview

Orlog is a strategic dice game where two players compete to reduce their opponent's health to zero through tactical dice rolls and divine blessings.

### Core Mechanics

- **Health Points**: Each player starts with 15 HP
- **Dice**: 6 dice per turn with 6 distinct faces:
  - ⚔️ **Axe**: Deals 1 damage, blocked ONLY by Shield
  - 🏹 **Arrow**: Deals 1 damage, blocked ONLY by Helmet
  - 🛡️ **Shield**: Blocks 1 Axe (cannot block Arrows)
  - 🪖 **Helmet**: Blocks 1 Arrow (cannot block Axes)
  - ✋ **Hand**: Steals 1 God Token from opponent
  - ♦️ **Token**: Grants 1 God Token
- **Gold Borders**: Some dice have gold borders, granting +1 bonus token
- **Rerolls**: Up to 3 rerolls per turn
- **Tokens**: Used to activate powerful Gods' Favors

### Gods' Favors (Blessings)

- **Thor's Strike** (4 tokens): Deal 2 direct damage (ignores defense)
- **Idun's Rejuvenation** (3 tokens): Heal 3 HP
- **Ullr's Aim** (2 tokens): Gain an additional reroll
- **Heimdall's Watch** (3 tokens): Add 2 shields and 2 helmets for defense
- **Bragi's Gift** (1 token): Gain 2 extra tokens
- **Frigg's Sight** (5 tokens): Deal 3 damage and heal 2 HP

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm installed

### Installation

1. Navigate to the game directory:
```bash
cd orlog-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

## 🎯 How to Play

1. **Roll Phase**
   - Click "Roll Dice" to start your turn
   - Select any dice you want to reroll
   - Click "Reroll Selected" (up to 3 times)

2. **Strategy Phase**
   - Use Gods' Favors if you have enough tokens
   - Consider your opponent's dice when planning
   - Gold-bordered dice grant bonus tokens!

3. **Resolution** (Following AC Valhalla rules)
   - **Step 1**: Token Gain - Collect tokens (including gold bonuses)
   - **Step 2**: Hand Resolution - Hands steal tokens from opponent
   - **Step 3**: Defense Assignment
     - Shields ONLY block Axes
     - Helmets ONLY block Arrows
     - No cross-blocking!
   - **Step 4**: Damage Resolution - Unblocked attacks deal damage

4. **Victory**
   - First player to reduce opponent HP to 0 wins!

## 🤖 AI Opponent

The AI makes strategic decisions based on:
- Current health differentials
- Attack/defense balance
- Token management
- Optimal blessing usage
- Tactical rerolls

## 🎨 Features

- ✅ Full game mechanics from AC Valhalla
- ✅ Intelligent AI opponent
- ✅ Smooth dice roll animations
- ✅ Health and damage visual effects
- ✅ Token/blessing system
- ✅ Victory screen with stats
- ✅ Responsive design (mobile-friendly)
- ✅ Medieval-themed UI with custom fonts

## 🛠️ Technology Stack

- **Frontend**: React 18
- **Build Tool**: Vite
- **Styling**: Pure CSS with animations
- **Fonts**: Google Fonts (MedievalSharp, Cinzel)

## 📂 Project Structure

```
orlog-game/
├── src/
│   ├── components/
│   │   ├── Dice.jsx           # Dice component
│   │   ├── Player.jsx          # Player info display
│   │   ├── BlessingPanel.jsx   # Blessings UI
│   │   └── VictoryScreen.jsx   # End game screen
│   ├── gameLogic.js            # Core game mechanics
│   ├── App.jsx                 # Main game component
│   ├── App.css                 # Game styles
│   ├── index.css               # Global styles
│   └── main.jsx                # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## 🎲 Game Rules Reference

### Combat Resolution (AC Valhalla Authentic)

**Example Combat:**
- Player: 3 Axes (⚔️), 2 Arrows (🏹)
- Opponent: 2 Shields (🛡️), 1 Helmet (🪖)

**Resolution:**
1. Axes: 3 - 2 shields = **1 damage**
2. Arrows: 2 - 1 helmet = **1 damage**
3. **Total: 2 damage**

### Critical Rules
- ❌ Shields CANNOT block Arrows
- ❌ Helmets CANNOT block Axes
- ✅ Each defense type only blocks its corresponding attack
- ✅ Hands (✋) steal tokens during resolution
- ✅ Gold-bordered dice grant +1 bonus token

### Token Economy
- Each ♦️ rolled = 1 token
- Gold-bordered dice = +1 bonus token
- Tokens persist across rounds
- Hands steal tokens from opponent
- Spend wisely on Gods' Favors!

## 🔮 Future Enhancements

Potential additions:
- Multiple AI difficulty levels
- Online multiplayer
- Custom dice probabilities
- Sound effects and music
- Additional blessing types
- Tournament mode
- Leaderboard system
- Dice roll physics with 3D animations

## 📝 License

This is a fan-made recreation for educational purposes. Orlog and Assassin's Creed are trademarks of Ubisoft.

## 🙏 Credits

- Original game design by Ubisoft
- Implementation by [Your Name]
- Inspired by Assassin's Creed Valhalla

---

**May the gods favor you in battle! ⚔️**
