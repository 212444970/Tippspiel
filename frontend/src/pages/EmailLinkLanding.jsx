import { useEffect, useState } from 'react';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function EmailLinkLanding() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [askEmail, setAskEmail] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      navigate('/login');
      return;
    }
    const saved = window.localStorage.getItem('emailForSignIn');
    if (saved) {
      completeSignIn(saved);
    } else {
      setAskEmail(true);
    }
  }, []);

  async function completeSignIn(emailAddr) {
    try {
      await signInWithEmailLink(auth, emailAddr, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      navigate('/matches');
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>
      <a href="/login">Back to login</a>
    </div>
  );

  if (askEmail) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 360, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 12 }}>Confirm your email</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: '1rem' }}>Please re-enter the email you used to sign in.</p>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{ display: 'block', width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)', color: 'var(--text)', marginBottom: '0.75rem' }}
        />
        <button onClick={() => completeSignIn(email)} style={{ width: '100%', padding: '10px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 500 }}>
          Sign in
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      Signing you in…
    </div>
  );
}
