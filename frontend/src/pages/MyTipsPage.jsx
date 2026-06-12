import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const RESULT_STYLES = {
  exact:          { label: 'Exact',                    color: 'var(--success)',    bg: 'var(--success-bg)' },
  correct_winner: { label: 'Tendency',                 color: 'var(--accent)',     bg: 'var(--accent-bg)' },
  goal_bonus:     { label: 'Goal bonus',               color: 'var(--warning)',    bg: 'var(--warning-bg)' },
  wrong:          { label: 'Miss',                     color: 'var(--text-muted)', bg: 'var(--border)' },
};

export default function MyTipsPage() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyTips()
      .then(({ tips }) => setTips(tips.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))))
      .finally(() => setLoading(false));
  }, []);

  const evaluated = tips.filter(t => t.evaluated);
  const totalPoints = evaluated.reduce((s, t) => s + (t.points || 0), 0);
  const exactCount = evaluated.filter(t => t.result === 'exact').length;
  const correctCount = evaluated.filter(t => t.result === 'correct_winner').length;
  const accuracy = evaluated.length > 0 ? Math.round(((exactCount + correctCount) / evaluated.length) * 100) : 0;

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: '1.25rem' }}>My tips</h1>

      {evaluated.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
          {[['Total points', totalPoints], ['Accuracy', `${accuracy}%`], ['Exact scores', exactCount]].map(([label, val]) => (
            <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
      {!loading && tips.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>No tips yet — head to Matches to submit your first tip!</p>
      )}

      {tips.map(tip => {
        const baseStyle = tip.evaluated ? (RESULT_STYLES[tip.result] || RESULT_STYLES.wrong) : null;
        const style = baseStyle ? {
          ...baseStyle,
          label: tip.result === 'correct_winner' && tip.points > 3 ? 'Tendency + goal bonus' : baseStyle.label,
        } : null;
        const matchLabel = tip.homeTeam && tip.awayTeam
          ? `${tip.homeTeam} vs ${tip.awayTeam}`
          : `Match #${tip.fixtureId}`;

        return (
          <div key={tip.id} style={{ background: 'var(--surface)', border: `1px solid ${style ? style.color : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: 10 }}>

            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>{matchLabel}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>My tip</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{tip.scoreHome} : {tip.scoreAway}</div>
              </div>

              {tip.evaluated && (
                <>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Result</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{tip.actualHome} : {tip.actualAway}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Points</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: style.color }}>+{tip.points}</div>
                    <div style={{ fontSize: 11, color: style.color, marginTop: 2 }}>{style.label}</div>
                  </div>
                </>
              )}

              {!tip.evaluated && (
                <div style={{ fontSize: 12, color: 'var(--text-hint)' }}>⏳ Waiting for result…</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
