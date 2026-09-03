// Abstraction so the app never talks to `groq-sdk` directly outside this folder.
// Swapping providers later = implement this interface + change one export.
export class AIProvider {
  /**
   * @param {{ system?: string, messages: {role: string, content: string}[], jsonMode?: boolean }} args
   * @returns {Promise<string>} raw text (or raw JSON string when jsonMode is true)
   */
  async complete(args) {
    throw new Error('AIProvider.complete() not implemented');
  }
}