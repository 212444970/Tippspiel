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

const BASE_PTS = { 1: 20, 2: 12, 3: 8 };

function tournamentPickLabel(pick, pts, rank) {
  if (pts === 0) return { label: 'Miss', color: 'var(--text-muted)' };
  const base = BASE_PTS[rank];
  const hasRankBonus = pts === base + 10;
  if (hasRankBonus) return { label: `✓ Exact rank (+10)`, color: 'var(--success)' };
  return { label: '✓ In top 3', color: 'var(--accent)' };
}

export default function AllTipsPage() {
  const [matches, setMatches] = useState([]);
  const [tournamentTips, setTournamentTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('matches');

  useEffect(() => {
    Promise.all([api.getAllTips(), api.getAllTournamentTips()])
      .then(([{ matches }, { tips }]) => {
        setMatches(matches);
        setTournamentTips(tips);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>;

  const evaluated = tournamentTips.some(t => t.evaluated);

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: '1rem' }}>All Tips</h1>

      <div style={{ display: 'flex', gap: 4, marginBottom: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        {['matches', 'tournament'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px', border: 'none', cursor: 'pointer',
            background: tab === t ? 'var(--accent)' : 'transparent',
            color: tab === t ? '#fff' : 'var(--text-muted)',
            fontWeight: 500, fontSize: 14,
          }}>
            {t === 'matches' ? '⚽ Matches' : '🌍 Tournament'}
          </button>
        ))}
      </div>

      {tab === 'matches' && (
        matches.length === 0
          ? <p style={{ color: 'var(--text-muted)' }}>No evaluated matches yet.</p>
          : matches.map(match => (
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
          ))
      )}

      {tab === 'tournament' && (
        tournamentTips.length === 0
          ? <p style={{ color: 'var(--text-muted)' }}>No tournament picks yet.</p>
          : (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {evaluated && (
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-muted)' }}>
                  🥇 Spain · 🥈 Argentina · 🥉 England
                </div>
              )}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '6px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>Player</th>
                    <th style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>🥇</th>
                    <th style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>🥈</th>
                    <th style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>🥉</th>
                    {evaluated && <th style={{ padding: '6px 14px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 500 }}>Pts</th>}
                  </tr>
                </thead>
                <tbody>
                  {tournamentTips.map((tip, i) => (
                    <tr key={i} style={{ borderBottom: i < tournamentTips.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '8px 14px', fontWeight: 500 }}>{tip.displayName}</td>
                      {[{ pick: tip.pick1, pts: tip.pts1, rank: 1 }, { pick: tip.pick2, pts: tip.pts2, rank: 2 }, { pick: tip.pick3, pts: tip.pts3, rank: 3 }].map(({ pick, pts, rank }) => {
                        const { label, color } = evaluated ? tournamentPickLabel(pick, pts, rank) : { label: '', color: 'var(--text)' };
                        return (
                          <td key={rank} style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <div style={{ color: evaluated ? color : 'var(--text)' }}>{pick}</div>
                            {evaluated && <div style={{ fontSize: 11, color }}>{label} +{pts}</div>}
                          </td>
                        );
                      })}
                      {evaluated && (
                        <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 700, color: tip.points > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                          +{tip.points}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      )}
    </div>
  );
}
