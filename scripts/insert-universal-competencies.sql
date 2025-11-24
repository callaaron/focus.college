-- 插入40个通用能力（每个能力域5个）
-- 这些能力标记为 isCore = 1，适用于所有创业者

-- 1. 战略规划域（domainId = 1）
INSERT INTO competencies (name, description, domainId, competencyType, isCore, createdAt, updatedAt) VALUES
('商业模式设计', '设计可持续的商业模式，明确价值主张、收入来源和成本结构', 1, 'knowledge', 1, NOW(), NOW()),
('市场分析', '分析市场规模、竞争格局、行业趋势，识别市场机会', 1, 'knowledge', 1, NOW(), NOW()),
('战略规划', '制定长期战略目标和阶段性里程碑，规划企业发展路径', 1, 'knowledge', 1, NOW(), NOW()),
('竞争策略', '制定差异化竞争策略，构建核心竞争优势', 1, 'knowledge', 1, NOW(), NOW()),
('商业洞察', '敏锐捕捉商业机会，预判市场变化和行业趋势', 1, 'mindset', 1, NOW(), NOW());

-- 2. 产品创新域（domainId = 2）
INSERT INTO competencies (name, description, domainId, competencyType, isCore, createdAt, updatedAt) VALUES
('需求分析', '识别和分析用户真实需求，定义产品核心价值', 2, 'knowledge', 1, NOW(), NOW()),
('产品设计', '设计产品功能、交互流程和用户体验', 2, 'skill', 1, NOW(), NOW()),
('产品迭代', '基于用户反馈快速迭代产品，持续优化产品体验', 2, 'skill', 1, NOW(), NOW()),
('用户体验', '关注用户体验细节，提升产品易用性和满意度', 2, 'mindset', 1, NOW(), NOW()),
('创新思维', '保持创新意识，探索新的产品方向和商业模式', 2, 'mindset', 1, NOW(), NOW());

-- 3. 市场营销域（domainId = 3）
INSERT INTO competencies (name, description, domainId, competencyType, isCore, createdAt, updatedAt) VALUES
('品牌建设', '塑造品牌形象，建立品牌认知和品牌价值', 3, 'knowledge', 1, NOW(), NOW()),
('营销策划', '制定营销策略，设计营销活动和推广方案', 3, 'skill', 1, NOW(), NOW()),
('渠道拓展', '开拓多元化营销渠道，扩大市场覆盖面', 3, 'skill', 1, NOW(), NOW()),
('数据分析', '分析营销数据，优化营销ROI和转化率', 3, 'knowledge', 1, NOW(), NOW()),
('用户增长', '设计增长策略，实现用户规模的快速增长', 3, 'skill', 1, NOW(), NOW());

-- 4. 团队管理域（domainId = 4）
INSERT INTO competencies (name, description, domainId, competencyType, isCore, createdAt, updatedAt) VALUES
('人才招聘', '识别和吸引优秀人才，搭建高效团队', 4, 'skill', 1, NOW(), NOW()),
('团队激励', '设计激励机制，激发团队成员积极性和创造力', 4, 'skill', 1, NOW(), NOW()),
('绩效管理', '设定明确目标，实施有效的绩效评估和反馈', 4, 'knowledge', 1, NOW(), NOW()),
('组织文化', '塑造积极的组织文化，增强团队凝聚力', 4, 'mindset', 1, NOW(), NOW()),
('冲突处理', '妥善处理团队冲突，维护团队和谐氛围', 4, 'skill', 1, NOW(), NOW());

-- 5. 运营管理域（domainId = 5）
INSERT INTO competencies (name, description, domainId, competencyType, isCore, createdAt, updatedAt) VALUES
('流程优化', '优化业务流程，提升运营效率和执行力', 5, 'skill', 1, NOW(), NOW()),
('项目管理', '管理项目进度、资源和风险，确保项目按时交付', 5, 'skill', 1, NOW(), NOW()),
('质量管控', '建立质量标准，实施质量监控和持续改进', 5, 'knowledge', 1, NOW(), NOW()),
('供应链管理', '优化供应链效率，降低成本并保证交付质量', 5, 'knowledge', 1, NOW(), NOW()),
('运营数据分析', '分析运营数据，发现问题并制定改进措施', 5, 'skill', 1, NOW(), NOW());

-- 6. 财务融资域（domainId = 6）
INSERT INTO competencies (name, description, domainId, competencyType, isCore, createdAt, updatedAt) VALUES
('财务规划', '制定财务预算和资金使用计划，确保资金健康', 6, 'knowledge', 1, NOW(), NOW()),
('融资能力', '准备融资材料，与投资人沟通并完成融资', 6, 'skill', 1, NOW(), NOW()),
('成本控制', '控制各项成本支出，提高资金使用效率', 6, 'knowledge', 1, NOW(), NOW()),
('财务分析', '分析财务报表，评估财务健康状况和经营风险', 6, 'knowledge', 1, NOW(), NOW()),
('投资决策', '评估投资机会和风险，做出合理的投资决策', 6, 'knowledge', 1, NOW(), NOW());

-- 7. 技术研发域（domainId = 7）
INSERT INTO competencies (name, description, domainId, competencyType, isCore, createdAt, updatedAt) VALUES
('技术选型', '选择合适的技术栈和架构，支持业务快速发展', 7, 'knowledge', 1, NOW(), NOW()),
('研发管理', '管理研发团队和项目，确保技术产出质量和效率', 7, 'skill', 1, NOW(), NOW()),
('技术架构', '设计可扩展的技术架构，支撑业务长期发展', 7, 'knowledge', 1, NOW(), NOW()),
('技术创新', '关注技术前沿，将新技术应用于产品创新', 7, 'mindset', 1, NOW(), NOW()),
('技术债务管理', '平衡技术债务和业务发展，避免技术风险积累', 7, 'knowledge', 1, NOW(), NOW());

-- 8. 领导力域（domainId = 8）
INSERT INTO competencies (name, description, domainId, competencyType, isCore, createdAt, updatedAt) VALUES
('战略决策', '在不确定性中做出关键决策，把握企业发展方向', 8, 'skill', 1, NOW(), NOW()),
('沟通表达', '清晰表达想法和愿景，有效沟通和说服他人', 8, 'skill', 1, NOW(), NOW()),
('抗压能力', '在高压环境下保持冷静，应对挑战和挫折', 8, 'mindset', 1, NOW(), NOW()),
('学习能力', '快速学习新知识和技能，适应快速变化的环境', 8, 'mindset', 1, NOW(), NOW()),
('影响力', '通过个人魅力和专业能力影响团队和利益相关方', 8, 'mindset', 1, NOW(), NOW());
