import Product from '../db/models/Product.js';

/**
 * Deterministic recommendation engine — no LLM.
 * For each product, looks at its merchant-curated `compatibility` list and
 * proposes up to `maxPerProduct` active, in-stock companion products with a
 * template-based, always-true reason.
 */
export async function recommendFor(products, { maxPerProduct = 1 } = {}) {
  const recommendations = [];

  for (const product of products) {
    if (!product.compatibility || product.compatibility.length === 0) continue;

    const compatibleProducts = await Product.find({
      _id: { $in: product.compatibility },
      active: true,
      inventory: { $gt: 0 },
    }).lean();

    for (const compat of compatibleProducts.slice(0, maxPerProduct)) {
      recommendations.push({
        baseProductId: product._id,
        baseProductName: product.name,
        recommendedProduct: compat,
        type: 'cross-sell',
        reason: `Customers buying the ${product.name} frequently purchase the ${compat.name}.`,
      });
    }
  }

  return recommendations;
}