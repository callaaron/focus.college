# 企业能力评估提交问题修复

## 问题描述

在企业能力评估完成答题并提交后，出现以下问题：
1. 页面显示一直在"提交中"状态
2. 控制台报告多个错误

## 错误日志分析

### 错误1: toast is not defined
```
[API Mutation Error] ReferenceError: toast is not defined
    at Object.onSuccess (CompanyAssessment.tsx:176:7)
```

**原因**: `CompanyAssessment.tsx`文件中导入了`useToast` hook，但代码中使用的是`toast`函数（来自sonner）。

**修复**: 
```typescript
// 修改前
import { useToast } from "@/hooks/use-toast";

// 修改后
import { toast } from "sonner";
```

### 错误2: Query data cannot be undefined
```
Query data cannot be undefined. Please make sure to return a value other than undefined from your query function. 
Affected query key: [["profile","get"],{"type":"query"}]
```

**原因**: `profile.get` API在用户没有profile记录时返回`undefined`，但React Query不允许query函数返回undefined。

**修复**:
```typescript
// server/routers.ts - 修改前
get: protectedProcedure.query(async ({ ctx }) => {
  return await db.getUserProfile(ctx.user.id);
}),

// 修改后
get: protectedProcedure.query(async ({ ctx }) => {
  const profile = await db.getUserProfile(ctx.user.id);
  return profile ?? null;  // 返回null而不是undefined
}),
```

### 错误3: disconnected
```
Error: disconnected
```

**原因**: 这通常是tRPC连接问题，可能由以下原因引起：
- 网络连接中断
- 服务器重启或超时
- 浏览器到服务器的HTTP连接断开

**解决方案**: 
- 这个错误通常是暂时性的，刷新页面后会恢复
- 确保开发服务器正常运行
- 检查网络连接

## 修复后的行为

1. ✅ 提交按钮点击后正常处理
2. ✅ 显示成功提示（使用sonner toast）
3. ✅ 自动跳转到企业能力看板页面
4. ✅ profile.get API返回null而不是undefined（符合React Query规范）
5. ✅ 前端正确处理null值（使用可选链 `profile?.`）

## 测试验证

### 测试场景1: 新用户提交评估
1. 用新用户账号登录
2. 进入企业能力评估页面
3. 完成所有20个问题
4. 点击提交
5. **预期结果**: 成功提交，显示成功提示，跳转到看板页面

### 测试场景2: 已有profile的用户
1. 用已配置profile的用户登录
2. 进入企业能力评估页面
3. 完成评估并提交
4. **预期结果**: 正常提交，不出现undefined错误

### 测试场景3: 网络问题处理
1. 在提交过程中模拟网络断开
2. **预期结果**: 显示错误提示，不会无限loading

## 相关文件

- `client/src/pages/CompanyAssessment.tsx` - 修复toast导入
- `server/routers.ts` - 修复profile.get返回值
- `client/src/main.tsx` - tRPC客户端配置（无需修改）

## Git提交

**Commit**: `fix: 修复企业能力评估提交问题`
**Branch**: `genspark_ai_developer`
**PR**: https://github.com/callaaron/focus.college/pull/1

## 注意事项

1. **React Query规范**: 所有query函数必须返回非undefined值（可以是null）
2. **Toast系统**: 项目使用sonner作为toast系统，不要使用shadcn/ui的useToast
3. **错误处理**: 确保所有mutation都有onError处理器
4. **API返回值**: 数据库查询可能返回undefined，需要在API层转换为null

## 后续改进建议

1. **添加重试机制**: 在网络错误时自动重试提交
2. **离线支持**: 保存草稿到localStorage，避免数据丢失
3. **加载状态优化**: 显示更详细的加载进度（如"保存中..."、"计算分数..."等）
4. **错误提示增强**: 针对不同错误类型显示更友好的提示
5. **数据验证**: 提交前验证所有分数都在有效范围内（0-100）
