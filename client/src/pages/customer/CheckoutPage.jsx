import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useCart } from '../../hooks/useCart.jsx';
import { api } from '../../lib/api.js';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load the Razorpay checkout script.'));
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { appUser } = useAuth();
  const { cart, total, merchantId, refresh: refreshCart } = useCart();
  const navigate = useNavigate();

  // review -> creating -> awaiting_approval -> paying -> success | rejected | blocked | failed
  const [phase, setPhase] = useState('review');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [retryAllowed, setRetryAllowed] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => () => clearInterval(pollRef.current), []);

  const upsellAccepted = cart.items.some((i) => i.addedVia !== 'customer');

  async function startPayment(orderData, razorpayInfo) {
    setPhase('paying');
    setError('');

    const isMock = razorpayInfo.orderId.startsWith('order_mock_');

    if (isMock) {
      // Mock mode: no real gateway involved — verify immediately with synthetic values,
      // exercising the exact same server-side code path a real payment would.
      try {
        const result = await api.post('/checkout/verify', {
          orderId: orderData._id,
          razorpayOrderId: razorpayInfo.orderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: 'mock_signature',
        });
        setOrder(result.order);
        setPhase('success');
        refreshCart();
      } catch (err) {
        setError(err.message);
        setPhase('failed');
      }
      return;
    }

    try {
      await loadRazorpayScript();
    } catch (err) {
      setError(err.message);
      setPhase('failed');
      return;
    }

        try {
      const rzp = new window.Razorpay({
        key: razorpayInfo.keyId || RAZORPAY_KEY_ID,
        amount: razorpayInfo.amount,
        currency: razorpayInfo.currency,
        order_id: razorpayInfo.orderId,
        name: 'RazorPilot Demo Store',
        description: `Order for ${orderData.items.length} item(s)`,
        handler: async (response) => {
          try {
            const result = await api.post('/checkout/verify', {
              orderId: orderData._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setOrder(result.order);
            setPhase('success');
            refreshCart();
          } catch (err) {
            await handleFailure(orderData._id, err.message);
          }
        },
        modal: {
          ondismiss: async () => {
            await handleFailure(orderData._id, 'Payment window closed before completing.');
          },
        },
        theme: { color: '#3B5BFD' },
      });

      rzp.on('payment.failed', async (response) => {
        await handleFailure(orderData._id, response.error?.description || 'Payment failed.');
      });

      rzp.open();
    } catch (err) {
      console.error('Razorpay widget failed to open:', err);
      setError(err.message || 'The payment window could not be opened.');
      setPhase('failed');
    }
  }

  async function handleFailure(orderId, reason) {
    try {
      const result = await api.post('/checkout/fail', { orderId, merchantId, reason });
      setOrder(result.order);
      setRetryAllowed(result.retryAllowed);
      setError(reason);
      setPhase('failed');
    } catch (err) {
      setError(err.message);
      setPhase('failed');
    }
  }

  async function handleRetry() {
    if (!order) return;
    setPhase('paying');
    try {
      const result = await api.post('/checkout/retry', { orderId: order._id, merchantId });
      setOrder(result.order);
      await startPayment(result.order, result.razorpay);
    } catch (err) {
      setError(err.message);
      setPhase('failed');
    }
  }

  function pollApproval(orderId) {
    pollRef.current = setInterval(async () => {
      try {
        const { order: latest } = await api.get(`/orders/${orderId}?merchantId=${merchantId}`);
        setOrder(latest);
        if (latest.approvalStatus === 'approved' && latest.razorpayOrderId) {
          clearInterval(pollRef.current);
          startPayment(latest, {
            orderId: latest.razorpayOrderId,
            amount: Math.round(latest.amount * 100),
            currency: 'INR',
            keyId: RAZORPAY_KEY_ID,
          });
        } else if (latest.approvalStatus === 'rejected') {
          clearInterval(pollRef.current);
          setPhase('rejected');
        }
      } catch {
        // Transient poll error — try again on the next tick rather than surfacing it.
      }
    }, 3000);
  }

  async function placeOrder() {
    setPhase('creating');
    setError('');
    try {
      const result = await api.post('/checkout/create-order', {
        userId: appUser._id,
        merchantId,
        upsellAccepted,
      });
      setOrder(result.order);

      if (result.requiresApproval) {
        setPhase('awaiting_approval');
        pollApproval(result.order._id);
      } else {
        startPayment(result.order, result.razorpay);
      }
    } catch (err) {
      const blocked = err.message?.toLowerCase().includes("can't complete");
      setPhase(blocked ? 'blocked' : 'failed');
      setError(err.message);
    }
  }

  if (cart.items.length === 0 && phase === 'review') {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <p className="text-sm text-[var(--color-ink)]/60 mb-4">Your cart is empty.</p>
        <button onClick={() => navigate('/shop')} className="text-sm text-[var(--color-accent)] underline">
          Go back to shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold mb-6">Checkout</h1>

      <div className="border border-[var(--color-border)] rounded-lg divide-y divide-[var(--color-border)] mb-6">
        {cart.items.map((item) => (
          <div key={item.productId} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              {item.name}
              <span className="text-[var(--color-ink)]/40"> × {item.quantity}</span>
            </div>
            <div>₹{item.priceAtAdd * item.quantity}</div>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-3 text-sm font-semibold">
          <div>Total</div>
          <div>₹{total}</div>
        </div>
      </div>

      {phase === 'review' && (
        <button
          onClick={placeOrder}
          className="w-full bg-[var(--color-accent)] text-white text-sm font-medium py-2.5 rounded-md hover:opacity-90"
        >
          Place order
        </button>
      )}

      {phase === 'creating' && (
        <div className="text-sm text-[var(--color-ink)]/60 text-center py-4">Running safety checks…</div>
      )}

      {phase === 'awaiting_approval' && (
        <div className="text-center py-4">
          <div className="text-sm font-medium mb-1">Waiting for merchant approval</div>
          <p className="text-xs text-[var(--color-ink)]/60">
            {order?.safetyReason || 'This order needs a quick review before payment.'}
          </p>
        </div>
      )}

      {phase === 'paying' && (
        <div className="text-sm text-[var(--color-ink)]/60 text-center py-4">Opening payment…</div>
      )}

      {phase === 'success' && (
        <div className="text-center py-4">
          <div className="text-sm font-semibold text-[var(--color-success)] mb-1">Payment successful</div>
          <p className="text-xs text-[var(--color-ink)]/60 mb-4">Order total ₹{order?.amount} — thank you!</p>
          <button onClick={() => navigate('/shop')} className="text-sm text-[var(--color-accent)] underline">
            Continue shopping
          </button>
        </div>
      )}

      {phase === 'rejected' && (
        <div className="text-center py-4">
          <div className="text-sm font-semibold text-[var(--color-danger)] mb-1">Order declined</div>
          <p className="text-xs text-[var(--color-ink)]/60">
            The merchant was unable to approve this order. Please contact support or try a different cart.
          </p>
        </div>
      )}

      {phase === 'blocked' && (
        <div className="text-center py-4">
          <div className="text-sm font-semibold text-[var(--color-danger)] mb-1">We can't complete this order</div>
          <p className="text-xs text-[var(--color-ink)]/60">{error}</p>
        </div>
      )}

      {phase === 'failed' && (
        <div className="text-center py-4">
          <div className="text-sm font-semibold text-[var(--color-danger)] mb-1">Payment didn't go through</div>
          <p className="text-xs text-[var(--color-ink)]/60 mb-3">{error || 'Something went wrong.'}</p>
          {retryAllowed ? (
            <button
              onClick={handleRetry}
              className="text-sm bg-[var(--color-accent)] text-white px-4 py-2 rounded-md hover:opacity-90"
            >
              Try again
            </button>
          ) : (
            <p className="text-xs text-[var(--color-ink)]/40">Retry limit reached — please contact support.</p>
          )}
        </div>
      )}
    </div>
  );
}