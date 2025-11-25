# ☁️ Cloudflare Pages 自动部署配置指南

## 🎯 目标

让每次推送到main分支的代码**自动部署**到Cloudflare Pages生产环境。

---

## 📋 配置方式（二选一）

### 方法1：Cloudflare GitHub集成（推荐）⭐

这是最简单的方式，无需配置GitHub Actions。

#### 步骤：

1. **登录 Cloudflare Dashboard**
   - 访问：https://dash.cloudflare.com/

2. **进入 Pages 项目**
   - 点击 "Workers & Pages"
   - 选择你的项目（或创建新项目）

3. **连接 GitHub 仓库**
   - 点击 "Connect to Git"
   - 授权 Cloudflare 访问 GitHub
   - 选择仓库：`callaaron/focus.college`

4. **配置构建设置**
   ```
   Framework preset: None
   Build command: npm run build
   Build output directory: dist/public
   Root directory: /
   ```

5. **配置触发分支**
   ```
   Production branch: main
   ```

6. **保存并部署**
   - 点击 "Save and Deploy"
   - 首次部署会立即开始

#### 完成后：

✅ 每次推送到 `main` 分支，Cloudflare 会自动：
1. 检测到新提交
2. 拉取代码
3. 运行 `npm run build`
4. 部署到生产环境
5. 更新域名（2-3分钟）

---

### 方法2：GitHub Actions + Wrangler

如果你想要更多控制，可以使用GitHub Actions。

#### 步骤：

1. **配置 GitHub Secrets**

访问：https://github.com/callaaron/focus.college/settings/secrets/actions

添加以下secrets：

| Name | Value | 获取方式 |
|------|-------|----------|
| `CLOUDFLARE_API_TOKEN` | 你的API Token | [生成Token](https://dash.cloudflare.com/profile/api-tokens) |
| `CLOUDFLARE_ACCOUNT_ID` | 你的Account ID | [查看Account ID](https://dash.cloudflare.com/) |

2. **创建 Workflow 文件**

在仓库中创建文件：`.github/workflows/auto-deploy.yml`

```yaml
name: 自动部署到 Cloudflare Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: 自动构建并部署
    
    steps:
      - name: 📥 检出代码
        uses: actions/checkout@v4
        
      - name: 📦 安装 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: 📚 安装依赖
        run: npm ci
        
      - name: 🏗️ 构建应用
        run: npm run build
        env:
          NODE_ENV: production
          
      - name: 🚀 部署到 Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist/public --project-name=focus-college
          
      - name: ✅ 部署成功
        if: success()
        run: echo "🎉 部署成功！"
```

3. **提交 Workflow 文件**

```bash
git add .github/workflows/auto-deploy.yml
git commit -m "ci: 添加自动部署workflow"
git push origin main
```

#### 完成后：

✅ 每次推送到 `main` 分支，GitHub Actions 会：
1. 自动触发workflow
2. 构建应用
3. 部署到 Cloudflare Pages
4. 显示部署状态

---

## 🔍 验证配置

### Cloudflare GitHub集成验证：

1. 推送一个小改动到main分支
2. 访问 Cloudflare Dashboard → Pages → 你的项目
3. 查看 "Deployments" 标签页
4. 应该看到新的部署正在进行

### GitHub Actions验证：

1. 推送一个小改动到main分支
2. 访问 https://github.com/callaaron/focus.college/actions
3. 应该看到workflow正在运行
4. 点击查看详细日志

---

## 📊 部署时间线

```
T+0s    → 推送代码到GitHub
T+5s    → Cloudflare/GitHub Actions检测到
T+30s   → 开始构建 (npm ci + npm run build)
T+2min  → 构建完成，开始部署
T+3min  → 部署完成，全球CDN更新
✅ 完成  → 生产环境更新
```

---

## 🎯 推荐配置

我推荐使用 **方法1：Cloudflare GitHub集成**，因为：

✅ 更简单 - 无需配置Secrets  
✅ 更快 - 直接在Cloudflare边缘构建  
✅ 更稳定 - Cloudflare官方支持  
✅ 免费 - 无限次构建  
✅ 内置回滚 - 一键回滚到任何版本  

---

## 🔧 故障排除

### 问题1：构建失败

**检查**：
- 本地能否成功运行 `npm run build`？
- 所有依赖是否在 package.json 中？
- Node.js版本是否正确（建议20.x）？

**解决**：
```bash
# 本地测试构建
npm ci
npm run build

# 如果成功，推送到GitHub
git push origin main
```

### 问题2：部署超时

**原因**：构建时间过长

**解决**：
- 检查是否有不必要的依赖
- 优化构建配置
- 考虑使用构建缓存

### 问题3：404错误

**原因**：Build output directory配置错误

**解决**：
确认输出目录为 `dist/public`

---

## 📝 配置完成清单

配置 Cloudflare GitHub集成后：

- [ ] GitHub仓库已连接
- [ ] Production branch设置为 `main`
- [ ] Build command: `npm run build`
- [ ] Build output: `dist/public`
- [ ] 首次部署成功
- [ ] 推送测试提交验证自动部署

配置 GitHub Actions后：

- [ ] CLOUDFLARE_API_TOKEN已配置
- [ ] CLOUDFLARE_ACCOUNT_ID已配置
- [ ] Workflow文件已创建
- [ ] Workflow运行成功
- [ ] 部署到生产环境成功

---

## 🎉 配置完成

配置完成后，你的开发流程变为：

```bash
# 1. 修改代码
vim client/src/...

# 2. 提交并推送
git add .
git commit -m "feat: 新功能"
git push origin main

# 3. 等待2-3分钟
# ✅ 自动部署完成！
```

**就是这么简单！** 🚀

---

## 📚 相关资源

- [Cloudflare Pages文档](https://developers.cloudflare.com/pages/)
- [GitHub Actions文档](https://docs.github.com/en/actions)
- [Wrangler CLI文档](https://developers.cloudflare.com/workers/wrangler/)

---

**配置指南版本**: v1.0  
**最后更新**: 2025-11-25  
**建议配置**: Cloudflare GitHub集成
