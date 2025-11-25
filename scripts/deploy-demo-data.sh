#!/bin/bash

# 部署演示数据到 Cloudflare D1
# 需要先生成密码哈希

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  ${1}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_header "部署演示账户数据到生产环境"

# 生成密码哈希 (demo123)
print_info "生成密码哈希..."
PASSWORD_HASH=$(node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('demo123', 10));")
print_success "密码哈希生成完成"

# 替换SQL文件中的密码哈希
print_info "准备SQL文件..."
sed "s/\$2a\$10\$YourHashedPasswordHere/$PASSWORD_HASH/g" scripts/seed-demo-users-d1.sql > /tmp/seed-demo-users.sql
print_success "SQL文件准备完成"

# 执行SQL到远程D1数据库
print_info "部署到 Cloudflare D1 数据库..."
wrangler d1 execute focus-college-db --remote --file=/tmp/seed-demo-users.sql

if [ $? -eq 0 ]; then
    print_success "演示数据部署完成！"
    echo
    print_header "演示账户信息"
    echo -e "${GREEN}1. 产品经理${NC}"
    echo -e "   用户名: demo_pm"
    echo -e "   密码: demo123"
    echo -e "   角色: 高级产品经理"
    echo
    echo -e "${GREEN}2. 技术总监${NC}"
    echo -e "   用户名: demo_cto"
    echo -e "   密码: demo123"
    echo -e "   角色: 首席技术官"
    echo
    echo -e "${GREEN}3. 首席执行官${NC}"
    echo -e "   用户名: demo_ceo"
    echo -e "   密码: demo123"
    echo -e "   角色: 首席执行官"
    echo
else
    print_error "部署失败"
    exit 1
fi

# 清理临时文件
rm -f /tmp/seed-demo-users.sql
