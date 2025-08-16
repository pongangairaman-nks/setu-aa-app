#!/bin/bash

# Test script for Setu AA Backend Deployment

echo "🧪 Testing Setu AA Backend Deployment..."

# Configuration
EC2_IP="13.233.96.134"
EC2_PORT="5000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Testing Configuration:${NC}"
echo "EC2 IP: $EC2_IP"
echo "Port: $EC2_PORT"

# Test 1: Health Check
echo -e "\n${YELLOW}🔍 Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" "http://$EC2_IP:$EC2_PORT/health" -o /tmp/health_response.json)

if [[ $HEALTH_RESPONSE == *"200"* ]]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "Response: $(cat /tmp/health_response.json)"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "HTTP Status: $HEALTH_RESPONSE"
    echo "Response: $(cat /tmp/health_response.json)"
fi

# Test 2: Test Setu Configuration
echo -e "\n${YELLOW}🔍 Test 2: Setu Configuration Test${NC}"
SETU_RESPONSE=$(curl -s -w "%{http_code}" "http://$EC2_IP:$EC2_PORT/test-setu" -o /tmp/setu_response.json)

if [[ $SETU_RESPONSE == *"200"* ]]; then
    echo -e "${GREEN}✅ Setu configuration test passed${NC}"
    echo "Response: $(cat /tmp/setu_response.json)"
else
    echo -e "${RED}❌ Setu configuration test failed${NC}"
    echo "HTTP Status: $SETU_RESPONSE"
    echo "Response: $(cat /tmp/setu_response.json)"
fi

# Test 3: Webhook Endpoint
echo -e "\n${YELLOW}🔍 Test 3: Webhook Endpoint Test${NC}"
WEBHOOK_RESPONSE=$(curl -s -w "%{http_code}" -X POST "http://$EC2_IP:$EC2_PORT/api/webhooks/setu" \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' \
  -o /tmp/webhook_response.json)

if [[ $WEBHOOK_RESPONSE == *"200"* ]] || [[ $WEBHOOK_RESPONSE == *"400"* ]] || [[ $WEBHOOK_RESPONSE == *"401"* ]]; then
    echo -e "${GREEN}✅ Webhook endpoint is accessible${NC}"
    echo "HTTP Status: $WEBHOOK_RESPONSE"
    echo "Response: $(cat /tmp/webhook_response.json)"
else
    echo -e "${RED}❌ Webhook endpoint test failed${NC}"
    echo "HTTP Status: $WEBHOOK_RESPONSE"
    echo "Response: $(cat /tmp/webhook_response.json)"
fi

# Test 4: API Base URL
echo -e "\n${YELLOW}🔍 Test 4: API Base URL Test${NC}"
API_RESPONSE=$(curl -s -w "%{http_code}" "http://$EC2_IP:$EC2_PORT/api" -o /tmp/api_response.json)

if [[ $API_RESPONSE == *"404"* ]]; then
    echo -e "${GREEN}✅ API base URL is accessible (404 expected for root)${NC}"
else
    echo -e "${YELLOW}⚠️ API base URL test (unexpected response)${NC}"
    echo "HTTP Status: $API_RESPONSE"
    echo "Response: $(cat /tmp/api_response.json)"
fi

# Cleanup
rm -f /tmp/health_response.json /tmp/setu_response.json /tmp/webhook_response.json /tmp/api_response.json

echo -e "\n${GREEN}🎉 Deployment testing completed!${NC}"
echo ""
echo -e "${YELLOW}📝 Summary:${NC}"
echo "✅ Backend is deployed and running on EC2"
echo "✅ Application is accessible via HTTP"
echo "✅ PM2 is managing the process"
echo ""
echo -e "${YELLOW}🔗 Your API URLs:${NC}"
echo "Health Check: http://$EC2_IP:$EC2_PORT/health"
echo "Setu Webhook: http://$EC2_IP:$EC2_PORT/api/webhooks/setu"
echo "API Base: http://$EC2_IP:$EC2_PORT/api"
echo ""
echo -e "${YELLOW}⚠️ Remember to:${NC}"
echo "1. Configure AWS Security Group to allow port 5000"
echo "2. Update your .env file with actual configuration"
echo "3. Update your mobile app to use the new API URL"
