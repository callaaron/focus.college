#!/bin/bash

# 生产环境部署检查脚本
# 用途：部署前检查所有必要配置和文件

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

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_header() {
    echo
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  ${1}${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo
}

ERRORS=0
WARNINGS=0

print_header "🔍 生产环境部署检查"

# 1. 检查 Git 状态
print_info "检查 Git 状态..."
if [ -d ".git" ]; then
    CURRENT_BRANCH=$(git branch --show-current)
    print_success "Git 仓库已初始化 (分支: $CURRENT_BRANCH)"
    
    # 检查未提交的更改
    if ! git diff-index --quiet HEAD --; then
        print_warning "有未提交的更改，建议先提交"
        WARNINGS=$((WARNINGS + 1))
    else
        print_success "所有更改已提交"
    fi
    
    # 检查是否与远程同步
    git fetch origin main --quiet 2>/dev/null || true
    LOCAL=$(git rev-parse @ 2>/dev/null)
    REMOTE=$(git rev-parse @{u} 2>/dev/null)
    if [ "$LOCAL" = "$REMOTE" ]; then
        print_success "代码已与远程同步"
    else
        print_warning "本地代码与远程不同步"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    print_error "未找到 Git 仓库"
    ERRORS=$((ERRORS + 1))
fi

# 2. 检查必需文件
print_info "检查必需文件..."

REQUIRED_FILES=(
    "package.json"
    "wrangler.toml"
    "vite.config.ts"
    "drizzle/schema.ts"
    "scripts/seed-challenges.sql"
    "client/src/pages/Challenge.tsx"
    "client/src/pages/Achievements.tsx"
    "client/src/components/AchievementCard.tsx"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "找到: $file"
    else
        print_error "缺失: $file"
        ERRORS=$((ERRORS + 1))
    fi
done

# 3. 检查 wrangler.toml 配置
print_info "检查 Cloudflare 配置..."

if [ -f "wrangler.toml" ]; then
    if grep -q "focus-college" wrangler.toml; then
        print_success "项目名称配置正确: focus-college"
    else
        print_error "wrangler.toml 中未找到项目名称"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "d1_databases" wrangler.toml; then
        print_success "D1 数据库配置存在"
        DB_ID=$(grep "database_id" wrangler.toml | cut -d'"' -f2)
        if [ ! -z "$DB_ID" ]; then
            print_success "数据库 ID: $DB_ID"
        fi
    else
        print_warning "未找到 D1 数据库配置"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if grep -q "dist/public" wrangler.toml; then
        print_success "构建输出目录配置正确: dist/public"
    else
        print_warning "构建输出目录可能配置不正确"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# 4. 检查 package.json 脚本
print_info "检查构建脚本..."

if grep -q '"build":' package.json; then
    print_success "构建脚本已定义"
    BUILD_COMMAND=$(grep '"build":' package.json | cut -d'"' -f4)
    print_info "构建命令: $BUILD_COMMAND"
else
    print_error "未找到构建脚本"
    ERRORS=$((ERRORS + 1))
fi

# 5. 检查依赖
print_info "检查依赖安装..."

if [ -d "node_modules" ]; then
    print_success "node_modules 目录存在"
    
    # 检查关键依赖
    if [ -f "node_modules/.package-lock.json" ] || [ -f "node_modules/.pnpm-lock.yaml" ]; then
        print_success "依赖已安装"
    else
        print_warning "依赖可能未完全安装，建议运行 npm install"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    print_error "node_modules 不存在，需要运行 npm install"
    ERRORS=$((ERRORS + 1))
fi

# 6. 检查环境变量模板
print_info "检查环境变量配置..."

if [ -f ".env.example" ]; then
    print_success "找到 .env.example 模板"
else
    print_warning "未找到 .env.example 模板"
    WARNINGS=$((WARNINGS + 1))
fi

# 检查敏感信息
if [ -f ".env" ]; then
    if grep -q "development-secret" .env || grep -q "change-in-production" .env; then
        print_warning ".env 包含开发环境密钥，生产环境需要更改"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# 7. 检查数据库迁移文件
print_info "检查数据库迁移..."

if [ -d "drizzle/migrations-d1" ]; then
    MIGRATION_COUNT=$(ls -1 drizzle/migrations-d1/*.sql 2>/dev/null | wc -l)
    if [ $MIGRATION_COUNT -gt 0 ]; then
        print_success "找到 $MIGRATION_COUNT 个迁移文件"
    else
        print_warning "迁移目录存在但为空"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    print_warning "未找到迁移目录，可能需要运行 npm run db:generate:d1"
    WARNINGS=$((WARNINGS + 1))
fi

# 8. 检查挑战题库数据
print_info "检查挑战题库..."

if [ -f "scripts/seed-challenges.sql" ]; then
    CHALLENGE_COUNT=$(grep -c "INSERT INTO challenges" scripts/seed-challenges.sql || echo 0)
    ACHIEVEMENT_COUNT=$(grep -c "INSERT INTO challengeAchievements" scripts/seed-challenges.sql || echo 0)
    
    if [ $CHALLENGE_COUNT -ge 30 ]; then
        print_success "题库包含 $CHALLENGE_COUNT 道题目"
    else
        print_warning "题库可能不完整，只有 $CHALLENGE_COUNT 道题目（预期至少30道）"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if [ $ACHIEVEMENT_COUNT -ge 10 ]; then
        print_success "包含 $ACHIEVEMENT_COUNT 个成就"
    else
        print_warning "成就数量较少，只有 $ACHIEVEMENT_COUNT 个"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    print_error "未找到题库数据文件 scripts/seed-challenges.sql"
    ERRORS=$((ERRORS + 1))
fi

# 9. 检查 Cloudflare 认证
print_info "检查 Cloudflare 认证..."

if [ ! -z "$CLOUDFLARE_API_TOKEN" ]; then
    print_success "找到 CLOUDFLARE_API_TOKEN 环境变量"
else
    print_warning "未设置 CLOUDFLARE_API_TOKEN，部署时可能需要"
    print_info "建议：运行 'npx wrangler login' 或设置 CLOUDFLARE_API_TOKEN"
    WARNINGS=$((WARNINGS + 1))
fi

# 10. 测试构建（可选）
print_info "检查构建配置..."

if [ -f "vite.config.ts" ]; then
    print_success "找到 Vite 配置文件"
else
    print_error "未找到 vite.config.ts"
    ERRORS=$((ERRORS + 1))
fi

# 总结
print_header "📊 检查结果总结"

echo -e "${CYAN}总计检查项：${NC} 10"
echo -e "${GREEN}成功：${NC} $((10 - ERRORS - WARNINGS))"
echo -e "${YELLOW}警告：${NC} $WARNINGS"
echo -e "${RED}错误：${NC} $ERRORS"
echo

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    print_header "🎉 所有检查通过！准备部署"
    echo
    echo -e "${GREEN}建议的部署步骤：${NC}"
    echo
    echo "方式一（推荐）：GitHub 自动部署"
    echo "  1. 确保代码已推送到 GitHub main 分支"
    echo "  2. 在 Cloudflare Dashboard 配置 GitHub 集成"
    echo "  3. 等待自动部署完成"
    echo
    echo "方式二：命令行部署"
    echo "  1. npm run build"
    echo "  2. npx wrangler pages deploy dist/public --project-name=focus-college"
    echo
    echo "部署后别忘记："
    echo "  • 应用数据库迁移：npx wrangler d1 migrations apply focus-college-db --remote"
    echo "  • 导入题库数据：npx wrangler d1 execute focus-college-db --remote --file=scripts/seed-challenges.sql"
    echo
    exit 0
elif [ $ERRORS -eq 0 ]; then
    print_header "⚠️  有警告项，但可以继续部署"
    echo
    echo -e "${YELLOW}建议先解决警告项，或者继续部署并在生产环境中配置${NC}"
    echo
    exit 0
else
    print_header "❌ 发现错误，需要修复后再部署"
    echo
    echo -e "${RED}请修复上述错误后再次运行此脚本${NC}"
    echo
    exit 1
fi
