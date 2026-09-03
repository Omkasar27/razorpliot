import AuditLog from '../db/models/AuditLog.js';

export async function getAuditTrail(req, res, next) {
  try {
    const { merchantId, orderId, conversationId, limit } = req.query;
    if (!merchantId) {
      const err = new Error('merchantId required');
      err.status = 400;
      err.publicMessage = 'merchantId is required.';
      throw err;
    }

    const filter = { merchantId };
    if (orderId) filter.orderId = orderId;
    if (conversationId) filter.conversationId = conversationId;

    const logs = await AuditLog.find(filter)
      .sort({ ts: 1 }) // oldest first — reads as a real timeline
      .limit(limit ? Number(limit) : 200)
      .lean();

    res.json({ logs, count: logs.length });
  } catch (err) {
    next(err);
  }
}