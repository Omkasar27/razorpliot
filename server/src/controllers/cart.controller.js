import { getOrCreateCart, addItem, removeItem, cartTotal } from '../commerce/cartService.js';
import { evaluateCart } from '../commerce/safetyEngine.js';
import Rule from '../db/models/Rule.js';
import { logAudit } from '../audit/logger.js';

export async function getCart(req, res, next) {
  try {
    const { userId, merchantId } = req.query;
    if (!userId || !merchantId) {
      const err = new Error('Missing fields');
      err.status = 400;
      err.publicMessage = 'userId and merchantId are required.';
      throw err;
    }
    const cart = await getOrCreateCart(userId, merchantId);
    res.json({ cart, total: cartTotal(cart) });
  } catch (err) {
    next(err);
  }
}

export async function postItem(req, res, next) {
  try {
    const { userId, merchantId, productId, quantity, addedVia } = req.body;
    if (!userId || !merchantId || !productId) {
      const err = new Error('Missing fields');
      err.status = 400;
      err.publicMessage = 'userId, merchantId, and productId are required.';
      throw err;
    }
    const cart = await addItem(userId, merchantId, { productId, quantity, addedVia });

    await logAudit({
      merchantId,
      actor: 'customer',
      action: addedVia === 'upsell' || addedVia === 'cross-sell' ? 'upsell_added_to_cart' : 'item_added_to_cart',
      reason: `Item added to cart (source: ${addedVia || 'customer'}).`,
    });

    res.json({ cart, total: cartTotal(cart) });
  } catch (err) {
    next(err);
  }
}

export async function deleteItem(req, res, next) {
  try {
    const { userId, merchantId } = req.query;
    const { productId } = req.params;
    if (!userId || !merchantId) {
      const err = new Error('Missing fields');
      err.status = 400;
      err.publicMessage = 'userId and merchantId are required.';
      throw err;
    }
    const cart = await removeItem(userId, merchantId, productId);
    res.json({ cart, total: cartTotal(cart) });
  } catch (err) {
    next(err);
  }
}

export async function safetyCheck(req, res, next) {
  try {
    const { userId, merchantId } = req.body;
    if (!userId || !merchantId) {
      const err = new Error('Missing fields');
      err.status = 400;
      err.publicMessage = 'userId and merchantId are required.';
      throw err;
    }

    const cart = await getOrCreateCart(userId, merchantId);
    let rule = await Rule.findOne({ merchantId });
    if (!rule) rule = await Rule.create({ merchantId });

    const result = await evaluateCart(cart, rule);

    await logAudit({
      merchantId,
      actor: 'system',
      action: `safety_check_${result.decision}`,
      reason: result.reason,
    });

    res.json({ cart, total: cartTotal(cart), safety: result });
  } catch (err) {
    next(err);
  }
}