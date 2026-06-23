import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const RESULT_COLOR = {
  exact: 'var(--success)',
  correct_winner: 'var(--accent)',
  goal_bonus: 'var(--warning)',
  wrong: 'var(--text-muted)',
};

function resultLabel(tip, actualHome, actualAway) {
  if (tip.result === 'exact') return 'Exact';
  if (tip.result === 'wrong') return 'Miss';
  const diff = (tip.scoreHome - tip.scoreAway) === (actualHome - actualAway);
  const bonusLabel = diff ? 'Goal difference bonus' : 'One team goal bonus';
  const hasBonus = tip.points > 3;
  if (tip.result === 'correct_winner') return hasBonus ? `Tendency + ${bonusLabel}` : 'Tendency';
  return bonusLabel;
}

export default function AllTipsPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAllTips()
      .then(({ matches }) => setMatches(matches))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>;
  if (matches.length === 0) return <p style={{ color: 'var(--text-muted)' }}>No evaluated matches yet.</p>;

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: '1.25rem' }}>All Tips</h1>

      {matches.map(match => (
        <div key={match.fixtureId} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{match.homeTeam} vs {match.awayTeam}</div>
              {match.date && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(match.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>}
            </div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{match.actualHome} : {match.actualAway}</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '6px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>Player</th>
                <th style={{ padding: '6px 14px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>Tip</th>
                <th style={{ padding: '6px 14px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>Result</th>
                <th style={{ padding: '6px 14px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 500 }}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {match.tips.map((tip, i) => (
                <tr key={i} style={{ borderBottom: i < match.tips.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '8px 14px' }}>{tip.displayName}</td>
                  <td style={{ padding: '8px 14px', textAlign: 'center', fontWeight: 600 }}>{tip.scoreHome} : {tip.scoreAway}</td>
                  <td style={{ padding: '8px 14px', textAlign: 'center', color: RESULT_COLOR[tip.result] || 'var(--text-muted)' }}>
                    {resultLabel(tip, match.actualHome, match.actualAway)}
                  </td>
                  <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, color: RESULT_COLOR[tip.result] || 'var(--text-muted)' }}>
                    +{tip.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
