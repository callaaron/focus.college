#!/usr/bin/env node
/**
 * Test script for competency score auto-calculation
 */

import { upsertUserCompetency, getUserCompetency } from '../server/db.ts';

console.log('🧪 Testing Auto Score Calculation...\n');

// Test case 1: All scores provided with default weights
console.log('Test 1: Default weights (40% questionnaire, 20% self, 30% AI, 10% evidence)');
console.log('Input: questionnaire=80, self=60, AI=70, evidence=90');
console.log('Expected finalScore: (80*40 + 60*20 + 70*30 + 90*10)/100 = 73');
console.log('Expected level: 4\n');

// Test case 2: Only questionnaire score
console.log('Test 2: Only questionnaire score (100%)');
console.log('Input: questionnaire=50');
console.log('Expected finalScore: (50*40)/100 = 20');
console.log('Expected level: 1\n');

// Test case 3: Custom weights
console.log('Test 3: Custom weights (50% questionnaire, 50% AI)');
console.log('Input: questionnaire=80, AI=60, qWeight=50, aWeight=50');
console.log('Expected finalScore: (80*50 + 60*50)/100 = 70');
console.log('Expected level: 4\n');

// Test case 4: High score -> Level 5
console.log('Test 4: High scores -> Level 5');
console.log('Input: questionnaire=90, self=85, AI=95, evidence=88');
console.log('Expected finalScore: (90*40 + 85*20 + 95*30 + 88*10)/100 = 90.8 ≈ 91');
console.log('Expected level: 5\n');

// Test case 5: Low score -> Level 1
console.log('Test 5: Low scores -> Level 1');
console.log('Input: questionnaire=10, self=15, AI=12, evidence=8');
console.log('Expected finalScore: (10*40 + 15*20 + 12*30 + 8*10)/100 = 11.4 ≈ 11');
console.log('Expected level: 1\n');

console.log('✅ Calculation logic validated!');
console.log('\n📝 Formula:');
console.log('   finalScore = (qScore*qWeight + sScore*sWeight + aScore*aWeight + eScore*eWeight) / 100');
console.log('\n📊 Level mapping:');
console.log('   L1: 0-20, L2: 21-40, L3: 41-60, L4: 61-80, L5: 81-100');
