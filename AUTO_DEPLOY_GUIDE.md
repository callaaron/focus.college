# 🚀 自动化部署指南

> 简化版：无需配置GitHub Actions，直接使用脚本完成提交和部署

---

## 📦 两种部署方式

### 方式1：快速部署（推荐）✨

**一键完成：提交 → 推送 → 创建PR → 提示合并**

```bash
npm run deploy:quick
```

#### 工作流程：
1. 自动提交所有更改（会提示输入提交信息）
2. 同步远程main分支
3. 推送到GitHub
4. 自动创建或更新PR
5. 显示下一步操作提示

#### 使用场景：
- ✅ 日常开发迭代
- ✅ 功能更新
- ✅ Bug修复
- ✅ 任何需要代码审查的更改

---

### 方式2：直接部署（紧急用）⚡

**直接部署到Cloudflare Pages，跳过PR流程**

```bash
npm run deploy:direct
```

#### 工作流程：
1. 切换到main分支
2. 拉取最新代码
3. 构建项目
4. 直接部署到Cloudflare Pages

#### 使用场景：
- 🚨 紧急bug修复
- 🔥 热修复部署
- ⚡ 需要立即上线的更改

⚠️ **注意**：此方式跳过PR审查，请谨慎使用！

---

## 📋 完整部署流程示例

### 场景：你刚完成一个新功能

```bash
# 1. 使用快速部署脚本
npm run deploy:quick

# 脚本会提示：请输入提交信息
# 输入：feat: 添加用户评分功能

# 2. 脚本完成后会显示：
#    ✓ 代码已提交
#    ✓ 代码已推送到 GitHub
#    ✓ PR已创建: https://github.com/callaaron/focus.college/pull/6

# 3. 合并PR（选择以下方式之一）：

# 方式A - 命令行合并：
gh pr merge 6 --squash --delete-branch

# 方式B - 网页合并：
# 访问PR链接，点击"Merge pull request"

# 4. Cloudflare自动部署
# 如果配置了GitHub集成，合并后会自动部署
# 否则运行：npm run deploy:direct
```

---

## ⚙️ Cloudflare GitHub集成配置

### 让Cloudflare自动检测main分支更新并部署

1. **登录Cloudflare Dashboard**
   - 访问：https://dash.cloudflare.com/

2. **进入Pages项目**
   - Workers & Pages → focus-college

3. **连接GitHub**
   - Settings → Builds & deployments
   - 点击 "Connect to Git"
   - 选择仓库：callaaron/focus.college
   - 配置：
     ```
     Production branch: main
     Build command: npm run build
     Build output directory: dist/public
     ```

4. **保存配置**
   - 之后每次合并PR到main，Cloudflare会自动部署

---

## 🔧 Cloudflare CLI配置（首次使用）

### 如果要使用 `deploy:direct`，需要先登录：

```bash
# 登录Cloudflare账号
npx wrangler login

# 验证登录状态
npx wrangler whoami
```

登录后，`deploy:direct` 命令就可以正常使用了。

---

## 📊 两种方式对比

| 特性 | deploy:quick | deploy:direct |
|------|-------------|---------------|
| 提交代码到GitHub | ✅ | ❌ |
| 创建PR | ✅ | ❌ |
| 代码审查 | ✅ | ❌ |
| 自动部署 | 需要合并PR | ✅ 立即部署 |
| 使用场景 | 日常开发 | 紧急修复 |
| 推荐程度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🎯 最佳实践

### 推荐工作流：

```
日常开发
    ↓
使用 deploy:quick 创建PR
    ↓
代码审查（可选）
    ↓
合并PR到main
    ↓
Cloudflare自动部署
    ↓
✅ 完成
```

### 团队协作建议：

1. **功能开发**：使用 `deploy:quick`
2. **Bug修复**：使用 `deploy:quick`
3. **紧急热修复**：使用 `deploy:direct`（需要团队负责人批准）

---

## 🔍 故障排除

### 问题1：推送失败

```
error: failed to push some refs
```

**解决方案**：
```bash
# 同步远程分支
git fetch origin main
git rebase origin/main

# 解决冲突（如果有）
# 然后继续
git rebase --continue

# 重新运行脚本
npm run deploy:quick
```

### 问题2：PR创建失败

```
gh: command not found
```

**解决方案**：
```bash
# 安装GitHub CLI
# macOS:
brew install gh

# Linux:
# 见: https://cli.github.com/

# 登录
gh auth login
```

### 问题3：Cloudflare部署失败

```
Not logged in
```

**解决方案**：
```bash
# 登录Cloudflare
npx wrangler login

# 验证
npx wrangler whoami
```

---

## 📝 快速参考

### 常用命令

```bash
# 快速部署（推荐）
npm run deploy:quick

# 直接部署（紧急）
npm run deploy:direct

# 查看PR列表
gh pr list

# 合并PR
gh pr merge <PR编号> --squash --delete-branch

# 查看部署状态
npx wrangler pages deployment list
```

---

## 🆘 需要帮助？

- 📖 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- 🔧 [GitHub CLI 文档](https://cli.github.com/manual/)
- 💬 [项目Issues](https://github.com/callaaron/focus.college/issues)

---

## 🎉 总结

✅ **推荐流程**：
1. 开发功能
2. 运行 `npm run deploy:quick`
3. 输入提交信息
4. 合并PR：`gh pr merge <编号> --squash --delete-branch`
5. 等待Cloudflare自动部署（2-3分钟）

就是这么简单！🚀
