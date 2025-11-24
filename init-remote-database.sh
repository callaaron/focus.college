#!/bin/bash

# 远程数据库初始化脚本（用于宝塔面板 MySQL）

echo "🚀 Focus College 数据库初始化脚本"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否设置了 DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ 错误: DATABASE_URL 环境变量未设置${NC}"
    echo ""
    echo "请先设置 DATABASE_URL："
    echo "export DATABASE_URL=\"mysql://用户名:密码@服务器IP:3306/数据库名\""
    echo ""
    echo "示例："
    echo "export DATABASE_URL=\"mysql://focus_college_user:your_password@123.456.789.123:3306/focus_college\""
    exit 1
fi

echo -e "${GREEN}✅ DATABASE_URL 已设置${NC}"
echo "连接字符串: ${DATABASE_URL:0:30}...（已隐藏敏感信息）"
echo ""

# 测试数据库连接
echo "🔍 测试数据库连接..."
if npx tsx scripts/test-remote-db.ts > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 数据库连接成功${NC}"
else
    echo -e "${RED}❌ 数据库连接失败${NC}"
    echo ""
    echo "请检查："
    echo "1. DATABASE_URL 是否正确"
    echo "2. 服务器 3306 端口是否开放"
    echo "3. 宝塔数据库访问权限是否设置为'所有人'"
    echo "4. 服务器安全组是否放行 3306 端口"
    echo ""
    echo "运行以下命令进行详细测试："
    echo "npx tsx scripts/test-remote-db.ts"
    exit 1
fi

echo ""
echo "================================"
echo "开始初始化数据库..."
echo "================================"
echo ""

# 1. 运行数据库迁移
echo "📝 [1/6] 运行数据库迁移..."
if npm run db:push; then
    echo -e "${GREEN}✅ 数据库迁移完成${NC}"
else
    echo -e "${RED}❌ 数据库迁移失败${NC}"
    exit 1
fi

echo ""

# 2. 插入能力体系数据
echo "📊 [2/6] 插入能力体系数据（8个领域，40个能力）..."
if npx tsx scripts/seed-competency-data.ts; then
    echo -e "${GREEN}✅ 能力体系数据插入完成${NC}"
else
    echo -e "${YELLOW}⚠️  能力体系数据插入失败（可能已存在）${NC}"
fi

echo ""

# 3. 插入行业-能力关联
echo "🏢 [3/6] 插入行业-能力关联（168条关联）..."
if npx tsx scripts/seed-industry-competencies.ts; then
    echo -e "${GREEN}✅ 行业-能力关联插入完成${NC}"
else
    echo -e "${YELLOW}⚠️  行业-能力关联插入失败（可能已存在）${NC}"
fi

echo ""

# 4. 插入职位-能力关联
echo "👔 [4/6] 插入职位-能力关联（144条关联）..."
if npx tsx scripts/seed-position-competencies.ts; then
    echo -e "${GREEN}✅ 职位-能力关联插入完成${NC}"
else
    echo -e "${YELLOW}⚠️  职位-能力关联插入失败（可能已存在）${NC}"
fi

echo ""

# 5. 修复行业编码
echo "🔧 [5/6] 修复行业编码（21个行业）..."
if npx tsx scripts/fix-industries-encoding.ts; then
    echo -e "${GREEN}✅ 行业编码修复完成${NC}"
else
    echo -e "${YELLOW}⚠️  行业编码修复失败${NC}"
fi

echo ""

# 6. 插入题库数据
echo "📝 [6/6] 插入题库数据（30道题）..."
if npx tsx scripts/fix-question-encoding.ts; then
    echo -e "${GREEN}✅ 题库数据插入完成${NC}"
else
    echo -e "${YELLOW}⚠️  题库数据插入失败（可能已存在）${NC}"
fi

echo ""
echo "================================"
echo "🎉 数据库初始化完成！"
echo "================================"
echo ""

echo "📊 数据统计:"
echo "  - 能力领域: 8 个"
echo "  - 通用能力: 40 个"
echo "  - 行业: 21 个"
echo "  - 职位: 12 个"
echo "  - 题库: 30 道"
echo "  - 行业-能力关联: 168 条"
echo "  - 职位-能力关联: 144 条"
echo ""

echo "✅ 下一步:"
echo "1. 在 Cloudflare Pages 配置环境变量（DATABASE_URL）"
echo "2. 触发重新部署"
echo "3. 访问网站测试功能"
echo ""

echo "🔍 验证数据（可选）:"
echo "运行以下命令查看数据库大小："
echo "npx tsx scripts/check-database-size.ts"
