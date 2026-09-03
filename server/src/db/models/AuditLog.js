import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true, index: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null, index: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', default: null, index: true },
    actor: { type: String, enum: ['system', 'ai', 'merchant', 'customer'], required: true },
    action: { type: String, required: true }, // short machine-readable label, e.g. "safety_check_passed"
    reason: { type: String, required: true }, // human-readable explanation shown in the audit timeline
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ts: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

auditLogSchema.index({ merchantId: 1, ts: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
