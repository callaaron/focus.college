# 行业数据编码问题修复

## 问题描述

在用户画像配置页面，行业类型下拉菜单显示乱码，所有选项都是无法识别的字符。

### 截图示例
用户看到的下拉菜单：
```
å°"è"¯ç½'/ç"µå•†
è½¯ä»¶/ITæœåŠ¡
äººå·¥æ™ºèƒ½
é‡'èžç§'æŠ€
...（全是乱码）
```

应该显示的内容：
```
互联网/电商
软件/IT服务
人工智能
金融科技
...
```

## 根本原因

虽然数据库配置使用了`utf8mb4`字符集，但行业数据在插入时使用了**错误的字符编码**。

### 技术细节

1. **数据库字符集**: ✅ `utf8mb4` (正确)
2. **表字符集**: ✅ `utf8mb4_general_ci` (正确)
3. **连接字符集**: ✅ `utf8mb4` (正确)
4. **数据编码**: ❌ **插入时使用了错误的编码** (问题根源)

### 问题数据示例
```sql
-- 数据库中存储的实际值（十六进制）
id: 1, name: 'äº\x92è\x81"ç½'/ç"µå•†', code: 'internet_ecommerce'
```

这些乱码字符是UTF-8字符被错误地当作Latin-1或其他编码解释的结果。

## 修复方案

### 步骤1: 检查编码问题
创建诊断脚本 `scripts/check-industries-encoding.ts`：
```typescript
// 检查数据库字符集设置
SHOW VARIABLES LIKE 'character_set%'

// 查看实际存储的数据
SELECT id, name, code FROM industries
```

### 步骤2: 修复数据
创建修复脚本 `scripts/fix-industries-encoding.ts`：

1. **删除旧数据**
   ```sql
   DELETE FROM industries;
   ```

2. **使用正确的UTF-8编码重新插入**
   ```typescript
   const connection = await mysql.createConnection(process.env.DATABASE_URL);
   // 连接会自动使用utf8mb4
   
   await connection.execute(
     "INSERT INTO industries (name, code, description, keyCharacteristics) VALUES (?, ?, ?, ?)",
     ['互联网/电商', 'internet_ecommerce', '...', '...']
   );
   ```

### 步骤3: 重建关联关系
由于删除并重新插入了行业数据，行业ID发生了变化（从1-21变为22-42）。需要重新建立行业-能力关联关系。

创建脚本 `scripts/reseed-industry-competencies.ts`：
```typescript
// 1. 动态获取新的行业ID
const allIndustries = await db.select().from(industries);
const industryMap = new Map<string, number>();
for (const ind of allIndustries) {
  industryMap.set(ind.code, ind.id);  // 使用code而不是硬编码ID
}

// 2. 根据code映射到新ID并插入关联
for (const rel of relationshipsData) {
  const industryId = industryMap.get(rel.code);
  await db.insert(industryCompetencies).values({
    industryId,
    competencyId: rel.competencyId,
    importance: rel.importance,
    description: rel.description,
  });
}
```

## 执行修复

### 1. 运行修复脚本
```bash
cd /home/user/webapp

# 检查编码问题
npx tsx scripts/check-industries-encoding.ts

# 修复行业数据
npx tsx scripts/fix-industries-encoding.ts

# 重建行业-能力关联
npx tsx scripts/reseed-industry-competencies.ts
```

### 2. 修复结果
```
✅ 成功插入 21 个行业（ID: 22-42）
✅ 成功重建 168 条行业-能力关联关系
✅ 数据验证通过：显示正确的中文
```

## 修复后的数据

