#!/bin/bash
#
# Deploy all seed data to Cloudflare D1 Production Database
# 
# This script will seed:
# 1. Assessment questions (49 questions)
# 2. Industries data (37 industries)
# 3. Positions data (39 positions)
#
# Usage:
#   CLOUDFLARE_API_TOKEN="your-token" ./scripts/deploy-all-seeds.sh
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Complete Database Seeding Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if CLOUDFLARE_API_TOKEN is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo -e "${RED}❌ Error: CLOUDFLARE_API_TOKEN environment variable is not set${NC}"
  echo ""
  echo "Please set your Cloudflare API token:"
  echo "  export CLOUDFLARE_API_TOKEN='your-token-here'"
  echo ""
  exit 1
fi

# Database configuration
DB_NAME="focus-college-db"

echo -e "${YELLOW}📋 Database: $DB_NAME${NC}"
echo ""

# Seed files
SEEDS=(
  "drizzle/seed-questions.sql:Assessment Questions (49)"
  "scripts/seed-industries.sql:Industries (37)"
  "scripts/seed-positions.sql:Positions (39)"
)

# Confirm before proceeding
echo -e "${YELLOW}⚠️  This will seed the PRODUCTION database with:${NC}"
for seed in "${SEEDS[@]}"; do
  IFS=':' read -r file desc <<< "$seed"
  echo "  - $desc"
done
echo ""
read -p "Do you want to continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo -e "${RED}❌ Seeding cancelled${NC}"
  exit 0
fi

echo ""
echo -e "${GREEN}🚀 Starting complete database seeding...${NC}"
echo ""

# Execute each seed file
SUCCESS_COUNT=0
FAIL_COUNT=0

for seed in "${SEEDS[@]}"; do
  IFS=':' read -r file desc <<< "$seed"
  
  if [ ! -f "$file" ]; then
    echo -e "${RED}❌ File not found: $file${NC}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    continue
  fi
  
  echo -e "${BLUE}📤 Seeding: $desc${NC}"
  echo "   File: $file"
  
  if npx wrangler d1 execute "$DB_NAME" --remote --file="$file" > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Success${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo -e "${RED}   ❌ Failed${NC}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
  echo ""
done

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Seeding Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "✅ Successful: ${GREEN}$SUCCESS_COUNT${NC}"
if [ $FAIL_COUNT -gt 0 ]; then
  echo -e "❌ Failed: ${RED}$FAIL_COUNT${NC}"
fi
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}🎉 All data seeded successfully!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Build frontend: npm run build"
  echo "  2. Deploy to Cloudflare Pages"
  echo "  3. Test the application"
else
  echo -e "${YELLOW}⚠️  Some seeds failed. Please check the errors above.${NC}"
  exit 1
fi
