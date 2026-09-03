import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../db/models/Order.js';
import PaymentAttempt from '../db/models/PaymentAttempt.js';
import Cart from '../db/models/Cart.js';
import Rule from '../db/models/Rule.js';
import { getOrCreateCart, cartTotal } from './cartService.js';
import { evaluateCart } from './safetyEngine.js';
import { logAudit } from '../audit/logger.js';


const isMock = process.env.MOCK_PAYMENTS === 'true';

const razorpay = isMock
  ? null
  : new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

export async function createCheckout({ userId, merchantId, upsellAccepted = false }) {
  const cart = await getOrCreateCart(userId, merchantId);
  if (!cart.items.length) {
    const err = new Error('Cart is empty');
    err.status = 400;
    err.publicMessage = 'Your cart is empty.';
    throw err;
  }

  let rule = await Rule.findOne({ merchantId });
  if (!rule) rule = await Rule.create({ merchantId });

  const safety = await evaluateCart(cart, rule);
  const total = cartTotal(cart);

  await logAudit({
    merchantId,
    actor: 'system',
    action: `safety_check_${safety.decision}`,
    reason: safety.reason,
  });

  if (safety.decision === 'blocked') {
    const err = new Error('Checkout blocked');
    err.status = 422;
    err.publicMessage = `We can't complete this order right now: ${safety.reason}`;
    throw err;
  }

  const orderItems = cart.items.map((i) => ({
    productId: i.productId,
    name: i.name,
    price: i.priceAtAdd,
    quantity: i.quantity,
  }));

  if (safety.decision === 'approval_required') {
    const order = await Order.create({
      merchantId,
      userId,
      items: orderItems,
      amount: total,
      upsellAccepted,
      safetyDecision: safety.decision,
      safetyReason: safety.reason,
      approvalStatus: 'pending',
      status: 'pending_approval',
    });

    await logAudit({
      merchantId,
      orderId: order._id,
      actor: 'system',
      action: 'merchant_approval_requested',
      reason: `Order ₹${total} requires merchant approval: ${safety.reason}`,
    });

    return { order, requiresApproval: true };
  }

  // Auto-approved: create the Razorpay Test Mode order immediately.
  const order = await Order.create({
    merchantId,
    userId,
    items: orderItems,
    amount: total,
    upsellAccepted,
    safetyDecision: safety.decision,
    safetyReason: safety.reason,
    approvalStatus: 'not_required',
    status: 'pending_payment',
  });

  const razorpayOrder = await createRazorpayOrder(order);
  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  await logAudit({
    merchantId,
    orderId: order._id,
    actor: 'system',
    action: 'razorpay_order_created',
    reason: `Created Razorpay Test Mode order for ₹${total}. Safety check passed automatically (no approval needed).`,
  });

  return {
    order,
    requiresApproval: false,
    razorpay: {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  };
}

export async function createRazorpayOrder(order) {
  if (isMock) {
    // Deterministic fake order — clearly labeled, never confusable with a real Razorpay ID.
    return {
      id: `order_mock_${order._id.toString()}`,
      amount: Math.round(order.amount * 100),
      currency: 'INR',
    };
  }

  return razorpay.orders.create({
    amount: Math.round(order.amount * 100), // Razorpay expects paise
    currency: 'INR',
    receipt: order._id.toString(),
    notes: { orderId: order._id.toString(), merchantId: order.merchantId.toString() },
  });
}

export async function verifyPayment({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const order = await Order.findById(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    err.publicMessage = 'Order not found.';
    throw err;
  }

  // Mock orders skip real signature math — there's no real Razorpay secret involved
  // for a fake order ID, so we just require that the caller sent *something*.
  const isMockOrder = razorpayOrderId.startsWith('order_mock_');
  const isValid = isMockOrder
    ? Boolean(razorpayPaymentId && razorpaySignature)
    : crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex') ===
      razorpaySignature;
  const attemptNumber = (await PaymentAttempt.countDocuments({ orderId: order._id })) + 1;

  if (!isValid) {
    await PaymentAttempt.create({
      orderId: order._id,
      attemptNumber,
      status: 'failed',
      failureReason: 'Signature verification failed.',
    });
    await logAudit({
      merchantId: order.merchantId,
      orderId: order._id,
      actor: 'system',
      action: 'payment_verification_failed',
      reason: 'Razorpay payment signature could not be verified.',
    });
    const err = new Error('Payment verification failed');
    err.status = 400;
    err.publicMessage = "We couldn't verify your payment. Please try again.";
    throw err;
  }

  order.razorpayPaymentId = razorpayPaymentId;
  order.status = 'paid';
  await order.save();

  await PaymentAttempt.create({
    orderId: order._id,
    attemptNumber,
    status: 'succeeded',
    razorpayPaymentId,
  });

  await Cart.updateOne(
    { userId: order.userId, merchantId: order.merchantId, status: 'active' },
    { status: 'converted' }
  );

  await logAudit({
    merchantId: order.merchantId,
    orderId: order._id,
    actor: 'system',
    action: 'payment_successful',
    reason: `Payment of ₹${order.amount} completed successfully.`,
  });

  return order;
}

export async function recordPaymentFailure({ orderId, merchantId, reason }) {
  const order = await Order.findOne({ _id: orderId, merchantId });
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    err.publicMessage = 'Order not found.';
    throw err;
  }

  let rule = await Rule.findOne({ merchantId });
  if (!rule) rule = await Rule.create({ merchantId });

  const failedCount = await PaymentAttempt.countDocuments({ orderId: order._id, status: 'failed' });
  const attemptNumber = failedCount + 1;

  await PaymentAttempt.create({
    orderId: order._id,
    attemptNumber,
    status: 'failed',
    failureReason: reason || 'Payment failed.',
  });

  await logAudit({
    merchantId,
    orderId: order._id,
    actor: 'system',
    action: 'payment_failed',
    reason: `Payment attempt ${attemptNumber} failed: ${reason || 'unknown reason'}.`,
  });

  const maxAttempts = rule.maxRetryAttempts + 1; // original attempt + allowed retries
  const retryAllowed = attemptNumber < maxAttempts;

  if (!retryAllowed) {
    order.status = 'failed';
    await order.save();

    await logAudit({
      merchantId,
      orderId: order._id,
      actor: 'system',
      action: 'payment_failed_final',
      reason: `Payment failed after ${attemptNumber} attempt(s) — retry limit of ${rule.maxRetryAttempts} reached. Merchant notified.`,
    });
  }

  return { order, retryAllowed, attemptNumber, maxAttempts };
}

export async function retryPayment({ orderId, merchantId }) {
  const order = await Order.findOne({ _id: orderId, merchantId });
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    err.publicMessage = 'Order not found.';
    throw err;
  }
  if (['paid', 'failed', 'blocked'].includes(order.status)) {
    const err = new Error('Order not eligible for retry');
    err.status = 409;
    err.publicMessage = `This order is ${order.status} and can't be retried.`;
    throw err;
  }

  let rule = await Rule.findOne({ merchantId });
  if (!rule) rule = await Rule.create({ merchantId });

  const failedCount = await PaymentAttempt.countDocuments({ orderId: order._id, status: 'failed' });
  const maxAttempts = rule.maxRetryAttempts + 1;

  if (failedCount >= maxAttempts) {
    const err = new Error('Retry limit reached');
    err.status = 409;
    err.publicMessage = 'The retry limit for this order has already been reached.';
    throw err;
  }

  const razorpayOrder = await createRazorpayOrder(order);
  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  await logAudit({
    merchantId,
    orderId: order._id,
    actor: 'system',
    action: 'payment_retry_initiated',
    reason: `Retrying payment — attempt ${failedCount + 1} of ${maxAttempts} allowed.`,
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