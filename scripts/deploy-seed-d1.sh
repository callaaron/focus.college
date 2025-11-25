#!/bin/bash
#
# Deploy seed data to Cloudflare D1 Production Database
# 
# Usage:
#   CLOUDFLARE_API_TOKEN="your-token" ./scripts/deploy-seed-d1.sh
#
# This script will:
# 1. Check if CLOUDFLARE_API_TOKEN is set
# 2. Execute the seed-questions.sql file against the remote D1 database
# 3. Verify the data was inserted correctly
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Cloudflare D1 Seed Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if CLOUDFLARE_API_TOKEN is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo -e "${RED}❌ Error: CLOUDFLARE_API_TOKEN environment variable is not set${NC}"
  echo ""
  echo "Please set your Cloudflare API token:"
  echo "  export CLOUDFLARE_API_TOKEN='your-token-here'"
  echo ""
  echo "Or run the script with the token:"
  echo "  CLOUDFLARE_API_TOKEN='your-token' $0"
  echo ""
  exit 1
fi

# Database configuration
DB_NAME="focus-college-db"
SEED_FILE="drizzle/seed-questions.sql"

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  Database: $DB_NAME"
echo "  Seed File: $SEED_FILE"
echo ""

# Check if seed file exists
if [ ! -f "$SEED_FILE" ]; then
  echo -e "${RED}❌ Error: Seed file not found: $SEED_FILE${NC}"
  exit 1
fi

# Count INSERT statements in the seed file
INSERT_COUNT=$(grep -c "INSERT INTO" "$SEED_FILE")
echo -e "${YELLOW}📊 Seed file contains ${INSERT_COUNT} INSERT statements${NC}"
echo ""

# Confirm before proceeding
echo -e "${YELLOW}⚠️  This will execute SQL against the PRODUCTION database${NC}"
read -p "Do you want to continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo -e "${RED}❌ Deployment cancelled${NC}"
  exit 0
fi

echo ""
echo -e "${GREEN}🚀 Starting deployment...${NC}"
echo ""

# Execute the seed file against remote D1
echo -e "${YELLOW}📤 Executing seed SQL...${NC}"
if npx wrangler d1 execute "$DB_NAME" --remote --file="$SEED_FILE"; then
  echo -e "${GREEN}✅ Seed SQL executed successfully${NC}"
else
  echo -e "${RED}❌ Failed to execute seed SQL${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}🔍 Verifying data...${NC}"

# Verify the data was inserted
VERIFY_SQL="SELECT COUNT(*) as total FROM assessmentQuestions;"
if npx wrangler d1 execute "$DB_NAME" --remote --command="$VERIFY_SQL"; then
  echo -e "${GREEN}✅ Data verification complete${NC}"
else
  echo -e "${YELLOW}⚠️  Could not verify data (this is non-critical)${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Test the assessment system locally"
echo "  2. Build the frontend: npm run build"
echo "  3. Deploy to Cloudflare Pages"
echo ""
