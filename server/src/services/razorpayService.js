import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env.js';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID || 'mock_key_id',
  key_secret: env.RAZORPAY_KEY_SECRET || 'mock_key_secret',
});

export const razorpayService = {
  createRazorpayOrder: async (amount, receiptId) => {
    // Amount must be passed in smallest currency subunit (paise for INR)
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: receiptId.toString(),
    };
    
    // Automatically mock Razorpay response during isolated testing
    if (env.RAZORPAY_KEY_ID === 'mock_key_id' || !env.RAZORPAY_KEY_ID) {
      return {
        id: 'order_mock_' + Date.now(),
        amount: options.amount,
        currency: 'INR',
        receipt: receiptId.toString(),
        status: 'created'
      };
    }
    
    return razorpay.orders.create(options);
  },

  verifySignature: (razorpayOrderId, razorpayPaymentId, signature) => {
    if (env.RAZORPAY_KEY_ID === 'mock_key_id' || !env.RAZORPAY_KEY_ID) {
      return signature === 'mock_signature';
    }

    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');
      
    return expectedSignature === signature;
  }
};
