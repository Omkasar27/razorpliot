import { useAuth } from '../../hooks/useAuth.jsx';
import { useConversation } from '../../hooks/useConversation.js';
import ChatPanel from '../../components/customer/ChatPanel.jsx';
import ProductCard from '../../components/customer/ProductCard.jsx';
import RecommendationCard from '../../components/customer/RecommendationCard.jsx';

const MERCHANT_ID = import.meta.env.VITE_DEMO_MERCHANT_ID;

export default function ShoppingPage() {
  const { appUser } = useAuth();
  const { messages, products, recommendations, sendMessage, sending, error } = useConversation(
    MERCHANT_ID,
    appUser?._id
  );

  if (!MERCHANT_ID) {
    return (
      <div className="max-w-xl mx-auto px-6 py-10 text-sm text-[var(--color-danger)]">
        VITE_DEMO_MERCHANT_ID is not set in client/.env — set it to your seeded merchant's ID.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-3.5rem)]">
      <div className="border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] flex flex-col overflow-hidden">
        <ChatPanel messages={messages} onSend={sendMessage} sending={sending} />
      </div>

      <div className="overflow-y-auto space-y-3 pb-6">
        {error && <div className="text-xs text-[var(--color-danger)]">{error}</div>}

        {recommendations.map((rec) => (
          <RecommendationCard key={rec.recommendationId} recommendation={rec} />
        ))}

        {products.length === 0 && messages.length > 0 && !sending && (
          <div className="text-sm text-[var(--color-ink)]/50">No products yet — try asking for something.</div>
        )}

        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}