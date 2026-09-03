import { aiProvider } from './groqProvider.js';

function buildSystemPrompt(validCategories) {
  const categoryList = validCategories.length
    ? validCategories.map((c) => `"${c}"`).join(', ')
    : '(no categories available)';

  return `You are an intent-extraction engine for an e-commerce assistant.
Given a customer's message, output ONLY a JSON object with this exact shape:
{
  "intent": "search" | "add_to_cart" | "question" | "checkout" | "other",
  "keywords": string[],
  "category": string | null,
  "maxPrice": number | null,
  "minPrice": number | null
}
Rules:
- "category" MUST be exactly one of these values, or null if none clearly fits: ${categoryList}
- Do not invent a category that is not in that list.
- If no price is mentioned, both maxPrice and minPrice must be null.
- Output raw JSON only. No markdown, no explanation, no code fences.`;
}

export async function extractIntent(message, validCategories = []) {
  const raw = await aiProvider.complete({
    system: buildSystemPrompt(validCategories),
    messages: [{ role: 'user', content: message }],
    jsonMode: true,
  });

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Fail safe: never crash the conversation on a bad LLM response.
    return { intent: 'search', keywords: [message], category: null, maxPrice: null, minPrice: null };
  }

  // Deterministic guardrail: the LLM can only pick a category that actually
  // exists in this merchant's catalog. Anything else is discarded rather than
  // trusted, so a hallucinated category can never zero-out a valid search.
  const normalizedCategory =
    typeof parsed.category === 'string' &&
    validCategories.some((c) => c.toLowerCase() === parsed.category.toLowerCase())
      ? validCategories.find((c) => c.toLowerCase() === parsed.category.toLowerCase())
      : null;

  return {
    intent: parsed.intent || 'other',
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    category: normalizedCategory,
    maxPrice: typeof parsed.maxPrice === 'number' ? parsed.maxPrice : null,
    minPrice: typeof parsed.minPrice === 'number' ? parsed.minPrice : null,
  };
}