import { searchCatalog } from '../commerce/catalogSearch.js';

export async function search(req, res, next) {
  try {
    const { merchantId } = req.query;
    if (!merchantId) {
      const err = new Error('merchantId is required');
      err.status = 400;
      err.publicMessage = 'merchantId is required to search a catalog.';
      throw err;
    }

    const { q, category, maxPrice, minPrice, limit } = req.query;
    const results = await searchCatalog(merchantId, {
      query: q,
      category,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.json({ results, count: results.length });
  } catch (err) {
    next(err);
  }
}