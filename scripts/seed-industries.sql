-- 行业库数据
-- 根据中国国民经济行业分类标准和常见管理岗位分布

DELETE FROM industries;

-- 互联网与科技
INSERT INTO industries (name, code, description, keyCharacteristics) VALUES 
('互联网/电子商务', 'tech_internet', '在线平台、电商、社交媒体等', '快速迭代、数据驱动、用户增长'),
('软件开发/SaaS', 'tech_software', '企业级软件、云服务、工具平台', '技术驱动、订阅模式、客户成功'),
('人工智能/大数据', 'tech_ai', 'AI应用、机器学习、数据分析', '前沿技术、算法优化、场景应用'),
('硬件/电子制造', 'tech_hardware', '智能硬件、电子产品、芯片', '供应链管理、质量控制、研发创新');

-- 金融服务
INSERT INTO industries (name, code, description, keyCharacteristics) VALUES 
('银行/保险', 'finance_banking', '传统金融机构、保险公司', '风险管控、合规监管、客户服务'),
('证券/投资', 'finance_investment', '证券交易、基金管理、投资顾问', '市场分析、风险评估、投资组合'),
('金融科技', 'finance_fintech', '支付、P2P、区块链金融应用', '技术创新、快速迭代、监管合规');

-- 制造业
INSERT INTO industries (name, code, description, keyCharacteristics) VALUES 
('汽车制造', 'manufacturing_auto', '整车生产、汽车零部件', '精益生产、质量体系、供应链'),
('机械设备', 'manufacturing_machinery', '工业设备、机械制造', '工程设计、生产管理、售后服务'),
('消费品制造', 'manufacturing_consumer', '食品饮料、日用品、家电', '规模化生产、渠道管理、品牌营销');

-- 医疗健康
INSERT INTO industries (name, code, description, keyCharacteristics) VALUES 
('医疗服务', 'healthcare_service', '医院、诊所、体检中心', '医疗质量、患者体验、运营效率'),
('医药研发', 'healthcare_pharma', '药品研发、临床试验', '研发周期、合规审批、科研管理'),
('医疗器械', 'healthcare_device', '医疗设备、诊断仪器', '技术创新、质量认证、市场准入');

-- 消费零售
INSERT INTO industries (name, code, description, keyCharacteristics) VALUES 
('连锁零售', 'retail_chain', '超市、便利店、专卖店', '门店运营、供应链、客户体验'),
('电子商务', 'retail_ecommerce', '在线零售、直播带货', '流量运营、转化率、物流配送'),
('餐饮服务', 'retail_food', '餐厅、咖啡、快餐连锁', '标准化运营、食品安全、客户满意度');

-- 教育培训
INSERT INTO industries (name, code, description, keyCharacteristics) VALUES 
('K12教育', 'education_k12', '中小学教育、学科培训', '教学质量、师资管理、招生运营'),
('职业培训', 'education_vocational', '技能培训、职业考证', '课程设计、就业服务、口碑营销'),
('在线教育', 'education_online', '网络课程、直播教学', '内容研发、平台运营、用户增长');

-- 房地产建筑
INSERT INTO industries (name, code, description, keyCharacteristics) VALUES 
('房地产开发', 'realestate_development', '住宅/商业地产开发', '项目管理、资金运作、销售营销'),
('物业管理', 'realestate_property', '物业服务、社区运营', '服务标准、成本控制、客户关系'),
('建筑工程', 'construction_engineering', '工程承包、施工管理', '项目进度、质量安全、成本控制');

-- 交通物流
INSERT INTO industries (name, code, description, keyCharacteristics) VALUES 
('物流快递', 'logistics_express', '快递配送、仓储物流', '网络覆盖、时效管理、成本控制'),
('供应链管理', 'logistics_supply', '供应链解决方案、第三方物流', '协同管理、信息化、优化效率');

-- 能源环保
INSERT INTO industries (name, code, description, keyCharacteristics) VALUES 
('新能源', 'energy_renewable', '光伏、风电、新能源汽车', '技术创新、政策导向、绿色发展'),
('环保工程', 'energy_environmental', '污水处理、固废处理、环境治理', '合规标准、工程管理、社会责任');

-- 文化传媒
INSERT INTO industries (name, code, description, keyCharacteristics) VALUES 
('广告营销', 'media_advertising', '品牌策划、广告代理、数字营销', '创意能力、客户关系、效果追踪'),
('影视娱乐', 'media_entertainment', '影视制作、游戏开发、直播', '内容创作、IP运营、粉丝经济'),
('出版传媒', 'media_publishing', '图书出版、新媒体、内容平台', '内容质量、版权管理、渠道分发');

-- 专业服务
INSERT INTO industries (name, code, description, keyCharacteristics) VALUES 
('咨询服务', 'service_consulting', '管理咨询、战略咨询', '专业能力、客户交付、知识管理'),
('人力资源', 'service_hr', 'HR服务、猎头、培训', '人才匹配、服务质量、行业洞察'),
('法律服务', 'service_legal', '律师事务所、法律顾问', '专业水平、案件管理、客户信任');

-- 旅游酒店
INSERT INTO industries (name, code, description, keyCharacteristics) VALUES 
('酒店住宿', 'tourism_hotel', '酒店、民宿、度假村', '服务标准、客户体验、收益管理'),
('旅游服务', 'tourism_travel', '旅行社、在线旅游平台', '产品设计、供应商管理、客户满意度');

-- 农业相关
INSERT INTO industries (name, code, description, keyCharacteristics) VALUES 
('现代农业', 'agriculture_modern', '规模化种植、智慧农业', '技术应用、供应链、品牌建设');

-- 其他
INSERT INTO industries (name, code, description, keyCharacteristics) VALUES 
('政府/非营利组织', 'other_government', '政府机构、NGO、社会组织', '公共服务、社会影响、资源协调'),
('其他行业', 'other_general', '其他未列出的行业', '根据具体情况而定');

-- 验证数据
SELECT COUNT(*) as total_industries FROM industries;
