import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

type Mode = 'signin' | 'signup';

export function AuthView({ onSkip }: { onSkip: () => void }) {
  const { signIn, signUp } = useAuthStore();
  const [mode, setMode]       = useState<Mode>('signin');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [name, setName]       = useState('');
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null); setSuccess(null);
    if (!email.trim() || !password.trim()) { setError('Email and password are required.'); return; }
    if (mode === 'signup' && !name.trim()) { setError('Display name is required.'); return; }
    setBusy(true);
    try {
      const err = mode === 'signin'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, name.trim());
      if (err) { setError(err); }
      else if (mode === 'signup') {
        setSuccess('Account created! Check your email if verification is required, then sign in.');
        setMode('signin');
      }
      // On sign-in success the auth store updates and App re-renders automatically
    } finally { setBusy(false); }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, background: 'var(--bg-0)',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🐉</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>TTRPG Sheet</h1>
          <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
            {mode === 'signin'
              ? 'Sign in to sync your characters and join campaigns.'
              : 'Create an account to get started.'}
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
            {(['signin', 'signup'] as Mode[]).map(m => (
              <button key={m}
                onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                style={{
                  flex: 1, padding: '9px 0', fontSize: 13, fontWeight: mode === m ? 700 : 400,
                  color: mode === m ? 'var(--accent)' : 'var(--text-2)',
                  borderBottom: mode === m ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                Display Name
              </label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name or username" style={{ width: '100%' }} />
            </div>
          )}

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
              Email
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="you@example.com" style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
              Password
            </label>
            <input type="password" value={password} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder={mode === 'signup' ? 'At least 6 characters' : ''}
              style={{ width: '100%' }} />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: 'var(--accent-2)', padding: '8px 12px', background: 'color-mix(in srgb, var(--accent-2) 12%, var(--bg-2))', borderRadius: 6 }}>
              {error}
            </p>
          )}
          {success && (
            <p style={{ fontSize: 12, color: 'var(--accent-4)', padding: '8px 12px', background: 'color-mix(in srgb, var(--accent-4) 12%, var(--bg-2))', borderRadius: 6 }}>
              {success}
            </p>
          )}

          <button className="btn btn-primary" onClick={handleSubmit} disabled={busy}
            style={{ width: '100%', padding: '11px 0', fontSize: 14 }}>
            {busy ? '…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        {/* Skip */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={onSkip}
            style={{ fontSize: 12, color: 'var(--text-2)', textDecoration: 'underline' }}>
            Continue without an account (local only)
          </button>
        </div>
      </div>
    </div>
  );
}
