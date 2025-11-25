#!/bin/bash

# 直接部署到Cloudflare Pages
# 用途：构建并部署到生产环境

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  ${1}${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_header "🚀 Cloudflare Pages 直接部署"

# 确保在main分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_info "切换到main分支..."
    git checkout main
    git pull origin main
fi

# 构建项目
print_info "开始构建项目..."
if npm run build; then
    print_success "构建完成"
else
    print_error "构建失败"
    exit 1
fi

# 检查构建输出
if [ ! -d "dist/public" ]; then
    print_error "构建输出目录不存在: dist/public"
    exit 1
fi

print_info "构建输出大小:"
du -sh dist/public

# 部署到Cloudflare Pages
print_info "部署到Cloudflare Pages..."
echo
if npx wrangler pages deploy dist/public --project-name=focus-college; then
    print_success "部署成功！"
    
    print_header "🎉 部署完成"
    echo
    echo -e "${GREEN}生产环境已更新${NC}"
    echo -e "${CYAN}访问: https://focus-college.pages.dev${NC}"
    echo
    echo -e "${BLUE}提示: 可能需要1-2分钟才能在全球CDN上生效${NC}"
    echo
else
    print_error "部署失败"
    echo
    echo -e "${YELLOW}可能的原因：${NC}"
    echo "1. Cloudflare API Token未配置或已过期"
    echo "2. 网络连接问题"
    echo "3. 项目名称不正确"
    echo
    echo -e "${BLUE}解决方案：${NC}"
    echo "1. 检查 .env 文件中的 CLOUDFLARE_API_TOKEN"
    echo "2. 运行: wrangler login"
    echo "3. 确认项目名称为: focus-college"
    exit 1
fi
