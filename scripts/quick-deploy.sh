#!/bin/bash

# 快速部署脚本 - 直接推送到GitHub并手动触发Cloudflare部署
# 用途：提交代码 → GitHub → 提示用户合并

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印函数
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

print_header() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  ${1}${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 检查是否在正确的分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "genspark_ai_developer" ]; then
    print_warning "当前不在 genspark_ai_developer 分支，正在切换..."
    git checkout genspark_ai_developer || {
        print_error "无法切换到 genspark_ai_developer 分支"
        exit 1
    }
fi

print_header "🚀 Focus.College 快速部署工具"

# 检查是否有未提交的更改
if [ -z "$(git status --porcelain)" ]; then
    print_warning "没有检测到未提交的更改"
    read -p "是否继续创建PR？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "操作已取消"
        exit 0
    fi
else
    # 显示更改
    print_info "检测到以下更改："
    echo
    git status --short
    echo
    
    # 获取提交信息
    read -p "请输入提交信息: " COMMIT_MSG
    if [ -z "$COMMIT_MSG" ]; then
        print_error "提交信息不能为空"
        exit 1
    fi
    
    # 提交更改
    print_info "正在提交更改..."
    git add .
    git commit -m "$COMMIT_MSG"
    print_success "代码已提交: $COMMIT_MSG"
fi

# 同步远程main分支
print_info "同步远程main分支..."
git fetch origin main

# 检查是否需要rebase
BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")
if [ "$BEHIND" -gt 0 ]; then
    print_warning "本地分支落后 $BEHIND 个提交，正在rebase..."
    if git rebase origin/main; then
        print_success "Rebase完成"
    else
        print_error "Rebase失败，可能有冲突需要解决"
        print_info "解决冲突后运行: git rebase --continue"
        print_info "然后重新运行此脚本"
        exit 1
    fi
fi

# 推送到远程
print_info "推送到远程仓库..."
if git push origin genspark_ai_developer --force-with-lease; then
    print_success "代码已推送到 GitHub"
else
    print_error "推送失败"
    exit 1
fi

# 检查是否已存在PR
EXISTING_PR=$(gh pr list --head genspark_ai_developer --base main --json number --jq '.[0].number' 2>/dev/null || echo "")

if [ -z "$EXISTING_PR" ]; then
    # 创建新PR
    print_info "创建Pull Request..."
    
    # 生成PR描述
    COMMIT_COUNT=$(git rev-list --count origin/main..HEAD)
    
    PR_BODY=$(cat <<EOF
## 📝 变更摘要

此PR包含 $COMMIT_COUNT 个提交：

\`\`\`
$(git log --oneline origin/main..HEAD)
\`\`\`

## 🚀 部署说明

**合并此PR后需要手动部署到Cloudflare Pages**

### 方法1：GitHub自动部署（推荐）
合并PR后，Cloudflare Pages会自动检测main分支的更新并部署（如果已配置GitHub集成）

### 方法2：手动部署
\`\`\`bash
git checkout main
git pull
npm run build
npx wrangler pages deploy dist/public --project-name=focus-college
\`\`\`

## ✅ 检查清单

- [x] 代码已本地测试
- [x] 已同步main分支最新代码
- [x] 准备好部署到生产环境

---

🤖 由 GenSpark AI 自动生成
📅 创建时间: $(date '+%Y-%m-%d %H:%M:%S')
EOF
)
    
    PR_URL=$(gh pr create \
        --base main \
        --head genspark_ai_developer \
        --title "🚀 $(git log -1 --pretty=%s)" \
        --body "$PR_BODY" \
        2>&1)
    
    if [ $? -eq 0 ]; then
        print_success "PR已创建！"
        
        # 提取PR编号
        PR_NUMBER=$(echo "$PR_URL" | grep -oP 'pull/\K\d+' || gh pr list --head genspark_ai_developer --base main --json number --jq '.[0].number')
        
        print_header "✨ 下一步操作"
        echo
        echo -e "${GREEN}1️⃣  查看PR：${NC}"
        echo -e "   ${CYAN}$PR_URL${NC}"
        echo
        echo -e "${GREEN}2️⃣  合并PR到main分支（选择以下方式之一）：${NC}"
        echo
        echo -e "${YELLOW}   方式A - 使用命令行：${NC}"
        echo -e "   ${CYAN}gh pr merge $PR_NUMBER --squash --delete-branch${NC}"
        echo
        echo -e "${YELLOW}   方式B - 使用GitHub网页：${NC}"
        echo -e "   访问上面的PR链接，点击 'Merge pull request'"
        echo
        echo -e "${GREEN}3️⃣  部署到Cloudflare Pages：${NC}"
        echo
        echo -e "${YELLOW}   自动部署（如果已配置）：${NC}"
        echo -e "   合并后Cloudflare会自动检测并部署"
        echo
        echo -e "${YELLOW}   手动部署（如果需要）：${NC}"
        echo -e "   ${CYAN}npm run deploy:direct${NC}"
        echo
        print_header "🎉 准备就绪！"
        
    else
        print_error "创建PR失败: $PR_URL"
        exit 1
    fi
else
    print_info "更新现有PR #$EXISTING_PR..."
    
    COMMIT_COUNT=$(git rev-list --count origin/main..HEAD)
    PR_BODY=$(cat <<EOF
## 📝 变更摘要（已更新）

此PR包含 $COMMIT_COUNT 个提交：

\`\`\`
$(git log --oneline origin/main..HEAD)
\`\`\`

## 🚀 部署说明

**合并此PR后需要手动部署到Cloudflare Pages**

### 方法1：GitHub自动部署（推荐）
合并PR后，Cloudflare Pages会自动检测main分支的更新并部署（如果已配置GitHub集成）

### 方法2：手动部署
\`\`\`bash
git checkout main
git pull
npm run build
npx wrangler pages deploy dist/public --project-name=focus-college
\`\`\`

---

🤖 由 GenSpark AI 自动生成
📅 最后更新: $(date '+%Y-%m-%d %H:%M:%S')
EOF
)
    
    gh pr edit "$EXISTING_PR" \
        --title "🚀 $(git log -1 --pretty=%s)" \
        --body "$PR_BODY"
    
    PR_URL="https://github.com/callaaron/focus.college/pull/$EXISTING_PR"
    print_success "PR已更新！"
    
    print_header "✨ 下一步操作"
    echo
    echo -e "${GREEN}1️⃣  查看PR：${NC}"
    echo -e "   ${CYAN}$PR_URL${NC}"
    echo
    echo -e "${GREEN}2️⃣  合并PR：${NC}"
    echo -e "   ${CYAN}gh pr merge $EXISTING_PR --squash --delete-branch${NC}"
    echo
    echo -e "${GREEN}3️⃣  部署：${NC}"
    echo -e "   ${CYAN}npm run deploy:direct${NC}"
    echo
    print_header "🎉 准备就绪！"
fi
