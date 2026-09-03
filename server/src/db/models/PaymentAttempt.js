import mongoose from 'mongoose';

const paymentAttemptSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    attemptNumber: { type: Number, required: true },
    status: { type: String, enum: ['created', 'succeeded', 'failed'], required: true },
    razorpayPaymentId: { type: String, default: null },
    failureReason: { type: String, default: null },
    ts: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export default mongoose.model('PaymentAttempt', paymentAttemptSchema);
