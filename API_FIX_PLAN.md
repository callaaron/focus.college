# 🔧 API路由修复计划

## 🐛 发现的问题

前端调用的API路由与后端不匹配，导致404错误。

### 不匹配列表：

| 前端调用 | 后端实际 | 状态 |
|---------|---------|------|
| `trpc.user.*` | `trpc.profile.*` | ❌ 不匹配 |
| `trpc.questions.*` | 不存在 | ❌ 缺失 |
| `trpc.organizationAssessment.*` | `trpc.organization.*` | ❌ 不匹配 |
| `trpc.learningPaths.*` | `trpc.learning.*` | ❌ 不匹配 |
| `trpc.admin.getStats` | 需要检查 | ❓ 待确认 |

---

## 🎯 解决方案

### 方案1：在后端添加别名（推荐）✅

在 `server/routers-d1.ts` 中添加别名路由：

```typescript
export const appRouter = router({
  // ... existing routers
  
  // Aliases for frontend compatibility
  user: profileRouter,              // user.* → profile.*
  organizationAssessment: organizationRouter,  // organizationAssessment.* → organization.*
  learningPaths: learningRouter,    // learningPaths.* → learning.*
  questions: assessmentRouter,      // questions.* → assessment.* (if applicable)
});
```

### 方案2：修改前端调用（备选）

批量替换前端API调用：
- `trpc.user.*` → `trpc.profile.*`
- `trpc.organizationAssessment.*` → `trpc.organization.*`
- `trpc.learningPaths.*` → `trpc.learning.*`

---

## 📝 实施步骤

1. ✅ 在routers-d1.ts添加别名
2. ✅ 在routers.ts添加相同别名（保持一致）
3. ✅ 测试所有页面是否正常
4. ✅ 提交并部署

---

## ⚠️ 注意事项

- 别名不会增加bundle大小
- 向后兼容，不会破坏现有代码
- 未来可以逐步迁移到统一命名

