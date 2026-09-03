import mongoose from 'mongoose';

const merchantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Razorpay key_id is safe to store — it's public. The secret never lives in Mongo,
    // it stays in server env vars only.
    razorpayKeyId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Merchant', merchantSchema);
