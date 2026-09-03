import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true }, // snapshot at add-time so cart survives catalog edits
    priceAtAdd: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    addedVia: { type: String, enum: ['customer', 'upsell', 'cross-sell'], default: 'customer' },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
    items: { type: [cartItemSchema], default: [] },
    status: { type: String, enum: ['active', 'converted', 'abandoned'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model('Cart', cartSchema);
