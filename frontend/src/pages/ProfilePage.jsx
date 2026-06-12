import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';

export default function ProfilePage() {
  const user = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.updateDisplayName(displayName);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: '1.25rem' }}>Profile</h1>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Email</div>
        <div style={{ fontSize: 15 }}>{user?.email}</div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: '1rem' }}>Change display name</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            required
            maxLength={30}
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your name shown in rankings"
            style={{
              display: 'block', width: '100%', padding: '10px 12px',
              border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: 15,
              marginBottom: '0.75rem', outline: 'none',
            }}
          />
          {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: '0.75rem' }}>{error}</p>}
          {saved && <p style={{ color: 'var(--success)', fontSize: 13, marginBottom: '0.75rem' }}>Display name updated!</p>}
          <button
            type="submit"
            disabled={saving || !displayName.trim()}
            style={{
              padding: '9px 20px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius)', fontWeight: 500,
              fontSize: 14, opacity: (saving || !displayName.trim()) ? 0.6 : 1, cursor: 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
