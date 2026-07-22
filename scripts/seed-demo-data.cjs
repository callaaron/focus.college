/**
 * Seed demo evaluation data for demo_ceo / demo_cto / demo_manager
 * Inserts: userProfile + assessmentSession + userAnswers(25) + competencyScores(40)
 * Run: node scripts/seed-demo-data.js
 */
const mysql = require('mysql2/promise');
const DATABASE_URL = 'mysql://webapp:webapp_password_2024@localhost:3306/competency_system';

// Domain ID -> domain name mapping
const DOMAINS = {
  1: 'leadership',   // 战略领导力
  2: 'innovation',   // 产品创新
  3: 'marketing',    // 市场营销
  4: 'team',         // 团队管理
  5: 'operation',    // 运营管理
  6: 'finance',      // 财务能力
  7: 'network',      // 资源整合
  8: 'mindset',      // 创业心态
};

// Role-specific base scores per domain (0-100)
// Each role has strengths and weaknesses to make the radar chart interesting
const ROLE_PROFILES = {
  // CEO: strong strategy/mindset/network, moderate marketing/team, weaker ops/finance details
  7: {
    industry: '互联网/IT',
    currentRole: 'CEO',
    companySize: 'medium',
    companyStage: 'series_b',
    managementLevel: 'executive',
    yearsOfManagement: 8,
    directReports: 6,
    managementLayers: 3,
    teamSize: 50,
    domainScores: {
      1: [78, 92],  // leadership: 78-92
      2: [60, 78],  // innovation
      3: [65, 82],  // marketing
      4: [72, 88],  // team
      5: [42, 62],  // operation (weakness)
      6: [55, 72],  // finance
      7: [70, 88],  // network
      8: [80, 95],  // mindset (strength)
    }
  },
  // CTO: strong innovation/operation/data, moderate strategy/team, weaker marketing/network
  8: {
    industry: '互联网/IT',
    currentRole: 'CTO',
    companySize: 'medium',
    companyStage: 'series_a',
    managementLevel: 'senior',
    yearsOfManagement: 5,
    directReports: 4,
    managementLayers: 2,
    teamSize: 20,
    domainScores: {
      1: [55, 72],  // leadership
      2: [75, 92],  // innovation (strength)
      3: [40, 62],  // marketing (weakness)
      4: [50, 70],  // team
      5: [72, 88],  // operation (strength)
      6: [50, 68],  // finance
      7: [42, 60],  // network (weakness)
      8: [65, 82],  // mindset
    }
  },
  // Manager: moderate across board, some clear gaps
  9: {
    industry: '互联网/IT',
    currentRole: '运营总监',
    companySize: 'small',
    companyStage: 'angel',
    managementLevel: 'middle',
    yearsOfManagement: 3,
    directReports: 2,
    managementLayers: 1,
    teamSize: 8,
    domainScores: {
      1: [45, 65],  // leadership
      2: [50, 68],  // innovation
      3: [55, 75],  // marketing
      4: [60, 80],  // team (slight strength)
      5: [55, 72],  // operation
      6: [35, 55],  // finance (weakness)
      7: [50, 68],  // network
      8: [50, 70],  // mindset
    }
  },
};

// Deterministic pseudo-random based on seed (competencyId + userId)
function seededScore(seed, min, max) {
  // Simple hash: not crypto, just deterministic distribution
  const hash = (seed * 9301 + 49297) % 233280;
  const ratio = hash / 233280;
  return Math.round(min + ratio * (max - min));
}

function calculateFinalScore(qScore, sScore, aScore, eScore) {
  const qWeight = 40, sWeight = 20, aWeight = 30, eWeight = 10;
  return Math.max(0, Math.min(100, Math.round(
    (qScore * qWeight + sScore * sWeight + aScore * aWeight + eScore * eWeight) / 100
  )));
}

