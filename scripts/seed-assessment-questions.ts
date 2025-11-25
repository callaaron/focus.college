import Database from 'better-sqlite3';
import * as schema from '../drizzle/schema-d1';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const db = new Database('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/8165a43c4148c06aa1bcf8795c36171863aaa14fcab8ba91989ddde997f672fb.sqlite');
const orm = drizzle(db, { schema });

// 49道评估题目 - 覆盖35项核心能力
const assessmentQuestions = [
  // ============ 战略思维维度 (6题) ============
  // 1. 战略规划能力
  {
    competencyId: 1,
    question: "在制定公司年度战略规划时，您通常会：",
    questionType: "self_assessment",
    option1: "主要依据去年的经验和行业惯例",
    option2: "分析市场趋势，制定基本的年度目标",
    option3: "系统分析内外部环境，制定清晰的战略目标和路径",
    option4: "建立完整的战略规划体系，包括长期愿景、中期目标和短期计划",
    option5: "主导企业战略转型，在行业中建立独特的竞争优势",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 2. 商业洞察力
  {
    competencyId: 2,
    question: "面对行业新趋势（如AI、新能源等），您的反应是：",
    questionType: "scenario",
    option1: "保持观望，等待趋势明确后再行动",
    option2: "关注行业动态，但不确定如何应对",
    option3: "能够识别趋势，并评估对业务的影响",
    option4: "快速判断趋势价值，制定应对策略并付诸实施",
    option5: "提前预判趋势，引领行业变革，成为先行者",
    difficulty: "hard",
    targetLevel: 4,
  },
  // 3. 市场分析能力
  {
    competencyId: 3,
    question: "在分析竞争对手时，您的做法是：",
    questionType: "behavioral",
    option1: "主要关注价格和产品特性",
    option2: "定期收集竞品信息，了解基本情况",
    option3: "建立竞品分析框架，系统跟踪对手动态",
    option4: "深入分析竞争格局，制定差异化竞争策略",
    option5: "建立完整的竞争情报系统，持续优化竞争优势",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 4. 业务模式创新
  {
    competencyId: 4,
    question: "当现有业务模式遇到增长瓶颈时，您会：",
    questionType: "scenario",
    option1: "加强销售力度，扩大市场投入",
    option2: "尝试优化现有模式，提升效率",
    option3: "探索新的商业模式，寻找增长点",
    option4: "系统设计创新商业模式，开拓新市场",
    option5: "重构价值链，创造全新的行业生态",
    difficulty: "hard",
    targetLevel: 4,
  },
  // 5. 风险管理能力
  {
    competencyId: 5,
    question: "对于重大投资决策，您的风险评估方式是：",
    questionType: "behavioral",
    option1: "主要依赖直觉和经验判断",
    option2: "进行基本的财务可行性分析",
    option3: "建立风险评估清单，系统评估各类风险",
    option4: "建立完整的风险管理体系，制定应对预案",
    option5: "构建动态风险监控系统，实时调整策略",
    difficulty: "hard",
    targetLevel: 4,
  },
  // 6. 长期价值创造
  {
    competencyId: 6,
    question: "在短期业绩压力和长期投资之间，您通常：",
    questionType: "scenario",
    option1: "优先完成短期目标，暂缓长期投资",
    option2: "尽量平衡，但以短期为主",
    option3: "制定平衡的策略，同时关注短期和长期",
    option4: "建立长期价值评估体系，平衡短期和长期目标",
    option5: "坚持长期价值导向，建立可持续的竞争优势",
    difficulty: "hard",
    targetLevel: 4,
  },

  // ============ 运营管理维度 (7题) ============
  // 7. 流程优化能力
  {
    competencyId: 7,
    question: "发现业务流程效率低下时，您的做法是：",
    questionType: "behavioral",
    option1: "要求团队加快工作速度",
    option2: "识别明显的瓶颈环节并改进",
    option3: "系统梳理流程，优化关键环节",
    option4: "重构端到端流程，建立标准化体系",
    option5: "建立持续改进机制，实现流程自动化和智能化",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 8. 质量管理
  {
    competencyId: 8,
    question: "在质量管理方面，您的工作方式是：",
    questionType: "self_assessment",
    option1: "主要依赖事后检查和返工",
    option2: "设定基本的质量标准和检查点",
    option3: "建立质量管理流程，预防质量问题",
    option4: "实施全面质量管理，建立质量文化",
    option5: "打造卓越运营体系，成为行业质量标杆",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 9. 成本控制
  {
    competencyId: 9,
    question: "面对成本压力时，您的策略是：",
    questionType: "scenario",
    option1: "全面削减开支，降低各项费用",
    option2: "识别主要成本项，重点控制",
    option3: "建立成本分析体系，优化成本结构",
    option4: "实施精益管理，在保证质量前提下降本增效",
    option5: "重构价值链，实现成本领先战略",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 10. 项目管理
  {
    competencyId: 10,
    question: "管理复杂项目时，您通常：",
    questionType: "behavioral",
    option1: "边做边调整，灵活应对",
    option2: "制定基本的时间表和任务分工",
    option3: "使用项目管理工具，系统管控进度和风险",
    option4: "建立完整的项目管理体系，确保交付质量",
    option5: "运用敏捷和精益方法，实现卓越项目交付",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 11. 供应链管理
  {
    competencyId: 11,
    question: "在供应链管理方面，您的成熟度是：",
    questionType: "self_assessment",
    option1: "主要关注采购价格，缺乏系统管理",
    option2: "建立基本的供应商管理流程",
    option3: "实施供应链协同，优化库存和物流",
    option4: "建立端到端供应链管理体系",
    option5: "打造智能供应链网络，实现价值链整合",
    difficulty: "hard",
    targetLevel: 3,
  },
  // 12. 运营指标管理
  {
    competencyId: 12,
    question: "对于运营KPI的管理，您的做法是：",
    questionType: "behavioral",
    option1: "关注基本的业绩指标（营收、利润）",
    option2: "建立部门级KPI体系",
    option3: "建立全面的KPI体系，定期分析和改进",
    option4: "建立战略级KPI体系，驱动业务增长",
    option5: "构建数据驱动的运营管理系统，实时优化",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 13. 数字化转型
  {
    competencyId: 13,
    question: "在推动数字化转型时，您的角色是：",
    questionType: "scenario",
    option1: "主要交给IT部门处理",
    option2: "推动基础信息化建设",
    option3: "主导业务流程数字化，提升效率",
    option4: "推动业务模式创新，实现数字化转型",
    option5: "引领企业数字化战略，重构商业模式",
    difficulty: "hard",
    targetLevel: 4,
  },

  // ============ 团队建设维度 (6题) ============
  // 14. 人才招募
  {
    competencyId: 14,
    question: "在招聘关键岗位时，您的评估重点是：",
    questionType: "behavioral",
    option1: "主要看简历和工作经验",
    option2: "评估专业技能和基本素质",
    option3: "系统评估能力、经验和文化匹配度",
    option4: "建立结构化面试流程，多维度评估候选人",
    option5: "建立人才画像体系，精准识别和吸引顶尖人才",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 15. 团队激励
  {
    competencyId: 15,
    question: "在激励团队方面，您通常：",
    questionType: "self_assessment",
    option1: "主要依靠薪资奖金",
    option2: "结合物质和精神激励",
    option3: "建立多元化激励体系，满足不同需求",
    option4: "实施个性化激励，激发员工潜能",
    option5: "打造高绩效文化，建立长期激励机制",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 16. 团队培养
  {
    competencyId: 16,
    question: "对于团队能力发展，您的投入是：",
    questionType: "behavioral",
    option1: "主要依靠员工自学和在职锻炼",
    option2: "组织基本的培训课程",
    option3: "建立系统的培训和发展计划",
    option4: "实施人才发展体系，包括轮岗、导师制等",
    option5: "打造学习型组织，建立人才梯队",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 17. 绩效管理
  {
    competencyId: 17,
    question: "在绩效管理方面，您的做法是：",
    questionType: "self_assessment",
    option1: "年底进行简单的绩效评估",
    option2: "定期评估绩效，给予反馈",
    option3: "建立完整的绩效管理流程",
    option4: "实施OKR等先进的绩效管理方法",
    option5: "建立高绩效文化，持续提升组织效能",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 18. 团队协作
  {
    competencyId: 18,
    question: "跨部门协作出现问题时，您会：",
    questionType: "scenario",
    option1: "让各部门自行协调",
    option2: "协调关键问题，推动解决",
    option3: "建立跨部门协作机制，预防问题",
    option4: "打造协作文化，建立高效协作体系",
    option5: "构建无边界组织，实现高效协同",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 19. 文化建设
  {
    competencyId: 19,
    question: "在企业文化建设方面，您的投入是：",
    questionType: "behavioral",
    option1: "主要关注业务，文化建设较少",
    option2: "组织团建活动，营造氛围",
    option3: "提炼企业价值观，推动文化落地",
    option4: "建立文化管理体系，融入日常运营",
    option5: "打造独特的文化IP，成为企业核心竞争力",
    difficulty: "hard",
    targetLevel: 4,
  },

  // ============ 领导力维度 (6题) ============
  // 20. 愿景塑造
  {
    competencyId: 20,
    question: "在设定团队目标时，您通常：",
    questionType: "self_assessment",
    option1: "分解公司目标，分配到团队",
    option2: "与团队讨论，设定明确目标",
    option3: "描绘清晰愿景，激发团队热情",
    option4: "塑造令人振奋的愿景，凝聚团队力量",
    option5: "建立共同的使命和价值观，激发组织活力",
    difficulty: "hard",
    targetLevel: 4,
  },
  // 21. 变革领导
  {
    competencyId: 21,
    question: "面对组织变革阻力时，您的做法是：",
    questionType: "scenario",
    option1: "强制推行，要求团队执行",
    option2: "解释变革必要性，说服团队",
    option3: "系统规划变革路径，逐步推进",
    option4: "建立变革联盟，营造变革氛围",
    option5: "成为变革推动者，引领组织转型",
    difficulty: "hard",
    targetLevel: 4,
  },
  // 22. 授权赋能
  {
    competencyId: 22,
    question: "在授权方面，您的风格是：",
    questionType: "behavioral",
    option1: "重要事项必须亲自把关",
    option2: "授权常规工作，保留关键决策",
    option3: "充分授权，但保持监督",
    option4: "赋能团队，培养决策能力",
    option5: "打造自主驱动的团队，释放组织潜能",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 23. 影响力
  {
    competencyId: 23,
    question: "在没有直接权力的情况下推动工作，您会：",
    questionType: "scenario",
    option1: "寻求上级支持和授权",
    option2: "通过人际关系推动",
    option3: "用数据和逻辑说服相关方",
    option4: "建立联盟，凝聚共识",
    option5: "通过个人魅力和愿景，赢得支持",
    difficulty: "hard",
    targetLevel: 4,
  },
  // 24. 决策能力
  {
    competencyId: 24,
    question: "面对重大决策时，您的决策方式是：",
    questionType: "behavioral",
    option1: "依据经验和直觉快速决策",
    option2: "收集信息后，谨慎决策",
    option3: "系统分析，权衡利弊后决策",
    option4: "建立决策框架，科学决策",
    option5: "在不确定中果断决策，并持续优化",
    difficulty: "hard",
    targetLevel: 4,
  },
  // 25. 冲突解决
  {
    competencyId: 25,
    question: "团队出现严重冲突时，您会：",
    questionType: "scenario",
    option1: "避免介入，让当事人自行解决",
    option2: "听取双方意见，协调解决",
    option3: "分析冲突根源，系统化解",
    option4: "将冲突转化为建设性对话",
    option5: "建立开放文化，预防和处理冲突",
    difficulty: "medium",
    targetLevel: 3,
  },

  // ============ 沟通协调维度 (4题) ============
  // 26. 清晰表达
  {
    competencyId: 26,
    question: "在重要会议上汇报时，您的表现是：",
    questionType: "self_assessment",
    option1: "能够完整汇报内容",
    option2: "表达清晰，逻辑完整",
    option3: "结构化表达，重点突出",
    option4: "根据受众调整内容，精准传达",
    option5: "通过故事和数据，产生深刻影响",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 27. 倾听理解
  {
    competencyId: 27,
    question: "在团队提出不同意见时，您通常：",
    questionType: "behavioral",
    option1: "听完后按自己想法处理",
    option2: "认真听取，理解观点",
    option3: "深入理解，提出澄清问题",
    option4: "同理心倾听，挖掘深层需求",
    option5: "创造安全环境，鼓励开放对话",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 28. 谈判协商
  {
    competencyId: 28,
    question: "在商务谈判中，您的策略是：",
    questionType: "scenario",
    option1: "坚持己方立场，不轻易妥协",
    option2: "寻找折中方案，达成协议",
    option3: "理解对方需求，寻求双赢",
    option4: "创造性解决问题，实现共赢",
    option5: "建立长期合作关系，创造更大价值",
    difficulty: "hard",
    targetLevel: 4,
  },
  // 29. 跨文化沟通
  {
    competencyId: 29,
    question: "与国际团队合作时，您的做法是：",
    questionType: "behavioral",
    option1: "按照自己的方式沟通",
    option2: "注意基本的文化差异",
    option3: "学习和适应不同文化",
    option4: "建立跨文化协作机制",
    option5: "成为文化桥梁，促进全球协作",
    difficulty: "hard",
    targetLevel: 3,
  },

  // ============ 创新能力维度 (4题) ============
  // 30. 创新思维
  {
    competencyId: 30,
    question: "面对新问题时，您的思考方式是：",
    questionType: "self_assessment",
    option1: "参考过往经验和行业做法",
    option2: "尝试新的解决方法",
    option3: "从不同角度思考，寻找创新方案",
    option4: "突破思维定式，创造性解决问题",
    option5: "引领思维变革，开创新范式",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 31. 产品创新
  {
    competencyId: 31,
    question: "在产品创新方面，您的角色是：",
    questionType: "behavioral",
    option1: "主要优化现有产品",
    option2: "推动渐进式创新",
    option3: "识别市场机会，开发新产品",
    option4: "主导颠覆式创新，开创新市场",
    option5: "建立创新体系，持续引领行业",
    difficulty: "hard",
    targetLevel: 4,
  },
  // 32. 技术应用
  {
    competencyId: 32,
    question: "对于新技术（AI、区块链等）的应用，您会：",
    questionType: "scenario",
    option1: "等待技术成熟后再考虑",
    option2: "关注新技术，评估应用可能",
    option3: "积极试点，探索业务价值",
    option4: "主导技术应用，实现业务创新",
    option5: "引领技术战略，建立技术护城河",
    difficulty: "hard",
    targetLevel: 4,
  },
  // 33. 创新文化
  {
    competencyId: 33,
    question: "在鼓励团队创新方面，您的做法是：",
    questionType: "behavioral",
    option1: "完成本职工作即可",
    option2: "鼓励提出改进建议",
    option3: "建立创新激励机制",
    option4: "营造创新氛围，容忍失败",
    option5: "打造创新文化，建立创新系统",
    difficulty: "medium",
    targetLevel: 3,
  },

  // ============ 客户导向维度 (3题) ============
  // 34. 客户需求洞察
  {
    competencyId: 34,
    question: "在理解客户需求方面，您的做法是：",
    questionType: "self_assessment",
    option1: "主要依据客户明确表达的需求",
    option2: "通过调研了解客户需求",
    option3: "系统分析客户需求和痛点",
    option4: "洞察客户潜在需求，超越期待",
    option5: "预见客户未来需求，引领市场",
    difficulty: "hard",
    targetLevel: 4,
  },
  // 35. 客户体验管理
  {
    competencyId: 35,
    question: "在提升客户体验方面，您的投入是：",
    questionType: "behavioral",
    option1: "主要关注产品质量",
    option2: "改进服务流程，提升满意度",
    option3: "设计完整的客户旅程",
    option4: "打造卓越的客户体验",
    option5: "建立以客户为中心的组织文化",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 36. 客户关系管理
  {
    competencyId: 36,
    question: "对于重要客户的管理，您会：",
    questionType: "scenario",
    option1: "主要通过销售团队维护",
    option2: "定期拜访，维护关系",
    option3: "建立客户管理体系",
    option4: "成为客户信赖的合作伙伴",
    option5: "建立战略伙伴关系，共创价值",
    difficulty: "hard",
    targetLevel: 4,
  },

  // ============ 学习成长维度 (3题) ============
  // 37. 自我认知
  {
    competencyId: 37,
    question: "对于自己的优势和不足，您的认知是：",
    questionType: "self_assessment",
    option1: "大致了解，但不够清晰",
    option2: "比较清楚自己的能力范围",
    option3: "深入了解，主动寻求反馈",
    option4: "建立系统的自我评估体系",
    option5: "持续反思，不断提升自我认知",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 38. 持续学习
  {
    competencyId: 38,
    question: "在个人学习方面，您的投入是：",
    questionType: "behavioral",
    option1: "主要依靠工作中学习",
    option2: "定期阅读和参加培训",
    option3: "建立系统的学习计划",
    option4: "实践学习型领导力",
    option5: "成为终身学习者，引领学习文化",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 39. 适应变化
  {
    competencyId: 39,
    question: "面对重大变化（市场、技术、组织等），您会：",
    questionType: "scenario",
    option1: "需要时间适应新环境",
    option2: "积极调整，适应变化",
    option3: "快速学习，拥抱变化",
    option4: "主动引领变化，创造机会",
    option5: "在不确定中成长，成为变革推动者",
    difficulty: "hard",
    targetLevel: 4,
  },

  // ============ 补充题目 (10题 - 覆盖复合能力) ============
  // 40. 战略执行力
  {
    competencyId: 1,
    question: "将战略转化为行动时，您通常：",
    questionType: "behavioral",
    option1: "直接告诉团队要做什么",
    option2: "分解目标，制定行动计划",
    option3: "建立战略执行体系，确保落地",
    option4: "打通战略到执行的全链路",
    option5: "建立战略执行文化，实现战略目标",
    difficulty: "hard",
    targetLevel: 4,
  },
  // 41. 资源配置
  {
    competencyId: 7,
    question: "在资源有限的情况下，您的分配原则是：",
    questionType: "scenario",
    option1: "平均分配，确保公平",
    option2: "向紧急项目倾斜",
    option3: "基于优先级配置资源",
    option4: "动态优化资源配置",
    option5: "建立资源管理体系，实现价值最大化",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 42. 人才识别
  {
    competencyId: 14,
    question: "识别高潜人才时，您主要关注：",
    questionType: "behavioral",
    option1: "当前业绩表现",
    option2: "专业能力和工作态度",
    option3: "业绩、能力和潜力",
    option4: "建立人才评估体系，多维度识别",
    option5: "建立人才发展机制，培养未来领导者",
    difficulty: "hard",
    targetLevel: 4,
  },
  // 43. 危机处理
  {
    competencyId: 5,
    question: "面对突发危机时，您的反应是：",
    questionType: "scenario",
    option1: "紧急处理，控制局面",
    option2: "组织团队，快速应对",
    option3: "冷静分析，制定应对方案",
    option4: "系统应对，将损失降到最低",
    option5: "化危为机，提升组织韧性",
    difficulty: "hard",
    targetLevel: 4,
  },
  // 44. 数据驱动决策
  {
    competencyId: 12,
    question: "在做决策时，您对数据的使用是：",
    questionType: "behavioral",
    option1: "主要依据经验和直觉",
    option2: "参考关键数据指标",
    option3: "基于数据分析做决策",
    option4: "建立数据驱动的决策体系",
    option5: "运用大数据和AI，实现智能决策",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 45. 生态构建
  {
    competencyId: 4,
    question: "在构建商业生态方面，您的思考是：",
    questionType: "scenario",
    option1: "主要关注自身业务",
    option2: "寻找合作伙伴，互惠互利",
    option3: "建立合作网络，扩大影响力",
    option4: "构建生态系统，创造协同价值",
    option5: "打造平台生态，引领行业发展",
    difficulty: "hard",
    targetLevel: 5,
  },
  // 46. 敏捷响应
  {
    competencyId: 39,
    question: "市场出现快速变化时，您的组织能：",
    questionType: "behavioral",
    option1: "缓慢调整，逐步适应",
    option2: "快速反应，调整策略",
    option3: "敏捷转型，抓住机遇",
    option4: "建立快速响应机制",
    option5: "打造敏捷组织，持续进化",
    difficulty: "hard",
    targetLevel: 4,
  },
  // 47. 情绪管理
  {
    competencyId: 25,
    question: "在高压环境下，您的情绪管理能力是：",
    questionType: "self_assessment",
    option1: "容易受情绪影响",
    option2: "能够控制情绪",
    option3: "保持冷静，理性应对",
    option4: "管理自己和团队情绪",
    option5: "营造积极氛围，激发团队能量",
    difficulty: "medium",
    targetLevel: 3,
  },
  // 48. 社会责任
  {
    competencyId: 6,
    question: "在企业社会责任方面，您的认知是：",
    questionType: "behavioral",
    option1: "主要关注商业利益",
    option2: "遵守法律法规要求",
    option3: "积极履行社会责任",
    option4: "将社会责任融入战略",
    option5: "创造共享价值，引领可持续发展",
    difficulty: "medium",
    targetLevel: 4,
  },
  // 49. 全局思维
  {
    competencyId: 1,
    question: "在思考问题时，您的视角是：",
    questionType: "self_assessment",
    option1: "主要从部门角度考虑",
    option2: "考虑业务整体影响",
    option3: "从公司全局角度思考",
    option4: "考虑行业和生态系统",
    option5: "具备全球视野，引领行业发展",
    difficulty: "hard",
    targetLevel: 4,
  },
];

async function seedQuestions() {
  console.log('🌱 开始录入评估题目...');
  
  try {
    // 清空现有题目
    await orm.delete(schema.assessmentQuestions);
    console.log('✅ 已清空现有题目');
    
    // 插入新题目
    for (const question of assessmentQuestions) {
      await orm.insert(schema.assessmentQuestions).values(question);
    }
    
    console.log(`✅ 成功录入 ${assessmentQuestions.length} 道评估题目`);
    
    // 验证
    const count = await orm.select().from(schema.assessmentQuestions);
    console.log(`📊 数据库中共有 ${count.length} 道题目`);
    
    // 按维度统计
    const stats = assessmentQuestions.reduce((acc, q) => {
      acc[q.competencyId] = (acc[q.competencyId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    console.log('\n📈 题目分布统计：');
    Object.entries(stats).forEach(([competencyId, count]) => {
      console.log(`  能力 ${competencyId}: ${count} 道题`);
    });
    
  } catch (error) {
    console.error('❌ 录入失败:', error);
    throw error;
  } finally {
    db.close();
  }
}

seedQuestions();
