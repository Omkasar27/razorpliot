import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

export default function SignInPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

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

  async function handleGoogle() {
    setError('');
    setGoogleBusy(true);
    try {
      await signInWithGoogle(role);
      navigate(role === 'merchant' ? '/merchant' : '/shop');
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <h1 className="text-xl font-semibold mb-1">{mode === 'signin' ? 'Sign in' : 'Create an account'}</h1>
        <p className="text-sm text-[var(--color-ink)]/60 mb-6">RazorPilot demo access</p>

        <div className="mb-4">
          <div className="flex gap-2 text-sm mb-4">
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
          <p className="text-xs text-[var(--color-ink)]/40 -mt-2 mb-4">
            Only matters for a brand-new account — returning users go straight to their existing role.
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleBusy}
            className="w-full flex items-center justify-center gap-2 border border-[var(--color-border)] rounded-md py-2 text-sm font-medium hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
          >
            <GoogleIcon />
            {googleBusy ? 'Connecting…' : 'Continue with Google'}
          </button>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-ink)]/40">or</span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

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