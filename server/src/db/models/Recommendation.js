import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    baseProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    recommendedProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, enum: ['upsell', 'cross-sell', 'bundle'], required: true },
    reason: { type: String, required: true }, // human-readable explanation shown to the customer
    accepted: { type: Boolean, default: null }, // null = not yet decided
  },
  { timestamps: true }
);

export default mongoose.model('Recommendation', recommendationSchema);
