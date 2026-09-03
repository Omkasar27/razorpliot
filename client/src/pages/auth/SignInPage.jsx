import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function SignInPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
        navigate('/shop');
      } else {
        await signUp(email, password, role);
        navigate(role === 'merchant' ? '/merchant' : '/shop');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <h1 className="text-xl font-semibold mb-1">{mode === 'signin' ? 'Sign in' : 'Create an account'}</h1>
        <p className="text-sm text-[var(--color-ink)]/60 mb-6">RazorPilot demo access</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-[var(--color-border)] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-[var(--color-border)] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />

          {mode === 'signup' && (
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`flex-1 py-2 rounded-md border transition-colors ${
                  role === 'customer'
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)] font-medium'
                    : 'border-[var(--color-border)] text-[var(--color-ink)]/70'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('merchant')}
                className={`flex-1 py-2 rounded-md border transition-colors ${
                  role === 'merchant'
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)] font-medium'
                    : 'border-[var(--color-border)] text-[var(--color-ink)]/70'
                }`}
              >
                Merchant
              </button>
            </div>
          )}

          {error && <div className="text-xs text-[var(--color-danger)]">{error}</div>}

          <button
            type="submit"
            disabled={busy}
            className="bg-[var(--color-accent)] text-white text-sm font-medium py-2 rounded-md disabled:opacity-60 hover:opacity-90"
          >
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError('');
          }}
          className="text-xs text-[var(--color-ink)]/60 mt-4 underline"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}