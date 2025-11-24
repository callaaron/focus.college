# 🚀 快速开始指南

## ✅ 配置已完成

所有数据库迁移和管理员配置已经完成！你现在可以直接使用系统了。

---

## 🌐 访问系统

### 前端应用（用户界面）
```
https://5173-io1101qpnz3j58qotc9e0-cbeee0f9.sandbox.novita.ai
```

### 后端API
```
https://5000-io1101qpnz3j58qotc9e0-cbeee0f9.sandbox.novita.ai
```

---

## 👤 管理员账户

已为你创建了一个默认管理员账户：

| 项目 | 值 |
|------|-----|
| 用户ID | 1 |
| 姓名 | 系统管理员 |
| 邮箱 | admin@competency-system.com |
| OpenID | admin_default_001 |
| 角色 | admin |

---

## 📝 如何使用

### 第一步：正常用户注册/登录
1. 访问前端URL
2. 通过正常流程登录（系统会创建用户）
3. 记住你的用户ID

### 第二步：设置自己为管理员
```bash
# 替换 YOUR_USER_ID 为你的实际用户ID
mysql -u webapp -pwebapp_password_2024 competency_system -e "UPDATE users SET role = 'admin' WHERE id = YOUR_USER_ID;"
```

### 第三步：访问管理后台
访问 `/admin` 路由即可看到：
- 用户管理
- 题库管理  
- 系统统计
- QA测试中心

---

## 🔍 常用命令

### 查看所有用户
```bash
mysql -u webapp -pwebapp_password_2024 competency_system -e "SELECT id, name, email, role FROM users;"
```

### 查看题库数量
```bash
mysql -u webapp -pwebapp_password_2024 competency_system -e "SELECT COUNT(*) as total FROM assessmentQuestions;"
```

### 查看成就列表
```bash
mysql -u webapp -pwebapp_password_2024 competency_system -e "SELECT name, category, points FROM achievements;"
```

---

## 📚 详细文档

更多信息请查看：
- **完整配置报告**: `ADMIN_SETUP_COMPLETE.md`
- **功能实现报告**: `QA_IMPLEMENTATION_REPORT.md`

---

## 💡 提示

**系统已经准备就绪！** 

现在你可以：
1. ✅ 创建和管理评估问题
2. ✅ 查看用户数据和统计
3. ✅ 运行QA测试验证功能
4. ✅ 体验新增的8个完整功能

如有任何问题，请参考 `ADMIN_SETUP_COMPLETE.md` 中的问题排查部分。

---

*快速指南 - 2025-11-22*
