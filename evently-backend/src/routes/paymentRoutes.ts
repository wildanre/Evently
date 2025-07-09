import express from 'express';
import { Request, Response } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { prisma } from '../utils/prisma';

const router = express.Router();

// iPaymu Configuration
const IPAYMU_API_KEY = process.env.IPAYMU_API_KEY || 'your-api-key';
const IPAYMU_VA = process.env.IPAYMU_VA || 'your-va-number';
const IPAYMU_BASE_URL = process.env.IPAYMU_BASE_URL || 'https://sandbox.ipaymu.com/api/v2';

// Helper function to generate iPaymu signature
function generateSignature(method: string, url: string, body: any = null): string {
  const bodyHash = body ? crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex') : '';
  const stringToSign = `${method.toUpperCase()}:${url}:${bodyHash}:${IPAYMU_API_KEY}`;
  return crypto.createHash('sha256').update(stringToSign).digest('hex');
}

// Create payment
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { eventId, quantity, paymentMethod = 'va', buyerName, buyerEmail, buyerPhone } = req.body;

    // Validate required fields
    if (!eventId || !quantity || !buyerName || !buyerEmail || !buyerPhone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: eventId, quantity, buyerName, buyerEmail, buyerPhone' 
      });
    }

    // Validate payment method
    const validMethods = ['va', 'cc', 'qris', 'convenience_store'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment method. Supported: va, cc, qris, convenience_store' 
      });
    }

    // Get event details
    const event: any = await (prisma as any).events.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        ticketPrice: true,
        capacity: true,
        attendeeCount: true
      }
    });

    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    // Check ticket availability
    if (event.capacity && event.attendeeCount + quantity > event.capacity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Not enough tickets available' 
      });
    }

    // Calculate total amount
    const amount = (event.ticketPrice || 0) * quantity;

    if (amount === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'This is a free event, no payment required' 
      });
    }

    // Generate unique reference ID
    const referenceId = `EVT-${eventId}-${Date.now()}`;

    // Create payment record in database
    const payment: any = await (prisma as any).payments.create({
      data: {
        eventId,
        userId: 'cmcumjsri0000k4044nn5xovc', // Use existing user for now
        quantity,
        amount,
        paymentMethod,
        ipaymuReferenceId: referenceId,
        buyerName,
        buyerEmail,
        buyerPhone,
        status: 'pending'
      }
    });

    // Generate payment URL based on method
    let paymentUrl: string;
    let mockSessionId: string;

    if (paymentMethod === 'qris') {
      // QRIS Mock Payment URL
      mockSessionId = `qris-${payment.id}`;
      paymentUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/mock?paymentId=${payment.id}&amount=${amount}&method=qris`;
    } else if (paymentMethod === 'cc') {
      // Credit Card Mock Payment URL
      mockSessionId = `cc-${payment.id}`;
      paymentUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/mock?paymentId=${payment.id}&amount=${amount}&method=cc`;
    } else if (paymentMethod === 'va') {
      // Virtual Account Mock Payment URL
      mockSessionId = `va-${payment.id}`;
      paymentUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/mock?paymentId=${payment.id}&amount=${amount}&method=va`;
    } else {
      // Default fallback
      mockSessionId = `${paymentMethod}-${payment.id}`;
      paymentUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/mock?paymentId=${payment.id}&amount=${amount}&method=${paymentMethod}`;
    }
    
    await (prisma as any).payments.update({
      where: { id: payment.id },
      data: { 
        ipaymuSessionId: mockSessionId,
        paymentUrl: paymentUrl
      }
    });

    return res.json({
      success: true,
      data: {
        paymentId: payment.id,
        paymentUrl: paymentUrl,
        sessionId: mockSessionId,
        amount,
        referenceId,
        paymentMethod
      },
      note: `Using mock ${paymentMethod.toUpperCase()} payment URL for demo purposes`
    });

  } catch (error: any) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment', 
      error: error.message 
    });
  }
});

// Get payment status
router.get('/:paymentId/status', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    const payment: any = await (prisma as any).payments.findUnique({
      where: { id: paymentId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startDate: true,
            location: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    return res.json({
      success: true,
      data: {
        id: payment.id,
        referenceId: payment.ipaymuReferenceId,
        status: payment.status,
        amount: payment.amount,
        quantity: payment.quantity,
        buyerName: payment.buyerName,
        buyerEmail: payment.buyerEmail,
        event: payment.event,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Error fetching payment status:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment status', 
      error: error.message 
    });
  }
});

// Get user's payment history
router.get('/user', async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email parameter is required' 
      });
    }

    const payments: any[] = await (prisma as any).payments.findMany({
      where: { buyerEmail: email as string },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startDate: true,
            location: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: payments.map((payment: any) => ({
        id: payment.id,
        referenceId: payment.ipaymuReferenceId,
        status: payment.status,
        amount: payment.amount,
        quantity: payment.quantity,
        event: payment.event,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }))
    });

  } catch (error: any) {
    console.error('Error fetching payment history:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment history', 
      error: error.message 
    });
  }
});

// Check if user has paid for specific event
router.get('/check/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email parameter is required' 
      });
    }

    // Check for completed payment
    const payment: any = await (prisma as any).payments.findFirst({
      where: { 
        eventId: eventId,
        buyerEmail: email as string,
        status: 'completed'
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            ticketPrice: true
          }
        }
      }
    });

    return res.json({
      success: true,
      data: {
        hasPaid: !!payment,
        payment: payment ? {
          id: payment.id,
          quantity: payment.quantity,
          amount: payment.amount,
          status: payment.status,
          createdAt: payment.createdAt
        } : null
      }
    });

  } catch (error: any) {
    console.error('Error checking payment status:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to check payment status', 
      error: error.message 
    });
  }
});

// Simple webhook endpoint for testing
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { reference_id, status, trx_id } = req.body;

    if (!reference_id || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required webhook data' 
      });
    }

    // Find payment by reference ID
    const payment: any = await (prisma as any).payments.findFirst({
      where: { ipaymuReferenceId: reference_id }
    });

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    // Map iPaymu webhook status to our status
    let newStatus = payment.status;
    switch (status) {
      case 'berhasil':
        newStatus = 'completed';
        break;
      case 'pending':
        newStatus = 'pending';
        break;
      case 'expired':
      case 'dibatalkan':
        newStatus = 'failed';
        break;
    }

    // Update payment status
    await (prisma as any).payments.update({
      where: { id: payment.id },
      data: { 
        status: newStatus,
        ipaymuTransactionId: trx_id || null
      }
    });

    // If payment completed, update event attendee count
    if (newStatus === 'completed' && payment.status !== 'completed') {
      await (prisma as any).events.update({
        where: { id: payment.eventId },
        data: {
          attendeeCount: {
            increment: payment.quantity
          }
        }
      });
    }

    return res.json({ success: true, message: 'Webhook processed successfully' });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to process webhook', 
      error: error.message 
    });
  }
});

export default router;
