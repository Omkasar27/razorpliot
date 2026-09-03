import { listPendingApprovals, decideApproval } from '../commerce/approvalService.js';

export async function getPending(req, res, next) {
  try {
    const { merchantId } = req.query;
    if (!merchantId) {
      const err = new Error('merchantId required');
      err.status = 400;
      err.publicMessage = 'merchantId is required.';
      throw err;
    }
    const orders = await listPendingApprovals(merchantId);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

export async function postDecision(req, res, next) {
  try {
    const { id } = req.params;
    const { merchantId, approve, approverUserId } = req.body;
    if (!merchantId || typeof approve !== 'boolean') {
      const err = new Error('Missing fields');
      err.status = 400;
      err.publicMessage = 'merchantId and approve (boolean) are required.';
      throw err;
    }
    const result = await decideApproval({ orderId: id, merchantId, approverUserId, approve });
    res.json(result);
  } catch (err) {
    next(err);
  }
}