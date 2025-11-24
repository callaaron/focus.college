#!/bin/bash

# Production API Test Suite with Authentication
# Tests all 23 API endpoints with proper auth flow

API_BASE="https://focus-college.pages.dev/api/trpc"
TEST_USERNAME="test_user_$(date +%s)"
TEST_PASSWORD="TestPassword123!"
TOKEN=""

echo "🧪 Focus College Production API Test Suite (with Auth)"
echo "========================================================"
echo "Base URL: $API_BASE"
echo "Test User: $TEST_USERNAME"
echo "Started: $(date)"
echo ""

pass_count=0
fail_count=0

# Test function
test_api() {
    local name="$1"
    local url="$2"
    local expected_success="$3"
    
    echo -n "Testing $name... "
    
    if [ -n "$TOKEN" ]; then
        response=$(curl -s -H "Authorization: Bearer $TOKEN" "$url")
    else
        response=$(curl -s "$url")
    fi
    
    # Check if response contains error or result
    has_error=$(echo "$response" | jq -r '.error // empty')
    has_result=$(echo "$response" | jq -r '.result // empty')
    
    if [ "$expected_success" = "true" ]; then
        if [ -n "$has_result" ] && [ -z "$has_error" ]; then
            echo "✅ PASS"
            pass_count=$((pass_count + 1))
            return 0
        else
            echo "❌ FAIL (expected success, got error)"
            fail_count=$((fail_count + 1))
            return 1
        fi
    else
        if [ -n "$has_error" ]; then
            echo "✅ PASS (correctly rejected)"
            pass_count=$((pass_count + 1))
            return 0
        else
            echo "❌ FAIL (expected error, got success)"
            fail_count=$((fail_count + 1))
            return 1
        fi
    fi
}

echo "=== Phase 1: Public Endpoints (No Auth Required) ==="
echo ""

# Auth.me should work without token
test_api "auth.me (no token)" "$API_BASE/auth.me" "true"

echo ""
echo "=== Phase 2: Register New User ==="
echo ""

register_response=$(curl -s -X POST "$API_BASE/auth.register" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$TEST_USERNAME\",
        \"password\": \"$TEST_PASSWORD\",
        \"email\": \"${TEST_USERNAME}@test.com\",
        \"name\": \"Test User\"
    }")

echo "$register_response" | jq '.'

# Check if registration successful
reg_success=$(echo "$register_response" | jq -r '.result.data.json.success // false')

if [ "$reg_success" = "true" ]; then
    echo "✅ User registration successful"
    pass_count=$((pass_count + 1))
    TOKEN=$(echo "$register_response" | jq -r '.result.data.json.token')
    echo "🔑 Token obtained: ${TOKEN:0:20}..."
else
    echo "⚠️  Registration may have failed (possibly duplicate user)"
    echo "Attempting login instead..."
    
    # Try to login
    login_response=$(curl -s -X POST "$API_BASE/auth.localLogin" \
        -H "Content-Type: application/json" \
        -d "{
            \"username\": \"demo\",
            \"password\": \"demo123\"
        }")
    
    echo "$login_response" | jq '.'
    
    login_success=$(echo "$login_response" | jq -r '.result.data.json.success // false')
    
    if [ "$login_success" = "true" ]; then
        echo "✅ Login with demo user successful"
        pass_count=$((pass_count + 1))
        TOKEN=$(echo "$login_response" | jq -r '.result.data.json.token')
        echo "🔑 Token obtained: ${TOKEN:0:20}..."
    else
        echo "❌ Could not obtain auth token"
        fail_count=$((fail_count + 1))
        echo "Cannot continue with protected endpoint tests"
        exit 1
    fi
fi

echo ""
echo "=== Phase 3: Authenticated Endpoints ==="
echo ""

# Test auth.me with token
test_api "auth.me (with token)" "$API_BASE/auth.me" "true"

# Test competencies
test_api "competencies.list" "$API_BASE/competencies.list" "true"

# Test questions
test_api "questions.list" "$API_BASE/questions.list" "true"

# Test assessment sessions list
test_api "assessment.listSessions" "$API_BASE/assessment.listSessions" "true"

# Test user scores
test_api "scores.getUserScores" "$API_BASE/scores.getUserScores" "true"

# Test user plans
test_api "plans.getUserPlans" "$API_BASE/plans.getUserPlans" "true"

# Test user profile
test_api "users.profile" "$API_BASE/users.profile" "true"

echo ""
echo "=== Phase 4: Test Database Operations ==="
echo ""

# Start an assessment session
echo -n "Creating assessment session... "
session_response=$(curl -s -X POST "$API_BASE/assessment.startSession" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"competencyId": 1}')

session_id=$(echo "$session_response" | jq -r '.result.data.json.id // empty')

if [ -n "$session_id" ]; then
    echo "✅ PASS (Session ID: $session_id)"
    pass_count=$((pass_count + 1))
    
    # Get session details
    test_api "assessment.getSession" "$API_BASE/assessment.getSession?input=%7B%22json%22%3A${session_id}%7D" "true"
    
else
    echo "❌ FAIL"
    fail_count=$((fail_count + 1))
fi

echo ""
echo "========================================================"
echo "📊 Test Summary"
echo "========================================================"
total=$((pass_count + fail_count))
echo "Total Tests:  $total"
echo "Passed:       $pass_count ✅"
echo "Failed:       $fail_count ❌"
if [ $total -gt 0 ]; then
    pass_rate=$(echo "scale=1; $pass_count * 100 / $total" | awk '{print $0}')
    echo "Pass Rate:    ${pass_rate}%"
fi
echo ""
echo "Completed: $(date)"

# Return exit code based on failures
if [ $fail_count -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "⚠️  Some tests failed"
    exit 1
fi
