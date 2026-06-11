import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const MEDALS = ['🥇', '🥈', '🥉'];

function initials(name) {
  return name.split(/\s+|@/).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
}

const AVATAR_COLORS = [
  ['#EEEDFE', '#534AB7'], ['#E1F5EE', '#0F6E56'], ['#FAECE7', '#993C1D'],
  ['#FBEAF0', '#993556'], ['#E6F1FB', '#185FA5'], ['#FAEEDA', '#854F0B'],
];

export default function LeaderboardPage() {
  const user = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard()
      .then(({ leaderboard }) => setLeaderboard(leaderboard))
      .finally(() => setLoading(false));
  }, []);

  const me = leaderboard.find(u => u.uid === user?.uid);

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: '1.25rem' }}>Ranking</h1>

      {me && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
          {[['Your rank', `#${me.rank}`], ['Your points', me.totalPoints], ['Accuracy', `${me.accuracy}%`]].map(([label, val]) => (
            <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}

      {leaderboard.map((entry, i) => {
        const isMe = entry.uid === user?.uid;
        const [bg, textColor] = AVATAR_COLORS[i % AVATAR_COLORS.length];
        return (
          <div key={entry.uid} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', borderRadius: 'var(--radius-lg)', marginBottom: 6,
            background: isMe ? 'var(--accent-bg)' : 'var(--surface)',
            border: `1px solid ${isMe ? 'var(--accent)' : 'var(--border)'}`,
          }}>
            <div style={{ width: 28, textAlign: 'center', fontSize: 16, flexShrink: 0 }}>
              {i < 3 ? MEDALS[i] : <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{entry.rank}</span>}
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: bg, color: textColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, flexShrink: 0 }}>
              {initials(entry.displayName)}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: isMe ? 'var(--accent-text)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {entry.displayName}{isMe && ' (you)'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {entry.tipsEvaluated} tips evaluated
                {entry.tournamentPoints > 0 && ` · 🌍 ${entry.tournamentPoints} tournament`}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: isMe ? 'var(--accent-text)' : 'var(--text)' }}>{entry.totalPoints} pts</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{entry.accuracy}% accuracy</div>
            </div>
          </div>
        );
      })}

      {!loading && leaderboard.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>No results yet — rankings appear once matches are evaluated.</p>
      )}
    </div>
  );
}
