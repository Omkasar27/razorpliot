import { createCheckout, verifyPayment, recordPaymentFailure, retryPayment } from '../commerce/checkoutService.js';
export async function postCreateOrder(req, res, next) {
  try {
    const { userId, merchantId, upsellAccepted } = req.body;
    if (!userId || !merchantId) {
      const err = new Error('Missing fields');
      err.status = 400;
      err.publicMessage = 'userId and merchantId are required.';
      throw err;
    }
    const result = await createCheckout({ userId, merchantId, upsellAccepted });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function postVerify(req, res, next) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      const err = new Error('Missing fields');
      err.status = 400;
      err.publicMessage = 'orderId, razorpayOrderId, razorpayPaymentId, and razorpaySignature are required.';
      throw err;
    }
    const order = await verifyPayment({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature });
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

export async function postFail(req, res, next) {
  try {
    const { orderId, merchantId, reason } = req.body;
    if (!orderId || !merchantId) {
      const err = new Error('Missing fields');
      err.status = 400;
      err.publicMessage = 'orderId and merchantId are required.';
      throw err;
    }
    const result = await recordPaymentFailure({ orderId, merchantId, reason });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function postRetry(req, res, next) {
  try {
    const { orderId, merchantId } = req.body;
    if (!orderId || !merchantId) {
      const err = new Error('Missing fields');
      err.status = 400;
      err.publicMessage = 'orderId and merchantId are required.';
      throw err;
    }
    const result = await retryPayment({ orderId, merchantId });
    res.json(result);
  } catch (err) {
    next(err);
  }
}


