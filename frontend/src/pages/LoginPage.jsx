import { useState } from 'react';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const actionCodeSettings = {
  url: `${window.location.origin}/auth/email-link`,
  handleCodeInApp: true,
};

export default function LoginPage() {
  const user = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/matches" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 48, marginBottom: '0.5rem' }}>⚽</div>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>Tippspiel</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>World Cup 2026 · Tip your way to glory</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: '0.75rem' }}>📧</div>
              <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Check your inbox</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                We sent a magic link to <strong>{email}</strong>. Click it to sign in — no password needed.
              </p>
              <button onClick={() => setSent(false)} style={{ marginTop: '1rem', fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none' }}>
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  marginBottom: '0.75rem',
                  outline: 'none',
                }}
              />
              {error && (
                <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: '0.75rem' }}>{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontWeight: 500,
                  fontSize: 15,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
