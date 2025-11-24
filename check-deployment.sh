#!/bin/bash

# focus.college 部署状态检查脚本

echo "🔍 检查 focus.college 部署状态..."
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 DNS
echo "📡 DNS 检查..."
echo "---"

echo -n "检查 focus.college DNS: "
if nslookup focus.college > /dev/null 2>&1; then
    DNS_IP=$(nslookup focus.college | grep "Address:" | tail -1 | awk '{print $2}')
    if [[ $DNS_IP == 104.* ]] || [[ $DNS_IP == 172.* ]]; then
        echo -e "${GREEN}✅ 已解析到 Cloudflare ($DNS_IP)${NC}"
    else
        echo -e "${YELLOW}⚠️  解析到 $DNS_IP (可能还未迁移到 Cloudflare)${NC}"
    fi
else
    echo -e "${RED}❌ DNS 解析失败${NC}"
fi

echo -n "检查 www.focus.college DNS: "
if nslookup www.focus.college > /dev/null 2>&1; then
    WWW_DNS_IP=$(nslookup www.focus.college | grep "Address:" | tail -1 | awk '{print $2}')
    if [[ $WWW_DNS_IP == 104.* ]] || [[ $WWW_DNS_IP == 172.* ]]; then
        echo -e "${GREEN}✅ 已解析到 Cloudflare ($WWW_DNS_IP)${NC}"
    else
        echo -e "${YELLOW}⚠️  解析到 $WWW_DNS_IP (可能还未迁移到 Cloudflare)${NC}"
    fi
else
    echo -e "${RED}❌ DNS 解析失败${NC}"
fi

echo ""

# 检查 HTTP 访问
echo "🌐 HTTP 访问检查..."
echo "---"

