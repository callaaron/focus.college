# 知识与能力图谱系统 - 开发任务清单

## 项目概述
专注于管理和企业运营领域的个人能力评估和成长追踪系统

## Phase 1: 数据库Schema设计和迁移
- [x] 设计用户画像表（userProfiles）
- [x] 设计能力域表（competencyDomains）
- [x] 设计能力表（competencies）
- [x] 设计能力评分表（competencyScores）
- [x] 设计能力快照表（competencySnapshots）
- [x] 设计问题场景表（scenarios）
- [x] 设计答题会话表（assessmentSessions）
- [x] 设计用户答题记录表（userAnswers）
- [x] 设计行业库表（industries）
- [x] 设计职位库表（positions）
- [x] 设计行业专有能力表（industryCompetencies）
- [x] 设计职位专有能力表（positionCompetencies）
- [x] 设计学习资源表（learningResources）
- [x] 设计公司表（companies）
- [x] 设计公司成员表（companyMembers）
- [x] 设计演示账户表（demoAccounts）
- [x] 设计演示数据分析表（demoAccountAnalytics）
- [x] 设计Wiki表（wikiCategories, wikiArticles）
- [x] 执行数据库迁移（pnpm db:push）

## Phase 2: 后端API开发
- [ ] 实现用户画像管理API
- [ ] 实现能力数据查询API
- [ ] 实现能力评分API
- [ ] 实现问题场景提交和AI分析API
- [ ] 实现问卷评估API
- [ ] 实现成长历程API
- [ ] 实现综合分析报告API
- [ ] 实现学习路径推荐API
- [ ] 实现公司管理API
- [ ] 实现演示账户API
- [ ] 实现Wiki内容API
- [ ] 实现行业和职位库管理API

## Phase 3: 前端核心页面开发
- [ ] 设计和实现首页（Home）
- [ ] 实现Dashboard布局
- [ ] 实现用户画像配置页面（Onboarding）
- [ ] 实现能力看板页面（Competencies）
- [ ] 实现能力详情页面（CompetencyDetail）
- [ ] 实现今日挑战页面（Challenge）
- [ ] 实现综合分析页面（ComprehensiveAnalysis）
- [ ] 实现成长历程页面（Growth）
- [ ] 实现问卷评估页面（AssessmentQuestionnaire）
- [ ] 实现学习路径页面（LearningPath）

## Phase 4: 企业功能开发
- [ ] 实现公司管理页面（CompanyManagement）
- [ ] 实现公司Dashboard（CompanyDashboard）
- [ ] 实现企业能力评估页面（CompanyAssessmentDashboard）
- [ ] 实现员工管理页面
- [ ] 实现团队能力对比功能

## Phase 5: 演示账户系统
- [ ] 实现演示账户管理后台
- [ ] 创建演示数据预填充脚本
- [ ] 实现首页演示账户展示
- [ ] 实现一键登录功能
- [ ] 实现演示账户权限限制
- [ ] 实现演示数据统计分析

## Phase 6: Wiki功能介绍系统
- [ ] 实现Wiki页面
- [ ] 编写功能介绍内容
- [ ] 实现搜索功能
- [ ] 实现Markdown渲染

## Phase 7: 管理员功能
- [ ] 实现管理员Dashboard
- [ ] 实现用户管理页面
- [ ] 实现行业库管理页面
- [ ] 实现职位库管理页面
- [ ] 实现能力库管理页面

## Phase 8: 数据预填充
- [ ] 创建35个能力数据（包含L1-L5标准和案例）
- [ ] 创建行业库数据（10个行业）
- [ ] 创建职位库数据（20个职位）
- [ ] 创建问卷题库（49道题）
- [ ] 创建学习资源数据
- [ ] 创建Wiki内容数据
- [ ] 创建3个演示账户数据

## Phase 9: 测试和优化
- [ ] 编写核心功能单元测试
- [ ] 测试用户注册和画像配置流程
- [ ] 测试能力评估流程
- [ ] 测试AI分析功能
- [ ] 测试演示账户功能
- [ ] 优化性能和加载速度
- [ ] 优化移动端体验

## Phase 10: 部署和交付
- [ ] 保存最终检查点
- [ ] 部署到生产环境
- [ ] 验证所有功能正常运行
- [ ] 向用户交付项目

## 已知问题
（待发现和记录）

## 未来优化
- 首页加载性能优化（懒加载、图片压缩）
- 成长报告PDF导出功能
- 定期回顾提醒功能
- A/B测试系统
