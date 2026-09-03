import Order from '../db/models/Order.js';

export async function listOrders(req, res, next) {
  try {
    const { merchantId, userId, status } = req.query;
    if (!merchantId) {
      const err = new Error('merchantId required');
      err.status = 400;
      err.publicMessage = 'merchantId is required.';
      throw err;
    }
    const filter = { merchantId };
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { merchantId } = req.query;
    const filter = { _id: id };
    if (merchantId) filter.merchantId = merchantId;
    const order = await Order.findOne(filter);
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      err.publicMessage = 'Order not found.';
      throw err;
    }
    res.json({ order });
  } catch (err) {
    next(err);
  }
}