echo -n "检查 https://focus.college: "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -m 10 https://focus.college 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200 (正常)${NC}"
elif [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${YELLOW}⚠️  HTTP $HTTP_CODE (重定向)${NC}"
elif [ -z "$HTTP_CODE" ]; then
    echo -e "${RED}❌ 无法访问 (DNS 可能未生效)${NC}"
else
    echo -e "${RED}❌ HTTP $HTTP_CODE${NC}"
fi

echo -n "检查 https://www.focus.college: "
WWW_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -m 10 https://www.focus.college 2>/dev/null)
if [ "$WWW_HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200 (正常)${NC}"
elif [ "$WWW_HTTP_CODE" = "301" ] || [ "$WWW_HTTP_CODE" = "302" ]; then
    echo -e "${YELLOW}⚠️  HTTP $WWW_HTTP_CODE (重定向)${NC}"
elif [ -z "$WWW_HTTP_CODE" ]; then
    echo -e "${RED}❌ 无法访问 (DNS 可能未生效)${NC}"
else
    echo -e "${RED}❌ HTTP $WWW_HTTP_CODE${NC}"
fi

echo ""

# 检查 SSL 证书
echo "🔒 SSL 证书检查..."
echo "---"

echo -n "检查 focus.college SSL: "
if curl -vI https://focus.college 2>&1 | grep -q "SSL certificate verify ok"; then
    CERT_ISSUER=$(curl -vI https://focus.college 2>&1 | grep "issuer:" | head -1)
    if echo "$CERT_ISSUER" | grep -q "Cloudflare"; then
        echo -e "${GREEN}✅ SSL 有效 (Cloudflare 签发)${NC}"
    else
        echo -e "${YELLOW}⚠️  SSL 有效 (非 Cloudflare 签发)${NC}"
    fi
else
    echo -e "${RED}❌ SSL 证书无效或无法验证${NC}"
fi

echo ""

# 检查响应时间
echo "⚡ 性能检查..."
echo "---"

echo -n "首字节时间 (TTFB): "
TTFB=$(curl -o /dev/null -s -w "%{time_starttransfer}" -m 10 https://focus.college 2>/dev/null)
if [ ! -z "$TTFB" ]; then
    TTFB_MS=$(echo "$TTFB * 1000" | bc)
    if (( $(echo "$TTFB < 0.5" | bc -l) )); then
        echo -e "${GREEN}✅ ${TTFB}s (${TTFB_MS%.*}ms) - 优秀${NC}"
    elif (( $(echo "$TTFB < 1.0" | bc -l) )); then
        echo -e "${YELLOW}⚠️  ${TTFB}s (${TTFB_MS%.*}ms) - 良好${NC}"
    else
        echo -e "${RED}❌ ${TTFB}s (${TTFB_MS%.*}ms) - 需要优化${NC}"
    fi
else
    echo -e "${RED}❌ 无法测量${NC}"
fi

echo -n "总加载时间: "
TOTAL=$(curl -o /dev/null -s -w "%{time_total}" -m 10 https://focus.college 2>/dev/null)
if [ ! -z "$TOTAL" ]; then
    TOTAL_MS=$(echo "$TOTAL * 1000" | bc)
    if (( $(echo "$TOTAL < 2.0" | bc -l) )); then
        echo -e "${GREEN}✅ ${TOTAL}s (${TOTAL_MS%.*}ms) - 优秀${NC}"
    elif (( $(echo "$TOTAL < 5.0" | bc -l) )); then
        echo -e "${YELLOW}⚠️  ${TOTAL}s (${TOTAL_MS%.*}ms) - 良好${NC}"
    else
        echo -e "${RED}❌ ${TOTAL}s (${TOTAL_MS%.*}ms) - 需要优化${NC}"
    fi
else
    echo -e "${RED}❌ 无法测量${NC}"
fi

echo ""

# 检查安全头
echo "🛡️  安全头检查..."
echo "---"

HEADERS=$(curl -sI https://focus.college 2>/dev/null)

echo -n "X-Frame-Options: "
if echo "$HEADERS" | grep -qi "X-Frame-Options"; then
    echo -e "${GREEN}✅ 已配置${NC}"
else
    echo -e "${YELLOW}⚠️  未配置${NC}"
fi

echo -n "X-Content-Type-Options: "
if echo "$HEADERS" | grep -qi "X-Content-Type-Options"; then
    echo -e "${GREEN}✅ 已配置${NC}"
else
    echo -e "${YELLOW}⚠️  未配置${NC}"
fi

echo -n "Strict-Transport-Security: "
if echo "$HEADERS" | grep -qi "Strict-Transport-Security"; then
    echo -e "${GREEN}✅ 已配置 (HSTS)${NC}"
else
    echo -e "${YELLOW}⚠️  未配置${NC}"
fi

echo ""

# 总结
echo "================================"
echo "📊 检查完成"
echo ""

# 判断整体状态
if [ "$HTTP_CODE" = "200" ] && [[ $DNS_IP == 104.* ]]; then
    echo -e "${GREEN}🎉 网站状态: 正常运行${NC}"
    echo ""
    echo "✅ 您的网站已成功部署并可以访问："
    echo "   https://focus.college"
    echo "   https://www.focus.college"
elif [ -z "$HTTP_CODE" ]; then
    echo -e "${YELLOW}⏳ 网站状态: 等待 DNS 生效${NC}"
    echo ""
    echo "DNS 传播通常需要 30 分钟到 2 小时"
    echo "请稍后再次运行此脚本检查"
else
    echo -e "${RED}❌ 网站状态: 存在问题${NC}"
    echo ""
    echo "请检查："
    echo "1. Cloudflare Pages 部署是否成功"
    echo "2. DNS 配置是否正确"
    echo "3. 环境变量是否设置"
fi

echo ""
echo "💡 提示: 如需详细诊断信息，请访问："
echo "   - Cloudflare Dashboard: https://dash.cloudflare.com/"
echo "   - DNS 传播检查: https://www.whatsmydns.net/"
echo "   - SSL 测试: https://www.ssllabs.com/ssltest/"
