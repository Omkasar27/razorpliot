import { aiProvider } from './groqProvider.js';

const SYSTEM_PROMPT = `You are RazorPilot, a concise shopping assistant for an online store.
You are given the customer's message, a list of matching products, and optionally one
recommended add-on — all already decided by the system. You must not invent products,
prices, or facts not present in what you're given.
Write a short, friendly reply (2-4 sentences) that:
- Acknowledges what the customer is looking for.
- Mentions the products found, using their exact names and prices as given.
- If an add-on recommendation is given, mention it briefly with its reason, framed as a
  suggestion the customer can accept or skip — never as something already added.
- If no products were found, say so plainly and suggest different terms.
Do not mention JSON, systems, or internal processes.`;

export async function composeReply(customerMessage, products, recommendations = []) {
  const productSummary = products.length
    ? products.map((p) => `- ${p.name} — ₹${p.price} (${p.inStock !== false ? 'in stock' : 'out of stock'})`).join('\n')
    : 'No matching products were found.';

  const recommendationSummary = recommendations.length
    ? recommendations
        .map((r) => `- Suggest ${r.recommendedProduct.name} (₹${r.recommendedProduct.price}) because: ${r.reason}`)
        .join('\n')
    : null;

  const userContent = [
    `Customer message: "${customerMessage}"`,
    `Products found:\n${productSummary}`,
    recommendationSummary ? `Recommended add-on (mention briefly, with its reason):\n${recommendationSummary}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const reply = await aiProvider.complete({
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  return reply.trim();
}