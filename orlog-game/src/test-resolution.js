// Test file to verify AC Valhalla Orlog resolution rules
import { resolveRound, DICE_FACES } from './gameLogic.js';

console.log('=== AC Valhalla Orlog Resolution Test ===\n');

// Test Case from Requirements:
// Player: 3 Axes, 2 Arrows
// Opponent: 2 Shields, 1 Helmet
// Expected: 1 axe damage + 1 arrow damage = 2 total damage

const playerDice = [
  { face: DICE_FACES.AXE, isGold: false },
  { face: DICE_FACES.AXE, isGold: false },
  { face: DICE_FACES.AXE, isGold: false },
  { face: DICE_FACES.ARROW, isGold: false },
  { face: DICE_FACES.ARROW, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false }
];

const opponentDice = [
  { face: DICE_FACES.SHIELD, isGold: false },
  { face: DICE_FACES.SHIELD, isGold: false },
  { face: DICE_FACES.HELMET, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.HAND, isGold: false },
  { face: DICE_FACES.SHIELD, isGold: false }
];

const result = resolveRound(playerDice, opponentDice, 0, 0);

console.log('Player Dice: 3 Axes, 2 Arrows');
console.log('Opponent Dice: 2 Shields, 1 Helmet\n');

console.log('Expected Resolution:');
console.log('- Axes: 3 - 2 shields = 1 damage');
console.log('- Arrows: 2 - 1 helmet = 1 damage');
console.log('- Total: 2 damage\n');

console.log('Actual Resolution:');
console.log(`- Axes blocked: ${result.attacker.details.axesBlocked}`);
console.log(`- Unblocked axes: ${result.attacker.details.unblockedAxes}`);
console.log(`- Arrows blocked: ${result.attacker.details.arrowsBlocked}`);
console.log(`- Unblocked arrows: ${result.attacker.details.unblockedArrows}`);
console.log(`- Total damage dealt: ${result.attacker.damage}\n`);

// Verify test passes
if (result.attacker.damage === 2 && 
    result.attacker.details.unblockedAxes === 1 && 
    result.attacker.details.unblockedArrows === 1) {
  console.log('✅ TEST PASSED: Combat resolution matches AC Valhalla rules!');
} else {
  console.log('❌ TEST FAILED: Combat resolution does not match expected values');
  console.log(`   Expected: 2 damage (1 axe + 1 arrow)`);
  console.log(`   Got: ${result.attacker.damage} damage`);
}

// Test 2: Cross-blocking should NOT work
console.log('\n=== Test 2: Shield cannot block Arrow ===\n');

const test2Player = [
  { face: DICE_FACES.ARROW, isGold: false },
  { face: DICE_FACES.ARROW, isGold: false },
  { face: DICE_FACES.ARROW, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false }
];

const test2Opponent = [
  { face: DICE_FACES.SHIELD, isGold: false },
  { face: DICE_FACES.SHIELD, isGold: false },
  { face: DICE_FACES.SHIELD, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false }
];

const result2 = resolveRound(test2Player, test2Opponent, 0, 0);

console.log('Player: 3 Arrows');
console.log('Opponent: 3 Shields');
console.log('Expected: 3 damage (shields do NOT block arrows)');
console.log(`Actual: ${result2.attacker.damage} damage`);

if (result2.attacker.damage === 3) {
  console.log('✅ TEST PASSED: Shields correctly do not block arrows!\n');
} else {
  console.log('❌ TEST FAILED: Shields should not block arrows\n');
}

// Test 3: Helmet cannot block Axe
console.log('=== Test 3: Helmet cannot block Axe ===\n');

const test3Player = [
  { face: DICE_FACES.AXE, isGold: false },
  { face: DICE_FACES.AXE, isGold: false },
  { face: DICE_FACES.AXE, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false }
];

const test3Opponent = [
  { face: DICE_FACES.HELMET, isGold: false },
  { face: DICE_FACES.HELMET, isGold: false },
  { face: DICE_FACES.HELMET, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false }
];

const result3 = resolveRound(test3Player, test3Opponent, 0, 0);

console.log('Player: 3 Axes');
console.log('Opponent: 3 Helmets');
console.log('Expected: 3 damage (helmets do NOT block axes)');
console.log(`Actual: ${result3.attacker.damage} damage`);

if (result3.attacker.damage === 3) {
  console.log('✅ TEST PASSED: Helmets correctly do not block axes!\n');
} else {
  console.log('❌ TEST FAILED: Helmets should not block axes\n');
}

// Test 4: Token stealing with Hands
console.log('=== Test 4: Hand steals tokens ===\n');

const test4Player = [
  { face: DICE_FACES.HAND, isGold: false },
  { face: DICE_FACES.HAND, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false }
];

const test4Opponent = [
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false }
];

const result4 = resolveRound(test4Player, test4Opponent, 0, 5);

console.log('Player: 2 Hands, 4 Tokens (opponent has 5 tokens)');
console.log('Opponent: 6 Tokens');
console.log('Expected: Player steals 2 tokens from opponent');
console.log(`Actual: Player steals ${result4.attacker.tokensStolen} tokens`);
console.log(`Opponent loses ${result4.defender.tokensLost} tokens`);

if (result4.attacker.tokensStolen === 2 && result4.defender.tokensLost === 2) {
  console.log('✅ TEST PASSED: Hand correctly steals tokens!\n');
} else {
  console.log('❌ TEST FAILED: Hand token stealing not working correctly\n');
}

// Test 5: Gold border bonus tokens
console.log('=== Test 5: Gold border grants bonus tokens ===\n');

const test5Player = [
  { face: DICE_FACES.AXE, isGold: true },
  { face: DICE_FACES.ARROW, isGold: true },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false }
];

const test5Opponent = [
  { face: DICE_FACES.SHIELD, isGold: false },
  { face: DICE_FACES.HELMET, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false },
  { face: DICE_FACES.TOKEN, isGold: false }
];

const result5 = resolveRound(test5Player, test5Opponent, 0, 0);

console.log('Player: 4 regular tokens + 2 gold-bordered dice');
console.log('Expected: 6 total tokens gained');
console.log(`Actual: ${result5.attacker.tokensGained} tokens gained`);

if (result5.attacker.tokensGained === 6) {
  console.log('✅ TEST PASSED: Gold borders correctly grant bonus tokens!\n');
} else {
  console.log('❌ TEST FAILED: Gold border bonus not working correctly\n');
}

console.log('=== All Tests Complete ===');