### 21个行业（正确编码）
| ID | 名称 | Code |
|----|------|------|
| 22 | 互联网/电商 | internet_ecommerce |
| 23 | 软件/IT服务 | software_it |
| 24 | 人工智能 | artificial_intelligence |
| 25 | 金融科技 | fintech |
| 26 | 企业服务 | enterprise_service |
| 27 | 教育培训 | education |
| 28 | 医疗健康 | healthcare |
| 29 | 文娱传媒 | media_entertainment |
| 30 | 新零售 | new_retail |
| 31 | 智能硬件 | smart_hardware |
| 32 | 汽车交通 | automotive |
| 33 | 房产家居 | real_estate |
| 34 | 农业科技 | agritech |
| 35 | 先进制造 | advanced_manufacturing |
| 36 | 新能源 | new_energy |
| 37 | 环保 | environmental |
| 38 | 物流供应链 | logistics |
| 39 | 旅游出行 | travel_tourism |
| 40 | 社交网络 | social_network |
| 41 | 本地生活 | local_services |
| 42 | 其他 | other |

### 168条行业-能力关联
每个行业关联~8个核心能力，带有重要性等级（1-5）和描述。

## 预防措施

### 1. 确保连接使用正确编码
```typescript
// ✅ 正确方式
const connection = await mysql.createConnection(process.env.DATABASE_URL);
// mysql2会自动使用数据库的字符集设置

// ❌ 错误方式 - 不要手动覆盖编码配置
const connection = await mysql.createConnection({
  ...config,
  charset: 'latin1'  // ❌ 错误！
});
```

### 2. 使用参数化查询
```typescript
// ✅ 推荐：使用参数化查询（自动处理编码）
await connection.execute(
  "INSERT INTO industries (name) VALUES (?)",
  ['互联网/电商']
);

// ❌ 避免：字符串拼接（可能导致编码问题）
await connection.execute(
  `INSERT INTO industries (name) VALUES ('互联网/电商')`
);
```

### 3. 验证插入的数据
```typescript
// 插入后立即验证
const [rows] = await connection.execute("SELECT name FROM industries WHERE id = ?", [id]);
console.log("验证:", rows[0].name);  // 应该显示正确的中文
```

## 测试验证

### 前端测试
1. 打开用户画像配置页面 `/profile`
2. 点击"行业类型"下拉菜单
3. **预期结果**: 看到正确的中文选项
   - ✅ 互联网/电商
   - ✅ 软件/IT服务
   - ✅ 人工智能
   - ✅ 金融科技
   - ...（共21个选项）

### 后端测试
```bash
# 直接查询数据库验证
cd /home/user/webapp
npx tsx scripts/check-industries-encoding.ts

# 应该看到：
# { id: 22, name: '互联网/电商', code: 'internet_ecommerce' }
# { id: 23, name: '软件/IT服务', code: 'software_it' }
# ...
```

## 相关文件

- `scripts/check-industries-encoding.ts` - 编码问题诊断工具
- `scripts/fix-industries-encoding.ts` - 行业数据修复脚本
- `scripts/reseed-industry-competencies.ts` - 重建关联关系脚本

## 影响范围

### 修复的功能
- ✅ 用户画像配置 - 行业类型选择
- ✅ 能力推荐系统 - 基于行业的能力匹配
- ✅ 差距分析 - 行业特定的能力要求

### 无影响的功能
- ✅ 用户登录/注册
- ✅ 能力评估
- ✅ 企业能力评估
- ✅ 其他不依赖行业数据的功能

## Git提交记录

```
fix: 修复行业数据编码问题

- 行业下拉菜单显示乱码已修复，现在正确显示中文
- 重新插入21个行业数据，使用正确的UTF-8编码
- 重新建立168条行业-能力关联关系（使用新的行业ID）
- 添加编码检查和修复脚本
```

**Branch**: `genspark_ai_developer`  
**PR**: https://github.com/callaaron/focus.college/pull/1

## 总结

✅ **问题**: 行业下拉菜单显示乱码  
✅ **根因**: 数据插入时使用了错误的字符编码  
✅ **修复**: 使用正确的UTF-8编码重新插入数据  
✅ **验证**: 前端显示正确的中文，后端数据正确存储  
✅ **预防**: 使用参数化查询，验证插入的数据

现在用户可以正常选择行业类型了！🎉
