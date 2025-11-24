# 阿里云 DNS 配置指南

> 专为 focus.college 域名从阿里云迁移到 Cloudflare 的详细操作指南

---

## 🎯 配置目标

将 `focus.college` 域名的 DNS 服务器从阿里云修改为 Cloudflare，实现：
- ✅ Cloudflare Pages 自动管理 DNS
- ✅ 全球 CDN 加速
- ✅ 自动 SSL 证书
- ✅ DDoS 防护

---

## 📋 前置准备

在开始之前，请确保：
- [x] 已在 Cloudflare 添加域名 `focus.college`
- [x] 已记录 Cloudflare 的 Nameservers
- [x] 拥有阿里云账号访问权限
- [x] 能够登录阿里云控制台

**Cloudflare Nameservers**（请从 Cloudflare Dashboard 获取）：
```
Nameserver 1: ______________________.ns.cloudflare.com
Nameserver 2: ______________________.ns.cloudflare.com
```

⚠️ **重要**: 每个域名的 Nameservers 是唯一的，请使用您自己的！

---

## 📝 详细步骤

### 步骤 1: 登录阿里云

1. 打开浏览器，访问：https://www.aliyun.com/
2. 点击右上角 **登录** 按钮
3. 选择登录方式：
   - 账号密码登录
   - 扫码登录（推荐，更快）
4. 输入凭证并登录
5. 登录成功后，点击右上角 **控制台**

✅ 进入阿里云控制台

---

### 步骤 2: 进入域名管理

**方法 A：通过搜索（推荐）**
1. 在控制台顶部搜索框中输入：`域名`
2. 在下拉列表中点击：**域名** → **域名列表**
3. 进入域名控制台

**方法 B：通过产品导航**
1. 在控制台左侧菜单，找到 **域名与网站**
2. 展开后点击 **域名**
3. 点击 **域名列表**

✅ 看到域名列表页面

---

### 步骤 3: 找到 focus.college 域名

在域名列表页面：
1. 如果域名很多，可以使用搜索框
2. 在搜索框输入：`focus.college`
3. 找到您的域名行

域名状态应该显示为：**正常**

---

### 步骤 4: 进入 DNS 管理

在 focus.college 域名行：
1. 找到右侧的操作按钮
2. 点击 **管理** 或 **解析**

进入域名管理页面，您会看到：
- 域名信息
- DNS 服务器信息
- 解析记录

---

### 步骤 5: 查看当前 DNS 服务器

在域名管理页面，找到 **DNS 服务器** 或 **DNS 修改** 部分

当前的 DNS 服务器应该是阿里云的（类似）：
```
dns1.hichina.com
dns2.hichina.com
```
或
```
vip1.alidns.com
vip2.alidns.com
```

---

### 步骤 6: 修改 DNS 服务器

#### 6.1 点击修改按钮

找到 **DNS 服务器** 旁边的 **修改** 或 **修改 DNS 服务器** 按钮，点击

#### 6.2 选择修改类型

您可能会看到两个选项：
- **修改为阿里云 DNS**
- **修改为自定义 DNS**

选择：**修改为自定义 DNS** 或 **修改 DNS 服务器**

#### 6.3 输入 Cloudflare Nameservers

会出现输入框，通常有两个或多个：

**DNS 服务器 1**:
```
输入: [your-nameserver-1].ns.cloudflare.com
例如: chad.ns.cloudflare.com
```

**DNS 服务器 2**:
```
输入: [your-nameserver-2].ns.cloudflare.com
例如: lola.ns.cloudflare.com
```

⚠️ **注意**：
- 请使用您从 Cloudflare 获得的实际 Nameservers
- 不要包含 `http://` 或 `https://`
- 确保拼写完全正确

#### 6.4 确认修改

1. 仔细检查输入的 Nameservers
2. 点击 **确定** 或 **保存**
3. 可能会要求再次确认
4. 阅读提示信息（DNS 修改需要时间生效）
5. 点击 **确认修改**

✅ 看到 "修改成功" 或 "DNS 服务器修改成功" 提示

---

### 步骤 7: 等待生效提示

修改成功后，阿里云会显示：

```
✅ DNS 服务器修改成功

您的 DNS 服务器已从：
  dns1.hichina.com
  dns2.hichina.com
  
修改为：
  chad.ns.cloudflare.com
  lola.ns.cloudflare.com

⚠️ DNS 修改需要 24-48 小时在全球生效
```

---

### 步骤 8: 验证修改

#### 8.1 在阿里云验证

刷新域名管理页面，应该看到：

**DNS 服务器**:
```
chad.ns.cloudflare.com
lola.ns.cloudflare.com
```

状态可能显示为：
- **修改中**（刚修改完成）
- **正常**（已生效）

#### 8.2 在终端验证（可选）

打开终端或命令提示符：

```bash
# macOS / Linux
nslookup focus.college

# 或使用 dig
dig focus.college NS
```

**立即执行**（可能还未生效）：
```
Server:  dns1.hichina.com
Address: xxx.xxx.xxx.xxx
```

**生效后**（几分钟到几小时后）：
```
Server:  chad.ns.cloudflare.com
Address: 104.21.x.x
```

---

### 步骤 9: 回到 Cloudflare 完成验证

1. 返回 Cloudflare Dashboard
2. 进入 focus.college 域名页面
3. 如果还在 Nameserver 设置页面：
   - 点击 **Done, check nameservers**
4. Cloudflare 会检查 DNS 修改状态

**可能的结果**:

**情况 A: 立即成功** ✅
```
Status: Active
Your site is active on Cloudflare
```
说明 DNS 已快速生效！

**情况 B: 等待中** ⏳
```
Status: Pending Nameserver Update
We are waiting for your DNS provider to update your nameservers
```
这是正常的，需要等待

