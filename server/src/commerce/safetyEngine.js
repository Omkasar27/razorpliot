import Product from '../db/models/Product.js';

/**
 * Deterministic safety engine — pure decision logic, no LLM involved anywhere.
 * Re-fetches live product data rather than trusting cart snapshots, since
 * inventory can change between "add to cart" and "checkout."
 * Check order: unknown/inactive product (blocks outright) -> low inventory
 * -> amount threshold -> auto-approve.
 */
export async function evaluateCart(cart, rule) {
  const total = cart.items.reduce((sum, i) => sum + i.priceAtAdd * i.quantity, 0);

  for (const item of cart.items) {
    const product = await Product.findById(item.productId).lean();

    if (!product || !product.active) {
      return {
        decision: 'blocked',
        reason: `Product "${item.name}" is unknown or no longer available.`,
      };
    }

    if (product.inventory < rule.lowInventoryThreshold) {
      return {
        decision: 'approval_required',
        reason: `"${product.name}" has low inventory (${product.inventory} left, below the threshold of ${rule.lowInventoryThreshold}).`,
      };
    }
  }

  if (total >= rule.approvalThreshold) {
    return {
      decision: 'approval_required',
      reason: `Order total ₹${total} is at or above the merchant's approval threshold of ₹${rule.approvalThreshold}.`,
    };
  }

  return {
    decision: 'auto',
    reason: `Order total ₹${total} is below the merchant's approval threshold of ₹${rule.approvalThreshold}.`,
  };
}