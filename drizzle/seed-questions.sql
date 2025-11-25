-- 评估系统题库数据
-- 共49道题目，覆盖8大维度35项核心能力
-- 生成时间: 2025-11-24T16:20:02.325Z

-- 清空现有题目
DELETE FROM assessmentQuestions;

-- 插入49道评估题目
INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  1,
  '在制定公司年度战略规划时，您通常会：',
  'self_assessment',
  '主要依据去年的经验和行业惯例',
  '分析市场趋势，制定基本的年度目标',
  '系统分析内外部环境，制定清晰的战略目标和路径',
  '建立完整的战略规划体系，包括长期愿景、中期目标和短期计划',
  '主导企业战略转型，在行业中建立独特的竞争优势',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  2,
  '面对行业新趋势（如AI、新能源等），您的反应是：',
  'scenario',
  '保持观望，等待趋势明确后再行动',
  '关注行业动态，但不确定如何应对',
  '能够识别趋势，并评估对业务的影响',
  '快速判断趋势价值，制定应对策略并付诸实施',
  '提前预判趋势，引领行业变革，成为先行者',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  3,
  '在分析竞争对手时，您的做法是：',
  'behavioral',
  '主要关注价格和产品特性',
  '定期收集竞品信息，了解基本情况',
  '建立竞品分析框架，系统跟踪对手动态',
  '深入分析竞争格局，制定差异化竞争策略',
  '建立完整的竞争情报系统，持续优化竞争优势',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  4,
  '当现有业务模式遇到增长瓶颈时，您会：',
  'scenario',
  '加强销售力度，扩大市场投入',
  '尝试优化现有模式，提升效率',
  '探索新的商业模式，寻找增长点',
  '系统设计创新商业模式，开拓新市场',
  '重构价值链，创造全新的行业生态',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  5,
  '对于重大投资决策，您的风险评估方式是：',
  'behavioral',
  '主要依赖直觉和经验判断',
  '进行基本的财务可行性分析',
  '建立风险评估清单，系统评估各类风险',
  '建立完整的风险管理体系，制定应对预案',
  '构建动态风险监控系统，实时调整策略',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  6,
  '在短期业绩压力和长期投资之间，您通常：',
  'scenario',
  '优先完成短期目标，暂缓长期投资',
  '尽量平衡，但以短期为主',
  '制定平衡的策略，同时关注短期和长期',
  '建立长期价值评估体系，平衡短期和长期目标',
  '坚持长期价值导向，建立可持续的竞争优势',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  7,
  '发现业务流程效率低下时，您的做法是：',
  'behavioral',
  '要求团队加快工作速度',
  '识别明显的瓶颈环节并改进',
  '系统梳理流程，优化关键环节',
  '重构端到端流程，建立标准化体系',
  '建立持续改进机制，实现流程自动化和智能化',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  8,
  '在质量管理方面，您的工作方式是：',
  'self_assessment',
  '主要依赖事后检查和返工',
  '设定基本的质量标准和检查点',
  '建立质量管理流程，预防质量问题',
  '实施全面质量管理，建立质量文化',
  '打造卓越运营体系，成为行业质量标杆',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  9,
  '面对成本压力时，您的策略是：',
  'scenario',
  '全面削减开支，降低各项费用',
  '识别主要成本项，重点控制',
  '建立成本分析体系，优化成本结构',
  '实施精益管理，在保证质量前提下降本增效',
  '重构价值链，实现成本领先战略',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  10,
  '管理复杂项目时，您通常：',
  'behavioral',
  '边做边调整，灵活应对',
  '制定基本的时间表和任务分工',
  '使用项目管理工具，系统管控进度和风险',
  '建立完整的项目管理体系，确保交付质量',
  '运用敏捷和精益方法，实现卓越项目交付',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  11,
  '在供应链管理方面，您的成熟度是：',
  'self_assessment',
  '主要关注采购价格，缺乏系统管理',
  '建立基本的供应商管理流程',
  '实施供应链协同，优化库存和物流',
  '建立端到端供应链管理体系',
  '打造智能供应链网络，实现价值链整合',
  20, 40, 60, 80, 100,
  'hard',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  12,
  '对于运营KPI的管理，您的做法是：',
  'behavioral',
  '关注基本的业绩指标（营收、利润）',
  '建立部门级KPI体系',
  '建立全面的KPI体系，定期分析和改进',
  '建立战略级KPI体系，驱动业务增长',
  '构建数据驱动的运营管理系统，实时优化',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  13,
  '在推动数字化转型时，您的角色是：',
  'scenario',
  '主要交给IT部门处理',
  '推动基础信息化建设',
  '主导业务流程数字化，提升效率',
  '推动业务模式创新，实现数字化转型',
  '引领企业数字化战略，重构商业模式',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  14,
  '在招聘关键岗位时，您的评估重点是：',
  'behavioral',
  '主要看简历和工作经验',
  '评估专业技能和基本素质',
  '系统评估能力、经验和文化匹配度',
  '建立结构化面试流程，多维度评估候选人',
  '建立人才画像体系，精准识别和吸引顶尖人才',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  15,
  '在激励团队方面，您通常：',
  'self_assessment',
  '主要依靠薪资奖金',
  '结合物质和精神激励',
  '建立多元化激励体系，满足不同需求',
  '实施个性化激励，激发员工潜能',
  '打造高绩效文化，建立长期激励机制',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  16,
  '对于团队能力发展，您的投入是：',
  'behavioral',
  '主要依靠员工自学和在职锻炼',
  '组织基本的培训课程',
  '建立系统的培训和发展计划',
  '实施人才发展体系，包括轮岗、导师制等',
  '打造学习型组织，建立人才梯队',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  17,
  '在绩效管理方面，您的做法是：',
  'self_assessment',
  '年底进行简单的绩效评估',
  '定期评估绩效，给予反馈',
  '建立完整的绩效管理流程',
  '实施OKR等先进的绩效管理方法',
  '建立高绩效文化，持续提升组织效能',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  18,
  '跨部门协作出现问题时，您会：',
  'scenario',
  '让各部门自行协调',
  '协调关键问题，推动解决',
  '建立跨部门协作机制，预防问题',
  '打造协作文化，建立高效协作体系',
  '构建无边界组织，实现高效协同',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  19,
  '在企业文化建设方面，您的投入是：',
  'behavioral',
  '主要关注业务，文化建设较少',
  '组织团建活动，营造氛围',
  '提炼企业价值观，推动文化落地',
  '建立文化管理体系，融入日常运营',
  '打造独特的文化IP，成为企业核心竞争力',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  20,
  '在设定团队目标时，您通常：',
  'self_assessment',
  '分解公司目标，分配到团队',
  '与团队讨论，设定明确目标',
  '描绘清晰愿景，激发团队热情',
  '塑造令人振奋的愿景，凝聚团队力量',
  '建立共同的使命和价值观，激发组织活力',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  21,
  '面对组织变革阻力时，您的做法是：',
  'scenario',
  '强制推行，要求团队执行',
  '解释变革必要性，说服团队',
  '系统规划变革路径，逐步推进',
  '建立变革联盟，营造变革氛围',
  '成为变革推动者，引领组织转型',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  22,
  '在授权方面，您的风格是：',
  'behavioral',
  '重要事项必须亲自把关',
  '授权常规工作，保留关键决策',
  '充分授权，但保持监督',
  '赋能团队，培养决策能力',
  '打造自主驱动的团队，释放组织潜能',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  23,
  '在没有直接权力的情况下推动工作，您会：',
  'scenario',
  '寻求上级支持和授权',
  '通过人际关系推动',
  '用数据和逻辑说服相关方',
  '建立联盟，凝聚共识',
  '通过个人魅力和愿景，赢得支持',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  24,
  '面对重大决策时，您的决策方式是：',
  'behavioral',
  '依据经验和直觉快速决策',
  '收集信息后，谨慎决策',
  '系统分析，权衡利弊后决策',
  '建立决策框架，科学决策',
  '在不确定中果断决策，并持续优化',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  25,
  '团队出现严重冲突时，您会：',
  'scenario',
  '避免介入，让当事人自行解决',
  '听取双方意见，协调解决',
  '分析冲突根源，系统化解',
  '将冲突转化为建设性对话',
  '建立开放文化，预防和处理冲突',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  26,
  '在重要会议上汇报时，您的表现是：',
  'self_assessment',
  '能够完整汇报内容',
  '表达清晰，逻辑完整',
  '结构化表达，重点突出',
  '根据受众调整内容，精准传达',
  '通过故事和数据，产生深刻影响',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  27,
  '在团队提出不同意见时，您通常：',
  'behavioral',
  '听完后按自己想法处理',
  '认真听取，理解观点',
  '深入理解，提出澄清问题',
  '同理心倾听，挖掘深层需求',
  '创造安全环境，鼓励开放对话',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  28,
  '在商务谈判中，您的策略是：',
  'scenario',
  '坚持己方立场，不轻易妥协',
  '寻找折中方案，达成协议',
  '理解对方需求，寻求双赢',
  '创造性解决问题，实现共赢',
  '建立长期合作关系，创造更大价值',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  29,
  '与国际团队合作时，您的做法是：',
  'behavioral',
  '按照自己的方式沟通',
  '注意基本的文化差异',
  '学习和适应不同文化',
  '建立跨文化协作机制',
  '成为文化桥梁，促进全球协作',
  20, 40, 60, 80, 100,
  'hard',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  30,
  '面对新问题时，您的思考方式是：',
  'self_assessment',
  '参考过往经验和行业做法',
  '尝试新的解决方法',
  '从不同角度思考，寻找创新方案',
  '突破思维定式，创造性解决问题',
  '引领思维变革，开创新范式',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  31,
  '在产品创新方面，您的角色是：',
  'behavioral',
  '主要优化现有产品',
  '推动渐进式创新',
  '识别市场机会，开发新产品',
  '主导颠覆式创新，开创新市场',
  '建立创新体系，持续引领行业',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  32,
  '对于新技术（AI、区块链等）的应用，您会：',
  'scenario',
  '等待技术成熟后再考虑',
  '关注新技术，评估应用可能',
  '积极试点，探索业务价值',
  '主导技术应用，实现业务创新',
  '引领技术战略，建立技术护城河',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  33,
  '在鼓励团队创新方面，您的做法是：',
  'behavioral',
  '完成本职工作即可',
  '鼓励提出改进建议',
  '建立创新激励机制',
  '营造创新氛围，容忍失败',
  '打造创新文化，建立创新系统',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  34,
  '在理解客户需求方面，您的做法是：',
  'self_assessment',
  '主要依据客户明确表达的需求',
  '通过调研了解客户需求',
  '系统分析客户需求和痛点',
  '洞察客户潜在需求，超越期待',
  '预见客户未来需求，引领市场',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  35,
  '在提升客户体验方面，您的投入是：',
  'behavioral',
  '主要关注产品质量',
  '改进服务流程，提升满意度',
  '设计完整的客户旅程',
  '打造卓越的客户体验',
  '建立以客户为中心的组织文化',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  36,
  '对于重要客户的管理，您会：',
  'scenario',
  '主要通过销售团队维护',
  '定期拜访，维护关系',
  '建立客户管理体系',
  '成为客户信赖的合作伙伴',
  '建立战略伙伴关系，共创价值',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  37,
  '对于自己的优势和不足，您的认知是：',
  'self_assessment',
  '大致了解，但不够清晰',
  '比较清楚自己的能力范围',
  '深入了解，主动寻求反馈',
  '建立系统的自我评估体系',
  '持续反思，不断提升自我认知',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  38,
  '在个人学习方面，您的投入是：',
  'behavioral',
  '主要依靠工作中学习',
  '定期阅读和参加培训',
  '建立系统的学习计划',
  '实践学习型领导力',
  '成为终身学习者，引领学习文化',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  39,
  '面对重大变化（市场、技术、组织等），您会：',
  'scenario',
  '需要时间适应新环境',
  '积极调整，适应变化',
  '快速学习，拥抱变化',
  '主动引领变化，创造机会',
  '在不确定中成长，成为变革推动者',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  1,
  '将战略转化为行动时，您通常：',
  'behavioral',
  '直接告诉团队要做什么',
  '分解目标，制定行动计划',
  '建立战略执行体系，确保落地',
  '打通战略到执行的全链路',
  '建立战略执行文化，实现战略目标',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  7,
  '在资源有限的情况下，您的分配原则是：',
  'scenario',
  '平均分配，确保公平',
  '向紧急项目倾斜',
  '基于优先级配置资源',
  '动态优化资源配置',
  '建立资源管理体系，实现价值最大化',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  14,
  '识别高潜人才时，您主要关注：',
  'behavioral',
  '当前业绩表现',
  '专业能力和工作态度',
  '业绩、能力和潜力',
  '建立人才评估体系，多维度识别',
  '建立人才发展机制，培养未来领导者',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  5,
  '面对突发危机时，您的反应是：',
  'scenario',
  '紧急处理，控制局面',
  '组织团队，快速应对',
  '冷静分析，制定应对方案',
  '系统应对，将损失降到最低',
  '化危为机，提升组织韧性',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  12,
  '在做决策时，您对数据的使用是：',
  'behavioral',
  '主要依据经验和直觉',
  '参考关键数据指标',
  '基于数据分析做决策',
  '建立数据驱动的决策体系',
  '运用大数据和AI，实现智能决策',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  4,
  '在构建商业生态方面，您的思考是：',
  'scenario',
  '主要关注自身业务',
  '寻找合作伙伴，互惠互利',
  '建立合作网络，扩大影响力',
  '构建生态系统，创造协同价值',
  '打造平台生态，引领行业发展',
  20, 40, 60, 80, 100,
  'hard',
  5
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  39,
  '市场出现快速变化时，您的组织能：',
  'behavioral',
  '缓慢调整，逐步适应',
  '快速反应，调整策略',
  '敏捷转型，抓住机遇',
  '建立快速响应机制',
  '打造敏捷组织，持续进化',
  20, 40, 60, 80, 100,
  'hard',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  25,
  '在高压环境下，您的情绪管理能力是：',
  'self_assessment',
  '容易受情绪影响',
  '能够控制情绪',
  '保持冷静，理性应对',
  '管理自己和团队情绪',
  '营造积极氛围，激发团队能量',
  20, 40, 60, 80, 100,
  'medium',
  3
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  6,
  '在企业社会责任方面，您的认知是：',
  'behavioral',
  '主要关注商业利益',
  '遵守法律法规要求',
  '积极履行社会责任',
  '将社会责任融入战略',
  '创造共享价值，引领可持续发展',
  20, 40, 60, 80, 100,
  'medium',
  4
);

INSERT INTO assessmentQuestions (
  competencyId, question, questionType,
  option1, option2, option3, option4, option5,
  score1, score2, score3, score4, score5,
  difficulty, targetLevel
) VALUES (
  1,
  '在思考问题时，您的视角是：',
  'self_assessment',
  '主要从部门角度考虑',
  '考虑业务整体影响',
  '从公司全局角度思考',
  '考虑行业和生态系统',
  '具备全球视野，引领行业发展',
  20, 40, 60, 80, 100,
  'hard',
  4
);

-- 验证数据
SELECT COUNT(*) as total FROM assessmentQuestions;
SELECT competencyId, COUNT(*) as count FROM assessmentQuestions GROUP BY competencyId ORDER BY competencyId;
