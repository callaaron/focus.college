-- 填充演示账户数据到 Cloudflare D1

-- 1. 演示账户 - 产品经理 (demo_pm)
INSERT OR REPLACE INTO users (
  id, username, email, passwordHash, name, role, isDemo, demoRole, loginMethod, createdAt, updatedAt, lastSignedIn
) VALUES (
  101,
  'demo_pm',
  'demo_pm@focus.college',
  '$2a$10$YourHashedPasswordHere', -- demo123
  '张伟 (产品经理)',
  'user',
  1,
  'pm',
  'local',
  datetime('now'),
  datetime('now'),
  datetime('now')
);

INSERT OR REPLACE INTO userProfiles (
  userId, industry, industryId, currentRole, positionId, managementLevel,
  companySize, companyStage, yearsOfManagement, directReports, teamSize, profileCompleted
) VALUES (
  101,
  '互联网',
  1,
  '高级产品经理',
  5,
  'middle',
  'medium',
  'series_b',
  3,
  5,
  8,
  1
);

-- 2. 演示账户 - 技术总监 (demo_cto)
INSERT OR REPLACE INTO users (
  id, username, email, passwordHash, name, role, isDemo, demoRole, loginMethod, createdAt, updatedAt, lastSignedIn
) VALUES (
  102,
  'demo_cto',
  'demo_cto@focus.college',
  '$2a$10$YourHashedPasswordHere', -- demo123
  '李明 (技术总监)',
  'user',
  1,
  'cto',
  'local',
  datetime('now'),
  datetime('now'),
  datetime('now')
);

INSERT OR REPLACE INTO userProfiles (
  userId, industry, industryId, currentRole, positionId, managementLevel,
  companySize, companyStage, yearsOfManagement, directReports, teamSize, profileCompleted
) VALUES (
  102,
  '人工智能',
  2,
  '首席技术官',
  2,
  'executive',
  'large',
  'series_c',
  8,
  15,
  120,
  1
);

-- 3. 演示账户 - 首席执行官 (demo_ceo)
INSERT OR REPLACE INTO users (
  id, username, email, passwordHash, name, role, isDemo, demoRole, loginMethod, createdAt, updatedAt, lastSignedIn
) VALUES (
  103,
  'demo_ceo',
  'demo_ceo@focus.college',
  '$2a$10$YourHashedPasswordHere', -- demo123
  '王芳 (首席执行官)',
  'user',
  1,
  'ceo',
  'local',
  datetime('now'),
  datetime('now'),
  datetime('now')
);

INSERT OR REPLACE INTO userProfiles (
  userId, industry, industryId, currentRole, positionId, managementLevel,
  companySize, companyStage, yearsOfManagement, directReports, teamSize, profileCompleted
) VALUES (
  103,
  '金融科技',
  3,
  '首席执行官',
  1,
  'executive',
  'large',
  'pre_ipo',
  12,
  8,
  500,
  1
);

-- 为每个演示用户创建能力评分数据（示例）
-- PM的能力评分
INSERT OR IGNORE INTO competencyScores (userId, competencyId, questionnaireScore, selfAssessmentScore, aiAnalysisScore, finalScore, level, createdAt, updatedAt)
SELECT 
  101 as userId,
  id as competencyId,
  CASE 
    WHEN id % 3 = 0 THEN 85
    WHEN id % 3 = 1 THEN 75
    ELSE 65
  END as questionnaireScore,
  CASE 
    WHEN id % 3 = 0 THEN 80
    WHEN id % 3 = 1 THEN 70
    ELSE 60
  END as selfAssessmentScore,
  CASE 
    WHEN id % 3 = 0 THEN 82
    WHEN id % 3 = 1 THEN 72
    ELSE 62
  END as aiAnalysisScore,
  CASE 
    WHEN id % 3 = 0 THEN 82
    WHEN id % 3 = 1 THEN 72
    ELSE 62
  END as finalScore,
  CASE 
    WHEN id % 3 = 0 THEN 'proficient'
    WHEN id % 3 = 1 THEN 'intermediate'
    ELSE 'basic'
  END as level,
  datetime('now') as createdAt,
  datetime('now') as updatedAt
FROM competencies
LIMIT 35;

-- CTO的能力评分（更高）
INSERT OR IGNORE INTO competencyScores (userId, competencyId, questionnaireScore, selfAssessmentScore, aiAnalysisScore, finalScore, level, createdAt, updatedAt)
SELECT 
  102 as userId,
  id as competencyId,
  CASE 
    WHEN id % 3 = 0 THEN 95
    WHEN id % 3 = 1 THEN 85
    ELSE 75
  END as questionnaireScore,
  CASE 
    WHEN id % 3 = 0 THEN 92
    WHEN id % 3 = 1 THEN 82
    ELSE 72
  END as selfAssessmentScore,
  CASE 
    WHEN id % 3 = 0 THEN 94
    WHEN id % 3 = 1 THEN 84
    ELSE 74
  END as aiAnalysisScore,
  CASE 
    WHEN id % 3 = 0 THEN 94
    WHEN id % 3 = 1 THEN 84
    ELSE 74
  END as finalScore,
  CASE 
    WHEN id % 3 = 0 THEN 'expert'
    WHEN id % 3 = 1 THEN 'proficient'
    ELSE 'intermediate'
  END as level,
  datetime('now') as createdAt,
  datetime('now') as updatedAt
FROM competencies
LIMIT 35;

-- CEO的能力评分（最高）
INSERT OR IGNORE INTO competencyScores (userId, competencyId, questionnaireScore, selfAssessmentScore, aiAnalysisScore, finalScore, level, createdAt, updatedAt)
SELECT 
  103 as userId,
  id as competencyId,
  CASE 
    WHEN id % 3 = 0 THEN 98
    WHEN id % 3 = 1 THEN 88
    ELSE 78
  END as questionnaireScore,
  CASE 
    WHEN id % 3 = 0 THEN 96
    WHEN id % 3 = 1 THEN 86
    ELSE 76
  END as selfAssessmentScore,
  CASE 
    WHEN id % 3 = 0 THEN 97
    WHEN id % 3 = 1 THEN 87
    ELSE 77
  END as aiAnalysisScore,
  CASE 
    WHEN id % 3 = 0 THEN 97
    WHEN id % 3 = 1 THEN 87
    ELSE 77
  END as finalScore,
  CASE 
    WHEN id % 3 = 0 THEN 'expert'
    WHEN id % 3 = 1 THEN 'expert'
    ELSE 'proficient'
  END as level,
  datetime('now') as createdAt,
  datetime('now') as updatedAt
FROM competencies
LIMIT 35;
