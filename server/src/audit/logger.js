import AuditLog from '../db/models/AuditLog.js';

// Every meaningful action in the app calls this. Failures here must never
// break the primary flow — we log to console and move on.
export async function logAudit({ merchantId, orderId = null, conversationId = null, actor, action, reason, metadata = {} }) {
  try {
    await AuditLog.create({ merchantId, orderId, conversationId, actor, action, reason, metadata });
  } catch (err) {
    console.error('[audit] failed to write log:', err.message);
  }
}