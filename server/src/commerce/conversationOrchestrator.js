import Conversation from '../db/models/Conversation.js';
import Recommendation from '../db/models/Recommendation.js';
import { searchCatalog, getCategories } from './catalogSearch.js';
import { recommendFor } from './recommend.js';
import { extractIntent } from '../ai/intent.js';
import { composeReply } from '../ai/explain.js';
import { logAudit } from '../audit/logger.js';

export async function handleMessage({ merchantId, userId, message, conversationId }) {
  let conversation = conversationId ? await Conversation.findById(conversationId) : null;
  if (!conversation) {
    conversation = await Conversation.create({ userId, merchantId, messages: [] });
  }

  conversation.messages.push({ role: 'customer', text: message });

  await logAudit({
    merchantId,
    conversationId: conversation._id,
    actor: 'customer',
    action: 'message_received',
    reason: `Customer said: "${message}"`,
  });

  const validCategories = await getCategories(merchantId);
  const intent = await extractIntent(message, validCategories);

  await logAudit({
    merchantId,
    conversationId: conversation._id,
    actor: 'ai',
    action: 'intent_extracted',
    reason: `Interpreted as intent="${intent.intent}"${intent.category ? `, category="${intent.category}"` : ''}${
      intent.maxPrice != null ? `, maxPrice=${intent.maxPrice}` : ''
    }`,
    metadata: intent,
  });

  const products = await searchCatalog(merchantId, {
    query: intent.keywords.join(' '),
    category: intent.category,
    maxPrice: intent.maxPrice,
    minPrice: intent.minPrice,
  });

  await logAudit({
    merchantId,
    conversationId: conversation._id,
    actor: 'system',
    action: 'catalog_searched',
    reason: `${products.length} product(s) found for the customer's request.`,
  });

  // Deterministic cross-sell candidates from the top matches only, to keep suggestions relevant.
  const candidates = await recommendFor(products.slice(0, 1));

  const savedRecommendations = [];
  for (const rec of candidates) {
    const doc = await Recommendation.create({
      conversationId: conversation._id,
      baseProductId: rec.baseProductId,
      recommendedProductId: rec.recommendedProduct._id,
      type: rec.type,
      reason: rec.reason,
    });
    savedRecommendations.push({ ...rec, recommendationId: doc._id });
  }

  if (savedRecommendations.length) {
    await logAudit({
      merchantId,
      conversationId: conversation._id,
      actor: 'system',
      action: 'recommendation_generated',
      reason: savedRecommendations
        .map((r) => `Suggested ${r.recommendedProduct.name} — ${r.reason}`)
        .join(' '),
    });
  }

  // Only the single strongest recommendation gets mentioned in the reply, to avoid noise.
  const reply = await composeReply(message, products, savedRecommendations.slice(0, 1));

  conversation.messages.push({ role: 'assistant', text: reply });
  await conversation.save();

  await logAudit({
    merchantId,
    conversationId: conversation._id,
    actor: 'ai',
    action: 'reply_generated',
    reason: 'Assistant responded to the customer with matching products.',
  });

  return {
    conversationId: conversation._id,
    reply,
    products,
    intent,
    recommendations: savedRecommendations,
  };
}