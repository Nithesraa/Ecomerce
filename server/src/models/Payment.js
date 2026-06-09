import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['RAZORPAY', 'UPI', 'CARD', 'NETBANKING', 'WALLET'] },
    status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], default: 'PENDING' },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
