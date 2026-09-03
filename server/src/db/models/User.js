import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    name: { type: String },
    role: { type: String, enum: ['merchant', 'customer'], required: true, default: 'customer' },
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