function calculateLevel(finalScore) {
  if (finalScore <= 20) return 1;
  if (finalScore <= 40) return 2;
  if (finalScore <= 60) return 3;
  if (finalScore <= 80) return 4;
  return 5;
}

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);

  // Fetch all competencies
  const [comps] = await conn.query('SELECT id, domainId, name, category FROM competencies ORDER BY id');
  console.log(`Found ${comps.length} competencies`);

  // Fetch all active questions
  const [questions] = await conn.query('SELECT id, competencyId FROM assessmentQuestions WHERE isActive=1 ORDER BY id');
  console.log(`Found ${questions.length} questions`);

  for (const [userIdStr, profile] of Object.entries(ROLE_PROFILES)) {
    const userId = parseInt(userIdStr);
    const [[userRow]] = await conn.query('SELECT username, name FROM users WHERE id=?', [userId]);
    console.log(`\n--- Seeding ${userRow.username} (${userRow.name}) ---`);

    // 1. Clean old data
    await conn.query('DELETE FROM competencyScores WHERE userId=?', [userId]);
    await conn.query('DELETE FROM userAnswers WHERE userId=?', [userId]);
    await conn.query('DELETE FROM assessmentSessions WHERE userId=?', [userId]);
    await conn.query('DELETE FROM userProfiles WHERE userId=?', [userId]);

    // 2. Insert userProfile
    await conn.query(
      `INSERT INTO userProfiles (userId, industry, companySize, companyStage, currentRole, managementLevel, yearsOfManagement, directReports, managementLayers, teamSize, profileCompleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [userId, profile.industry, profile.companySize, profile.companyStage, profile.currentRole,
       profile.managementLevel, profile.yearsOfManagement, profile.directReports,
       profile.managementLayers, profile.teamSize]
    );
    console.log('  + userProfile inserted');

    // 3. Insert assessmentSession (completed initial)
    const sessionDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const [sessionResult] = await conn.query(
      `INSERT INTO assessmentSessions (userId, sessionType, totalQuestions, answeredQuestions, status, startedAt, completedAt)
       VALUES (?, 'initial', ?, ?, 'completed', ?, ?)`,
      [userId, questions.length, questions.length, sessionDate, new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)]
    );
    const sessionId = sessionResult.insertId;
    console.log(`  + assessmentSession #${sessionId} (initial, completed)`);

    // 4. Insert userAnswers (use first 25 questions)
    const answersToInsert = questions.slice(0, 25);
    for (const q of answersToInsert) {
      const comp = comps.find(c => c.id === q.competencyId);
      if (!comp) continue;
      const domainRange = profile.domainScores[comp.domainId] || [50, 70];
      const qScore = seededScore(q.competencyId * 10 + userId, domainRange[0], domainRange[1]);
      // answer 1-5: score 20,40,60,80,100
      const answer = Math.max(1, Math.min(5, Math.round(qScore / 20)));
      const answerScore = answer * 20;

      await conn.query(
        `INSERT INTO userAnswers (userId, sessionId, questionId, competencyId, answer, score)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, sessionId, q.id, q.competencyId, answer, answerScore]
      );
    }
    console.log(`  + ${answersToInsert.length} userAnswers inserted`);

    // 5. Insert competencyScores (all 40 competencies)
    let mastered = 0, learning = 0, notStarted = 0;
    for (const comp of comps) {
      const domainRange = profile.domainScores[comp.domainId] || [50, 70];
      const qScore = seededScore(comp.id * 10 + userId, domainRange[0], domainRange[1]);
      const sScore = Math.min(100, qScore + 8);  // self-assessment slightly higher
      const aScore = Math.max(0, qScore - 5);     // AI analysis slightly lower
      const eScore = 0;                            // no evidence
      const finalScore = calculateFinalScore(qScore, sScore, aScore, eScore);
      const level = calculateLevel(finalScore);

      if (finalScore >= 80) mastered++;
      else if (finalScore >= 60) learning++;
      else notStarted++;

      await conn.query(
        `INSERT INTO competencyScores
         (userId, competencyId, questionnaireScore, selfAssessmentScore, aiAnalysisScore, evidenceScore, finalScore, level, practiceCount, lastPracticeAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, comp.id, qScore, sScore, aScore, eScore, finalScore, level,
         Math.floor(seededScore(comp.id + userId, 1, 15)),
         new Date(Date.now() - seededScore(comp.id, 1, 30) * 24 * 60 * 60 * 1000)]
      );
    }
    console.log(`  + 40 competencyScores inserted (mastered=${mastered}, learning=${learning}, notStarted=${notStarted})`);

    // Summary
    const avgScore = Math.round(
      comps.reduce((sum, comp) => {
        const dr = profile.domainScores[comp.domainId] || [50, 70];
        return sum + seededScore(comp.id * 10 + userId, dr[0], dr[1]);
      }, 0) / comps.length
    );
    console.log(`  ~ Average questionnaire score: ${avgScore}`);
  }

  // Verify
  console.log('\n=== VERIFICATION ===');
  const [summary] = await conn.query(`
    SELECT cs.userId, u.username, u.name,
      COUNT(*) as totalCompetencies,
      SUM(CASE WHEN cs.finalScore >= 80 THEN 1 ELSE 0 END) as mastered,
      SUM(CASE WHEN cs.finalScore >= 60 AND cs.finalScore < 80 THEN 1 ELSE 0 END) as learning,
      SUM(CASE WHEN cs.finalScore < 60 THEN 1 ELSE 0 END) as notStarted,
      ROUND(AVG(cs.finalScore)) as avgScore,
      MAX(cs.finalScore) as maxScore,
      MIN(cs.finalScore) as minScore
    FROM competencyScores cs
    JOIN users u ON cs.userId = u.id
    GROUP BY cs.userId, u.username, u.name
  `);
  console.table(summary);

  await conn.end();
  console.log('\nDone!');
}

main().catch(e => { console.error(e); process.exit(1); });
