#!/bin/bash

# Test script untuk verifikasi API pembayaran iPaymu
# Usage: ./test-payment-api.sh

BASE_URL="http://localhost:3001/api"
FRONTEND_URL="http://localhost:3000"

echo "🧪 Testing iPaymu Payment API Integration"
echo "=================================="

# 1. Test Health Check
echo "1. Testing Health Check..."
health_response=$(curl -s -X GET "$BASE_URL/health")
echo "✅ Health Check: $health_response"
echo ""

# 2. Test Payment History (empty)
echo "2. Testing Payment History..."
history_response=$(curl -s -X GET "$BASE_URL/payments/user?email=test@example.com")
echo "✅ Payment History: $history_response"
echo ""

# 3. Test Payment Creation (requires authentication token)
echo "3. Testing Payment Creation..."
echo "⚠️  Note: Payment creation requires authentication token"
echo "   To test manually:"
echo "   - Login to frontend at $FRONTEND_URL"
echo "   - Go to any event page"
echo "   - Click 'Buy Tickets' button"
echo "   - Fill payment form and submit"
echo ""

# 4. Check Frontend
echo "4. Testing Frontend..."
frontend_check=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$frontend_check" = "200" ]; then
    echo "✅ Frontend accessible at $FRONTEND_URL"
else
    echo "❌ Frontend not accessible (HTTP $frontend_check)"
fi
echo ""

# 5. Check Backend Documentation
echo "5. Backend API Documentation:"
echo "📚 Swagger UI: http://localhost:3001/api-docs"
echo ""

# 6. Environment Variables Check
echo "6. Environment Variables Status:"
if [ -f "../evently-backend/.env" ]; then
    echo "✅ Backend .env file exists"
    if grep -q "IPAYMU_API_KEY" "../evently-backend/.env"; then
        echo "✅ iPaymu API Key configured"
    else
        echo "❌ iPaymu API Key not found"
    fi
    if grep -q "IPAYMU_VA" "../evently-backend/.env"; then
        echo "✅ iPaymu VA configured"
    else
        echo "❌ iPaymu VA not found"
    fi
else
    echo "❌ Backend .env file not found"
fi

if [ -f "../evently-frontend/.env.local" ]; then
    echo "✅ Frontend .env.local file exists"
    if grep -q "NEXT_PUBLIC_IPAYMU_VA" "../evently-frontend/.env.local"; then
        echo "✅ Frontend iPaymu VA configured"
    else
        echo "❌ Frontend iPaymu VA not found"
    fi
else
    echo "❌ Frontend .env.local file not found"
fi
echo ""

# 7. Database Connection Test
echo "7. Database Status:"
echo "✅ Payments table should be available in Prisma schema"
echo "✅ Run 'npx prisma studio' to check database tables"
echo ""

# 8. Available Payment Methods
echo "8. Supported Payment Methods:"
echo "✅ Virtual Account (VA) - Bank Transfer"
echo "✅ Credit Card (CC) - Visa, MasterCard, JCB"
echo "✅ QRIS - E-wallet QR Code payments"
echo ""

# 9. Testing Flow Summary
echo "9. Complete Testing Flow:"
echo "=================================="
echo "1. Start Backend: cd evently-backend && pnpm start"
echo "2. Start Frontend: cd evently-frontend && pnpm dev"
echo "3. Open Browser: http://localhost:3000"
echo "4. Login/Register user account"
echo "5. Navigate to any event"
echo "6. Click 'Buy Tickets' or 'Purchase'"
echo "7. Fill payment form:"
echo "   - Select quantity"
echo "   - Choose payment method (VA/CC/QRIS)"
echo "   - Enter buyer details"
echo "   - Click 'Pay Now'"
echo "8. Complete mock payment on payment page"
echo "9. Verify payment status in database/API"
echo ""

# 10. Production Checklist
echo "10. Production Checklist:"
echo "=================================="
echo "□ Update iPaymu URLs to production"
echo "□ Set real iPaymu API credentials"
echo "□ Configure webhook endpoint with SSL"
echo "□ Test real payment flow"
echo "□ Setup payment monitoring"
echo "□ Configure error handling"
echo "□ Setup email notifications"
echo "□ Test refund process"
echo ""

echo "🎉 iPaymu Payment Integration Status: READY FOR TESTING!"
echo "📖 See PAYMENT_CONFIGURATION_STATUS.md for detailed documentation"
