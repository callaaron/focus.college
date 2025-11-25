-- 职位库数据
-- 常见管理岗位分类

DELETE FROM positions;

-- ============ 高管层级 (Executive) ============
INSERT INTO positions (name, code, category, level, description, keyResponsibilities) VALUES 
('首席执行官/CEO', 'ceo', '高管', 'executive', '公司最高管理者', '战略制定、整体运营、董事会汇报'),
('总裁/总经理', 'president', '高管', 'executive', '全面负责公司运营', '战略执行、业务管理、团队领导'),
('首席运营官/COO', 'coo', '高管', 'executive', '负责公司运营管理', '运营优化、流程管理、执行监督'),
('首席财务官/CFO', 'cfo', '高管', 'executive', '负责财务战略与管理', '财务规划、资金管理、风险控制'),
('首席技术官/CTO', 'cto', '高管', 'executive', '负责技术战略与研发', '技术规划、研发管理、技术创新'),
('首席产品官/CPO', 'cpo', '高管', 'executive', '负责产品战略与体系', '产品战略、产品线管理、用户体验'),
('首席营销官/CMO', 'cmo', '高管', 'executive', '负责市场营销战略', '品牌建设、市场推广、客户增长'),
('首席人力资源官/CHRO', 'chro', '高管', 'executive', '负责人力资源战略', '人才战略、组织发展、文化建设'),
('副总裁/VP', 'vp', '高管', 'executive', '分管某一业务板块', '战略参与、业务管理、跨部门协调');

-- ============ 高级管理层 (Senior) ============
INSERT INTO positions (name, code, category, level, description, keyResponsibilities) VALUES 
('事业部总经理', 'bu_gm', '业务管理', 'senior', '独立事业部负责人', '业务战略、P&L管理、团队建设'),
('研发总监', 'rd_director', '研发技术', 'senior', '研发团队负责人', '技术规划、项目管理、团队培养'),
('产品总监', 'product_director', '产品管理', 'senior', '产品线负责人', '产品策略、roadmap规划、用户研究'),
('销售总监', 'sales_director', '销售管理', 'senior', '销售团队负责人', '销售策略、目标达成、客户管理'),
('市场总监', 'marketing_director', '市场营销', 'senior', '市场部门负责人', '品牌策略、市场推广、数据分析'),
('运营总监', 'operations_director', '运营管理', 'senior', '运营体系负责人', '运营策略、流程优化、效率提升'),
('财务总监', 'finance_director', '财务管理', 'senior', '财务部门负责人', '财务计划、预算控制、报表分析'),
('人力资源总监', 'hr_director', '人力资源', 'senior', 'HR部门负责人', '人才招聘、绩效管理、员工关系'),
('供应链总监', 'supply_director', '供应链', 'senior', '供应链负责人', '采购管理、库存优化、物流协调');

-- ============ 中层管理 (Middle) ============
INSERT INTO positions (name, code, category, level, description, keyResponsibilities) VALUES 
('高级产品经理', 'senior_pm', '产品管理', 'middle', '资深产品负责人', '产品规划、需求分析、项目推进'),
('研发经理', 'rd_manager', '研发技术', 'middle', '研发团队管理', '技术架构、代码质量、团队协作'),
('项目经理', 'project_manager', '项目管理', 'middle', '项目执行负责人', '项目计划、进度跟踪、资源协调'),
('销售经理', 'sales_manager', '销售管理', 'middle', '销售团队管理', '销售目标、客户开发、团队激励'),
('市场经理', 'marketing_manager', '市场营销', 'middle', '市场活动负责人', '活动策划、渠道管理、效果评估'),
('运营经理', 'operations_manager', '运营管理', 'middle', '运营执行管理', '日常运营、流程执行、数据监控'),
('人力资源经理', 'hr_manager', '人力资源', 'middle', 'HR模块负责人', '招聘培训、薪酬绩效、员工关系'),
('财务经理', 'finance_manager', '财务管理', 'middle', '财务执行管理', '账务处理、成本控制、财务分析'),
('采购经理', 'procurement_manager', '供应链', 'middle', '采购团队管理', '供应商管理、成本优化、质量把控'),
('客服经理', 'cs_manager', '客户服务', 'middle', '客服团队负责人', '服务质量、客户满意度、投诉处理'),
('行政经理', 'admin_manager', '行政管理', 'middle', '行政后勤管理', '办公环境、资产管理、行政服务');

-- ============ 基层管理 (Junior) ============
INSERT INTO positions (name, code, category, level, description, keyResponsibilities) VALUES 
('产品主管', 'product_lead', '产品管理', 'junior', '产品功能负责人', '需求整理、原型设计、开发跟进'),
('技术主管/Team Lead', 'tech_lead', '研发技术', 'junior', '技术小组负责人', '技术方案、代码评审、团队指导'),
('销售主管', 'sales_lead', '销售管理', 'junior', '销售小组负责人', '销售执行、客户跟进、团队协作'),
('市场主管', 'marketing_lead', '市场营销', 'junior', '市场活动执行', '活动执行、内容制作、数据收集'),
('运营主管', 'operations_lead', '运营管理', 'junior', '运营模块负责人', '日常执行、流程优化、问题解决'),
('客服主管', 'cs_lead', '客户服务', 'junior', '客服小组负责人', '服务监督、问题升级、培训指导'),
('HR主管', 'hr_lead', '人力资源', 'junior', 'HR专项负责人', '招聘执行、培训组织、员工沟通'),
('财务主管', 'finance_lead', '财务管理', 'junior', '财务模块负责人', '账务核对、报表制作、费用审核'),
('仓库主管', 'warehouse_lead', '供应链', 'junior', '仓储管理负责人', '库存管理、出入库、盘点对账'),
('门店经理', 'store_manager', '零售管理', 'junior', '门店运营负责人', '门店销售、员工管理、客户服务');

-- 验证数据
SELECT COUNT(*) as total_positions FROM positions;
SELECT level, COUNT(*) as count FROM positions GROUP BY level ORDER BY 
  CASE level 
    WHEN 'executive' THEN 1 
    WHEN 'senior' THEN 2 
    WHEN 'middle' THEN 3 
    WHEN 'junior' THEN 4 
  END;
