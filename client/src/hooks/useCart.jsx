import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from './useAuth.jsx';

const MERCHANT_ID = import.meta.env.VITE_DEMO_MERCHANT_ID;

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { appUser } = useAuth();
  const userId = appUser?._id;

  const [cart, setCart] = useState({ items: [] });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId || !MERCHANT_ID) return;
    setLoading(true);
    try {
      const result = await api.get(`/cart?userId=${userId}&merchantId=${MERCHANT_ID}`);
      setCart(result.cart);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (productId, { quantity = 1, addedVia = 'customer' } = {}) => {
      if (!userId || !MERCHANT_ID) return;
      const result = await api.post('/cart/items', {
        userId,
        merchantId: MERCHANT_ID,
        productId,
        quantity,
        addedVia,
      });
      setCart(result.cart);
      setTotal(result.total);
    },
    [userId]
  );

  const removeItem = useCallback(
    async (productId) => {
      if (!userId || !MERCHANT_ID) return;
      const result = await api.del(`/cart/items/${productId}?userId=${userId}&merchantId=${MERCHANT_ID}`);
      setCart(result.cart);
      setTotal(result.total);
    },
    [userId]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        loading,
        addItem,
        removeItem,
        refresh,
        drawerOpen,
        setDrawerOpen,
        merchantId: MERCHANT_ID,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}