/**
 * 35个细分能力的完整L1-L5标准和案例
 * 与数据库中的能力名称完全匹配
 */

export interface CompetencyLevel {
  level: number;
  score: number;
  description: string;
  example: string;
}

export interface CompetencyData {
  name: string;
  category: string;
  description: string;
  levels: CompetencyLevel[];
}

export const competencyDatabase: CompetencyData[] = [
  // ==================== 战略规划 (4个能力) ====================
  {
    name: "战略规划与执行",
    category: "战略规划",
    description: "制定组织长期发展方向并推动落地的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够理解公司战略，执行分配的战略任务",
        example: "作为产品经理，理解公司'移动优先'战略，将团队工作重心转向移动端产品优化"
      },
      {
        level: 2,
        score: 40,
        description: "能够参与部门战略讨论，提出建设性意见",
        example: "在季度战略会上，基于用户数据分析，建议将战略重点从'功能扩展'调整为'用户留存'"
      },
      {
        level: 3,
        score: 60,
        description: "能够独立制定部门或业务线战略规划",
        example: "作为事业部总监，制定未来3年的产品战略：第一年聚焦核心功能，第二年拓展生态，第三年国际化"
      },
      {
        level: 4,
        score: 80,
        description: "能够制定跨部门的中长期战略，并推动落地",
        example: "作为VP，制定公司数字化转型战略，协调产品、技术、运营三个部门，在18个月内完成核心系统云化"
      },
      {
        level: 5,
        score: 100,
        description: "能够制定公司级战略，引领行业发展方向",
        example: "作为CEO，提出'AI原生'战略，重构公司所有产品线，三年内将公司从传统软件公司转型为AI平台公司"
      }
    ]
  },
  {
    name: "市场洞察与分析",
    category: "战略规划",
    description: "识别市场机会和威胁的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够收集和整理市场信息",
        example: "定期阅读行业报告，整理竞品动态，向上级汇报关键信息"
      },
      {
        level: 2,
        score: 40,
        description: "能够分析市场趋势，识别潜在机会",
        example: "通过分析用户反馈和竞品功能，发现'短视频+电商'的新兴趋势，建议团队尝试"
      },
      {
        level: 3,
        score: 60,
        description: "能够预判市场变化，提前布局",
        example: "在ChatGPT爆火前6个月，就开始组建AI团队，当风口来临时快速推出AI功能"
      },
      {
        level: 4,
        score: 80,
        description: "能够识别行业拐点，制定应对策略",
        example: "预判到隐私保护法规将严格化，提前2年启动数据合规改造，避免了后续的巨额罚款"
      },
      {
        level: 5,
        score: 100,
        description: "能够创造市场需求，定义新赛道",
        example: "像乔布斯定义智能手机、马斯克定义电动车一样，创造出用户之前没有意识到的需求"
      }
    ]
  },
  {
    name: "目标管理与分解",
    category: "战略规划",
    description: "设定清晰目标并分解到可执行层面的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够理解和执行上级设定的目标",
        example: "理解'本季度用户增长20%'的目标，制定个人工作计划去实现"
      },
      {
        level: 2,
        score: 40,
        description: "能够为团队设定具体、可衡量的目标",
        example: "将'提升用户活跃度'细化为'DAU提升15%，人均使用时长增加10分钟'等可量化指标"
      },
      {
        level: 3,
        score: 60,
        description: "能够设定有挑战性但可实现的目标（stretch goal）",
        example: "基于历史数据和市场分析，设定'6个月内收入翻倍'的目标，既有挑战性又在能力范围内"
      },
      {
        level: 4,
        score: 80,
        description: "能够设定多层次目标体系，确保上下对齐",
        example: "将公司级'成为行业第一'目标，分解为各部门OKR，确保每个团队的目标都支撑公司战略"
      },
      {
        level: 5,
        score: 100,
        description: "能够设定愿景级目标，激发组织潜能",
        example: "像马斯克'让人类成为多星球物种'、贝佐斯'地球上最以客户为中心的公司'一样，设定鼓舞人心的长期愿景"
      }
    ]
  },
  {
    name: "资源配置优化",
    category: "战略规划",
    description: "整合和优化内外部资源以实现战略目标的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够有效利用分配的资源完成任务",
        example: "合理分配团队的人力和预算，按时完成季度目标"
      },
      {
        level: 2,
        score: 40,
        description: "能够主动寻找和获取额外资源",
        example: "项目缺人手时，主动协调其他部门支援，或申请外包预算，确保项目不延期"
      },
      {
        level: 3,
        score: 60,
        description: "能够整合跨部门资源，实现协同效应",
        example: "整合产品、技术、市场三个部门的资源，共同推进新产品上线，避免各自为战"
      },
      {
        level: 4,
        score: 80,
        description: "能够整合外部资源（合作伙伴、投资方等）",
        example: "与上游供应商、下游渠道商建立战略联盟，共享数据和客户资源，降低成本30%"
      },
      {
        level: 5,
        score: 100,
        description: "能够构建资源生态，让资源自发聚集",
        example: "像苹果App Store、微信小程序一样，构建平台生态，让开发者、用户、广告主自发加入并创造价值"
      }
    ]
  },

  // ==================== 创新变革 (3个能力) ====================
  {
    name: "商业模式创新",
    category: "创新变革",
    description: "设计创新商业模式和盈利方式的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "理解基本的商业模式概念",
        example: "能够解释公司的收入来源和成本结构，理解'免费+增值'模式的逻辑"
      },
      {
        level: 2,
        score: 40,
        description: "能够优化现有商业模式的某个环节",
        example: "发现用户流失主要发生在试用期结束时，建议延长试用期并增加引导，使转化率提升30%"
      },
      {
        level: 3,
        score: 60,
        description: "能够设计新产品的商业模式",
        example: "为新推出的企业服务产品设计'按座位数订阅+超额使用量计费'的混合模式，实现稳定现金流和弹性增长"
      },
      {
        level: 4,
        score: 80,
        description: "能够创新商业模式，开辟新收入来源",
        example: "在原有B2C业务基础上，设计B2B2C模式，通过开放平台让企业客户服务其终端用户，收入翻倍"
      },
      {
        level: 5,
        score: 100,
        description: "能够设计颠覆性商业模式，重塑行业格局",
        example: "像Uber颠覆出租车、Airbnb颠覆酒店一样，通过平台模式重新定义行业的价值创造和分配方式"
      }
    ]
  },
  {
    name: "变革管理",
    category: "创新变革",
    description: "推动和管理组织变革的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够适应变革，快速调整工作方式",
        example: "公司推行敏捷开发后，快速学习新流程，从瀑布模式转向迭代开发"
      },
      {
        level: 2,
        score: 40,
        description: "能够在团队内推动小规模变革",
        example: "在团队内推行代码审查制度，通过培训和激励，3个月内让团队接受并形成习惯"
      },
      {
        level: 3,
        score: 60,
        description: "能够推动部门级变革，克服阻力",
        example: "推动产品部从'项目制'转向'产品制'，通过沟通、培训、调整KPI，半年内完成转型"
      },
      {
        level: 4,
        score: 80,
        description: "能够推动跨部门变革，重塑流程和文化",
        example: "推动公司从'销售驱动'转向'产品驱动'，重构组织架构，调整激励机制，2年内完成文化转型"
      },
      {
        level: 5,
        score: 100,
        description: "能够推动颠覆性变革，实现组织重生",
        example: "像Netflix从DVD租赁转向流媒体、微软从软件销售转向云服务一样，实现商业模式的根本性变革"
      }
    ]
  },
  {
    name: "敏捷迭代",
    category: "创新变革",
    description: "通过快速实验和迭代验证想法的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够参与A/B测试，收集数据反馈",
        example: "配合产品团队进行按钮颜色的A/B测试，记录点击率数据"
      },
      {
        level: 2,
        score: 40,
        description: "能够设计和执行简单的实验",
        example: "设计邮件标题的A/B测试，通过3个版本的对比，找到打开率最高的标题模板"
      },
      {
        level: 3,
        score: 60,
        description: "能够建立MVP快速验证产品假设",
        example: "用2周时间开发最小可行产品，投放给100个种子用户测试，根据反馈决定是否继续投入"
      },
      {
        level: 4,
        score: 80,
        description: "能够建立实验文化，系统化地进行创新",
        example: "建立'每月10个实验'的机制，鼓励团队快速试错，通过数据驱动决策"
      },
      {
        level: 5,
        score: 100,
        description: "能够构建实验平台，让创新成为组织基因",
        example: "像Google的20%时间、Amazon的两个披萨团队一样，将实验和创新制度化"
      }
    ]
  },

  // ==================== 决策思维 (5个能力) ====================
  {
    name: "风险识别与应对",
    category: "决策思维",
    description: "识别和应对风险的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够识别明显的风险并及时上报",
        example: "发现项目进度延迟风险，及时向上级汇报并寻求支持"
      },
      {
        level: 2,
        score: 40,
        description: "能够评估风险影响，制定应对预案",
        example: "识别出'核心开发离职'的风险，提前培养备份人员，建立知识库"
      },
      {
        level: 3,
        score: 60,
        description: "能够建立风险管理机制，系统化管理风险",
        example: "建立项目风险清单，每周评审，对高风险项制定详细的应对和监控计划"
      },
      {
        level: 4,
        score: 80,
        description: "能够预判潜在风险，提前布局防范",
        example: "预判到云服务商可能涨价，提前谈判锁定3年价格，并开发多云架构降低依赖"
      },
      {
        level: 5,
        score: 100,
        description: "能够将风险转化为机会，实现反脆弱",
        example: "疫情期间，将'线下业务停摆'的危机转化为'全面数字化'的机遇，业务反而增长50%"
      }
    ]
  },
  {
    name: "数据驱动决策",
    category: "决策思维",
    description: "通过数据分析支持决策的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够使用基本工具进行数据统计",
        example: "使用Excel制作数据透视表，统计每月销售额和增长率"
      },
      {
        level: 2,
        score: 40,
        description: "能够分析数据趋势，发现问题",
        example: "通过分析用户留存曲线，发现'第3天流失率异常高'的问题，定位到新手引导不足"
      },
      {
        level: 3,
        score: 60,
        description: "能够建立数据模型，预测未来趋势",
        example: "建立用户增长模型，基于历史数据预测未来6个月的用户规模，误差控制在10%以内"
      },
      {
        level: 4,
        score: 80,
        description: "能够设计数据指标体系，驱动业务决策",
        example: "设计'北极星指标+关键驱动指标'体系，将抽象的业务目标转化为可量化、可追踪的指标"
      },
      {
        level: 5,
        score: 100,
        description: "能够构建数据驱动文化，让数据成为决策基础",
        example: "建立全公司的数据平台和BI系统，让每个决策都有数据支撑，消除'拍脑袋'决策"
      }
    ]
  },
  {
    name: "问题解决",
    category: "决策思维",
    description: "系统化解决复杂问题的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够解决明确定义的简单问题",
        example: "根据错误日志，定位并修复代码bug"
      },
      {
        level: 2,
        score: 40,
        description: "能够分析问题原因，制定解决方案",
        example: "用户投诉响应慢，分析后发现是客服人手不足，建议增加客服或引入智能客服"
      },
      {
        level: 3,
        score: 60,
        description: "能够解决复杂问题，协调多方资源",
        example: "解决跨部门协作效率低的问题，重新设计协作流程，建立定期沟通机制"
      },
      {
        level: 4,
        score: 80,
        description: "能够解决模糊问题，在不确定中找到方向",
        example: "面对'用户增长停滞'的模糊问题，通过用户访谈、数据分析、竞品研究，找到突破口"
      },
      {
        level: 5,
        score: 100,
        description: "能够解决行业级难题，创造新的解决范式",
        example: "像SpaceX解决火箭回收、DeepMind解决蛋白质折叠预测一样，攻克行业公认的难题"
      }
    ]
  },
  {
    name: "决策力",
    category: "决策思维",
    description: "在不确定性下做出正确决策的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够在明确指引下做出日常决策",
        example: "根据公司政策和上级指示，决定是否批准员工的请假申请"
      },
      {
        level: 2,
        score: 40,
        description: "能够在多个选项中做出合理选择",
        example: "在3个供应商中，综合考虑价格、质量、交期，选择最合适的合作伙伴"
      },
      {
        level: 3,
        score: 60,
        description: "能够在不确定性下做出决策并承担责任",
        example: "在市场信息不充分的情况下，基于有限数据和经验判断，决定是否进入新市场"
      },
      {
        level: 4,
        score: 80,
        description: "能够做出高风险决策，并制定风险应对方案",
        example: "决定all-in新技术方向，同时制定详细的风险预案和退出机制"
      },
      {
        level: 5,
        score: 100,
        description: "能够做出战略级决策，影响公司命运",
        example: "像贝佐斯决定进入云计算、马化腾决定做微信一样，做出'赌上公司未来'的决策"
      }
    ]
  },
  {
    name: "长期主义",
    category: "决策思维",
    description: "从长期视角思考和决策的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够理解短期和长期的关系",
        example: "理解为什么公司愿意短期亏损来换取长期市场份额"
      },
      {
        level: 2,
        score: 40,
        description: "能够在决策时考虑长期影响",
        example: "选择技术方案时，不只看开发速度，还考虑可维护性和可扩展性"
      },
      {
        level: 3,
        score: 60,
        description: "能够平衡短期和长期目标",
        example: "在完成季度业绩的同时，投入20%资源做技术债务清理，为长期发展打基础"
      },
      {
        level: 4,
        score: 80,
        description: "能够为长期目标做出短期牺牲",
        example: "像亚马逊一样，愿意长期不盈利，持续投入基础设施建设，最终建立竞争壁垒"
      },
      {
        level: 5,
        score: 100,
        description: "能够构建长期主义文化",
        example: "像贝佐斯的'Day 1'理念，让组织始终保持创业心态，关注长期价值而非短期利益"
      }
    ]
  },

  // ==================== 业务执行 (4个能力) ====================
  {
    name: "项目管理",
    category: "业务执行",
    description: "规划和执行项目以达成目标的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够按照项目计划完成分配的任务",
        example: "按时完成开发任务，及时更新任务状态，遇到问题及时反馈"
      },
      {
        level: 2,
        score: 40,
        description: "能够管理小型项目，协调2-3人的团队",
        example: "负责一个功能模块的开发，制定计划，分配任务，跟踪进度，按时交付"
      },
      {
        level: 3,
        score: 60,
        description: "能够管理中型项目，协调跨职能团队",
        example: "负责新产品上线项目，协调产品、开发、测试、运营团队，管理10+人，3个月内完成上线"
      },
      {
        level: 4,
        score: 80,
        description: "能够管理大型复杂项目，应对多变需求",
        example: "负责公司核心系统重构项目，管理50+人，历时1年，在不影响业务的前提下完成迁移"
      },
      {
        level: 5,
        score: 100,
        description: "能够管理战略级项目，推动组织变革",
        example: "负责公司数字化转型项目，协调全公司资源，重构业务流程，3年内完成转型"
      }
    ]
  },
  {
    name: "流程优化",
    category: "业务执行",
    description: "改进工作流程和提升效率的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够发现流程中的问题并反馈",
        example: "发现报销流程需要5个审批节点，耗时过长，向上级反馈"
      },
      {
        level: 2,
        score: 40,
        description: "能够优化个人或小团队的工作流程",
        example: "制定代码开发规范，统一团队的代码风格和提交流程，减少代码审查时间"
      },
      {
        level: 3,
        score: 60,
        description: "能够优化部门级流程，提升整体效率",
        example: "重构产品需求评审流程，从'串行评审'改为'并行评审+集中决策'，需求响应速度提升3倍"
      },
      {
        level: 4,
        score: 80,
        description: "能够优化跨部门流程，打破部门墙",
        example: "优化'需求-开发-测试-上线'全流程，建立DevOps体系，产品迭代周期从1个月缩短到1周"
      },
      {
        level: 5,
        score: 100,
        description: "能够重构核心业务流程，实现质的飞跃",
        example: "像丰田创造精益生产、亚马逊创造两个披萨团队一样，创造新的流程管理范式"
      }
    ]
  },
  {
    name: "质量管理",
    category: "业务执行",
    description: "确保工作质量和标准的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够按照质量标准完成工作",
        example: "代码通过单元测试，符合代码规范，无明显bug"
      },
      {
        level: 2,
        score: 40,
        description: "能够建立质量检查机制",
        example: "建立代码审查checklist，确保每次提交都经过审查，减少线上bug"
      },
      {
        level: 3,
        score: 60,
        description: "能够建立质量管理体系",
        example: "建立'开发→测试→灰度→上线'的质量保障流程，线上故障率下降80%"
      },
      {
        level: 4,
        score: 80,
        description: "能够推动全员质量意识，预防问题发生",
        example: "通过培训、激励、复盘，让团队从'发现问题'转向'预防问题'，质量问题减少90%"
      },
      {
        level: 5,
        score: 100,
        description: "能够打造质量文化，让质量成为竞争优势",
        example: "像丰田的精益生产、苹果的极致体验一样，让质量成为公司的核心竞争力"
      }
    ]
  },
  {
    name: "成本控制",
    category: "业务执行",
    description: "合理控制和优化成本的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够在预算范围内完成工作",
        example: "严格控制项目支出，不超预算"
      },
      {
        level: 2,
        score: 40,
        description: "能够识别成本浪费，提出优化建议",
        example: "发现云服务器使用率低，建议调整配置，节省30%成本"
      },
      {
        level: 3,
        score: 60,
        description: "能够制定成本控制策略",
        example: "通过技术优化、流程改进、供应商谈判，将运营成本降低20%"
      },
      {
        level: 4,
        score: 80,
        description: "能够平衡成本和价值，做出最优决策",
        example: "在'降低成本'和'提升质量'之间找到平衡点，实现成本最优而非最低"
      },
      {
        level: 5,
        score: 100,
        description: "能够构建成本意识文化",
        example: "建立全员成本意识，让每个人都关注投入产出比，实现精益运营"
      }
    ]
  },

  // ==================== 沟通协作 (5个能力) ====================
  {
    name: "供应链协调",
    category: "沟通协作",
    description: "协调上下游资源和合作伙伴的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够与供应商进行基本沟通",
        example: "及时响应供应商的询问，提供所需信息"
      },
      {
        level: 2,
        score: 40,
        description: "能够协调供应商解决问题",
        example: "供应商交付延迟时，主动沟通，寻找替代方案或调整计划"
      },
      {
        level: 3,
        score: 60,
        description: "能够优化供应链流程，提升效率",
        example: "与供应商建立信息共享机制，实现库存透明化，减少缺货和积压"
      },
      {
        level: 4,
        score: 80,
        description: "能够构建供应链生态，实现协同效应",
        example: "与核心供应商建立战略合作关系，共同研发，共享收益，形成利益共同体"
      },
      {
        level: 5,
        score: 100,
        description: "能够重构供应链模式，创造竞争优势",
        example: "像Zara的快时尚供应链、小米的生态链一样，通过供应链创新建立竞争壁垒"
      }
    ]
  },
  {
    name: "跨部门协作",
    category: "沟通协作",
    description: "与其他部门有效合作的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够配合其他部门完成工作",
        example: "及时响应其他部门的需求，提供所需的信息和支持"
      },
      {
        level: 2,
        score: 40,
        description: "能够主动协调资源，推动跨部门项目",
        example: "主动联系产品、设计、测试团队，协调资源，推动项目按时交付"
      },
      {
        level: 3,
        score: 60,
        description: "能够解决跨部门冲突，达成共识",
        example: "产品和技术对优先级有分歧时，组织会议，基于数据和业务价值达成一致"
      },
      {
        level: 4,
        score: 80,
        description: "能够建立跨部门协作机制",
        example: "建立产品、技术、运营的定期同步会议，提前对齐目标，减少协作摩擦"
      },
      {
        level: 5,
        score: 100,
        description: "能够打破部门墙，构建协作文化",
        example: "通过组织架构调整、激励机制设计，让跨部门协作成为常态而非例外"
      }
    ]
  },
  {
    name: "冲突解决",
    category: "沟通协作",
    description: "处理和解决冲突的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够避免冲突升级",
        example: "和同事有分歧时，保持冷静，不情绪化，寻求第三方调解"
      },
      {
        level: 2,
        score: 40,
        description: "能够直面冲突，寻找解决方案",
        example: "主动和有矛盾的同事沟通，了解分歧原因，寻找双方都能接受的方案"
      },
      {
        level: 3,
        score: 60,
        description: "能够调解团队冲突，维护团队和谐",
        example: "团队成员因工作分配产生矛盾时，公平听取双方意见，重新分配任务，化解矛盾"
      },
      {
        level: 4,
        score: 80,
        description: "能够处理复杂的组织冲突",
        example: "部门之间因资源分配产生冲突时，基于公司整体利益，制定公平的分配机制"
      },
      {
        level: 5,
        score: 100,
        description: "能够将冲突转化为创新动力",
        example: "鼓励建设性冲突，通过辩论和碰撞产生更好的想法，像'红蓝军对抗'一样"
      }
    ]
  },
  {
    name: "沟通与影响力",
    category: "沟通协作",
    description: "清晰表达并影响他人的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够清晰表达自己的想法",
        example: "在会议上，能够用简洁的语言说明自己的观点和理由"
      },
      {
        level: 2,
        score: 40,
        description: "能够根据对象调整沟通方式",
        example: "和技术人员讲技术细节，和业务人员讲业务价值，和老板讲投入产出比"
      },
      {
        level: 3,
        score: 60,
        description: "能够说服他人，达成共识",
        example: "通过数据和案例，说服团队接受新的工作方式，推动变革落地"
      },
      {
        level: 4,
        score: 80,
        description: "能够在复杂场景下有效沟通",
        example: "在跨部门冲突中，平衡各方利益，找到共赢方案，达成一致"
      },
      {
        level: 5,
        score: 100,
        description: "能够通过沟通塑造文化和价值观",
        example: "像乔布斯的演讲、马云的湖畔大学一样，通过沟通传播理念，影响更多人"
      }
    ]
  },
  {
    name: "同理心",
    category: "沟通协作",
    description: "理解他人观点和感受的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够耐心听完他人的表达",
        example: "在会议上，不打断他人发言，认真听完再回应"
      },
      {
        level: 2,
        score: 40,
        description: "能够理解他人的真实需求",
        example: "客户说'系统太慢'，深入了解后发现真实需求是'希望减少操作步骤'"
      },
      {
        level: 3,
        score: 60,
        description: "能够理解他人的情绪和立场",
        example: "理解团队成员加班的抱怨背后是对工作价值的质疑，而不仅仅是累"
      },
      {
        level: 4,
        score: 80,
        description: "能够理解不同角色的诉求，找到平衡点",
        example: "理解产品要快速迭代、技术要保证质量、运营要稳定性，找到三方都能接受的方案"
      },
      {
        level: 5,
        score: 100,
        description: "能够理解组织和社会的深层需求",
        example: "像马斯洛需求层次理论一样，理解人性和组织的深层需求，设计更好的产品和制度"
      }
    ]
  },

  // ==================== 自我管理 (6个能力) ====================
  {
    name: "时间管理",
    category: "自我管理",
    description: "高效利用时间和管理优先级的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够按时完成任务，不拖延",
        example: "使用待办清单，每天规划工作，按时完成"
      },
      {
        level: 2,
        score: 40,
        description: "能够区分优先级，先做重要的事",
        example: "使用四象限法则，优先处理'重要且紧急'的事，避免被琐事占据时间"
      },
      {
        level: 3,
        score: 60,
        description: "能够管理团队时间，提升整体效率",
        example: "优化会议机制，减少无效会议，使团队有效工作时间增加30%"
      },
      {
        level: 4,
        score: 80,
        description: "能够进行长期时间规划，平衡短期和长期",
        example: "分配70%时间做业务，20%时间做创新，10%时间学习成长"
      },
      {
        level: 5,
        score: 100,
        description: "能够构建时间管理文化，让效率成为组织优势",
        example: "建立'深度工作'文化，减少打扰，让团队专注在高价值工作上"
      }
    ]
  },
  {
    name: "情绪管理",
    category: "自我管理",
    description: "控制和调节自己情绪的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够识别自己的情绪",
        example: "意识到自己在压力下会焦虑，在deadline前会紧张"
      },
      {
        level: 2,
        score: 40,
        description: "能够控制情绪，不让情绪影响工作",
        example: "即使遇到挫折，也不在团队面前表现出负面情绪，保持专业"
      },
      {
        level: 3,
        score: 60,
        description: "能够调节情绪，保持积极心态",
        example: "通过运动、冥想等方式缓解压力，保持工作热情"
      },
      {
        level: 4,
        score: 80,
        description: "能够利用情绪，激发团队士气",
        example: "在团队低迷时，通过积极的态度和鼓励，重新激发团队斗志"
      },
      {
        level: 5,
        score: 100,
        description: "能够塑造组织情绪文化",
        example: "建立'乐观向上'的文化，让团队在困难中保持韧性"
      }
    ]
  },
  {
    name: "压力应对",
    category: "自我管理",
    description: "应对和缓解工作压力的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够识别压力来源",
        example: "意识到deadline、工作量、人际关系是主要压力源"
      },
      {
        level: 2,
        score: 40,
        description: "能够采取措施缓解压力",
        example: "通过运动、休息、倾诉等方式缓解压力"
      },
      {
        level: 3,
        score: 60,
        description: "能够在高压下保持高效",
        example: "在项目紧急时期，通过合理安排时间和任务，保持高效产出"
      },
      {
        level: 4,
        score: 80,
        description: "能够帮助团队管理压力",
        example: "识别团队压力信号，及时调整工作节奏，避免团队burnout"
      },
      {
        level: 5,
        score: 100,
        description: "能够构建健康的工作文化",
        example: "建立'可持续发展'的文化，反对加班文化，提倡工作生活平衡"
      }
    ]
  },
  {
    name: "自我反思",
    category: "自我管理",
    description: "反思和总结经验教训的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够接受反馈，改进工作方式",
        example: "根据代码审查意见，改进代码质量和编码习惯"
      },
      {
        level: 2,
        score: 40,
        description: "能够主动复盘，总结经验教训",
        example: "项目结束后，组织复盘会，总结做得好和需要改进的地方"
      },
      {
        level: 3,
        score: 60,
        description: "能够建立反思习惯，持续改进",
        example: "每周进行个人复盘，记录学到的经验和需要改进的地方"
      },
      {
        level: 4,
        score: 80,
        description: "能够推动团队反思文化",
        example: "建立定期复盘机制，让团队从经验中学习，持续改进"
      },
      {
        level: 5,
        score: 100,
        description: "能够构建学习型组织",
        example: "建立知识管理系统，让组织的经验教训成为共同财富"
      }
    ]
  },
  {
    name: "成长型思维",
    category: "自我管理",
    description: "相信能力可以通过努力提升的思维方式",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够主动学习岗位所需的知识和技能",
        example: "通过在线课程学习数据分析，掌握SQL和Excel技能"
      },
      {
        level: 2,
        score: 40,
        description: "能够跨领域学习，拓展知识边界",
        example: "作为技术人员，学习产品设计和用户体验知识，提升产品思维"
      },
      {
        level: 3,
        score: 60,
        description: "能够快速掌握新领域，并应用到工作中",
        example: "3个月内从零学习机器学习，并将其应用到推荐系统优化中"
      },
      {
        level: 4,
        score: 80,
        description: "能够从失败中快速学习，持续改进",
        example: "产品上线失败后，深入分析原因，总结经验教训，下一个产品成功率大幅提升"
      },
      {
        level: 5,
        score: 100,
        description: "能够构建学习型组织，让学习成为文化",
        example: "建立知识管理系统、导师制度、学习社区，让组织的学习能力成为核心竞争力"
      }
    ]
  },
  {
    name: "抗挫折能力",
    category: "自我管理",
    description: "面对挫折和失败时的韧性",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够接受失败，不逃避",
        example: "项目失败后，不推卸责任，勇于承认错误"
      },
      {
        level: 2,
        score: 40,
        description: "能够从失败中恢复，继续前进",
        example: "产品上线失败后，调整心态，分析原因，准备下一次尝试"
      },
      {
        level: 3,
        score: 60,
        description: "能够在逆境中保持乐观",
        example: "公司遇到困难时，保持信心，鼓励团队，寻找突破机会"
      },
      {
        level: 4,
        score: 80,
        description: "能够将挫折转化为成长机会",
        example: "每次失败都深入复盘，提炼经验教训，让失败成为成长的阶梯"
      },
      {
        level: 5,
        score: 100,
        description: "能够构建反脆弱系统",
        example: "建立'拥抱失败'的文化，让组织在挫折中变得更强"
      }
    ]
  },

  // ==================== 团队管理 (4个能力) ====================
  {
    name: "团队建设",
    category: "团队管理",
    description: "组建和发展高效团队的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够融入团队，贡献个人价值",
        example: "积极参与团队活动，与同事建立良好关系"
      },
      {
        level: 2,
        score: 40,
        description: "能够招聘合适的人才",
        example: "通过面试评估候选人的能力和文化匹配度，招到合适的人"
      },
      {
        level: 3,
        score: 60,
        description: "能够组建高效团队，明确分工",
        example: "根据项目需求，组建跨职能团队，明确角色和职责"
      },
      {
        level: 4,
        score: 80,
        description: "能够打造高绩效团队文化",
        example: "通过目标对齐、信任建立、协作机制，打造高绩效团队"
      },
      {
        level: 5,
        score: 100,
        description: "能够构建人才梯队和组织能力",
        example: "建立人才培养体系，让组织具备持续输出高绩效团队的能力"
      }
    ]
  },
  {
    name: "绩效管理",
    category: "团队管理",
    description: "评估和提升团队绩效的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够完成绩效考核流程",
        example: "按时完成绩效自评和团队成员的绩效评估"
      },
      {
        level: 2,
        score: 40,
        description: "能够设定清晰的绩效目标",
        example: "为团队成员设定SMART目标，明确期望和考核标准"
      },
      {
        level: 3,
        score: 60,
        description: "能够进行有效的绩效反馈和辅导",
        example: "定期进行1on1，给予建设性反馈，帮助成员改进"
      },
      {
        level: 4,
        score: 80,
        description: "能够设计绩效管理体系",
        example: "设计OKR体系，将公司目标分解到个人，实现上下对齐"
      },
      {
        level: 5,
        score: 100,
        description: "能够构建高绩效文化",
        example: "建立'以结果为导向'的文化，让绩效管理成为组织的核心竞争力"
      }
    ]
  },
  {
    name: "激励与认可",
    category: "团队管理",
    description: "激发团队潜能和提升积极性的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够认可他人的贡献",
        example: "及时表扬团队成员的优秀表现，给予正面反馈"
      },
      {
        level: 2,
        score: 40,
        description: "能够通过激励提升团队士气",
        example: "通过奖金、晋升、荣誉等方式激励团队，提升工作积极性"
      },
      {
        level: 3,
        score: 60,
        description: "能够赋能团队，提升能力",
        example: "通过培训、辅导、授权，提升团队成员的能力和自主性"
      },
      {
        level: 4,
        score: 80,
        description: "能够设计激励机制，激发内驱力",
        example: "设计OKR、股权激励等机制，让团队成员与公司目标一致"
      },
      {
        level: 5,
        score: 100,
        description: "能够构建自驱型组织文化",
        example: "像谷歌的20%时间、Valve的无管理层一样，让团队自我驱动"
      }
    ]
  },
  {
    name: "文化塑造",
    category: "团队管理",
    description: "塑造和传承组织文化的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够理解和践行公司文化",
        example: "理解公司价值观，在日常工作中体现"
      },
      {
        level: 2,
        score: 40,
        description: "能够在团队中传播文化",
        example: "通过言传身教，让团队成员理解和认同公司文化"
      },
      {
        level: 3,
        score: 60,
        description: "能够塑造团队文化",
        example: "在公司文化基础上，塑造团队的独特文化，如'技术卓越''快速迭代'"
      },
      {
        level: 4,
        score: 80,
        description: "能够推动文化变革",
        example: "推动组织从'层级文化'转向'创新文化'，从'个人英雄'转向'团队协作'"
      },
      {
        level: 5,
        score: 100,
        description: "能够定义组织文化",
        example: "像阿里的'六脉神剑'、Netflix的'自由与责任'一样，定义组织的核心文化"
      }
    ]
  },

  // ==================== 人才发展 (4个能力) ====================
  {
    name: "人才招聘与选拔",
    category: "人才发展",
    description: "识别和招募优秀人才的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够识别明显的能力差异",
        example: "能够区分团队中谁的技术能力强，谁的沟通能力好"
      },
      {
        level: 2,
        score: 40,
        description: "能够通过面试评估候选人",
        example: "通过结构化面试，评估候选人的能力、潜力和文化匹配度"
      },
      {
        level: 3,
        score: 60,
        description: "能够识别高潜人才",
        example: "识别出团队中具有管理潜力的成员，提前培养"
      },
      {
        level: 4,
        score: 80,
        description: "能够建立人才评估体系",
        example: "建立能力模型和评估标准，系统化地识别和评估人才"
      },
      {
        level: 5,
        score: 100,
        description: "能够构建人才战略",
        example: "基于业务战略，制定人才战略，提前布局关键人才"
      }
    ]
  },
  {
    name: "授权与赋能",
    category: "人才发展",
    description: "合理授权和培养下属的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够接受授权，独立完成任务",
        example: "上级授权后，能够独立决策和执行，不需要事事请示"
      },
      {
        level: 2,
        score: 40,
        description: "能够将简单任务授权给他人",
        example: "将重复性工作授权给团队成员，自己专注在更重要的事上"
      },
      {
        level: 3,
        score: 60,
        description: "能够授权重要任务，培养下属",
        example: "将关键项目授权给潜力员工，给予支持和指导，帮助其成长"
      },
      {
        level: 4,
        score: 80,
        description: "能够建立授权文化，让团队自主决策",
        example: "明确授权边界，让团队在权限范围内自主决策，提升响应速度"
      },
      {
        level: 5,
        score: 100,
        description: "能够构建分布式决策体系",
        example: "像Spotify的部落模式、Zappos的全员自治一样，实现组织的去中心化"
      }
    ]
  },
  {
    name: "教练与辅导",
    category: "人才发展",
    description: "指导和培养下属成长的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够分享经验，帮助他人",
        example: "主动帮助新人解决技术问题，分享工作经验"
      },
      {
        level: 2,
        score: 40,
        description: "能够进行一对一辅导",
        example: "定期和下属进行1on1，了解困难，给予指导和反馈"
      },
      {
        level: 3,
        score: 60,
        description: "能够制定培养计划，系统化培养",
        example: "为团队成员制定个人发展计划，安排培训和实践机会"
      },
      {
        level: 4,
        score: 80,
        description: "能够建立培养体系",
        example: "建立导师制度、轮岗机制、培训体系，系统化培养人才"
      },
      {
        level: 5,
        score: 100,
        description: "能够构建学习型组织",
        example: "建立知识管理系统、学习社区，让学习成为组织文化"
      }
    ]
  },
  {
    name: "继任者培养",
    category: "人才发展",
    description: "为关键岗位培养接班人的能力",
    levels: [
      {
        level: 1,
        score: 20,
        description: "能够培养备份人员",
        example: "主动培养团队成员，确保自己休假时有人能顶上"
      },
      {
        level: 2,
        score: 40,
        description: "能够为关键岗位准备候选人",
        example: "识别团队中的潜力人才，提前培养，为晋升做准备"
      },
      {
        level: 3,
        score: 60,
        description: "能够制定继任计划",
        example: "为部门关键岗位制定继任计划，明确候选人和培养路径"
      },
      {
        level: 4,
        score: 80,
        description: "能够建立人才梯队",
        example: "建立'高潜-骨干-新人'的人才梯队，确保组织可持续发展"
      },
      {
        level: 5,
        score: 100,
        description: "能够构建人才供应链",
        example: "建立'内部培养+外部引进+战略合作'的人才供应链，确保人才供给"
      }
    ]
  }
];
