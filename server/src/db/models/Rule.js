import mongoose from 'mongoose';

const ruleSchema = new mongoose.Schema(
  {
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true, unique: true },
    approvalThreshold: { type: Number, required: true, default: 2000 }, // INR — orders >= this need approval
    maxDiscountPct: { type: Number, required: true, default: 20 }, // discounts above this need approval
    lowInventoryThreshold: { type: Number, required: true, default: 3 }, // stock below this needs approval
    maxRetryAttempts: { type: Number, required: true, default: 1 }, // payment retry limit (deterministic)
  },
  { timestamps: true }
);

export default mongoose.model('Rule', ruleSchema);
