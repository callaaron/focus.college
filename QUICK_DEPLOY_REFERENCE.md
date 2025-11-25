# 🚀 快速部署参考卡片

> 简单易记的部署命令，贴在显示器旁边！

---

## 📦 两个命令，搞定一切

### 🔄 日常开发 → GitHub PR

```bash
npm run deploy:quick
```

**做什么**：提交代码 → 推送GitHub → 创建PR  
**下一步**：合并PR后，Cloudflare自动部署

---

### ⚡ 紧急修复 → 直接上线

```bash
npm run deploy:direct
```

**做什么**：构建 → 直接部署到Cloudflare  
**时间**：2-3分钟完成

---

## 🔗 完整流程（首次使用请看）

### 方法1：标准流程（推荐）

```bash
# 1. 开发完成后
npm run deploy:quick

# 2. 输入提交信息（例如：feat: 添加新功能）

# 3. 合并PR（选一个）
gh pr merge <编号> --squash    # 命令行
# 或去GitHub网页点"Merge"      # 网页

# 4. 等待2-3分钟
# Cloudflare自动部署完成 ✅
```

### 方法2：快速通道（紧急用）

```bash
# 一步到位
npm run deploy:direct

# 等待2-3分钟
# 生产环境更新完成 ✅
```

---

## 🆘 遇到问题？

### 推送失败
```bash
git fetch origin main
git rebase origin/main
# 解决冲突后继续
npm run deploy:quick
```

### Cloudflare部署失败
```bash
# 首次需要登录
npx wrangler login
```

### 查看PR列表
```bash
gh pr list
```

---

## 📚 详细文档

完整指南：[AUTO_DEPLOY_GUIDE.md](./AUTO_DEPLOY_GUIDE.md)

---

**记住**：
- 日常用 `deploy:quick` ✅
- 紧急用 `deploy:direct` ⚡
- 合并PR后等2-3分钟 ⏰
