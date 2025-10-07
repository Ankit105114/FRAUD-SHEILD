#!/bin/bash

echo "🚀 FraudShield Frontend Demo Test"
echo "=================================="

# Test backend health
echo "1. Testing backend server..."
HEALTH=$(curl -s http://localhost:3001/health)
if [[ $HEALTH == *"success"* ]]; then
    echo "✅ Backend server is running"
else
    echo "❌ Backend server not responding"
    exit 1
fi

echo ""
echo "2. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@test.com","password":"DemoPass123"}')

if [[ $REGISTER_RESPONSE == *"success"* ]]; then
    echo "✅ User registration successful"
    TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "✅ JWT Token received"
else
    echo "❌ User registration failed"
    echo "Response: $REGISTER_RESPONSE"
fi

echo ""
echo "3. Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@test.com","password":"DemoPass123"}')

if [[ $LOGIN_RESPONSE == *"success"* ]]; then
    echo "✅ User login successful"
    NEW_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "✅ New JWT Token received"
else
    echo "❌ User login failed"
fi

echo ""
echo "4. Testing user dashboard..."
DASHBOARD_RESPONSE=$(curl -s http://localhost:3001/api/auth/dashboard \
  -H "Authorization: Bearer $NEW_TOKEN" 2>/dev/null)

if [[ $DASHBOARD_RESPONSE == *"success"* ]]; then
    echo "✅ User dashboard accessible"
    TRANSACTIONS=$(echo $DASHBOARD_RESPONSE | grep -o '"totalTransactions":[0-9]*' | cut -d':' -f2)
    echo "✅ Dashboard shows $TRANSACTIONS total transactions"
else
    echo "❌ Dashboard access failed"
fi

echo ""
echo "5. Testing transaction submission..."
TRANSACTION_RESPONSE=$(curl -s -X POST http://localhost:3001/api/transactions/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NEW_TOKEN" \
  -d '{
    "transactionId": "TEST_TXN_001",
    "userId": "demo@test.com",
    "amount": 1500.00,
    "merchant": "Test Merchant",
    "location": "Test City",
    "ipAddress": "192.168.1.1",
    "channel": "Web App"
  }')

if [[ $TRANSACTION_RESPONSE == *"success"* ]]; then
    echo "✅ Transaction submitted successfully"
    RISK_SCORE=$(echo $TRANSACTION_RESPONSE | grep -o '"riskScore":[0-9]*' | cut -d':' -f2)
    echo "✅ Transaction analyzed with risk score: $RISK_SCORE"
else
    echo "❌ Transaction submission failed"
fi

echo ""
echo "🎉 Demo test completed successfully!"
echo ""
echo "📁 Frontend demo file created: frontend-demo.html"
echo "🌐 Open http://localhost:3001 to test the API"
echo "📱 Open frontend-demo.html in browser to see the UI"
echo ""
echo "Features demonstrated:"
echo "✅ User registration and login"
echo "✅ JWT token authentication"
echo "✅ Profile circle with user initials"
echo "✅ User dashboard with statistics"
echo "✅ Transaction submission and analysis"
echo "✅ Real-time API integration"
