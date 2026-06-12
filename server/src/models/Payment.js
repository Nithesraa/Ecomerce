import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['STRIPE', 'RAZORPAY', 'UPI', 'CARD', 'NETBANKING', 'WALLET', 'COD'] },
    status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING', 'EXPIRED', 'REFUNDED'], default: 'PENDING' },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
