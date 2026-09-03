import { useState, useCallback } from 'react';
import { api } from '../lib/api.js';

export function useConversation(merchantId, userId) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]); // { role: 'customer' | 'assistant', text }
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || !merchantId || !userId) return;
      setError('');
      setMessages((prev) => [...prev, { role: 'customer', text }]);
      setSending(true);
      try {
        const result = await api.post('/conversation', {
          merchantId,
          userId,
          message: text,
          conversationId,
        });
        setConversationId(result.conversationId);
        setMessages((prev) => [...prev, { role: 'assistant', text: result.reply }]);
        setProducts(result.products || []);
        setRecommendations(result.recommendations || []);
      } catch (err) {
        setError(err.message || 'Something went wrong.');
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: "Sorry, I couldn't process that. Please try again." },
        ]);
      } finally {
        setSending(false);
      }
    },
    [merchantId, userId, conversationId]
  );

  return { conversationId, messages, products, recommendations, sendMessage, sending, error };
}