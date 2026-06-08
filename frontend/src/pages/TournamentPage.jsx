import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const DEADLINE = new Date('2026-06-18T00:00:00Z');

const TEAMS = [
  'Argentina', 'Australia', 'Brazil', 'Canada', 'Chile', 'Colombia',
  'Costa Rica', 'Ecuador', 'Honduras', 'Jamaica', 'Mexico', 'Panama',
  'Paraguay', 'Peru', 'United States', 'Uruguay', 'Venezuela',
  'Albania', 'Austria', 'Belgium', 'Croatia', 'Czechia', 'Denmark',
  'England', 'France', 'Georgia', 'Germany', 'Hungary', 'Italy',
  'Netherlands', 'Poland', 'Portugal', 'Romania', 'Serbia', 'Slovakia',
  'Slovenia', 'Spain', 'Switzerland', 'Turkey', 'Ukraine',
  'Cameroon', 'DR Congo', 'Egypt', 'Morocco', 'Nigeria', 'Senegal',
  'South Africa', 'Tunisia',
  'Iran', 'Japan', 'Qatar', 'Saudi Arabia', 'South Korea',
  'United Arab Emirates', 'Uzbekistan',
  'New Zealand',
].sort();

const BASE_PTS = { 1: 20, 2: 12, 3: 8 };

export default function TournamentPage() {
  const [tip, setTip] = useState(null);
  const [picks, setPicks] = useState({ pick1: '', pick2: '', pick3: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const isPast = new Date() > DEADLINE;

  useEffect(() => {
    api.getTournamentTip()
      .then(({ tip }) => {
        if (tip) {
          setTip(tip);
          setPicks({ pick1: tip.pick1, pick2: tip.pick2, pick3: tip.pick3 });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.submitTournamentTip(picks.pick1, picks.pick2, picks.pick3);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const usedTeams = Object.values(picks).filter(Boolean);

  function selectFor(key) {
    return (
      <select
        required
        disabled={isPast}
        value={picks[key]}
        onChange={e => setPicks(p => ({ ...p, [key]: e.target.value }))}
        style={{
          width: '100%', padding: '10px 12px',
          border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          background: 'var(--bg)', color: 'var(--text)', fontSize: 15,
        }}
      >
        <option value="">— select team —</option>
        {TEAMS.map(t => (
          <option key={t} value={t} disabled={usedTeams.includes(t) && picks[key] !== t}>
            {t}
          </option>
        ))}
      </select>
    );
  }

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Tournament Winner</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: '1.5rem' }}>
        Pick the top 3 teams. Deadline: <strong>June 18, 2026</strong>.
      </p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '1.5rem', fontSize: 13, color: 'var(--text-muted)' }}>
        <strong style={{ color: 'var(--text)' }}>Points:</strong>
        {' '}Winner correct: +20 · Finalist: +12 · Top 3: +8 · Exact rank bonus: +10
      </div>

      {isPast && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: 14, color: 'var(--text-muted)' }}>
          Deadline has passed — picks are locked.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {[
          { key: 'pick1', label: '🥇 1st place', pts: BASE_PTS[1] },
          { key: 'pick2', label: '🥈 2nd place', pts: BASE_PTS[2] },
          { key: 'pick3', label: '🥉 3rd place', pts: BASE_PTS[3] },
        ].map(({ key, label, pts }) => (
          <div key={key} style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
              <span>{label}</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>up to {pts + 10} pts</span>
            </label>
            {selectFor(key)}
          </div>
        ))}

        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: '0.75rem' }}>{error}</p>}
        {saved && <p style={{ color: 'var(--accent)', fontSize: 13, marginBottom: '0.75rem' }}>Saved!</p>}

        {!isPast && (
          <button
            type="submit"
            disabled={saving || !picks.pick1 || !picks.pick2 || !picks.pick3}
            style={{
              width: '100%', padding: '10px',
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius)',
              fontWeight: 500, fontSize: 15,
              opacity: (saving || !picks.pick1 || !picks.pick2 || !picks.pick3) ? 0.6 : 1,
              cursor: 'pointer',
            }}
          >
            {saving ? 'Saving…' : tip ? 'Update picks' : 'Save picks'}
          </button>
        )}
      </form>

      {tip?.evaluated && (
        <div style={{ marginTop: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: '0.75rem' }}>Result</h3>
          {[
            { label: '🥇', pick: tip.pick1, pts: tip.pts1 },
            { label: '🥈', pick: tip.pick2, pts: tip.pts2 },
            { label: '🥉', pick: tip.pick3, pts: tip.pts3 },
          ].map(({ label, pick, pts }) => (
            <div key={pick} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <span>{label} {pick}</span>
              <strong>{pts} pts</strong>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', fontWeight: 600 }}>
            <span>Total</span>
            <span>{tip.points} pts</span>
          </div>
        </div>
      )}
    </div>
  );
}
