import Product from '../db/models/Product.js';

/**
 * Deterministic catalog search — no LLM involved.
 * Supports free-text (name/description/tags), category filter, and price range.
 * Ranking: text relevance first (when a query is given), then in-stock items
 * before out-of-stock, then price ascending.
 */
export async function searchCatalog(merchantId, { query, category, maxPrice, minPrice, limit = 20 } = {}) {
  const filter = { merchantId, active: true };

  if (category) {
    filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
  }
  if (maxPrice != null || minPrice != null) {
    filter.price = {};
    if (minPrice != null) filter.price.$gte = Number(minPrice);
    if (maxPrice != null) filter.price.$lte = Number(maxPrice);
  }

  let cursor;
  if (query && query.trim()) {
    filter.$text = { $search: query.trim() };
    cursor = Product.find(filter, { score: { $meta: 'textScore' } }).sort({
      score: { $meta: 'textScore' },
    });
  } else {
    cursor = Product.find(filter);
  }

  const results = await cursor.limit(limit * 3).lean(); // over-fetch, then re-rank deterministically

  const ranked = results
    .map((p) => ({ ...p, inStock: p.inventory > 0 }))
    .sort((a, b) => {
      if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
      if (query && query.trim()) return 0; // preserve text-score order among same-stock items
      return a.price - b.price;
    })
    .slice(0, limit);

  return ranked;
}

export async function getCategories(merchantId) {
  return Product.distinct('category', { merchantId, active: true });
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}