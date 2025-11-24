-- 插入8个核心能力域
INSERT INTO competency_domains (name, description, icon, sortOrder, createdAt, updatedAt) VALUES
('战略规划', '企业战略制定、商业模式设计、市场定位等战略层面的能力', 'target', 1, NOW(), NOW()),
('产品创新', '产品设计、用户体验、产品迭代等产品相关能力', 'lightbulb', 2, NOW(), NOW()),
('市场营销', '品牌建设、市场推广、用户增长等市场营销能力', 'trending-up', 3, NOW(), NOW()),
('团队管理', '团队建设、人才招聘、组织文化等人力资源管理能力', 'users', 4, NOW(), NOW()),
('运营管理', '业务流程、运营效率、质量管控等运营管理能力', 'settings', 5, NOW(), NOW()),
('财务融资', '财务管理、融资能力、成本控制等财务相关能力', 'dollar-sign', 6, NOW(), NOW()),
('技术研发', '技术架构、研发管理、技术创新等技术能力', 'code', 7, NOW(), NOW()),
('领导力', '领导风格、决策能力、影响力等领导力相关能力', 'star', 8, NOW(), NOW());
