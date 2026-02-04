# ⚔️ Orlog Rules - Before vs After Refactor

## Quick Reference: What Changed

---

## 🎲 DICE FACES

### ❌ BEFORE (Simplified - 3 Types)
```
⚔️ Attack  - Deals damage (blocked by shields)
🛡️ Shield  - Blocks attacks
♦️ Token   - Grants tokens
```

### ✅ AFTER (AC Valhalla - 6 Types)
```
⚔️ Axe     - Deals 1 damage (blocked by SHIELD only)
🏹 Arrow   - Deals 1 damage (blocked by HELMET only)
🛡️ Shield  - Blocks 1 AXE (cannot block arrows!)
🪖 Helmet  - Blocks 1 ARROW (cannot block axes!)
✋ Hand    - Steals 1 token from opponent
♦️ Token   - Grants 1 token
```

**Key Difference:** Attack/defense split into two separate systems!

---

## 🛡️ BLOCKING RULES

### ❌ BEFORE
```
Shield blocks Attack ✅
That's it!
```

### ✅ AFTER (AC Valhalla Accurate)
```
Shield blocks Axe     ✅
Shield blocks Arrow   ❌ NO!

Helmet blocks Arrow   ✅
Helmet blocks Axe     ❌ NO!
```

**CRITICAL:** No cross-blocking allowed!

---

## 💎 GOLD BORDERS

### ❌ BEFORE
```
Not implemented
```

### ✅ AFTER
```
- 20% chance for gold border on any die
- Gold die = Normal effect + 1 bonus token
- Visual indicator: Gold outline + small ♦️
- Example: Gold Axe = 1 damage + 1 token
```

---

## 📋 RESOLUTION ORDER

### ❌ BEFORE
```
1. Calculate damage (attacks - shields)
2. Add tokens
3. Apply damage
```

### ✅ AFTER (AC Valhalla Order)
```
STEP 1: Token Gain
  → Count ♦️ tokens
  → Add gold border bonuses

STEP 2: Hand Resolution
  → Each ✋ steals 1 token

STEP 3: Defense Assignment
  → Shields block axes
  → Helmets block arrows
  → No cross-blocking!

STEP 4: Damage Resolution
  → Unblocked axes deal damage
  → Unblocked arrows deal damage
  → Total = unblocked axes + unblocked arrows
```

---

## 🔱 GODS' FAVORS (BLESSINGS)

### ❌ BEFORE (3 Options)
```
Thor's Blessing (3 tokens)    - Heal 2 HP
Odin's Fury (4 tokens)        - Deal 2 damage
Loki's Trickery (2 tokens)    - Reroll
```

### ✅ AFTER (6 Options)
```
Thor's Strike (4 tokens)         - Deal 2 direct damage
Idun's Rejuvenation (3 tokens)   - Heal 3 HP
Ullr's Aim (2 tokens)            - Extra reroll
Heimdall's Watch (3 tokens)      - +2 shields, +2 helmets
Bragi's Gift (1 token)           - Gain 2 tokens
Frigg's Sight (5 tokens)         - Deal 3 damage + heal 2 HP
```

---

## 🤖 AI BEHAVIOR

### ❌ BEFORE
```
- Reroll based on simple HP comparison
- Use healing when HP < 5
- Use damage when opponent HP < 4
```

### ✅ AFTER (Adaptive Strategy)
```
Reroll Logic:
  - Prefer helmets if opponent has many arrows
  - Prefer shields if opponent has many axes
  - Reroll hands if opponent has no tokens
  - Prioritize offense when losing

Favor Usage:
  - Idun (heal) if HP ≤ 4
  - Thor (damage) to finish at HP ≤ 3
  - Frigg (combo) when both damaged
  - Heimdall (defense) vs heavy offense
  - Strategic token management
```

---

## 📊 COMBAT EXAMPLE

### Scenario: You vs AI
```
Your Dice:    3 ⚔️ Axes, 2 🏹 Arrows, 1 ♦️ Token
AI Dice:      2 🛡️ Shields, 1 🪖 Helmet, 2 ✋ Hands, 1 ♦️ Token
```

### ❌ BEFORE (Simplified)
```
Your attacks: 5
AI shields:   2
Damage:       5 - 2 = 3
Tokens:       +1 each
```

### ✅ AFTER (AC Valhalla)
```
STEP 1: Tokens
  You: +1 token
  AI:  +1 token

STEP 2: Hands
  AI steals 2 tokens from you

STEP 3: Defense
  Your 3 axes vs AI's 2 shields = 1 unblocked axe
  Your 2 arrows vs AI's 1 helmet = 1 unblocked arrow

STEP 4: Damage
  You deal: 1 + 1 = 2 damage
  AI deals:         0 damage

Final Token Count:
  You: -1 (gained 1, lost 2 to hands)
  AI:  +3 (gained 1, stole 2)
```

---

## 🎮 VISUAL COMPARISON

### Blocking Matrix

#### ❌ BEFORE
```
           Shields
Attacks      ✅ BLOCKED
```