**情况 C: 失败** ❌
```
Status: Nameserver update not detected
```
请检查：
- Nameservers 是否输入正确
- 是否已保存修改
- 稍后重试

---

## ⏱️ DNS 生效时间

### 传播时间线

| 时间 | 状态 | 说明 |
|------|------|------|
| 0-5 分钟 | 开始传播 | 部分 DNS 服务器开始更新 |
| 10-30 分钟 | 部分生效 | 某些地区可以访问 |
| 1-2 小时 | 大部分生效 | 多数地区可以访问 |
| 24-48 小时 | 完全生效 | 全球所有地区生效 |

### 加速生效方法

1. **清除本地 DNS 缓存**:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Windows
   ipconfig /flushdns
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

2. **使用无痕模式**访问网站

3. **使用移动网络**测试（避免 ISP DNS 缓存）

---

## 🔍 检查 DNS 传播状态

### 方法 1: 在线工具（推荐）

访问：https://www.whatsmydns.net/

1. 在搜索框输入：`focus.college`
2. 选择记录类型：`NS` (Nameserver)
3. 点击 **Search**

您会看到全球不同位置的 DNS 查询结果：
- ✅ 绿色勾 = 已更新为 Cloudflare Nameservers
- ❌ 红叉 = 还是旧的 DNS 服务器

当所有位置都显示绿色勾，说明完全生效！

### 方法 2: 使用命令行

```bash
# 查询 Nameserver
dig focus.college NS

# 期望看到
;; ANSWER SECTION:
focus.college.  86400  IN  NS  chad.ns.cloudflare.com.
focus.college.  86400  IN  NS  lola.ns.cloudflare.com.
```

### 方法 3: 使用我们的检查脚本

```bash
cd /home/user/webapp
./check-deployment.sh
```

---

## ⚠️ 注意事项

### 1. 域名实名认证

如果域名未实名认证：
- 阿里云可能限制 DNS 修改
- 需要先完成实名认证
- 实名认证通常需要 1-3 个工作日

### 2. 域名状态

确保域名状态为 **正常**：
- 不在 **锁定** 状态
- 不在 **转移中** 状态
- 不在 **赎回期** 状态

### 3. 保留原有解析记录

Cloudflare 会自动扫描并导入阿里云的 DNS 记录，包括：
- A 记录
- CNAME 记录
- MX 记录（邮箱）
- TXT 记录

但建议在修改前：
1. 在阿里云导出解析记录（备份）
2. 截图保存重要记录
3. 特别注意邮箱相关记录

### 4. 子域名

如果您有子域名（如 `blog.focus.college`, `api.focus.college`）：
- 这些记录会自动迁移到 Cloudflare
- 迁移后在 Cloudflare DNS 管理中查看和修改

### 5. 邮箱服务

如果域名用于企业邮箱：
- ⚠️ DNS 修改可能影响邮件收发
- 确保 MX 记录正确迁移到 Cloudflare
- 建议在低峰期操作

---

## 🔄 回滚方案

如果需要回滚到阿里云 DNS：

1. 登录阿里云域名管理
2. 点击 **修改 DNS 服务器**
3. 选择 **修改为阿里云 DNS**
4. 选择对应的 DNS 服务器
5. 确认修改

阿里云 DNS 服务器：
```
dns1.hichina.com
dns2.hichina.com
```
或
```
vip1.alidns.com
vip2.alidns.com
```

---

## ✅ 配置完成检查

确认以下项目：

- [ ] ✅ 阿里云显示 DNS 已修改为 Cloudflare Nameservers
- [ ] ✅ Cloudflare 显示域名状态为 Active 或 Pending
- [ ] ✅ `nslookup focus.college` 返回 Cloudflare IP（生效后）
- [ ] ✅ https://www.whatsmydns.net/ 显示大部分地区已更新
- [ ] ✅ 已备份原有 DNS 解析记录

---

## 🆘 常见问题

### Q1: 修改后立即看不到效果正常吗？
**A**: 完全正常！DNS 传播需要时间，通常 30 分钟到 2 小时。

### Q2: 会不会影响网站访问？
**A**: 理论上不会。在传播期间：
- 部分用户看到旧 DNS（访问旧服务器）
- 部分用户看到新 DNS（访问 Cloudflare）

建议在低峰期操作。

### Q3: 可以随时改回来吗？
**A**: 可以！按照回滚方案操作即可。

### Q4: Cloudflare 显示 Pending 要等多久？
**A**: 通常 30 分钟到 2 小时。如果超过 24 小时还是 Pending：
- 检查阿里云是否真的修改成功
- 确认 Nameservers 拼写正确
- 联系 Cloudflare 支持

### Q5: 邮箱会受影响吗？
**A**: 如果 MX 记录正确迁移到 Cloudflare，不会影响。
建议：
- 在 Cloudflare DNS 中检查 MX 记录
- 发送测试邮件验证

---

## 📞 需要帮助？

遇到问题请提供：

1. **阿里云截图**: 显示当前 DNS 服务器
2. **Cloudflare 截图**: 显示域名状态
3. **错误信息**: 完整的错误提示
4. **nslookup 结果**: 
   ```bash
   nslookup focus.college
   ```

---

## 📅 记录表

**操作人员**: ___________  
**操作时间**: ___________  
**阿里云原 DNS**: ___________  
**Cloudflare Nameserver 1**: ___________  
**Cloudflare Nameserver 2**: ___________  
**预计完全生效时间**: ___________ (操作时间 + 24-48小时)

---

**文档版本**: 1.0  
**创建时间**: 2025-11-24  
**适用域名**: focus.college  
**域名注册商**: 阿里云
