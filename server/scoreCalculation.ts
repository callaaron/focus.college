/**
 * 能力评分计算工具函数
 *
 * 评分来源和权重（与 schema competencyScores 表默认权重一致）：
 * - 问卷答题得分（questionnaireScore）: 40% - 最客观，基于标准化测试
 * - AI分析得分（aiAnalysisScore）: 30% - 基于实际工作成果
 * - 自我评估得分（selfAssessmentScore）: 20% - 主观参考
 * - 证据上传得分（evidenceScore）: 10% - 最硬的证据，能力定级主要依据
 */

export interface ScoreComponents {
  questionnaireScore: number; // 0-100
  aiAnalysisScore: number; // 0-100
  selfAssessmentScore: number; // 0-100
  evidenceScore: number; // 0-100
}

export const SCORE_WEIGHTS = {
  questionnaire: 0.40,
  ai: 0.30,
  self: 0.20,
  evidence: 0.10,
};

/**
 * 计算加权平均得分
 * @param scores 四种评分来源的得分（0-100）
 * @returns 加权得分（0-100）和能力等级（1-5）
 */
export function calculateWeightedScore(scores: ScoreComponents): {
  finalScore: number; // 0-100
  level: number; // 1-5
  breakdown: {
    questionnaire: number;
    ai: number;
    self: number;
    evidence: number;
  };
} {
  const { questionnaireScore, aiAnalysisScore, selfAssessmentScore, evidenceScore } = scores;

  // 计算加权平均（0-100）
  const finalScore = Math.round(
    questionnaireScore * SCORE_WEIGHTS.questionnaire +
    aiAnalysisScore * SCORE_WEIGHTS.ai +
    selfAssessmentScore * SCORE_WEIGHTS.self +
    evidenceScore * SCORE_WEIGHTS.evidence
  );

  // 计算各部分贡献
  const breakdown = {
    questionnaire: Math.round(questionnaireScore * SCORE_WEIGHTS.questionnaire * 10) / 10,
    ai: Math.round(aiAnalysisScore * SCORE_WEIGHTS.ai * 10) / 10,
    self: Math.round(selfAssessmentScore * SCORE_WEIGHTS.self * 10) / 10,
    evidence: Math.round(evidenceScore * SCORE_WEIGHTS.evidence * 10) / 10,
  };

  // 根据分数确定等级：>=80=L4(精通), >=60=L3(发展中), >=40=L2(入门), >=20=L1(初学), <20=L1
  const level = finalScore >= 80 ? 4 : finalScore >= 60 ? 3 : finalScore >= 40 ? 2 : 1;

  return {
    finalScore,
    level,
    breakdown,
  };
}

/**
 * 根据分数确定能力等级
 * @param finalScore 最终得分（0-100）
 * @returns 能力等级（1-5）
 */
export function determineLevel(finalScore: number): number {
  if (finalScore >= 80) return 4;
  if (finalScore >= 60) return 3;
  if (finalScore >= 40) return 2;
  return 1;
}
