#!/bin/bash

# Cloudflare Pages 部署脚本
# 使用方法: ./deploy-cloudflare.sh

set -e

echo "🚀 开始部署到 Cloudflare Pages..."

# 1. 检查依赖
echo "📦 检查依赖..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

# 2. 安装 Wrangler CLI（如果未安装）
if ! command -v wrangler &> /dev/null; then
    echo "📥 安装 Wrangler CLI..."
    npm install -g wrangler
fi

# 3. 检查是否已登录
echo "🔐 检查 Cloudflare 登录状态..."
if ! wrangler whoami &> /dev/null; then
    echo "请先登录 Cloudflare:"
    wrangler login
fi

# 4. 安装项目依赖
echo "📦 安装项目依赖..."
npm install

# 5. 构建项目
echo "🔨 构建项目..."
npm run build

# 6. 复制配置文件到构建目录
echo "📄 复制配置文件..."
cp _headers dist/public/ 2>/dev/null || echo "⚠️  _headers 文件不存在"
cp _redirects dist/public/ 2>/dev/null || echo "⚠️  _redirects 文件不存在"

# 7. 部署到 Cloudflare Pages
echo "🚀 部署到 Cloudflare Pages..."
wrangler pages deploy dist/public --project-name=focus-college

echo ""
echo "✅ 部署完成！"
echo ""
echo "📝 后续步骤:"
echo "1. 访问 Cloudflare Dashboard: https://dash.cloudflare.com/"
echo "2. 进入 Pages → focus-college → Custom domains"
echo "3. 添加您的自定义域名"
echo "4. 配置环境变量 (Settings → Environment variables):"
echo "   - DATABASE_URL"
echo "   - JWT_SECRET"
echo "   - VITE_APP_TITLE"
echo ""
echo "🌐 预览链接将在上方显示"
