# iPaymu Payment Gateway Integration Guide

## Overview
This guide covers the complete iPaymu integration for the Evently platform, including Virtual Account (VA) and API_PAYMENT configurations.

## Features Implemented

### Payment Methods Supported
- ✅ Virtual Account (VA) - Bank Transfer
- ✅ Credit Card (CC) - Visa, MasterCard, JCB
- ✅ QRIS - QR Code payments with e-wallets
- 🔄 Convenience Store (Future implementation)

### Current Implementation Status
- ✅ Backend payment routes (`/api/payments/`)
- ✅ Frontend payment form component
- ✅ Database schema for payments
- ✅ Environment configuration
- ✅ Mock payment simulation
- ✅ Webhook handling
- ✅ Payment status tracking

## Environment Variables

### Backend (.env)
```bash
# iPaymu Configuration
IPAYMU_API_KEY="1179002329092617"
IPAYMU_VA="1179002329092617"
IPAYMU_BASE_URL="https://sandbox.ipaymu.com/api/v2"

# For Production, change to:
# IPAYMU_BASE_URL="https://my.ipaymu.com/api/v2"
```

### Frontend (.env.local)
```bash
# iPaymu Payment Gateway Configuration
NEXT_PUBLIC_IPAYMU_VA=1179002329092617
NEXT_PUBLIC_IPAYMU_API_KEY=7CEAC285-3016-49C6-B166-7432B4317EB1
NEXT_PUBLIC_IPAYMU_BASE_URL=https://sandbox.ipaymu.com/api/v2

# Payment Configuration
NEXT_PUBLIC_PAYMENT_ENABLED=true
NEXT_PUBLIC_PAYMENT_METHODS=va,cc,qris
NEXT_PUBLIC_CURRENCY=IDR
```

## API Endpoints

### 1. Create Payment
```
POST /api/payments/create
```
**Request Body:**
```json
{
  "eventId": "event-id",
  "quantity": 2,
  "buyerName": "John Doe",
  "buyerEmail": "john@example.com",
  "buyerPhone": "081234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "payment-id",
    "paymentUrl": "https://payment-url",
    "sessionId": "session-id",
    "amount": 100000,
    "referenceId": "EVT-event-id-timestamp"
  }
}
```

### 2. Check Payment Status
```
GET /api/payments/{paymentId}/status
```

### 3. Payment History
```
GET /api/payments/user?email=user@example.com
```

### 4. Webhook (for iPaymu callbacks)
```
POST /api/payments/webhook
```

## Database Schema

### Payments Table
```sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  eventId TEXT NOT NULL,
  userId TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  amount REAL NOT NULL,
  paymentMethod TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  ipaymuReferenceId TEXT UNIQUE,
  ipaymuSessionId TEXT,
  ipaymuTransactionId TEXT,
  paymentUrl TEXT,
  expiryTime TIMESTAMP,
  buyerName TEXT,
  buyerEmail TEXT,
  buyerPhone TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## Payment Flow

### 1. User Initiates Payment
1. User selects event and ticket quantity
2. Fills buyer information
3. Selects payment method (VA/CC/QRIS)
4. Clicks "Pay Now"

### 2. Payment Creation
1. Frontend sends request to `/api/payments/create`
2. Backend creates payment record in database
3. Backend generates payment URL (currently mock)
4. User is redirected to payment page

### 3. Payment Processing
1. User completes payment on iPaymu page
2. iPaymu sends webhook to `/api/payments/webhook`
3. Backend updates payment status
4. If successful, increments event attendee count

### 4. Payment Completion
1. User receives confirmation
2. Event organizer gets notification
3. Ticket/receipt can be generated

## Testing

### Current Mock Implementation
The system currently uses mock payments for testing:
- Mock payment page: `/payment/mock`
- Simulates 3-second payment processing
- Automatically updates payment status

### Switch to Real iPaymu
To enable real iPaymu payments:

1. **Update Backend Routes** (`evently-backend/src/routes/paymentRoutes.ts`):
```typescript
// Replace the mock payment creation with real iPaymu API call
const iPaymuData = {
  product: [event.name],
  qty: [quantity],
  price: [event.ticketPrice],
  returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
  cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,
  notifyUrl: `${process.env.BACKEND_URL}/api/payments/webhook`,
  buyerName: buyerName,
  buyerEmail: buyerEmail,
  buyerPhone: buyerPhone
};

const response = await axios.post(
  `${IPAYMU_BASE_URL}/payment`,
  iPaymuData,
  {
    headers: {
      'Content-Type': 'application/json',
      'signature': generateSignature('POST', '/payment', iPaymuData),
      'va': IPAYMU_VA,
      'timestamp': Date.now()
    }
  }
);
```

2. **Set Production Environment Variables**:
```bash
# Backend
IPAYMU_BASE_URL="https://my.ipaymu.com/api/v2"

# Frontend  
NEXT_PUBLIC_IPAYMU_BASE_URL=https://my.ipaymu.com/api/v2
```

## Security Considerations

### 1. API Key Protection
- Never expose real API keys in frontend
- Use environment variables
- Rotate keys regularly

### 2. Signature Verification
- Always verify iPaymu webhook signatures
- Implement HMAC validation
- Check timestamp to prevent replay attacks

### 3. Amount Validation
- Validate payment amounts server-side
- Check minimum/maximum limits
- Prevent amount manipulation

## Troubleshooting

### Common Issues

1. **Payment Creation Fails**
   - Check API credentials
   - Verify network connectivity
   - Review request format

2. **Webhook Not Received**
   - Check webhook URL accessibility
   - Verify SSL certificate
   - Review firewall settings

3. **Payment Status Not Updated**
   - Check webhook endpoint
   - Verify database connection
   - Review error logs

### Debug Tools

1. **Backend Logs**
   ```bash
   # View payment creation logs
   tail -f logs/payment.log
   ```

2. **Database Queries**
   ```sql
   -- Check payment status
   SELECT * FROM payments WHERE eventId = 'event-id';
   
   -- Check recent payments
   SELECT * FROM payments ORDER BY createdAt DESC LIMIT 10;
   ```

## Future Enhancements

1. **Payment Methods**
   - Add convenience store payments
   - Implement installment options
   - Add cryptocurrency support

2. **Features**
   - Payment analytics dashboard
   - Refund management
   - Recurring payments
   - Multi-currency support

3. **Integration**
   - Email notifications
   - SMS alerts
   - Receipt generation
   - Accounting system integration

## Support

For iPaymu specific issues:
- Documentation: https://ipaymu.com/developer-api/
- Support: support@ipaymu.com
- Sandbox: https://sandbox.ipaymu.com

For integration issues:
- Check console logs
- Review API responses
- Verify environment variables
- Test webhook connectivity

## Production Checklist

Before going live:
- [ ] Update to production iPaymu URLs
- [ ] Set real API credentials
- [ ] Configure webhook endpoint
- [ ] Test payment flow end-to-end
- [ ] Set up monitoring and logging
- [ ] Configure error handling
- [ ] Set up backup payment method
- [ ] Review security settings
- [ ] Test refund process
- [ ] Prepare customer support documentation