#### ✅ AFTER
```
         Shields  Helmets
Axes       ✅       ❌
Arrows     ❌       ✅
```

**Remember:** Each defense only blocks its matching attack type!

---

## 🔍 COMMON MISTAKES (NOW FIXED)

### ❌ OLD THINKING
```
"I have 3 shields, I'm safe from all attacks!"
"Helmet is useless, shield blocks everything!"
```

### ✅ NEW UNDERSTANDING
```
"I have 3 shields, but they only block axes!"
"Opponent has many arrows? I NEED helmets!"
"Shields and helmets serve different purposes!"
```

---

## 📈 STRATEGIC DEPTH

### ❌ BEFORE (Limited)
```
Strategy:
  - Roll for attacks
  - Keep some shields
  - Spend tokens on healing or damage
```

### ✅ AFTER (Much Deeper)
```
Strategy:
  - Identify opponent's attack type (axes vs arrows)
  - Match your defense accordingly
  - Use hands to steal tokens when profitable
  - Plan favor usage (6 options with combos)
  - Manage gold border bonus tokens
  - Adapt to AI's intelligent behavior
```

---

## 🎯 TEST VALIDATION

### Critical Test: Shield Cannot Block Arrow

#### ❌ BEFORE (Would Fail)
```
Player: 3 arrows
Opponent: 3 shields
Old Logic: 3 - 3 = 0 damage (WRONG!)
```

#### ✅ AFTER (Passes)
```
Player: 3 arrows
Opponent: 3 shields
New Logic: 3 arrows - 0 helmets = 3 damage ✅
```

### Critical Test: Helmet Cannot Block Axe

#### ❌ BEFORE (Would Fail)
```
Player: 3 axes
Opponent: 3 helmets
Old Logic: 3 - 3 = 0 damage (WRONG!)
```

#### ✅ AFTER (Passes)
```
Player: 3 axes
Opponent: 3 helmets
New Logic: 3 axes - 0 shields = 3 damage ✅
```

---

## 📱 UI CHANGES

### ❌ BEFORE
```
- 3 dice symbols
- Simple damage messages
- Basic blessing panel
```

### ✅ AFTER
```
- 6 dice symbols (⚔️🏹🛡️🪖✋♦️)
- Gold border visual effect
- Detailed combat log component
- Enhanced Gods' Favors panel
- Resolution breakdown display
```

---

## 🎲 PROBABILITY CHANGES

### ❌ BEFORE
```
Attack:  50% (3/6)
Shield:  33% (2/6)
Token:   17% (1/6)
```

### ✅ AFTER
```
Each face: 16.67% (1/6)
  - Axe
  - Arrow
  - Shield
  - Helmet
  - Hand
  - Token

Gold border: 20% on any die
```

---

## 🏆 GAME BALANCE

### ❌ BEFORE
```
- Simple offense/defense trade-off
- Tokens less important
- Limited strategic options
```

### ✅ AFTER
```
- Must adapt defense to opponent's offense type
- Token stealing adds layer of strategy
- Gold borders create lucky moments
- 6 favors allow varied playstyles
- AI forces adaptation
```

---

## 🚀 HOW TO PLAY NOW

### Step-by-Step

1. **Roll Dice** - Get your 6 dice with mixed faces
2. **Check Gold** - Look for gold borders (bonus tokens!)
3. **Analyze** - What's opponent showing? Axes or arrows?
4. **Reroll** - Adapt your defense to their offense
5. **Favors** - Use tokens strategically (6 choices)
6. **End Turn** - Watch combat log for breakdown
7. **Learn** - See exactly what blocked what

### Key Differences in Gameplay

**OLD:** "Just get attacks and shields"  
**NEW:** "Adapt defense type to opponent's offense type"

**OLD:** "Shields protect from everything"  
**NEW:** "Shields protect from axes only, helmets from arrows only"

**OLD:** "3 blessing choices"  
**NEW:** "6 favor choices with varied costs and effects"

---

## 📚 RULE MNEMONICS

### Remember the Blocking Rules

```
⚔️ AXE needs SHIELD 🛡️
  (Both are melee/close-range)

🏹 ARROW needs HELMET 🪖
  (Both are ranged/head protection)
```

### Remember Resolution Order

```
T.H.D.D. = Tokens, Hands, Defense, Damage

"The Hero Deals Damage"
```

---

## ✨ CONCLUSION

### What's Better Now?

✅ **Authenticity** - Matches real AC Valhalla Orlog  
✅ **Strategy** - Deeper decision-making required  
✅ **Clarity** - Combat log shows exact calculations  
✅ **Balance** - Multiple viable strategies  
✅ **AI** - Smarter and more adaptive opponent  
✅ **Polish** - Gold borders add excitement  

### What's Preserved?

✅ **UI** - Same clean interface  
✅ **Flow** - Same turn structure  
✅ **Animations** - All effects working  
✅ **Responsiveness** - Mobile-friendly maintained  

---

**The game is now a faithful recreation of Assassin's Creed Valhalla Orlog!** ⚔️

**Open http://localhost:3000 to play!** 🎮
