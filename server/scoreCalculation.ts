/**
 * 能力评分计算工具函数
 * 
 * 评分来源和权重：
 * - 问卷答题得分（questionnaireScore）: 40% - 最客观，基于标准化测试
 * - AI资料分析得分（aiAssessed）: 35% - 基于实际工作成果
 * - 自我评估得分（selfAssessed）: 25% - 主观参考
 */

export interface ScoreComponents {
  questionnaireScore: number; // 0-5
  aiAssessed: number; // 0-5
  selfAssessed: number; // 0-5
}

export const SCORE_WEIGHTS = {
  questionnaire: 0.40,
  ai: 0.35,
  self: 0.25,
};

/**
 * 计算加权平均得分
 * @param scores 三种评分来源的得分
 * @returns 加权平均得分（0-5）和最终分数（0-100）
 */
export function calculateWeightedScore(scores: ScoreComponents): {
  weightedLevel: number; // 0-5
  finalScore: number; // 0-100
  breakdown: {
    questionnaire: number;
    ai: number;
    self: number;
  };
} {
  const { questionnaireScore, aiAssessed, selfAssessed } = scores;
  
  // 计算加权平均（0-5）
  const weightedLevel = 
    questionnaireScore * SCORE_WEIGHTS.questionnaire +
    aiAssessed * SCORE_WEIGHTS.ai +
    selfAssessed * SCORE_WEIGHTS.self;
  
  // 转换为0-100分
  const finalScore = Math.round(weightedLevel * 20);
  
  // 计算各部分贡献
  const breakdown = {
    questionnaire: questionnaireScore * SCORE_WEIGHTS.questionnaire,
    ai: aiAssessed * SCORE_WEIGHTS.ai,
    self: selfAssessed * SCORE_WEIGHTS.self,
  };
  
  return {
    weightedLevel: Math.round(weightedLevel * 10) / 10, // 保留一位小数
    finalScore,
    breakdown,
  };
}

/**
 * 根据加权得分确定能力等级
 * @param weightedLevel 加权平均得分（0-5）
 * @returns 能力等级（0-5）
 */
export function determineLevel(weightedLevel: number): number {
  return Math.round(weightedLevel);
}
