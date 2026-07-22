# Focus College 局域网部署说明

## 部署状态：✅ 已成功运行

- **访问地址（同事在浏览器输入）：** `http://192.168.31.46:3000`
- **本机访问：** `http://localhost:3000`
- **技术栈：** Node.js (Express + tRPC) + React/Vite + MySQL 9.1

---

## 架构概览

```
同事电脑/手机 (同一局域网 Wi-Fi)
        │
        │  http://192.168.31.46:3000
        ▼
┌─────────────────────────────────────────────┐
│  Mac mini (本机)                              │
│                                              │
│  Node.js 服务器 (PID 47675)                  │
│    ├─ 监听 *:3000 (所有网卡)                  │
│    ├─ 前端静态文件: dist/public/              │
│    └─ API: /api/trpc                         │
│         │                                   │
│         │ DATABASE_URL                       │
│         ▼                                   │
│  MySQL 9.1 (PID 46716)                       │
│    ├─ 端口 3306 (127.0.0.1)                  │
│    └─ 数据库: competency_system (29张表)     │
└─────────────────────────────────────────────┘
```

---

## 关键路径

| 组件 | 路径 |
|------|------|
| 项目代码 | `/Users/panda/focus.college` |
| MySQL 安装 | `/Users/panda/mysql/mysql-9.1.0-macos14-arm64` |
| MySQL 数据 | `/Users/panda/mysql/data` |
| MySQL 配置 | `/Users/panda/mysql/my.cnf` |
| 构建产物 | `/Users/panda/focus.college/dist/` |
| 服务器日志 | `/Users/panda/focus.college/server.log` |

---

## 数据库信息

- **类型：** MySQL 9.1.0（用户空间安装，无需 sudo）
- **地址：** `127.0.0.1:3306`
- **数据库名：** `competency_system`
- **用户名/密码：** `webapp` / `webapp_password_2024`
- **表数量：** 29 张（含用户、能力模型、评估、公司、Wiki 等）
- **已 Seed：** 49 道评估题目

---

## AI 模型（DeepSeek）配置

项目的 AI / 聊天功能（`server/_core/llm.ts` 的 `invokeLLM`）已接入 **DeepSeek**，
配置写在 `server/_core/env.ts` 读取的以下环境变量（位于 `.env`，已被 gitignore）：

| 变量 | 值 | 说明 |
|------|-----|------|
| `DEEPSEEK_API_KEY` | `sk-...` | DeepSeek API Key |
| `DEEPSEEK_API_URL` | `https://api.deepseek.com` | OpenAI 兼容端点，实际请求 `/v1/chat/completions` |
| `DEEPSEEK_MODEL` | `deepseek-v4-pro` | 默认模型（改模型只需改此变量） |

请求默认带 `thinking: {type:"enabled"}` + `reasoning_effort: "high"`。

> **重要兼容性坑（已修复）：** DeepSeek 的 `deepseek-v4-pro` **不支持** `response_format: json_schema`
> （结构化输出），会返回 `400 This response_format type is unavailable now`。项目里大量 `invokeLLM`
> 调用都用了 `json_schema`。已在 `llm.ts` 中把 `json_schema` 自动降级为 `json_object`，并对返回内容
> 做了 JSON 清洗（去 ```json 围栏/多余说明文字），保证调用方 `JSON.parse` 稳定可用。

如需更换模型或 Key：编辑 `.env` 后 **重启服务器**（`lsof -tiTCP:3000 -sTCP:LISTEN | xargs kill`，
再 `bash start-server.sh`）即可生效，无需重新构建（env 在运行时读取）。

---

## 日常运维

### 启动服务器
```bash
# 方式一：手动启动（当前会话有效）
bash /Users/panda/focus.college/start-server.sh

# 方式二：开机自启（需在本机终端手动加载一次）
launchctl load ~/Library/LaunchAgents/com.focuscollege.server.plist
```

### 停止服务器
```bash
# 找到 Node 进程并结束
lsof -tiTCP:3000 -sTCP:LISTEN | xargs kill
```

### 重启 MySQL（如意外停止）
```bash
/Users/panda/mysql/mysql-9.1.0-macos14-arm64/bin/mysqld \
  --defaults-file=/Users/panda/mysql/my.cnf --user=panda --daemonize
```

### 查看日志
```bash
tail -f /Users/panda/focus.college/server.log
```

### 重新部署（代码更新后）
```bash
cd /Users/panda/focus.college
git pull origin genspark_ai_developer
npm run build:legacy
# 重启服务器
lsof -tiTCP:3000 -sTCP:LISTEN | xargs kill
bash start-server.sh
```

---

## 注意事项

1. **⚠️ GitHub Token 安全：** 你提供的 Personal Access Token 已在对话中明文出现，请立即到
   GitHub → Settings → Developer settings → Personal access tokens 中**撤销并重新生成**。

2. **局域网前提：** 同事设备必须连接**同一个 Wi-Fi/局域网网段**。若 Mac mini 换了网络，
   局域网 IP 会变（可用 `ipconfig getifaddr en0` 查看最新 IP）。

3. **进程持久性：** 当前服务器由 AI 助手的后台任务托管，若关闭 WorkBuddy 会话可能停止。
   建议在本机终端执行 `launchctl load ~/Library/LaunchAgents/com.focuscollege.server.plist`
   实现开机自启（该 plist 已生成，仅沙箱内被拦，本机可正常加载）。

4. **防火墙：** macOS 默认允许本机服务被局域网访问，如遇无法访问，检查
   系统设置 → 网络 → 防火墙 是否拦截了 Node/MySQL。

---

## QQ 浏览器 / 无头浏览器兼容说明

2026-07-20 测试中发现：**QQ 浏览器（headless 自动化模式）不执行 `<script type="module">` 标签**，
但支持动态 `import()`。`vite-plugin-manus-runtime` 会把模块代码内联到一个非执行脚本中，
进一步破坏挂载。

### 已落地的修复（`vite.config.ts`）
1. **移除 `vitePluginManusRuntime()`** —— 该 Manus 平台专用插件与 QQ 浏览器不兼容。
2. **关闭代码分割** —— `inlineDynamicImports: true`，所有代码打包成单一 JS 文件
   （解决 `import()` 在 QQ 浏览器中跨 chunk 解析失败问题）。
3. **自动 HTML 转换插件 `qq-browser-shim`** —— 在 `transformIndexHtml.post` 阶段
   自动把 `<script type="module" crossorigin src="...">` 替换为：
   ```html
   <script>/* QQ Browser shim: dynamic import() */
   import('/assets/index-xxx.js').catch(function(e){
     document.title='⚠ '+e.message.substring(0,150);
   });</script>
   ```
   这样无需手动编辑 `dist/public/index.html`，每次构建自动生效。

### 副作用
- 单一 bundle 体积约 1.5MB（无 gzip），网络较差时首屏略慢；如需优化可改回代码分割
  并保留 shim。
- 正常浏览器（Chrome / Safari / Edge）完全无影响，因为 `<script>` 中的 `import()`
  是标准 ES 语法，所有现代浏览器都支持。

### 验证脚本
```bash
# 确认 HTML 中无 type=module，且是 dynamic import 形式
grep -c 'type="module"' /Users/panda/focus.college/dist/public/index.html  # 应为 0
grep -c "import('/assets" /Users/panda/focus.college/dist/public/index.html  # 应为 1
```
