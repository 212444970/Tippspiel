import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const RESULT_STYLES = {
  exact:          { label: 'Exact score',     pts: '+4 pts', color: 'var(--success)',    bg: 'var(--success-bg)' },
  correct_winner: { label: 'Correct winner',  pts: '+2 pts', color: 'var(--accent)',     bg: 'var(--accent-bg)' },
  wrong:          { label: 'Wrong',           pts: '+0 pts', color: 'var(--text-muted)', bg: 'var(--border)' },
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
        const style = tip.evaluated ? RESULT_STYLES[tip.result] || RESULT_STYLES.wrong : null;
        return (
          <div key={tip.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: tip.evaluated ? 10 : 0 }}>
              <div style={{ flex: 1, fontSize: 14 }}>
                <span style={{ fontWeight: 500 }}>Match #{tip.fixtureId}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>
                  {new Date(tip.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {tip.scoreHome} : {tip.scoreAway}
              </div>
            </div>

            {tip.evaluated && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Result: <strong>{tip.actualHome} : {tip.actualAway}</strong>
                </span>
                <span style={{ fontSize: 12, fontWeight: 500, color: style.color }}>{style.label}</span>
                <span style={{ fontSize: 13, fontWeight: 500, padding: '4px 10px', borderRadius: 4, background: style.bg, color: style.color }}>{style.pts}</span>
              </div>
            )}

            {!tip.evaluated && (
              <div style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 4 }}>⏳ Waiting for result…</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
