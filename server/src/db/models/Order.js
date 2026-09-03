import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    amount: { type: Number, required: true }, // total in INR rupees
    upsellAccepted: { type: Boolean, default: false },

    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },

    // Deterministic safety engine output — see safetyEngine.js
    safetyDecision: { type: String, enum: ['auto', 'approval_required', 'blocked'], required: true },
    safetyReason: { type: String, required: true },

    approvalStatus: {
      type: String,
      enum: ['not_required', 'pending', 'approved', 'rejected'],
      default: 'not_required',
    },
    approvalDecidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvalDecidedAt: { type: Date, default: null },

    status: {
      type: String,
      enum: ['pending_approval', 'pending_payment', 'paid', 'failed', 'blocked'],
      default: 'pending_payment',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
