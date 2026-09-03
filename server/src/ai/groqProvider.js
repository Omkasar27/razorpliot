import Groq from 'groq-sdk';
import { AIProvider } from './provider.js';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

export class GroqProvider extends AIProvider {
  async complete({ system, messages, jsonMode = false }) {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [...(system ? [{ role: 'system', content: system }] : []), ...messages],
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      temperature: 0.3,
    });
    return completion.choices[0]?.message?.content ?? '';
  }
}

// Single shared instance used across the app.
export const aiProvider = new GroqProvider();