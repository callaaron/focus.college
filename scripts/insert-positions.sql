-- 插入常见创业岗位
INSERT INTO positions (name, code, description, level, category, createdAt, updatedAt) VALUES
('CEO/创始人', 'CEO', '公司最高决策者，负责公司整体战略、融资和重大决策', 'executive', 'management', NOW(), NOW()),
('CTO/技术负责人', 'CTO', '技术团队负责人，负责技术战略、架构设计和研发管理', 'executive', 'technology', NOW(), NOW()),
('CPO/产品负责人', 'CPO', '产品团队负责人，负责产品战略、规划和用户体验', 'executive', 'product', NOW(), NOW()),
('COO/运营负责人', 'COO', '运营团队负责人，负责业务运营、流程优化和执行落地', 'executive', 'operations', NOW(), NOW()),
('CFO/财务负责人', 'CFO', '财务团队负责人，负责财务管理、融资和投资决策', 'executive', 'finance', NOW(), NOW()),
('CMO/市场负责人', 'CMO', '市场团队负责人，负责品牌建设、市场推广和用户增长', 'executive', 'marketing', NOW(), NOW()),
('产品经理', 'PM', '负责产品规划、需求分析和产品迭代', 'middle', 'product', NOW(), NOW()),
('技术经理', 'TM', '负责技术团队管理、项目管理和技术方案设计', 'middle', 'technology', NOW(), NOW()),
('运营经理', 'OM', '负责业务运营、数据分析和运营策略制定', 'middle', 'operations', NOW(), NOW()),
('市场经理', 'MM', '负责市场活动策划、渠道拓展和品牌推广', 'middle', 'marketing', NOW(), NOW()),
('销售负责人', 'SM', '负责销售团队管理、客户关系维护和销售策略', 'middle', 'sales', NOW(), NOW()),
('人力资源负责人', 'HRM', '负责人才招聘、团队建设和组织文化塑造', 'middle', 'hr', NOW(), NOW());
