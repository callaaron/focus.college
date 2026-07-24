/**
 * 综合种子数据填充脚本
 * 填充所有空表：挑战、成就、学习路径、能力快照、岗位、行业、企业评估、知识库等
 * 用法: node scripts/seed-full-content.cjs
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

const POOL = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'webapp',
  password: 'webapp_password_2024',
  database: 'competency_system',
  charset: 'utf8mb4',
  multipleStatements: true,
});

const USERS = { ceo: 7, cto: 8, manager: 9 };
const ALL_USERS = [7, 8, 9];
const TODAY = new Date().toISOString().split('T')[0];

// 8 域 + 40 能力 ID 映射
const DOMAINS = {
  战略领导力: [1,2,3,4,5],
  产品创新: [6,7,8,9,10],
  市场营销: [11,12,13,14,15],
  团队管理: [16,17,18,19,20],
  运营管理: [21,22,23,24,25],
  财务能力: [26,27,28,29,30],
  资源整合: [31,32,33,34,35],
  创业心态: [36,37,38,39,40],
};

// ============================================================
// 1. 创建 challenges 表 + 填充 32 道挑战题
// ============================================================
async function seedChallenges() {
  console.log('=== 1. 创建 challenges 表 + 填充挑战题目 ===');

  await POOL.execute(`
    CREATE TABLE IF NOT EXISTS challenges (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      scenario TEXT NOT NULL,
      options TEXT NOT NULL,
      correctAnswer INT NOT NULL,
      difficulty ENUM('easy','medium','hard') DEFAULT 'medium' NOT NULL,
      category VARCHAR(100),
      points INT DEFAULT 10 NOT NULL,
      explanation TEXT,
      competencyId INT,
      tags TEXT,
      isActive BOOLEAN DEFAULT TRUE NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // 清空旧数据
  await POOL.execute('DELETE FROM challenges');

  const challenges = [
    // 战略领导力 (5题)
    { title: '新市场进入决策', cat: '战略领导力', compId: 3, diff: 'hard', points: 20, correct: 3,
      scenario: { context: '你的公司在国内市场增长放缓，董事会要求你评估进入东南亚市场的可行性。你的团队有有限的国际化经验，公司现金流充裕但不足以支撑长期亏损。', question: '作为CEO，你的第一步应该是什么？' },
      options: [
        { text: '立即组建海外团队，全面进入东南亚市场', explanation: '过于冒进，缺乏充分调研' },
        { text: '放弃国际化，专注国内市场深耕', explanation: '过于保守，错失增长机会' },
        { text: '先进行市场调研和试点验证，再决定是否全面进入', explanation: '正确！分阶段验证降低风险' },
        { text: '收购一家东南亚本地公司快速进入', explanation: '收购风险高，且缺乏整合经验' },
      ],
      explanation: '进入新市场应采用"探索-验证-规模化"的渐进策略。先通过小规模试点验证市场需求和商业模式，再决定是否全面投入。这样既能抓住机会，又能控制风险。' },

    { title: '商业模式转型', cat: '战略领导力', compId: 1, diff: 'hard', points: 20, correct: 2,
      scenario: { context: '你的SaaS公司月活用户增长50%但付费转化率从8%降到3%。投资人要求你在两个季度内实现盈亏平衡。', question: '你应该优先采取什么策略？' },
      options: [
        { text: '继续扩大免费用户基数，通过规模效应提升收入', explanation: '转化率持续下降，规模扩大不解决问题' },
        { text: '调整定价策略，推出中间档位套餐并优化转化漏斗', explanation: '正确！从转化率入手是关键' },
        { text: '裁减营销团队，降低获客成本', explanation: '治标不治本，问题在转化不在获客' },
        { text: '完全转向企业客户市场', explanation: '转型周期长，无法满足两季度要求' },
      ],
      explanation: '付费转化率下降说明产品价值传递或定价策略有问题。应优先优化转化漏斗和定价结构，而非简单扩大规模或削减成本。' },

    { title: '竞争策略选择', cat: '战略领导力', compId: 4, diff: 'medium', points: 15, correct: 4,
      scenario: { context: '行业龙头降价30%发起价格战。你的公司市场份额15%，利润率已很薄，现金流仅够支撑3个月。', question: '最佳应对策略是什么？' },
      options: [
        { text: '跟进降价，保住市场份额', explanation: '现金流仅够3个月，价格战会加速灭亡' },
        { text: '维持原价，加大营销投入', explanation: '加大投入会消耗本已紧张的现金流' },
        { text: '寻求被行业龙头收购', explanation: '过早放弃，且议价能力弱' },
        { text: '聚焦差异化细分市场，提升高价值客户留存', explanation: '正确！差异化避开正面价格战' },
      ],
      explanation: '面对强势对手的价格战，弱势方应避免正面交锋。聚焦差异化细分市场，提升高价值客户留存率，通过服务和定制化创造不可替代性。' },

    { title: '战略目标分解', cat: '战略领导力', compId: 2, diff: 'medium', points: 15, correct: 3,
      scenario: { context: '你制定了"三年内成为行业TOP3"的战略目标，但各部门负责人反馈说目标太宏大，不知道如何落地。', question: '你应该怎么做？' },
      options: [
        { text: '将目标改为"提升市场份额"，让各部门自行理解', explanation: '目标过于模糊，无法执行' },
        { text: '自己制定详细执行计划，要求各部门照做', explanation: '缺乏部门参与，执行效果差' },
        { text: '将战略目标分解为年度OKR，与各部门共同制定关键结果', explanation: '正确！OKR分解确保目标可执行' },
        { text: '聘请外部咨询公司制定战略落地方案', explanation: '成本高且不一定贴合实际' },
      ],
      explanation: '战略目标需要通过OKR体系层层分解：年度目标→季度关键结果→部门行动计划。与部门共同制定确保可行性和认同感。' },

    { title: '商业洞察判断', cat: '战略领导力', compId: 5, diff: 'easy', points: 10, correct: 2,
      scenario: { context: '你注意到一个现象：过去3个月，公司核心产品的复购率从45%下降到28%，但客诉率没有变化。', question: '这个信号最可能说明什么？' },
      options: [
        { text: '产品质量下降了', explanation: '客诉率没变，产品质量问题不大' },
        { text: '客户满意度可能在"无声下降"，需要深入调研用户行为变化', explanation: '正确！复购下降但无投诉是隐性流失信号' },
        { text: '市场竞争加剧，客户被抢走', explanation: '有可能但需数据验证，不是最直接判断' },
        { text: '季节性波动，无需担心', explanation: '3个月下降17个百分点不是正常季节波动' },
      ],
      explanation: '复购率大幅下降但客诉率不变，说明客户没有明显不满但减少了购买。这可能是竞品替代、需求变化或体验疲劳。需要用户行为分析和深度访谈来定位原因。' },

    // 产品创新 (4题)
    { title: '需求优先级排序', cat: '产品创新', compId: 6, diff: 'medium', points: 15, correct: 3,
      scenario: { context: '产品 backlog 有 50+ 需求，销售说客户要A功能，运营说B功能重要，技术说C功能能提效。开发资源只够做一个。', question: '如何科学决策？' },
      options: [
        { text: '听销售的，客户需求优先', explanation: '单一来源决策不全面' },
        { text: '听技术的，内部提效降低成本', explanation: '内部视角，忽略客户价值' },
        { text: '用RICE评分（覆盖度×影响力×信心÷投入）量化排序', explanation: '正确！数据驱动的优先级排序' },
        { text: '投票决定，少数服从多数', explanation: '民主但不科学，容易选错' },
      ],
      explanation: 'RICE框架通过覆盖度(Reach)、影响力(Impact)、信心(Confidence)和投入(Effort)四个维度量化每个需求的价值，避免单一视角偏见。' },

    { title: 'MVP设计原则', cat: '产品创新', compId: 7, diff: 'easy', points: 10, correct: 2,
      scenario: { context: '团队要做一个社区团购产品，设计师建议先做完整版（含拼团、秒杀、分销等8个模块），开发周期3个月。', question: '你的建议是？' },
      options: [
        { text: '同意完整版，功能多有竞争力', explanation: '周期长，验证成本高' },
        { text: '先做MVP：仅核心拼团流程，2周上线验证', explanation: '正确！MVP快速验证核心假设' },
        { text: '先做竞品分析再决定', explanation: '分析有用但不能替代用户验证' },
        { text: '外包给第三方快速上线', explanation: '质量不可控且成本高' },
      ],
      explanation: 'MVP的核心是"最小化可行产品"——用最少功能验证最核心的商业假设。社区团购的核心是拼团流程，验证用户是否愿意拼团购买比功能完整性更重要。' },

    { title: '用户体验取舍', cat: '产品创新', compId: 9, diff: 'medium', points: 15, correct: 4,
      scenario: { context: '数据团队报告：新版本注册流程增加了实名认证步骤后，注册完成率从70%降到40%。但合规部门要求必须实名。', question: '如何平衡？' },
      options: [
        { text: '取消实名认证，优先注册转化', explanation: '合规风险大' },
        { text: '保持现状，合规优先', explanation: '30%的完成率太低，大量用户流失' },
        { text: '改为可选实名，使用时再强制', explanation: '增加复杂度，且关键场景仍有流失' },
        { text: '优化实名流程：OCR自动识别+后置认证+渐进式引导', explanation: '正确！降低认证摩擦同时满足合规' },
      ],
      explanation: '通过OCR自动识别减少手动输入、将认证步骤后置到使用场景、用渐进式引导降低用户认知负担，可以在满足合规要求的同时最大化注册转化。' },

    { title: '创新思维应用', cat: '产品创新', compId: 10, diff: 'hard', points: 20, correct: 3,
      scenario: { context: '你的在线教育产品在三四线城市增长停滞。调研发现用户认为"课程太贵"但实际单价仅19.9元。', question: '问题的本质和解决方案是什么？' },
      options: [
        { text: '降价到9.9元，降低门槛', explanation: '低价可能损害品牌且不一定解决感知问题' },
        { text: '增加课程内容，提升性价比', explanation: '成本增加，且用户感知问题没解决' },
        { text: '改变定价锚点：推出"年卡365元"让单课感知价降至1元', explanation: '正确！用锚定效应改变价格感知' },
        { text: '做更多促销活动', explanation: '短期有效，不解决根本问题' },
      ],
      explanation: '用户说"贵"往往是价值感知问题而非绝对价格问题。通过年卡模式改变定价锚点，让用户感知到单课价格极低（1元/课），同时提升ARPU和留存。' },

    // 市场营销 (4题)
    { title: '品牌定位策略', cat: '市场营销', compId: 11, diff: 'medium', points: 15, correct: 2,
      scenario: { context: '你的家电品牌在高端市场（5000+）份额仅2%，在中端市场（2000-5000）份额15%。CEO想冲高端。', question: '品牌策略建议？' },
      options: [
        { text: '直接提价，用高端包装重塑品牌', explanation: '品牌认知非一日之功，直接提价风险大' },
        { text: '推出独立高端子品牌，与主品牌形成矩阵', explanation: '正确！子品牌避免主品牌认知拖累' },
        { text: '先做中高端（3500-5000）过渡', explanation: '过渡策略容易两头不讨好' },
        { text: '赞助高端活动提升品牌调性', explanation: '效果慢且不一定能改变产品认知' },
      ],
      explanation: '高端化需要独立的品牌认知。推出子品牌可以避免主品牌"性价比"标签的拖累，同时共享供应链降低成本。参考丰田→雷克萨斯、安踏→斐乐的路径。' },

    { title: '渠道选择决策', cat: '市场营销', compId: 13, diff: 'medium', points: 15, correct: 3,
      scenario: { context: '你的B2B企业服务产品客单价50万/年，目前主要通过电话销售获客，获客成本高且转化率仅5%。', question: '最优渠道策略？' },
      options: [
        { text: '加大电话销售团队规模', explanation: '线性增长，成本持续上升' },
        { text: '全面转向线上广告投放', explanation: 'B2B高客单价线上转化率低' },
        { text: '构建"内容营销+行业峰会+ABM精准营销"组合渠道', explanation: '正确！多触点组合更适合高客单价B2B' },
        { text: '依靠客户转介绍', explanation: '单一渠道增长天花板低' },
      ],
      explanation: '高客单价B2B需要长决策周期和多触点影响。内容营销建立专业认知，行业峰会获取高质量线索，ABM对头部客户精准营销，三者组合效果最佳。' },

    { title: '用户增长策略', cat: '市场营销', compId: 15, diff: 'hard', points: 20, correct: 4,
      scenario: { context: '你的社区App用户增长停滞在50万DAU。裂变活动效果越来越差（K因子从1.2降到0.3），买量成本翻倍。', question: '突破增长瓶颈的关键？' },
      options: [
        { text: '加大裂变奖励力度', explanation: 'K因子已降到0.3，加大奖励边际效应递减' },
        { text: '拓展新渠道买量', explanation: '买量成本已翻倍，新渠道更贵' },
        { text: '做品牌广告提升知名度', explanation: '品牌广告见效慢，不适合解决即时增长问题' },
        { text: '提升核心留存（次日留存从35%提到45%），再放大拉新', explanation: '正确！留存是增长飞轮的基础' },
      ],
      explanation: '增长=拉新×留存。当裂变K因子下降（说明产品分享价值减弱）和买量成本上升时，核心留存优化是突破口。留存提升后，每个新用户生命周期价值提高，可以承受更高获客成本，形成正向循环。' },

    { title: '数据分析应用', cat: '市场营销', compId: 14, diff: 'easy', points: 10, correct: 2,
      scenario: { context: '营销团队报告：上月投放了5个渠道，总ROI 150%。但当你问"哪个渠道最有效"时，团队说没有分渠道追踪。', question: '问题出在哪里？' },
      options: [
        { text: 'ROI 150%已经很好，不需要分渠道追踪', explanation: '不追踪就无法优化渠道分配' },
        { text: '缺少UTM参数追踪和分渠道归因分析', explanation: '正确！没有分渠道追踪就无法优化' },
        { text: '应该减少投放渠道', explanation: '渠道数量不是问题，追踪才是' },
        { text: '换一个数据分析工具', explanation: '工具不是问题，方法论才是' },
      ],
      explanation: '多渠道投放必须用UTM参数追踪每个渠道的流量、转化和ROI。没有分渠道数据就无法做预算优化，可能把钱浪费在低效渠道上。' },

    // 团队管理 (4题)
    { title: '团队冲突处理', cat: '团队管理', compId: 20, diff: 'medium', points: 15, correct: 3,
      scenario: { context: '产品经理和技术负责人在产品方向上产生严重分歧。产品要快速上线新功能冲KPI，技术要重构技术债。双方互不相让，团队氛围紧张。', question: '作为领导者如何处理？' },
      options: [
        { text: '支持产品，KPI优先', explanation: '忽视技术债会埋下更大隐患' },
        { text: '支持技术，先把地基打好', explanation: '忽视KPI会影响业务生存' },
        { text: '组织对齐会议：量化技术债风险和新功能收益，制定7/3资源分配方案', explanation: '正确！用数据和规则解决冲突' },
        { text: '各打五十大板，让他们自己解决', explanation: '回避问题，冲突会升级' },
      ],
      explanation: '冲突管理的核心是将对立转化为共同决策。用量化数据（技术债影响范围、新功能预期收益）替代情绪对抗，用明确的资源分配规则（7/3）建立共识。' },

    { title: '绩效面谈技巧', cat: '团队管理', compId: 18, diff: 'medium', points: 15, correct: 2,
      scenario: { context: '你的一个核心骨干员工绩效明显下滑（从A级降到B-级）。你了解到他最近家庭出现变故。', question: '如何进行绩效面谈？' },
      options: [
        { text: '直接指出绩效下滑，要求改进', explanation: '忽略个人情况，可能适得其反' },
        { text: '先表达关心，了解情况，共同制定恢复计划，给予合理调整期', explanation: '正确！以人为本的绩效管理' },
        { text: '暂时不谈绩效，等他自己恢复', explanation: '不作为可能让员工更焦虑' },
        { text: '调整KPI标准，降低对他的要求', explanation: '降低标准不利于员工长期发展' },
      ],
      explanation: '绩效面谈不只是谈数字，更是关注人。先关心再谈事，了解原因后共同制定恢复计划，既体现人文关怀又保持绩效标准。给予调整期但不是降低标准。' },

    { title: '人才梯队建设', cat: '团队管理', compId: 16, diff: 'hard', points: 20, correct: 4,
      scenario: { context: '你的技术团队过度依赖2个核心架构师。他们一旦离职，整个系统运维将陷入瘫痪。但公司目前无法提供有竞争力的薪酬涨幅。', question: '如何降低人才风险？' },
      options: [
        { text: '给核心架构师加薪留人', explanation: '成本增加且未解决单点依赖' },
        { text: '招新人替代，分散风险', explanation: '新人需要长期培养，短期风险更大' },
        { text: '签订长期合同和竞业协议', explanation: '合同约束力有限，治标不治本' },
        { text: '建立知识沉淀机制+交叉培养后备+架构民主化决策', explanation: '正确！系统性降低单点依赖' },
      ],
      explanation: '降低人才单点风险需要系统方案：1)知识沉淀（文档+代码注释+架构决策记录）；2)交叉培养（每个核心模块至少2人了解）；3)架构民主化（技术决策不再依赖个人）。' },

    { title: '组织文化塑造', cat: '团队管理', compId: 19, diff: 'easy', points: 10, correct: 3,
      scenario: { context: '你接手了一个新团队，发现成员只做分内事，不愿跨部门协作，信息不透明，甩锅现象严重。', question: '塑造协作文化的第一步？' },
      options: [
        { text: '制定严格的跨部门协作制度', explanation: '制度解决行为问题，不解决心态问题' },
        { text: '团建活动增进感情', explanation: '团建效果短暂，不改变工作模式' },
        { text: '建立"共同目标+透明信息+心理安全感"的三要素机制', explanation: '正确！从根源塑造协作文化' },
        { text: '更换不配合的成员', explanation: '治标不治本，新人进来也会被同化' },
      ],
      explanation: '协作文化的三要素：1)共同目标（让团队有一起赢的动力）；2)信息透明（减少信息差带来的甩锅）；3)心理安全感（允许试错和提问）。从三要素入手才能从根本上改变文化。' },

    // 运营管理 (4题)
    { title: '流程优化决策', cat: '运营管理', compId: 21, diff: 'medium', points: 15, correct: 2,
      scenario: { context: '你的客服团队平均响应时间45分钟，客户满意度仅65%。团队10人，日均处理300单。', question: '优化方向？' },
      options: [
        { text: '增加客服人员到15人', explanation: '人力成本增加50%，治标不治本' },
        { text: '引入智能客服分流常见问题+优化工单分类流程+建立FAQ知识库', explanation: '正确！系统化提效' },
        { text: '提高考核标准，要求15分钟响应', explanation: '不增能力只加压力，导致人员流失' },
        { text: '减少服务时间，只在工作时间服务', explanation: '降低客户体验' },
      ],
      explanation: '运营优化应先做"减法"再做"加法"：智能客服分流60%常见问题，优化工单分类减少转接，FAQ知识库让客户自助解决。这样10人团队可以聚焦高价值复杂问题。' },

    { title: '项目管理风险', cat: '运营管理', compId: 22, diff: 'medium', points: 15, correct: 4,
      scenario: { context: '一个3个月的关键项目到第2个月时，你发现进度仅完成35%（预期50%），且2个核心成员可能离职。', question: '应该怎么做？' },
      options: [
        { text: '要求团队加班赶进度', explanation: '加班质量下降，且加速核心成员离职' },
        { text: '向客户隐瞒风险，继续推进', explanation: '风险暴露后信任崩塌' },
        { text: '放弃项目，止损', explanation: '过早放弃，35%已完成有价值' },
        { text: '重新评估范围：砍非核心功能+稳核心成员+与客户透明沟通调整交付', explanation: '正确！范围管理+人员稳定+透明沟通' },
      ],
      explanation: '项目脱轨时需要三步走：1)重新评估范围（MVP思维砍非核心）；2)稳定核心人员（了解离职原因，提供激励或交接计划）；3)透明沟通（与客户重新对齐期望，争取理解和支持）。' },

    { title: '成本管控策略', cat: '运营管理', compId: 25, diff: 'hard', points: 20, correct: 3,
      scenario: { context: '公司年度审计发现运营成本同比增加40%，但收入仅增加15%。CEO要求你在不影响业务的前提下降低成本。', question: '成本优化的优先策略？' },
      options: [
        { text: '全面削减20%预算', explanation: '一刀切会伤及核心业务' },
        { text: '裁员10%', explanation: '裁员成本高且影响士气' },
        { text: 'ABC分类分析：砍C类低价值支出+优化B类+保障A类核心投入', explanation: '正确！基于价值分类优化' },
        { text: '换更便宜的供应商', explanation: '质量下降风险大' },
      ],
      explanation: '成本管控不是简单削减，而是价值优化。ABC分类法：A类（高价值核心）保障投入；B类（中等价值）优化效率；C类（低价值）果断砍掉。这样在不伤核心的前提下实现降本。' },

    { title: '质量管控体系', cat: '运营管理', compId: 23, diff: 'easy', points: 10, correct: 2,
      scenario: { context: '你的电商平台的退换货率从5%升到12%。分析发现主要原因是商品描述与实物不符。', question: '根因和解决方案？' },
      options: [
        { text: '提高退换货门槛，降低退换货率', explanation: '治标不治本，损害用户体验' },
        { text: '建立商品信息审核机制+实拍图要求+描述与实物一致性检查', explanation: '正确！从源头解决质量问题' },
        { text: '增加客服处理退换货效率', explanation: '提升处理效率但不减少退换货' },
        { text: '罚款描述不符的商家', explanation: '惩罚有用但不如建立预防机制' },
      ],
      explanation: '质量问题要从源头解决。建立商品信息审核机制（上架前检查）、实拍图要求（减少虚假图片）、描述一致性检查（系统+人工），可以将退换货率从12%降到5%以下。' },

    // 财务能力 (3题)
    { title: '现金流管理', cat: '财务能力', compId: 26, diff: 'hard', points: 20, correct: 3,
      scenario: { context: '你的公司年营收5000万，利润率15%。但应收账款周期90天，应付账款周期30天。最近有200万应收账款可能成为坏账。', question: '最紧急的财务措施？' },
      options: [
        { text: '向银行申请贷款补充现金流', explanation: '增加财务成本，治标不治本' },
        { text: '削减所有非必要支出', explanation: '影响正常经营' },
        { text: '建立应收账款分级管理+催收机制+调整客户信用政策+引入保理业务', explanation: '正确！系统解决应收账款问题' },
        { text: '打折催收，快速回笼资金', explanation: '损失大且可能传递负面信号' },
      ],
      explanation: '应收账款管理是中小企业现金流的生命线。分级管理（A/B/C客户不同策略）、催收机制（30/60/90天分级催收）、信用政策调整（缩短账期或预付款比例）、保理业务（将应收账款转让给保理公司提前获现）。' },

    { title: '投资判断分析', cat: '财务能力', compId: 29, diff: 'medium', points: 15, correct: 2,
      scenario: { context: '公司有500万闲置资金。财务建议买理财产品（年化4%），CTO建议投入研发新产品（预期3年回报200%但风险高），COO建议扩建产能（年增收入15%）。', question: '如何决策？' },
      options: [
        { text: '买理财，安全第一', explanation: '资金利用率低，跑不赢通胀' },
        { text: '组合配置：60%扩产能（中等风险回报）+30%研发（高风险高回报）+10%流动资金', explanation: '正确！风险分散的组合投资' },
        { text: '全部投入研发，追求高回报', explanation: '风险过于集中' },
        { text: '存银行定期', explanation: '过于保守' },
      ],
      explanation: '企业资金配置应基于风险-回报矩阵。组合配置实现：60%稳健增长（扩产能有明确回报）、30%战略投入（研发是未来增长引擎）、10%流动性保障（应对不确定性）。' },

    { title: '合规风险识别', cat: '财务能力', compId: 30, diff: 'medium', points: 15, correct: 4,
      scenario: { context: '你的公司快速发展中，HR报告：部分员工社保缴纳基数低于实际工资。财务说这样可以节省成本约5万/月。', question: '你的决策？' },
      options: [
        { text: '维持现状，行业普遍这么做', explanation: '法律风险巨大，不是规避理由' },
        { text: '立刻全员全额缴纳，不管成本', explanation: '突然增加成本可能影响现金流' },
        { text: '继续降低基数但给员工现金补偿', explanation: '仍然违法且增加成本' },
        { text: '制定合规过渡计划：6个月内分批调整到合规基数，同时优化其他成本项对冲', explanation: '正确！分步合规+成本对冲' },
      ],
      explanation: '社保不合规是定时炸弹。举报、劳动仲裁、税务稽查都会触发巨额补缴+罚款。正确做法是制定分步合规计划（6个月过渡），同时通过优化运营成本（如流程提效、减少浪费）来对冲合规成本。' },

    // 资源整合 (3题)
    { title: '合作谈判策略', cat: '资源整合', compId: 33, diff: 'medium', points: 15, correct: 3,
      scenario: { context: '你需要与一家头部平台谈判流量合作。对方提出要求：独家合作+30%分成+最低保底。你的底线是非独家+15%分成。', question: '谈判策略？' },
      options: [
        { text: '接受对方条件，先合作再说', explanation: '独家锁死未来合作空间，30%分成过高' },
        { text: '坚持底线，不接受就放弃', explanation: '放弃头部平台流量损失大' },
        { text: '提出折中方案：非独家+20%分成+阶段性保底+流量对赌条款', explanation: '正确！创造性折中实现双赢' },
        { text: '找对方竞争对手合作施压', explanation: '激化对抗，破坏合作关系' },
      ],
      explanation: '谈判不是零和博弈。通过折中方案（非独家+20%分成）满足双方核心诉求，用阶段性保底降低对方风险，用流量对赌（达不到量自动调整分成）保护自己。' },

    { title: '资源整合思维', cat: '资源整合', compId: 32, diff: 'hard', points: 20, correct: 4,
      scenario: { context: '你的创业公司需要：技术研发能力、市场渠道、品牌信誉、启动资金。你只有技术团队和少量资金。', question: '最优资源整合策略？' },
      options: [
        { text: '先融资，再建团队和渠道', explanation: '融资周期长，且无产品无数据难以融资' },
        { text: '自己做产品，慢慢积累', explanation: '速度太慢，错过市场窗口' },
        { text: '找大公司投资并购', explanation: '早期公司议价能力弱' },
        { text: '构建资源互换生态：技术换渠道+品牌背书换股权+政府补贴+产业基金', explanation: '正确！多方资源互换实现杠杆效应' },
      ],
      explanation: '资源整合的核心是"用自己有的换自己缺的"。技术能力换渠道伙伴的定制开发、股权换行业大佬的品牌背书、政府创新补贴、产业基金（不稀释股权）——多方资源撬动实现杠杆成长。' },

    { title: '供应链风险管理', cat: '资源整合', compId: 34, diff: 'medium', points: 15, correct: 2,
      scenario: { context: '你的产品80%的核心零部件来自单一供应商。最近该供应商出现了2次交付延迟，影响了你的生产计划。', question: '供应链风险管理方案？' },
      options: [
        { text: '增加库存缓冲，应对延迟', explanation: '库存成本高，且不解决根本问题' },
        { text: '开发备选供应商（40/30/30分配）+建立供应商评估体系+关键零件双源采购', explanation: '正确！多元化采购降低单点风险' },
        { text: '要求供应商签署更严格的交付协议', explanation: '协议约束力有限，供应商可能无法履约' },
        { text: '收购供应商，内部化生产', explanation: '成本高且分散精力' },
      ],
      explanation: '供应链风险管理最佳实践：1)多元化采购（主供应商40%+备选30%+30%）；2)供应商评估体系（定期评估交付、质量、财务健康）；3)关键零件双源采购（至少2个合格供应商）。' },

    // 创业心态 (2题)
    { title: '压力应对策略', cat: '创业心态', compId: 36, diff: 'medium', points: 15, correct: 3,
      scenario: { context: '创业2年，公司账上资金只够3个月。你每天工作14小时，失眠严重，情绪暴躁，家庭关系紧张。', question: '最健康的应对方式？' },
      options: [
        { text: '咬牙坚持，创业者就该拼', explanation: '忽视身心健康，可能崩溃' },
        { text: '放弃创业，回归职场', explanation: '过早放弃，且3个月资金还有机会' },
        { text: '分三步：1)找人倾诉减压 2)制定3个月生存计划（融资/裁员/转型）3)建立每日1小时运动/冥想习惯', explanation: '正确！系统应对压力' },
        { text: '靠酒精和游戏释放压力', explanation: '不健康且影响判断力' },
      ],
      explanation: '创业压力管理需要系统方法：1)情感支持（找导师/创业者社群倾诉，不孤立）；2)行动计划（把焦虑转化为具体行动清单）；3)身体管理（运动和冥想是科学验证的压力释放方式）。' },

    { title: '决策魄力展现', cat: '创业心态', compId: 37, diff: 'hard', points: 20, correct: 2,
      scenario: { context: '你的核心业务连续3个季度亏损。数据表明市场已经发生变化，但团队中有人坚持"再坚持一下就会好转"。账上资金够6个月。', question: '你的决策？' },
      options: [
        { text: '继续坚持，给团队更多时间', explanation: '3个季度亏损+市场变化，坚持可能加速死亡' },
        { text: '果断转型：1个月内完成战略调整，聚焦有增长信号的新方向', explanation: '正确！基于数据果断决策' },
        { text: '裁员50%缩减成本', explanation: '只降成本不转方向，6个月后仍会死' },
        { text: '寻求被收购', explanation: '亏损中议价能力极弱' },
      ],
      explanation: '创业最难的不是开始而是转向。连续3个季度亏损+市场变化=核心假设已失效。6个月资金是转型窗口期。果断转型比缓慢等死更有尊严，也更有可能成功。' },
  ];

  for (const ch of challenges) {
    await POOL.execute(
      `INSERT INTO challenges (title, scenario, options, correctAnswer, difficulty, category, points, explanation, competencyId, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        ch.title,
        JSON.stringify(ch.scenario),
        JSON.stringify(ch.options.map(o => ({ text: o.text, explanation: o.explanation }))),
        ch.correct,
        ch.diff,
        ch.cat,
        ch.points,
        ch.explanation,
        ch.compId,
      ]
    );
  }
  console.log(`  ✓ 填充 ${challenges.length} 道挑战题目`);
}

// ============================================================
// 2. 挑战成就定义 (challengeAchievements)
// ============================================================
async function seedChallengeAchievements() {
  console.log('=== 2. 填充挑战成就定义 ===');
  await POOL.execute('DELETE FROM challengeAchievements');

  const achievements = [
    { code: 'first_correct', name: '初出茅庐', desc: '答对第一道挑战题', icon: '🎯', cat: 'count', req: 1, points: 10, rarity: 'common' },
    { code: 'streak_3', name: '三日打卡', desc: '连续3天完成每日挑战', icon: '🔥', cat: 'streak', req: 3, points: 30, rarity: 'common' },
    { code: 'streak_7', name: '周冠王', desc: '连续7天完成每日挑战', icon: '⚡', cat: 'streak', req: 7, points: 50, rarity: 'rare' },
    { code: 'streak_30', name: '月度铁人', desc: '连续30天完成每日挑战', icon: '💪', cat: 'streak', req: 30, points: 200, rarity: 'epic' },
    { code: 'count_10', name: '勤奋学员', desc: '累计完成10道挑战题', icon: '📚', cat: 'count', req: 10, points: 50, rarity: 'common' },
    { code: 'count_50', name: '挑战达人', desc: '累计完成50道挑战题', icon: '🏆', cat: 'count', req: 50, points: 150, rarity: 'rare' },
    { code: 'count_100', name: '百题斩', desc: '累计完成100道挑战题', icon: '👑', cat: 'count', req: 100, points: 300, rarity: 'epic' },
    { code: 'accuracy_80', name: '精准射手', desc: '正确率达到80%（至少20题）', icon: '🔫', cat: 'accuracy', req: 80, points: 100, rarity: 'rare' },
    { code: 'accuracy_90', name: '神枪手', desc: '正确率达到90%（至少50题）', icon: '🎖️', cat: 'accuracy', req: 90, points: 250, rarity: 'epic' },
    { code: 'all_domains', name: '全能战士', desc: '在所有8个能力域中至少各答对1题', icon: '🌟', cat: 'special', req: 8, points: 200, rarity: 'legendary' },
  ];

  for (const a of achievements) {
    await POOL.execute(
      'INSERT INTO challengeAchievements (code, name, description, icon, category, requirement, points, rarity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [a.code, a.name, a.desc, a.icon, a.cat, a.req, a.points, a.rarity]
    );
  }
  console.log(`  ✓ 填充 ${achievements.length} 个挑战成就定义`);
}

// ============================================================
// 3. 通用成就定义 (achievements)
// ============================================================
async function seedAchievements() {
  console.log('=== 3. 填充通用成就定义 ===');
  await POOL.execute('DELETE FROM achievements');

  const achievements = [
    { name: '初次评估', desc: '完成第一次能力评估', icon: '📋', cat: 'assessment', type: 'one_time', cond: '{"action":"complete_assessment","count":1}', points: 50 },
    { name: '评估专家', desc: '完成3次能力评估', icon: '📊', cat: 'assessment', type: 'progressive', cond: '{"action":"complete_assessment","count":3}', points: 100 },
    { name: '能力突破', desc: '在任意能力上达到L4等级', icon: '🚀', cat: 'growth', type: 'one_time', cond: '{"action":"reach_level","level":4}', points: 80 },
    { name: '大师之路', desc: '在任意能力上达到L5等级', icon: '👑', cat: 'growth', type: 'one_time', cond: '{"action":"reach_level","level":5}', points: 150 },
    { name: '全面发展', desc: '在10个能力上达到L4等级', icon: '🌐', cat: 'growth', type: 'progressive', cond: '{"action":"reach_level","level":4,"count":10}', points: 300 },
    { name: '学习启航', desc: '完成第一个学习路径', icon: '🛤️', cat: 'learning', type: 'one_time', cond: '{"action":"complete_learning_path","count":1}', points: 100 },
    { name: '终身学习', desc: '完成3个学习路径', icon: '🎓', cat: 'learning', type: 'progressive', cond: '{"action":"complete_learning_path","count":3}', points: 200 },
    { name: '挑战新手', desc: '完成第一道每日挑战', icon: '⚔️', cat: 'assessment', type: 'one_time', cond: '{"action":"complete_challenge","count":1}', points: 20 },
    { name: '挑战达人', desc: '完成50道每日挑战', icon: '🗡️', cat: 'assessment', type: 'progressive', cond: '{"action":"complete_challenge","count":50}', points: 150 },
    { name: '连续打卡7天', desc: '连续7天完成每日挑战', icon: '🔥', cat: 'growth', type: 'one_time', cond: '{"action":"streak","days":7}', points: 70 },
    { name: '社交达人', desc: '提交3条产品反馈', icon: '💬', cat: 'social', type: 'progressive', cond: '{"action":"submit_feedback","count":3}', points: 30 },
    { name: '企业洞察', desc: '完成企业能力评估', icon: '🏢', cat: 'assessment', type: 'one_time', cond: '{"action":"complete_org_assessment"}', points: 80 },
  ];

  for (let i = 0; i < achievements.length; i++) {
    const a = achievements[i];
    await POOL.execute(
      'INSERT INTO achievements (name, description, icon, category, type, `condition`, points, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [a.name, a.desc, a.icon, a.cat, a.type, a.cond, a.points, i + 1]
    );
  }
  console.log(`  ✓ 填充 ${achievements.length} 个通用成就定义`);
}

// ============================================================
// 4. 用户挑战历史 + 积分 + 今日挑战 + 成就解锁
// ============================================================
async function seedUserChallenges() {
  console.log('=== 4. 填充用户挑战历史、积分、成就 ===');
  await POOL.execute('DELETE FROM userChallenges');
  await POOL.execute('DELETE FROM dailyChallenges');
  await POOL.execute('DELETE FROM userPoints');
  await POOL.execute('DELETE FROM userChallengeAchievements');

  // 获取所有挑战
  const [allChallenges] = await POOL.execute('SELECT id, difficulty, points, category FROM challenges WHERE isActive = TRUE ORDER BY id');
  const challengeIds = allChallenges.map(c => c.id);

  for (const userId of ALL_USERS) {
    const totalChallenges = userId === USERS.ceo ? 28 : userId === USERS.cto ? 22 : 18;
    const correctRate = userId === USERS.ceo ? 0.82 : userId === USERS.cto ? 0.73 : 0.65;
    const streakDays = userId === USERS.ceo ? 14 : userId === USERS.cto ? 10 : 7;

    let totalPoints = 0;
    let correctCount = 0;

    // 过去14天的挑战历史
    for (let day = streakDays; day >= 0; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      const dateStr = date.toISOString().split('T')[0];
      const completedAt = new Date(date.getTime() + 8 * 3600 * 1000); // 上午8点

      // 每天1-2题
      const numToday = Math.random() > 0.5 ? 2 : 1;
      for (let n = 0; n < numToday && totalChallenges > 0; n++) {
        const challenge = allChallenges[Math.floor(Math.random() * allChallenges.length)];
        const isCorrect = Math.random() < correctRate;
        const pointsEarned = isCorrect ? challenge.points : 0;
        const timeSpent = Math.floor(Math.random() * 120) + 30;

        await POOL.execute(
          `INSERT INTO userChallenges (userId, challengeId, isCorrect, selectedAnswer, pointsEarned, timeSpent, attemptNumber, completedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, challenge.id, isCorrect, isCorrect ? challenge.correctAnswer || 1 : Math.floor(Math.random() * 4) + 1, pointsEarned, timeSpent, 1, completedAt]
        );

        totalPoints += pointsEarned;
        if (isCorrect) correctCount++;

        // 前一天分配 dailyChallenge
        if (n === 0) {
          await POOL.execute(
            `INSERT INTO dailyChallenges (userId, challengeId, assignedDate, isCompleted, completedAt) VALUES (?, ?, ?, TRUE, ?)`,
            [userId, challenge.id, dateStr, completedAt]
          );
        }
      }
    }

    // 今日挑战（未完成）
    const todayChallenge = allChallenges[Math.floor(Math.random() * allChallenges.length)];
    await POOL.execute(
      `INSERT INTO dailyChallenges (userId, challengeId, assignedDate, isCompleted) VALUES (?, ?, ?, FALSE)`,
      [userId, todayChallenge.id, TODAY]
    );

    // 积分统计
    const rank = userId === USERS.ceo ? 1 : userId === USERS.cto ? 2 : 3;
    await POOL.execute(
      `INSERT INTO userPoints (userId, totalPoints, currentStreak, longestStreak, totalChallenges, correctCount, lastCompletedDate, \`rank\`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, totalPoints, streakDays, streakDays, totalChallenges, correctCount, TODAY, rank]
    );

    console.log(`  ✓ 用户${userId}: ${totalChallenges}题, 正确${correctCount}, 积分${totalPoints}, 连续${streakDays}天`);
  }

  // 解锁成就
  const [achDefs] = await POOL.execute('SELECT id, code FROM challengeAchievements');
  for (const userId of ALL_USERS) {
    // 每个用户解锁不同的成就
    const unlockCount = userId === USERS.ceo ? 6 : userId === USERS.cto ? 4 : 3;
    const unlocked = new Set();
    for (let i = 0; i < unlockCount && i < achDefs.length; i++) {
      const ach = achDefs[i];
      unlocked.add(ach.id);
      const unlockedAt = new Date();
      unlockedAt.setDate(unlockedAt.getDate() - Math.floor(Math.random() * 10));
      await POOL.execute(
        'INSERT INTO userChallengeAchievements (userId, achievementId, unlockedAt) VALUES (?, ?, ?)',
        [userId, ach.id, unlockedAt]
      );
    }
  }

  // 通用成就解锁
  await POOL.execute('DELETE FROM userAchievements');
  const [genAchs] = await POOL.execute('SELECT id FROM achievements');
  for (const userId of ALL_USERS) {
    const unlockCount = userId === USERS.ceo ? 8 : userId === USERS.cto ? 5 : 4;
    for (let i = 0; i < unlockCount && i < genAchs.length; i++) {
      const unlockedAt = new Date();
      unlockedAt.setDate(unlockedAt.getDate() - Math.floor(Math.random() * 30));
      await POOL.execute(
        'INSERT INTO userAchievements (userId, achievementId, unlockedAt, progress) VALUES (?, ?, ?, ?)',
        [userId, genAchs[i].id, unlockedAt, 100]
      );
    }
  }
  console.log('  ✓ 用户挑战成就和通用成就已解锁');
}

// ============================================================
// 5. 学习资源 + 学习路径 + 学习进度
// ============================================================
async function seedLearningPaths() {
  console.log('=== 5. 填充学习资源和学习路径 ===');
  await POOL.execute('DELETE FROM userLearningProgress');
  await POOL.execute('DELETE FROM learningPaths');
  await POOL.execute('DELETE FROM learningResources');

  // 获取所有能力
  const [comps] = await POOL.execute('SELECT id, name, category FROM competencies ORDER BY id');

  // 为每个能力创建1个学习资源
  const resourceTypes = ['article', 'video', 'book', 'course'];
  const resourceTitles = {
    article: '深度解析：{name}的核心框架与实践',
    video: '视频课程：{name}从入门到精通',
    book: '推荐阅读：《{name}实战指南》',
    course: '在线课程：{name}系统化训练',
  };

  for (const comp of comps) {
    const type = resourceTypes[comp.id % 4];
    const title = resourceTitles[type].replace('{name}', comp.name);
    const difficulty = comp.id % 3 === 0 ? 'beginner' : comp.id % 3 === 1 ? 'intermediate' : 'advanced';
    const time = [30, 45, 60, 90, 120][comp.id % 5];

    await POOL.execute(
      `INSERT INTO learningResources (competencyId, title, type, url, description, difficulty, estimatedTime) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        comp.id,
        title,
        type,
        `https://learning.focus-college.com/resources/${comp.id}`,
        `${comp.name}能力的系统化学习资源。${comp.category}域核心能力之一，通过${type === 'article' ? '深度文章' : type === 'video' ? '视频讲解' : type === 'book' ? '书籍阅读' : '课程训练'}掌握关键知识点和实践方法。`,
        difficulty,
        time,
      ]
    );
  }
  console.log(`  ✓ 填充 ${comps.length} 个学习资源`);

  // 获取创建的资源ID
  const [resources] = await POOL.execute('SELECT id, competencyId FROM learningResources ORDER BY id');

  // 为每个用户创建 2 条学习路径
  const pathTemplates = [
    { title: '战略领导力提升计划', desc: '系统提升战略思维和领导能力，覆盖商业模式、战略规划、竞争策略等核心维度', domain: '战略领导力', days: 45 },
    { title: '产品创新能力训练', desc: '从需求分析到创新思维，全方位锻炼产品创新能力', domain: '产品创新', days: 30 },
    { title: '团队管理精进之路', desc: '人才招聘、绩效管理、团队激励的实战学习路径', domain: '团队管理', days: 35 },
    { title: '运营效能提升计划', desc: '流程优化、项目管理、质量管控的系统化学习', domain: '运营管理', days: 40 },
    { title: '财务素养基础课程', desc: '从现金流管理到投资判断，建立管理者必备的财务思维', domain: '财务能力', days: 25 },
    { title: '创业心态修炼', desc: '抗压能力、决策魄力、自我迭代的综合修炼', domain: '创业心态', days: 20 },
  ];

  for (const userId of ALL_USERS) {
    // 根据用户角色选择路径
    let pathsForUser;
    if (userId === USERS.ceo) {
      pathsForUser = [pathTemplates[0], pathTemplates[2]]; // 战略 + 团队
    } else if (userId === USERS.cto) {
      pathsForUser = [pathTemplates[1], pathTemplates[3]]; // 产品 + 运营
    } else {
      pathsForUser = [pathTemplates[2], pathTemplates[4]]; // 团队 + 财务
    }

    for (let pi = 0; pi < pathsForUser.length; pi++) {
      const tpl = pathsForUser[pi];
      const domainCompIds = DOMAINS[tpl.domain];
      const pathResources = resources.filter(r => domainCompIds.includes(r.competencyId));
      const resourceIds = pathResources.map(r => r.id);

      const completedRes = pi === 0 ? Math.floor(resourceIds.length * 0.6) : Math.floor(resourceIds.length * 0.3);
      const status = pi === 0 ? 'active' : 'active';
      const startedAt = new Date();
      startedAt.setDate(startedAt.getDate() - 20);

      const result = await POOL.execute(
        `INSERT INTO learningPaths (userId, title, description, targetCompetencies, resourceIds, totalResources, completedResources, estimatedDays, status, startedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          tpl.title,
          tpl.desc,
          JSON.stringify(domainCompIds),
          JSON.stringify(resourceIds),
          resourceIds.length,
          completedRes,
          tpl.days,
          status,
          startedAt,
        ]
      );

      const pathId = result[0].insertId;

      // 填充学习进度
      for (let ri = 0; ri < resourceIds.length; ri++) {
        const resourceId = resourceIds[ri];
        let progressStatus, progressPercent, timeSpent, startedAtRes, completedAtRes, rating, notes;

        if (ri < completedRes) {
          progressStatus = 'completed';
          progressPercent = 100;
          timeSpent = [30, 45, 60, 90, 120][ri % 5];
          startedAtRes = new Date(startedAt.getTime() + ri * 24 * 3600 * 1000);
          completedAtRes = new Date(startedAtRes.getTime() + 3 * 24 * 3600 * 1000);
          rating = Math.floor(Math.random() * 2) + 4; // 4-5星
          notes = ['很有收获，实践性强。', '内容扎实，推荐学习。', '案例丰富，启发很大。', '系统性很好，值得反复学习。'][ri % 4];
        } else if (ri === completedRes) {
          progressStatus = 'in_progress';
          progressPercent = Math.floor(Math.random() * 50) + 20;
          timeSpent = Math.floor(Math.random() * 30) + 10;
          startedAtRes = new Date();
          completedAtRes = null;
          rating = null;
          notes = null;
        } else {
          progressStatus = 'not_started';
          progressPercent = 0;
          timeSpent = 0;
          startedAtRes = null;
          completedAtRes = null;
          rating = null;
          notes = null;
        }

        await POOL.execute(
          `INSERT INTO userLearningProgress (userId, pathId, resourceId, status, progressPercent, timeSpent, notes, rating, startedAt, completedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, pathId, resourceId, progressStatus, progressPercent, timeSpent, notes, rating, startedAtRes, completedAtRes]
        );
      }
    }
  }
  console.log(`  ✓ 填充 ${ALL_USERS.length * 2} 条学习路径 + 进度记录`);
}

// ============================================================
// 6. 能力快照历史（趋势图数据）
// ============================================================
async function seedCompetencySnapshots() {
  console.log('=== 6. 填充能力快照历史 ===');
  await POOL.execute('DELETE FROM competencySnapshots');

  // 获取每个用户的当前能力分数
  const [userScores] = await POOL.execute('SELECT userId, competencyId, finalScore, level FROM competencyScores ORDER BY userId, competencyId');

  // 为每个用户创建过去6个月的快照（每月1条）
  const now = new Date();
  let totalSnapshots = 0;

  for (const score of userScores) {
    // 当前分数是最终分数，历史分数逐步降低（模拟成长趋势）
    const currentScore = score.finalScore;
    const currentLevel = score.level;

    for (let month = 5; month >= 0; month--) {
      const date = new Date(now.getFullYear(), now.getMonth() - month, 15);
      // 历史分数 = 当前分数 - (月数 * 随机增量)
      const decay = month * (3 + Math.random() * 4);
      const histScore = Math.max(20, Math.min(100, Math.round(currentScore - decay)));
      const histLevel = histScore >= 80 ? 5 : histScore >= 60 ? 4 : histScore >= 40 ? 3 : histScore >= 20 ? 2 : 1;

      await POOL.execute(
        `INSERT INTO competencySnapshots (userId, competencyId, score, level, snapshotDate) VALUES (?, ?, ?, ?, ?)`,
        [score.userId, score.competencyId, histScore, histLevel, date]
      );
      totalSnapshots++;
    }
  }
  console.log(`  ✓ 填充 ${totalSnapshots} 条能力快照（${ALL_USERS.length}用户 × ${userScores.length / ALL_USERS.length}能力 × 6月）`);
}

// ============================================================
// 7. 岗位库 + 岗位能力要求
// ============================================================
async function seedPositions() {
  console.log('=== 7. 填充岗位库和岗位能力要求 ===');
  await POOL.execute('DELETE FROM positionCompetencies');
  await POOL.execute('DELETE FROM positions');

  const positions = [
    { name: 'CEO（首席执行官）', code: 'CEO', cat: 'C-Level', level: 'executive', desc: '负责公司整体战略方向、重大决策和对外代表',
      resp: '["制定公司战略和年度经营计划","重大投融资决策","核心团队建设","董事会汇报","对外合作与公共关系"]',
      compReq: { 1: 5, 2: 5, 3: 4, 4: 4, 5: 4, 11: 4, 16: 5, 17: 4, 26: 4, 27: 4, 32: 5, 36: 5, 37: 5, 38: 4 } },
    { name: 'CTO（首席技术官）', code: 'CTO', cat: 'C-Level', level: 'executive', desc: '负责技术战略、研发管理和技术创新',
      resp: '["技术架构规划","研发团队管理","技术选型和决策","技术风险控制","技术创新和专利"]',
      compReq: { 2: 4, 6: 5, 7: 5, 8: 5, 9: 5, 10: 5, 16: 4, 18: 4, 21: 4, 22: 5, 23: 5, 24: 4, 36: 4, 38: 5 } },
    { name: 'CMO（首席营销官）', code: 'CMO', cat: 'C-Level', level: 'executive', desc: '负责品牌战略、市场推广和用户增长',
      resp: '["品牌战略规划","营销预算管理","渠道策略","用户增长策略","市场调研与分析"]',
      compReq: { 3: 4, 4: 4, 11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 4, 17: 4, 31: 4, 33: 4, 36: 4 } },
    { name: 'COO（首席运营官）', code: 'COO', cat: 'C-Level', level: 'executive', desc: '负责日常运营、流程管理和组织效能',
      resp: '["运营体系搭建","流程优化和管理","供应链管理","质量管控","成本优化"]',
      compReq: { 2: 4, 16: 5, 17: 5, 18: 5, 19: 4, 20: 5, 21: 5, 22: 5, 23: 5, 24: 5, 25: 5, 34: 4 } },
    { name: '产品总监', code: 'PRODUCT_DIR', cat: 'Product', level: 'senior', desc: '负责产品战略、产品规划和产品团队管理',
      resp: '["产品路线图规划","需求管理和优先级","产品团队管理","用户研究和数据分析","竞品分析"]',
      compReq: { 3: 4, 6: 5, 7: 5, 8: 4, 9: 5, 10: 4, 14: 4, 16: 4, 17: 3, 18: 4, 22: 4 } },
    { name: '运营总监', code: 'OPS_DIR', cat: 'Operations', level: 'senior', desc: '负责运营策略制定和执行',
      resp: '["运营策略制定","数据分析和优化","用户运营","活动运营","内容运营"]',
      compReq: { 14: 5, 15: 4, 21: 5, 22: 5, 23: 4, 24: 4, 25: 4, 16: 4, 17: 4 } },
    { name: 'HR总监', code: 'HR_DIR', cat: 'Human Resources', level: 'senior', desc: '负责人才战略、组织发展和企业文化',
      resp: '["人才招聘策略","绩效体系搭建","培训和发展","组织文化建设","薪酬福利体系"]',
      compReq: { 16: 5, 17: 5, 18: 5, 19: 5, 20: 4, 26: 4, 32: 4, 36: 4 } },
    { name: '财务经理', code: 'FIN_MGR', cat: 'Finance', level: 'middle', desc: '负责财务规划、预算管理和成本控制',
      resp: '["财务规划和预算","成本控制","税务筹划","财务分析","内控管理"]',
      compReq: { 21: 4, 25: 5, 26: 5, 27: 4, 28: 5, 29: 5, 30: 5, 24: 4 } },
  ];

  for (const pos of positions) {
    const result = await POOL.execute(
      `INSERT INTO positions (name, code, category, level, description, keyResponsibilities) VALUES (?, ?, ?, ?, ?, ?)`,
      [pos.name, pos.code, pos.cat, pos.level, pos.desc, pos.resp]
    );
    const posId = result[0].insertId;

    for (const [compId, reqLevel] of Object.entries(pos.compReq)) {
      await POOL.execute(
        `INSERT INTO positionCompetencies (positionId, competencyId, importance, requiredLevel, description) VALUES (?, ?, ?, ?, ?)`,
        [posId, parseInt(compId), reqLevel > 3 ? 5 : 4, reqLevel, `${pos.name}需要${reqLevel}级${pos.code}能力`]
      );
    }
  }
  console.log(`  ✓ 填充 ${positions.length} 个岗位 + 能力要求映射`);

  // 更新 userProfile 的 positionId
  await POOL.execute('UPDATE userProfiles SET positionId = 1 WHERE userId = 7');
  await POOL.execute('UPDATE userProfiles SET positionId = 2 WHERE userId = 8');
  await POOL.execute('UPDATE userProfiles SET positionId = 6 WHERE userId = 9');
  console.log('  ✓ 用户画像 positionId 已关联');
}

// ============================================================
// 8. 行业库 + 行业能力基准
// ============================================================
async function seedIndustries() {
  console.log('=== 8. 填充行业库和行业能力基准 ===');
  await POOL.execute('DELETE FROM industryCompetencies');
  await POOL.execute('DELETE FROM industries');

  const industries = [
    { name: '互联网/科技', code: 'INTERNET', desc: '互联网产品设计、开发和运营，包括SaaS、电商、社交等', chars: '["快速迭代","数据驱动","用户至上","创新驱动"]',
      keyComps: { 6: 5, 7: 5, 8: 5, 9: 5, 10: 5, 14: 5, 15: 5, 38: 5 } },
    { name: '电子商务', code: 'ECOMMERCE', desc: '线上零售、跨境电商、社交电商等', chars: '["流量为王","转化优先","供应链效率","客户生命周期"]',
      keyComps: { 11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 21: 5, 25: 5, 34: 5 } },
    { name: '制造业', code: 'MANUFACTURING', desc: '传统制造、智能制造、工业互联网', chars: '["质量为本","成本控制","供应链管理","精益生产"]',
      keyComps: { 21: 5, 22: 5, 23: 5, 24: 5, 25: 5, 34: 5, 28: 4, 30: 4 } },
    { name: '金融服务', code: 'FINANCE', desc: '银行、保险、证券、金融科技', chars: '["风险管控","合规经营","数据安全","客户信任"]',
      keyComps: { 26: 5, 27: 5, 28: 5, 29: 5, 30: 5, 24: 5, 32: 4, 33: 4 } },
    { name: '医疗健康', code: 'HEALTHCARE', desc: '医疗器械、医药、数字医疗、健康服务', chars: '["专业壁垒","合规严格","研发驱动","渠道为王"]',
      keyComps: { 6: 4, 7: 4, 22: 5, 23: 5, 24: 5, 30: 5, 34: 4, 35: 4 } },
    { name: '教育', code: 'EDUCATION', desc: 'K12教育、职业教育、在线教育、教育科技', chars: '["内容为王","口碑驱动","政策敏感","长期主义"]',
      keyComps: { 7: 4, 11: 5, 12: 5, 14: 5, 15: 5, 17: 5, 19: 5, 38: 4 } },
  ];

  for (const ind of industries) {
    const result = await POOL.execute(
      `INSERT INTO industries (name, code, description, keyCharacteristics) VALUES (?, ?, ?, ?)`,
      [ind.name, ind.code, ind.desc, ind.chars]
    );
    const indId = result[0].insertId;

    for (const [compId, importance] of Object.entries(ind.keyComps)) {
      await POOL.execute(
        `INSERT INTO industryCompetencies (industryId, competencyId, importance, description) VALUES (?, ?, ?, ?)`,
        [indId, parseInt(compId), importance, `${ind.name}行业核心能力`]
      );
    }
  }
  console.log(`  ✓ 填充 ${industries.length} 个行业 + 能力基准映射`);

  // 更新 userProfile 的 industryId
  await POOL.execute('UPDATE userProfiles SET industryId = 1 WHERE userId = 7');
  await POOL.execute('UPDATE userProfiles SET industryId = 1 WHERE userId = 8');
  await POOL.execute('UPDATE userProfiles SET industryId = 2 WHERE userId = 9');
  console.log('  ✓ 用户画像 industryId 已关联');
}

// ============================================================
// 9. 公司 + 成员 + 企业评估
// ============================================================
async function seedCompanyAndOrgAssessment() {
  console.log('=== 9. 填充公司和企业评估 ===');
  await POOL.execute('DELETE FROM organizationAssessmentHistory');
  await POOL.execute('DELETE FROM organizationAssessments');
  await POOL.execute('DELETE FROM companyMembers');
  await POOL.execute('DELETE FROM companies');

  // 创建公司
  const [companyResult] = await POOL.execute(
    `INSERT INTO companies (name, industry, industryId, companySize, companyStage, description, ownerId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['焦点学院科技有限公司', '互联网/科技', 1, 'small', 'series_a', '专注于管理者能力评估与发展的教育科技公司', USERS.ceo]
  );
  const companyId = companyResult.insertId;

  // 添加成员
  const members = [
    { userId: USERS.ceo, role: 'owner', position: 'CEO' },
    { userId: USERS.cto, role: 'admin', position: 'CTO' },
    { userId: USERS.manager, role: 'member', position: '运营经理' },
  ];
  for (const m of members) {
    await POOL.execute(
      `INSERT INTO companyMembers (companyId, userId, role, position) VALUES (?, ?, ?, ?)`,
      [companyId, m.userId, m.role, m.position]
    );
  }
  console.log('  ✓ 创建公司 + 3 个成员');

  // 企业评估（8域分数）
  const orgScores = {
    [USERS.ceo]: { s: 78, o: 72, og: 75, i: 80, detailed: { '战略领导力': 78, '产品创新': 75, '市场营销': 70, '团队管理': 75, '运营管理': 72, '财务能力': 68, '资源整合': 80, '创业心态': 82 } },
    [USERS.cto]: { s: 70, o: 75, og: 72, i: 85, detailed: { '战略领导力': 70, '产品创新': 85, '市场营销': 65, '团队管理': 72, '运营管理': 75, '财务能力': 60, '资源整合': 68, '创业心态': 78 } },
    [USERS.manager]: { s: 65, o: 78, og: 70, i: 68, detailed: { '战略领导力': 65, '产品创新': 68, '市场营销': 72, '团队管理': 70, '运营管理': 78, '财务能力': 65, '资源整合': 62, '创业心态': 70 } },
  };

  for (const [userId, scores] of Object.entries(orgScores)) {
    await POOL.execute(
      `INSERT INTO organizationAssessments (userId, companyId, strategyScore, operationScore, organizationScore, innovationScore, detailedScores) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [parseInt(userId), companyId, scores.s, scores.o, scores.og, scores.i, JSON.stringify(scores.detailed)]
    );

    // 历史评估（3个月前）
    const histDate = new Date();
    histDate.setMonth(histDate.getMonth() - 3);
    await POOL.execute(
      `INSERT INTO organizationAssessmentHistory (userId, strategyScore, operationScore, organizationScore, innovationScore, assessmentDate) VALUES (?, ?, ?, ?, ?, ?)`,
      [parseInt(userId), Math.max(20, scores.s - 8), Math.max(20, scores.o - 6), Math.max(20, scores.og - 7), Math.max(20, scores.i - 5), histDate]
    );

    // 6个月前
    const histDate2 = new Date();
    histDate2.setMonth(histDate2.getMonth() - 6);
    await POOL.execute(
      `INSERT INTO organizationAssessmentHistory (userId, strategyScore, operationScore, organizationScore, innovationScore, assessmentDate) VALUES (?, ?, ?, ?, ?, ?)`,
      [parseInt(userId), Math.max(20, scores.s - 15), Math.max(20, scores.o - 12), Math.max(20, scores.og - 14), Math.max(20, scores.i - 10), histDate2]
    );
  }
  console.log('  ✓ 填充 3 用户的企业评估 + 历史记录');
}

// ============================================================
// 10. 知识库 (Wiki)
// ============================================================
async function seedWiki() {
  console.log('=== 10. 填充知识库 ===');
  await POOL.execute('DELETE FROM wikiArticles');
  await POOL.execute('DELETE FROM wikiCategories');

  const categories = [
    { name: '能力发展', slug: 'competency-development', desc: '管理者核心能力提升方法论和实践指南', order: 1 },
    { name: '管理方法论', slug: 'management-methodology', desc: '经典和现代管理理论、框架和工具', order: 2 },
    { name: '行业洞察', slug: 'industry-insights', desc: '各行业管理趋势、最佳实践和案例分析', order: 3 },
    { name: '工具技巧', slug: 'tools-tips', desc: '实用管理工具、模板和技巧分享', order: 4 },
  ];

  const catIds = [];
  for (const cat of categories) {
    const [result] = await POOL.execute(
      `INSERT INTO wikiCategories (name, slug, description, sortOrder) VALUES (?, ?, ?, ?)`,
      [cat.name, cat.slug, cat.desc, cat.order]
    );
    catIds.push(result.insertId);
  }

  const articles = [
    // 能力发展
    { cat: 0, title: 'L1-L5能力等级体系详解', slug: 'l1-l5-competency-levels', summary: '深入了解能力评估的5级标准及各级行为锚定', tags: '能力评估,等级体系,L1-L5', views: 1280,
      content: '## L1-L5 能力等级体系\n\nFocus College 采用国际通行的5级能力等级体系...\n\n### L1 初步认知 (0-20分)\n了解基本概念，偶尔在指导下应用。\n\n### L2 基础实践 (21-40分)\n能在常见场景下独立应用，效果一般。\n\n### L3 熟练掌握 (41-60分)\n能在多数场景下有效应用，取得良好效果。\n\n### L4 精通专业 (61-80分)\n能在复杂场景下灵活应用，持续产出优秀成果。\n\n### L5 行业专家 (81-100分)\n能创新方法论，指导他人，产生行业影响力。' },
    { cat: 0, title: '如何制定个人能力发展计划', slug: 'personal-development-plan', summary: '基于评估结果制定科学的个人发展计划', tags: '发展计划,IDP,能力提升', views: 956,
      content: '## 制定个人能力发展计划\n\n### 第一步：明确现状\n通过能力评估了解自己在8个维度40项能力上的当前水平。\n\n### 第二步：设定目标\n基于岗位要求和行业基准，确定优先发展的3-5项核心能力。\n\n### 第三步：选择路径\n选择适合的学习资源和发展活动...\n\n### 第四步：执行和反馈\n定期评估进展，调整计划。' },
    { cat: 0, title: '4源加权评分模型解析', slug: 'four-source-scoring-model', summary: '了解问卷40%、AI30%、自评20%、证据10%的评分逻辑', tags: '评分模型,4源加权,评分权重', views: 743,
      content: '## 4源加权评分模型\n\nFocus College 采用多维度评分系统，综合4个来源的评估数据：\n\n| 来源 | 权重 | 说明 |\n|------|------|------|\n| 问卷答题 | 40% | 标准化评估，客观性最强 |\n| AI分析 | 30% | 基于工作资料的智能分析 |\n| 自我评估 | 20% | 个人认知和反思 |\n| 证据上传 | 10% | 实际工作成果验证 |\n\n综合得分 = 问卷×0.4 + AI×0.3 + 自评×0.2 + 证据×0.1' },

    // 管理方法论
    { cat: 1, title: 'OKR目标管理法实战指南', slug: 'okr-practical-guide', summary: '从Google到字节跳动，OKR如何驱动高绩效团队', tags: 'OKR,目标管理,绩效', views: 2150,
      content: '## OKR实战指南\n\n### 什么是OKR\nOKR (Objectives and Key Results) 是一种目标管理框架...\n\n### OKR vs KPI\n| 维度 | OKR | KPI |\n|------|-----|-----|\n| 导向 | 成长导向 | 考核导向 |\n| 设定 | 自下而上+自上而下 | 自上而下 |\n| 透明 | 全员可见 | 层级可见 |\n\n### 制定好的OKR\n- O：有挑战性、有激励性\n- KR：可衡量、有时限\n- 每季度3-5个O，每个O 3-5个KR' },
    { cat: 1, title: 'RACI矩阵：职责分配的利器', slug: 'raci-matrix', summary: '用RACI模型明确团队角色和职责，消除推诿', tags: 'RACI,职责分配,项目管理', views: 1320,
      content: '## RACI矩阵\n\nRACI是项目管理中常用的职责分配矩阵：\n\n- **R** (Responsible) 执行者：实际完成任务的人\n- **A** (Accountable) 负责人：对结果负最终责任（每任务仅1人）\n- **C** (Consulted) 咨询者：需要征求意见的人\n- **I** (Informed) 知情者：需要被通知的人\n\n### 使用步骤\n1. 列出所有任务和里程碑\n2. 列出所有角色/人员\n3. 为每个任务分配RACI\n4. 检查：每任务至少1个R，仅1个A' },
    { cat: 1, title: '敏捷管理：Scrum框架精要', slug: 'scrum-framework-essentials', summary: 'Scrum三大角色、三个 artifacts、五个事件的完整指南', tags: 'Scrum,敏捷,项目管理', views: 1870,
      content: '## Scrum框架精要\n\n### 三大角色\n- Product Owner：产品方向和优先级\n- Scrum Master：流程保障和障碍清除\n- Development Team：自组织交付团队\n\n### 三个 Artifacts\n- Product Backlog：产品需求列表\n- Sprint Backlog：迭代任务列表\n- Increment：可交付增量\n\n### 五个事件\n- Sprint Planning：迭代规划\n- Daily Scrum：每日站会\n- Sprint Review：迭代评审\n- Sprint Retrospective：迭代回顾\n- Sprint：迭代周期（1-4周）' },

    // 行业洞察
    { cat: 2, title: '2024年互联网行业管理趋势报告', slug: '2024-internet-management-trends', summary: 'AI驱动管理、远程协作、扁平化组织的最新趋势', tags: '行业趋势,互联网,管理创新', views: 3210,
      content: '## 2024互联网管理趋势\n\n### 趋势1：AI辅助决策\n越来越多企业用AI分析运营数据，辅助管理决策。Gartner预测2025年75%的管理决策将有AI参与。\n\n### 趋势2：远程优先组织\nGitLab、Airbnb等公司全面拥抱远程办公，管理者需要新的协作和绩效管理模式。\n\n### 趋势3：扁平化加速\n字节跳动、Meta等公司减少管理层级，提升决策效率。\n\n### 趋势4：OKR+持续反馈\n传统年度考核正在被持续反馈取代，实时OKR追踪成为标配。' },
    { cat: 2, title: '制造业数字化转型的管理挑战', slug: 'manufacturing-digital-transformation', summary: '工业4.0时代制造业管理者的能力要求变化', tags: '制造业,数字化转型,工业4.0', views: 987,
      content: '## 制造业数字化转型的管理挑战\n\n### 从经验驱动到数据驱动\n传统制造业依赖老师傅经验，数字化转型要求管理者具备数据分析能力。\n\n### 供应链可视化\n实时供应链监控成为标配，管理者需要理解端到端供应链。\n\n### 人机协作\n自动化设备与人员的协作模式需要新的管理方法。\n\n### 合规与安全\n数据安全、网络安全成为制造业管理者的新课题。' },
    { cat: 2, title: '创业公司管理者的3个关键能力', slug: 'startup-manager-key-competencies', summary: '资源有限环境下，创业管理者最需要什么', tags: '创业,管理能力,创业心态', views: 1543,
      content: '## 创业管理者的3个关键能力\n\n### 1. 决策魄力\n创业环境下信息不完整、时间紧迫。优秀创业者能在70%信息时就做出决策，而非等到100%。\n\n### 2. 资源整合\n用有限的资源撬动最大价值。股权换人才、技术换渠道、品牌换合作——创业管理者需要"空手套白狼"的能力。\n\n### 3. 抗压能力\n创业是马拉松。面对资金压力、团队动荡、市场变化，保持心理健康和决策质量是核心竞争力。' },

    // 工具技巧
    { cat: 3, title: '10个高效管理工具推荐', slug: '10-management-tools', summary: '从Notion到飞书，管理者必备的工具箱', tags: '工具,效率,管理工具', views: 2870,
      content: '## 10个高效管理工具\n\n| 工具 | 用途 | 推荐指数 |\n|------|------|----------|\n| Notion | 知识管理 | ★★★★★ |\n| 飞书 | 协作沟通 | ★★★★★ |\n| Figma | 设计协作 | ★★★★☆ |\n| Tableau | 数据分析 | ★★★★☆ |\n| Miro | 白板协作 | ★★★★☆ |\n| Jira | 项目管理 | ★★★★☆ |\n| Lark | OKR管理 | ★★★★☆ |\n| Grammarly | 写作辅助 | ★★★☆☆ |\n| Calendly | 日程管理 | ★★★☆☆ |\n| 1Password | 密码管理 | ★★★☆☆ |' },
    { cat: 3, title: '1-on-1会议模板与最佳实践', slug: 'one-on-one-meeting-template', summary: '让一对一会议不再流于形式的实战模板', tags: '1-on-1,会议模板,团队管理', views: 1950,
      content: '## 1-on-1会议模板\n\n### 会议频率\n每周或每两周1次，每次30-45分钟。\n\n### 会议结构\n1. **破冰**（5分钟）：个人状态、生活近况\n2. **回顾**（10分钟）：上次1-on-1的行动项进展\n3. **讨论**（15分钟）：当前挑战、障碍、想法\n4. **反馈**（10分钟）：双向反馈\n5. **行动**（5分钟）：明确下次之前的行动项\n\n### 最佳实践\n- 让员工主导议程\n- 聚焦成长而非考核\n- 记录行动项并跟踪\n- 保持私密和安全的空间' },
    { cat: 3, title: '数据驱动决策的5个层次', slug: 'data-driven-decision-5-levels', summary: '从数据收集到数据文化的进阶之路', tags: '数据驱动,决策,数据分析', views: 1120,
      content: '## 数据驱动决策的5个层次\n\n### Level 1：数据收集\n搭建基础数据采集体系，确保关键指标可追踪。\n\n### Level 2：数据可视化\n将数据转化为直观图表和仪表盘，让管理者快速了解状况。\n\n### Level 3：数据分析\n从数据中发现规律和异常，回答"为什么"的问题。\n\n### Level 4：预测建模\n基于历史数据预测未来趋势，支持前瞻性决策。\n\n### Level 5：数据文化\n全员数据素养，每个决策都有数据支撑，形成数据驱动的组织文化。' },
  ];

  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    await POOL.execute(
      `INSERT INTO wikiArticles (categoryId, title, slug, content, summary, tags, sortOrder, viewCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [catIds[a.cat], a.title, a.slug, a.content, a.summary, a.tags, i + 1, a.views]
    );
  }
  console.log(`  ✓ 填充 ${categories.length} 个分类 + ${articles.length} 篇文章`);
}

// ============================================================
// 11. 问题场景 (scenarios)
// ============================================================
async function seedScenarios() {
  console.log('=== 11. 填充问题场景 ===');
  await POOL.execute('DELETE FROM scenarios');

  const scenarios = [
    { userId: USERS.ceo, title: '增长瓶颈如何突破', desc: '公司过去3个季度增长放缓，从40%降到15%。核心产品市场占有率已达25%，增量空间有限。团队士气受到影响，核心骨干开始流失。', stage: 'series_a', status: 'analyzed',
      analysis: '## 问题诊断\n\n增长放缓的核心原因：\n1. **市场天花板效应**：核心产品在目标市场渗透率已高\n2. **第二曲线缺失**：没有成功的新产品/新市场补充增长\n3. **组织能力瓶颈**：团队规模从30人扩张到80人，管理复杂度超出当前组织能力\n\n## 建议\n1. 启动第二增长曲线探索（3个月内验证2-3个新方向）\n2. 引入经验丰富的VP级人才补齐管理短板\n3. 将KPI从"增长率"调整为"健康度指标"（NPS+留存率+人效）',
      suggestions: '## 行动建议\n\n### 短期（1个月）\n- 召开战略共识会，对齐团队对增长放缓的认知\n- 启动核心骨干保留计划（股权激励+职业发展）\n\n### 中期（3个月）\n- 确定并验证1-2个第二曲线方向\n- 招聘VP级管理人才\n\n### 长期（6个月）\n- 调整组织架构适配新业务\n- 建立创新孵化机制',
      comps: '[1, 2, 3, 15, 16, 17, 37]' },
    { userId: USERS.ceo, title: '融资节奏与估值管理', desc: '公司计划6个月后启动B轮融资。当前月收入200万，增长率15%。市场上同类公司估值在3-5亿之间。如何最大化估值？', stage: 'series_a', status: 'analyzed',
      analysis: '## 问题诊断\n\nB轮估值的核心影响因素：\n1. **增长率**：15%偏低，投资人期望25%+\n2. **单位经济模型**：需验证LTV/CAC > 3\n3. **市场天花板**：需展示TAM足够大\n4. **团队完整性**：C-level是否齐全\n\n## 建议\n1. 融资前6个月集中提升增长率到25%+\n2. 优化单位经济模型，确保CAC回收周期<12个月\n3. 准备好市场规模的叙事逻辑\n4. 补齐CFO和CMO',
      suggestions: '## 行动建议\n\n### 融资前6个月\n- 月增长率提升到25%（市场扩张+产品升级）\n- 招聘CFO完善财务体系\n- 招聘CMO建立品牌势能\n\n### 融资前3个月\n- 准备Data Room（财务、运营、法务全套文件）\n- 确定目标投资人名单（15-20家）\n- 准备BP和Financial Model\n\n### 融资执行\n- 集中2周路演\n- 制造竞争感，争取多Term Sheet',
      comps: '[1, 3, 26, 27, 29, 32, 37]' },
    { userId: USERS.cto, title: '技术债与业务需求的平衡', desc: '技术团队一直在赶业务需求，积累了大量技术债。系统稳定性下降（最近1个月2次P1事故），开发效率也明显降低。但业务方不理解技术债的紧迫性。', stage: 'series_a', status: 'analyzed',
      analysis: '## 问题诊断\n\n技术债已经影响到业务连续性：\n1. **稳定性风险**：2次P1事故说明系统已到临界点\n2. **效率下降**：技术债导致开发速度变慢，形成恶性循环\n3. **沟通断层**：技术团队和业务方缺乏共同语言\n\n## 建议\n1. 将技术债"翻译"为业务影响（停机成本、开发延期、客户流失风险）\n2. 实施7/3资源分配：70%业务需求+30%技术债\n3. 建立技术债看板，可视化追踪',
      suggestions: '## 行动建议\n\n### 第1周\n- 量化技术债的业务影响（停机时长×收入/小时）\n- 向CEO和业务负责人做技术债汇报\n\n### 第2-4周\n- 启动7/3资源分配机制\n- 优先处理影响稳定性的Top 5技术债\n- 建立技术债看板（Jira/飞书）\n\n### 持续\n- 每月技术债回顾会\n- 新功能开发强制预留20%重构时间',
      comps: '[2, 7, 8, 21, 22, 23, 24, 18]' },
    { userId: USERS.cto, title: '团队规模化后的架构挑战', desc: '技术团队从10人扩张到40人，原来的单体架构开始难以支撑多团队并行开发。需要决策：微服务化还是模块化单体？', stage: 'series_a', status: 'analyzed',
      analysis: '## 问题诊断\n\n40人团队+单体架构的典型问题：\n1. **代码冲突频繁**：多团队修改同一代码库\n2. **部署耦合**：一个团队的功能必须等待另一个团队\n3. **技术栈统一困难**：不同团队想用不同技术\n\n## 微服务 vs 模块化单体\n| 维度 | 微服务 | 模块化单体 |\n|------|--------|------------|\n| 团队自治 | 高 | 中 |\n| 运维复杂度 | 高 | 低 |\n| 性能 | 网络开销 | 最优 |\n| 适用规模 | 50+人 | 10-50人 |\n\n## 建议\n40人团队建议先做**模块化单体**，等团队规模到50+再考虑微服务。',
      suggestions: '## 行动建议\n\n### 阶段1：模块化重构（2个月）\n- 按业务域拆分模块（订单、用户、支付等）\n- 每个模块独立包，通过接口通信\n- 建立模块owner制度\n\n### 阶段2：渐进式拆分（按需）\n- 当某个模块需要独立扩展时再拆为微服务\n- 优先拆分高流量/高变更频率的模块\n\n### 注意事项\n- 不要为了微服务而微服务\n- DevOps能力是微服务的前提',
      comps: '[2, 7, 8, 10, 21, 22, 16]' },
    { userId: USERS.manager, title: '跨部门协作效率低', desc: '作为运营经理，需要频繁与产品、技术、市场部门协作。但各部门优先级不同，沟通成本高，项目经常延期。', stage: 'seed', status: 'analyzed',
      analysis: '## 问题诊断\n\n跨部门协作低效的根因：\n1. **目标不对齐**：各部门KPI不同，优先级冲突\n2. **信息不透明**：各部门计划不共享\n3. **流程缺失**：没有标准化的跨部门协作流程\n4. **权力不足**：运营经理没有跨部门调度权\n\n## 建议\n1. 推动建立公司级OKR，确保部门目标对齐\n2. 建立跨部门项目机制（项目制+虚拟团队）\n3. 引入项目管理工具统一可视化',
      suggestions: '## 行动建议\n\n### 短期\n- 与各部门负责人1-on-1，了解他们的优先级和痛点\n- 提出跨部门协作SOP提案\n\n### 中期\n- 推动公司级OKR对齐会（每季度）\n- 建立跨部门项目看板（飞书/Jira）\n- 设立跨部门项目PMO角色\n\n### 沟通策略\n- 用数据说话：量化协作低效的成本\n- 从CEO处获得跨部门协作的授权',
      comps: '[16, 17, 18, 19, 20, 21, 22]' },
    { userId: USERS.manager, title: '新员工培养体系搭建', desc: '团队快速扩张，近3个月入职8名新员工。但没有系统化的培养体系，新员工上手慢，前3个月离职率25%。', stage: 'seed', status: 'analyzed',
      analysis: '## 问题诊断\n\n新员工离职率25%远超行业平均（10-15%），核心问题：\n1. **入职体验差**：没有标准化的onboarding流程\n2. **导师缺失**：新员工没有明确的指导人\n3. **期望不匹配**：面试承诺与实际工作差距大\n4. **融入困难**：缺乏团队文化建设和社交活动\n\n## 建议\n建立"30-60-90天"新员工培养体系',
      suggestions: '## 行动建议\n\n### 入职前\n- 准备工位、设备、账号\n- 发送入职指南（公司文化、团队介绍、第一周计划）\n\n### 第1-30天：融入期\n- 指定1对1导师\n- 第1周：公司文化+产品学习\n- 第2周：团队协作+工具使用\n- 第3-4周：简单任务上手\n- 30天check-in：了解适应情况\n\n### 第31-60天：上手期\n- 独立承担模块工作\n- 每周1-on-1\n- 60天评估：能力匹配度\n\n### 第61-90天：产出期\n- 独立负责项目\n- 设定季度目标\n- 90天转正评估',
      comps: '[16, 17, 18, 19, 21, 22]' },
  ];

  for (const s of scenarios) {
    await POOL.execute(
      `INSERT INTO scenarios (userId, title, description, companyStage, analysis, suggestions, relatedCompetencies, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.userId, s.title, s.desc, s.stage, s.analysis, s.suggestions, s.comps, s.status]
    );
  }
  console.log(`  ✓ 填充 ${scenarios.length} 个问题场景`);
}

// ============================================================
// 12. 更新日志 + 反馈
// ============================================================
async function seedChangelogsAndFeedback() {
  console.log('=== 12. 填充更新日志和反馈 ===');
  await POOL.execute('DELETE FROM changelogs');
  await POOL.execute('DELETE FROM feedbacks');

  const changelogs = [
    { ver: '2.3.0', title: '能力模型全面升级：8域40能力体系', type: 'feature', date: -7,
      content: '## v2.3.0 重大更新\n\n### 新功能\n- 🎯 **8域40能力体系**：从原来的4维度升级为8个能力域40项能力\n- 📊 **4源加权评分**：问卷40% + AI 30% + 自评20% + 证据10%\n- 🏢 **企业8域雷达图**：企业能力看板升级为8轴雷达图\n- 📚 **L1-L5行为锚定**：每项能力配备L1-L5级行为标准\n\n### 优化\n- 能力看板支持8域分组展示\n- 缺口分析对齐DB 8域标准\n- 学习路径推荐更精准\n\n### 修复\n- 修复评估结果页面字段名不一致问题\n- 修复企业评估4维度限制' },
    { ver: '2.2.0', title: '挑战系统上线', type: 'feature', date: -30,
      content: '## v2.2.0 挑战系统\n\n### 新功能\n- ⚔️ **每日挑战**：每天一道管理情景题\n- 🏆 **积分排行**：答题积分+连续打卡+排行榜\n- 🎖️ **成就系统**：10+挑战成就可解锁\n- 📈 **能力趋势图**：可视化能力成长轨迹' },
    { ver: '2.1.0', title: '学习路径系统', type: 'feature', date: -60,
      content: '## v2.1.0 学习路径\n\n### 新功能\n- 🛤️ **AI推荐学习路径**：基于能力缺口自动生成\n- 📖 **学习资源库**：40+资源覆盖全部能力\n- ✅ **进度追踪**：可视化学习进度和完成率' },
    { ver: '2.0.0', title: 'Focus College 2.0 全面重构', type: 'feature', date: -90,
      content: '## v2.0.0 重大重构\n\n### 架构升级\n- 前端迁移到 React + TypeScript\n- 后端迁移到 tRPC + Drizzle ORM\n- 数据库迁移到 MySQL\n\n### 新功能\n- 用户画像系统\n- 能力评估问卷\n- AI能力分析\n- 个人能力看板' },
    { ver: '1.1.0', title: '体验优化与Bug修复', type: 'improvement', date: -120,
      content: '## v1.1.0 优化\n\n### 改进\n- 评估问卷加载速度提升50%\n- 移动端适配优化\n- 登录流程简化' },
  ];

  for (const c of changelogs) {
    const date = new Date();
    date.setDate(date.getDate() + c.date);
    await POOL.execute(
      `INSERT INTO changelogs (version, title, content, type, publishedAt) VALUES (?, ?, ?, ?, ?)`,
      [c.ver, c.title, c.content, c.type, date]
    );
  }

  const feedbacks = [
    { userId: USERS.ceo, type: 'feature', title: '希望能增加团队对比功能', content: '如果能让我看到团队成员的能力对比，会非常有助于团队建设决策。', status: 'reviewed' },
    { userId: USERS.cto, type: 'feature', title: 'API能力评估希望支持代码片段', content: '作为技术管理者，希望能上传代码片段让AI评估技术能力，而不仅仅是文档。', status: 'pending' },
    { userId: USERS.manager, type: 'general', title: '界面体验很好，但希望增加导出功能', content: '评估结果和缺口分析如果能导出PDF，方便在团队会议中使用。', status: 'reviewed' },
    { userId: USERS.ceo, type: 'bug', title: '企业评估8域雷达图偶现闪烁', content: '在企业能力看板页面，8域雷达图在数据加载时偶尔会闪烁。', status: 'resolved' },
  ];

  for (const f of feedbacks) {
    await POOL.execute(
      `INSERT INTO feedbacks (userId, type, title, content, status) VALUES (?, ?, ?, ?, ?)`,
      [f.userId, f.type, f.title, f.content, f.status]
    );
  }

  console.log(`  ✓ 填充 ${changelogs.length} 条更新日志 + ${feedbacks.length} 条反馈`);
}

// ============================================================
// 主函数
// ============================================================
async function main() {
  console.log('🚀 开始填充综合种子数据...\n');

  try {
    await seedChallenges();
    await seedChallengeAchievements();
    await seedAchievements();
    await seedUserChallenges();
    await seedLearningPaths();
    await seedCompetencySnapshots();
    await seedPositions();
    await seedIndustries();
    await seedCompanyAndOrgAssessment();
    await seedWiki();
    await seedScenarios();
    await seedChangelogsAndFeedback();

    console.log('\n✅ 所有种子数据填充完成！\n');

    // 统计最终数据量
    const [counts] = await POOL.execute(`
      SELECT 'challenges' as tbl, COUNT(*) as cnt FROM challenges
      UNION ALL SELECT 'challengeAchievements', COUNT(*) FROM challengeAchievements
      UNION ALL SELECT 'achievements', COUNT(*) FROM achievements
      UNION ALL SELECT 'userChallenges', COUNT(*) FROM userChallenges
      UNION ALL SELECT 'userPoints', COUNT(*) FROM userPoints
      UNION ALL SELECT 'dailyChallenges', COUNT(*) FROM dailyChallenges
      UNION ALL SELECT 'userChallengeAchievements', COUNT(*) FROM userChallengeAchievements
      UNION ALL SELECT 'userAchievements', COUNT(*) FROM userAchievements
      UNION ALL SELECT 'learningResources', COUNT(*) FROM learningResources
      UNION ALL SELECT 'learningPaths', COUNT(*) FROM learningPaths
      UNION ALL SELECT 'userLearningProgress', COUNT(*) FROM userLearningProgress
      UNION ALL SELECT 'competencySnapshots', COUNT(*) FROM competencySnapshots
      UNION ALL SELECT 'positions', COUNT(*) FROM positions
      UNION ALL SELECT 'positionCompetencies', COUNT(*) FROM positionCompetencies
      UNION ALL SELECT 'industries', COUNT(*) FROM industries
      UNION ALL SELECT 'industryCompetencies', COUNT(*) FROM industryCompetencies
      UNION ALL SELECT 'companies', COUNT(*) FROM companies
      UNION ALL SELECT 'companyMembers', COUNT(*) FROM companyMembers
      UNION ALL SELECT 'organizationAssessments', COUNT(*) FROM organizationAssessments
      UNION ALL SELECT 'organizationAssessmentHistory', COUNT(*) FROM organizationAssessmentHistory
      UNION ALL SELECT 'wikiCategories', COUNT(*) FROM wikiCategories
      UNION ALL SELECT 'wikiArticles', COUNT(*) FROM wikiArticles
      UNION ALL SELECT 'scenarios', COUNT(*) FROM scenarios
      UNION ALL SELECT 'changelogs', COUNT(*) FROM changelogs
      UNION ALL SELECT 'feedbacks', COUNT(*) FROM feedbacks
    `);

    console.log('=== 最终数据统计 ===');
    for (const row of counts) {
      const bar = '█'.repeat(Math.min(40, Math.ceil(row.cnt / 5)));
      console.log(`  ${row.tbl.padEnd(35)} ${String(row.cnt).padStart(5)} ${bar}`);
    }
  } catch (err) {
    console.error('❌ 种子数据填充失败:', err);
    process.exit(1);
  } finally {
    await POOL.end();
  }
}

main();
