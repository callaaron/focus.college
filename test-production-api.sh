#!/bin/bash

# Production API Test Suite
# Tests all 23 API endpoints

API_BASE="https://focus-college.pages.dev/api/trpc"
RESULTS_FILE="api-test-results.json"

echo "🧪 Focus College Production API Test Suite"
echo "==========================================="
echo "Base URL: $API_BASE"
echo "Started: $(date)"
echo ""

# Initialize results
echo "{" > $RESULTS_FILE
echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"," >> $RESULTS_FILE
echo "  \"base_url\": \"$API_BASE\"," >> $RESULTS_FILE
echo "  \"tests\": [" >> $RESULTS_FILE

test_count=0
pass_count=0
fail_count=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local expected_code=$4
    local data=$5
    
    test_count=$((test_count + 1))
    echo -n "[$test_count] Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_BASE/$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE/$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "$expected_code" ]; then
        echo "✅ PASS (HTTP $http_code)"
        pass_count=$((pass_count + 1))
        status="PASS"
    else
        echo "❌ FAIL (Expected $expected_code, got $http_code)"
        fail_count=$((fail_count + 1))
        status="FAIL"
    fi
    
    # Add to results JSON
    if [ $test_count -gt 1 ]; then
        echo "    }," >> $RESULTS_FILE
    fi
    echo "    {" >> $RESULTS_FILE
    echo "      \"name\": \"$name\"," >> $RESULTS_FILE
    echo "      \"endpoint\": \"$endpoint\"," >> $RESULTS_FILE
    echo "      \"method\": \"$method\"," >> $RESULTS_FILE
    echo "      \"expected_code\": $expected_code," >> $RESULTS_FILE
    echo "      \"actual_code\": $http_code," >> $RESULTS_FILE
    echo "      \"status\": \"$status\"" >> $RESULTS_FILE
}

echo "📋 Testing Auth Router (4 endpoints)"
echo "-----------------------------------"
test_endpoint "auth.me (not logged in)" "GET" "auth.me" "200"
test_endpoint "auth.localLogin (no credentials)" "POST" "auth.localLogin" "200" '{"username":"","password":""}'
test_endpoint "auth.register (no data)" "POST" "auth.register" "200" '{}'
test_endpoint "auth.changePassword (unauthorized)" "POST" "auth.changePassword" "200" '{"oldPassword":"","newPassword":""}'

echo ""
echo "📋 Testing Competencies Router (4 endpoints)"
echo "-------------------------------------------"
test_endpoint "competencies.list (unauthorized)" "GET" "competencies.list" "200"
test_endpoint "competencies.listWithScores (unauthorized)" "GET" "competencies.listWithScores" "200"
test_endpoint "competencies.getById (unauthorized)" "GET" "competencies.getById?input={\"json\":1}" "200"
test_endpoint "competencies.search (unauthorized)" "GET" "competencies.search?input={\"json\":{\"query\":\"test\"}}" "200"

echo ""
echo "📋 Testing Questions Router (2 endpoints)"
echo "----------------------------------------"
test_endpoint "questions.list (unauthorized)" "GET" "questions.list" "200"
test_endpoint "questions.getById (unauthorized)" "GET" "questions.getById?input={\"json\":1}" "200"

echo ""
echo "📋 Testing Assessment Router (6 endpoints)"
echo "-----------------------------------------"
test_endpoint "assessment.startSession (unauthorized)" "POST" "assessment.startSession" "200" '{"competencyId":1}'
test_endpoint "assessment.getSession (unauthorized)" "GET" "assessment.getSession?input={\"json\":1}" "200"
test_endpoint "assessment.listSessions (unauthorized)" "GET" "assessment.listSessions" "200"
test_endpoint "assessment.submitAnswer (unauthorized)" "POST" "assessment.submitAnswer" "200" '{"sessionId":1,"questionId":1,"competencyId":1,"answer":3}'
test_endpoint "assessment.completeSession (unauthorized)" "POST" "assessment.completeSession" "200" '{"sessionId":1}'
test_endpoint "assessment.getProgress (unauthorized)" "GET" "assessment.getProgress?input={\"json\":1}" "200"

echo ""
echo "📋 Testing Scores Router (3 endpoints)"
echo "-------------------------------------"
test_endpoint "scores.getUserScores (unauthorized)" "GET" "scores.getUserScores" "200"
test_endpoint "scores.updateScore (unauthorized)" "POST" "scores.updateScore" "200" '{"competencyId":1,"score":80}'
test_endpoint "scores.getHistory (unauthorized)" "GET" "scores.getHistory?input={\"json\":1}" "200"

echo ""
echo "📋 Testing Plans Router (2 endpoints)"
echo "------------------------------------"
test_endpoint "plans.getUserPlans (unauthorized)" "GET" "plans.getUserPlans" "200"
test_endpoint "plans.createPlan (unauthorized)" "POST" "plans.createPlan" "200" '{"competencyId":1,"targetDate":"2024-12-31"}'

echo ""
echo "📋 Testing Users Router (2 endpoints)"
echo "------------------------------------"
test_endpoint "users.profile (unauthorized)" "GET" "users.profile" "200"
test_endpoint "users.updateProfile (unauthorized)" "POST" "users.updateProfile" "200" '{"name":"Test User"}'

# Close JSON
echo "    }" >> $RESULTS_FILE
echo "  ]," >> $RESULTS_FILE
echo "  \"summary\": {" >> $RESULTS_FILE
echo "    \"total\": $test_count," >> $RESULTS_FILE
echo "    \"passed\": $pass_count," >> $RESULTS_FILE
echo "    \"failed\": $fail_count," >> $RESULTS_FILE
echo "    \"pass_rate\": \"$(echo "scale=2; $pass_count * 100 / $test_count" | bc)%\"" >> $RESULTS_FILE
echo "  }" >> $RESULTS_FILE
echo "}" >> $RESULTS_FILE

echo ""
echo "==========================================="
echo "📊 Test Summary"
echo "==========================================="
echo "Total Tests:  $test_count"
echo "Passed:       $pass_count ✅"
echo "Failed:       $fail_count ❌"
echo "Pass Rate:    $(echo "scale=2; $pass_count * 100 / $test_count" | bc)%"
echo ""
echo "Results saved to: $RESULTS_FILE"
echo "Completed: $(date)"
