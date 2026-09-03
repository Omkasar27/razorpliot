import Recommendation from '../db/models/Recommendation.js';
import Product from '../db/models/Product.js';
import { logAudit } from '../audit/logger.js';

export async function decide(req, res, next) {
  try {
    const { id } = req.params;
    const { accepted, merchantId } = req.body;
    if (typeof accepted !== 'boolean' || !merchantId) {
      const err = new Error('Missing fields');
      err.status = 400;
      err.publicMessage = 'accepted (boolean) and merchantId are required.';
      throw err;
    }

    const recommendation = await Recommendation.findByIdAndUpdate(id, { accepted }, { new: true });
    if (!recommendation) {
      const err = new Error('Not found');
      err.status = 404;
      err.publicMessage = 'Recommendation not found.';
      throw err;
    }

    const product = await Product.findById(recommendation.recommendedProductId).lean();

    await logAudit({
      merchantId,
      conversationId: recommendation.conversationId,
      actor: 'customer',
      action: accepted ? 'upsell_accepted' : 'upsell_rejected',
      reason: `Customer ${accepted ? 'accepted' : 'declined'} the suggestion for ${product?.name || 'a recommended product'}.`,
    });

    res.json({ recommendation });
  } catch (err) {
    next(err);
  }
}