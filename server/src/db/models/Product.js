import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true }, // stored in INR rupees (not paise) for readability; converted at checkout
    inventory: { type: Number, required: true, default: 0 },
    tags: { type: [String], default: [], index: true },
    // Product IDs this item is frequently bought with — powers deterministic upsell/cross-sell.
    compatibility: { type: [mongoose.Schema.Types.ObjectId], ref: 'Product', default: [] },
    shippingInfo: { type: String, default: 'Standard shipping, 3-5 business days.' },
    returnPolicy: { type: String, default: '7-day return policy.' },
    imageUrl: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Product', productSchema);
