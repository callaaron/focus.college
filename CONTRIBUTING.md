# 贡献指南

感谢你对创业进化系统的关注！欢迎参与贡献。

## 如何贡献

### 报告问题

- 使用 [GitHub Issues](https://github.com/callaaron/focus.college/issues) 报告 bug 或提出功能建议
- 提交前请搜索是否已有类似 issue
- 请使用 issue 模板，提供尽可能详细的信息

### 提交代码

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'feat: 添加某功能'`
4. 推送到分支：`git push origin feature/your-feature`
5. 提交 Pull Request

### 开发规范

- **提交信息**：遵循 [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` 新功能
  - `fix:` 修复 bug
  - `docs:` 文档更新
  - `refactor:` 代码重构
  - `style:` 样式调整
- **代码风格**：使用 Prettier 格式化（`npm run format`）
- **类型安全**：确保 TypeScript 类型正确（`npm run check`）

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build:legacy
```

### 能力模型扩展

如果你想添加新的能力域或能力，请：

1. 在 `drizzle/schema.ts` 中确认表结构
2. 通过 SQL 插入新的能力域和能力记录
3. 在 `drizzle/seed-questions.sql` 中添加对应的评估题目
4. 提交 PR 并说明新增能力的理由和评分标准

## 行为准则

请保持友善和尊重。我们致力于维护一个开放的社区环境。
