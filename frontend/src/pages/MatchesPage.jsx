import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import MatchCard from '../components/MatchCard';

export default function MatchesPage() {
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState('');
  const [matches, setMatches] = useState([]);
  const [myTips, setMyTips] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getRounds()
      .then(({ rounds }) => {
        setRounds(rounds);
        // Default to first group stage round
        const first = rounds.find(r => r.includes('Group')) || rounds[0];
        if (first) setSelectedRound(first);
      })
      .catch(() => setError('Failed to load rounds'));
  }, []);

  useEffect(() => {
    if (!selectedRound) return;
    setLoading(true);
    Promise.all([
      api.getMatches(selectedRound),
      api.getMyTips(),
    ])
      .then(([{ fixtures }, { tips }]) => {
        setMatches(fixtures);
        const tipsMap = {};
        tips.forEach(t => { tipsMap[t.fixtureId] = t; });
        setMyTips(tipsMap);
      })
      .catch(() => setError('Failed to load matches'))
      .finally(() => setLoading(false));
  }, [selectedRound]);

  const upcomingCount = matches.filter(m => m.status === 'NS').length;
  const tippedCount = matches.filter(m => myTips[m.id]).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, flex: 1 }}>Matches</h1>
        {rounds.length > 0 && (
          <select value={selectedRound} onChange={e => setSelectedRound(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }}>
            {rounds.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        )}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px', marginBottom: '1rem', fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span>⚽ Exact score <strong style={{ color: 'var(--text)' }}>7 pts</strong></span>
        <span>✅ Correct tendency <strong style={{ color: 'var(--text)' }}>4 pts</strong></span>
        <span>+1 per correct team goal count</span>
        <span>🌍 Tournament: Winner <strong style={{ color: 'var(--text)' }}>20</strong> · Finalist <strong style={{ color: 'var(--text)' }}>12</strong> · Top 3 <strong style={{ color: 'var(--text)' }}>8</strong> · Exact rank <strong style={{ color: 'var(--text)' }}>+10</strong> per pick</span>
      </div>

      {upcomingCount > 0 && (
        <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px', marginBottom: '1rem', fontSize: 13, color: 'var(--warning)' }}>
          ⏰ {tippedCount}/{upcomingCount} tips submitted for this round
        </div>
      )}

      {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading matches…</p>}

      {!loading && matches.map(match => (
        <MatchCard
          key={match.id}
          match={match}
          existingTip={myTips[match.id] || null}
          onTipSaved={() => api.getMyTips().then(({ tips }) => {
            const map = {};
            tips.forEach(t => { map[t.fixtureId] = t; });
            setMyTips(map);
          })}
        />
      ))}

      {!loading && matches.length === 0 && !error && (
        <p style={{ color: 'var(--text-muted)' }}>No matches found for this round.</p>
      )}
    </div>
  );
}
