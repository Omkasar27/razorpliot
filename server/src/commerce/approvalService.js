import Order from '../db/models/Order.js';
import { createRazorpayOrder } from './checkoutService.js';
import { logAudit } from '../audit/logger.js';

export async function listPendingApprovals(merchantId) {
  return Order.find({ merchantId, approvalStatus: 'pending' }).sort({ createdAt: 1 });
}

export async function decideApproval({ orderId, merchantId, approverUserId, approve }) {
  const order = await Order.findOne({ _id: orderId, merchantId });
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    err.publicMessage = 'Order not found.';
    throw err;
  }
  if (order.approvalStatus !== 'pending') {
    const err = new Error('Order is not pending approval');
    err.status = 409;
    err.publicMessage = 'This order has already been decided.';
    throw err;
  }

  order.approvalDecidedBy = approverUserId || null;
  order.approvalDecidedAt = new Date();

  if (!approve) {
    order.approvalStatus = 'rejected';
    order.status = 'blocked';
    await order.save();

    await logAudit({
      merchantId,
      orderId: order._id,
      actor: 'merchant',
      action: 'merchant_rejected',
      reason: `Merchant rejected the order (₹${order.amount}). No payment will be collected.`,
    });

    return { order, razorpay: null };
  }

  order.approvalStatus = 'approved';
  order.status = 'pending_payment';
  await order.save();

  await logAudit({
    merchantId,
    orderId: order._id,
    actor: 'merchant',
    action: 'merchant_approved',
    reason: `Merchant approved the order (₹${order.amount}).`,
  });

  // Only now — after a human has signed off — do we create the actual Razorpay order.
  const razorpayOrder = await createRazorpayOrder(order);
  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  await logAudit({
    merchantId,
    orderId: order._id,
    actor: 'system',
    action: 'razorpay_order_created',
    reason: `Created Razorpay Test Mode order for ₹${order.amount} following merchant approval.`,
  });

  return {
    order,
    razorpay: {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  };
}