import { useState } from 'react';
import { api } from '../lib/api';

const FLAG_MAP = {
  'Mexico': '🇲🇽', 'South Africa': '🇿🇦', 'USA': '🇺🇸', 'United States': '🇺🇸',
  'Paraguay': '🇵🇾', 'Canada': '🇨🇦', 'Bosnia and Herzegovina': '🇧🇦',
  'Qatar': '🇶🇦', 'Germany': '🇩🇪', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Japan': '🇯🇵',
  'Czechia': '🇨🇿', 'Czech Republic': '🇨🇿', 'Australia': '🇦🇺',
  'Brazil': '🇧🇷', 'Argentina': '🇦🇷', 'France': '🇫🇷', 'Spain': '🇪🇸',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Portugal': '🇵🇹', 'Netherlands': '🇳🇱',
  'Italy': '🇮🇹', 'Belgium': '🇧🇪', 'Croatia': '🇭🇷', 'Switzerland': '🇨🇭',
  'Uruguay': '🇺🇾', 'Colombia': '🇨🇴', 'Morocco': '🇲🇦', 'Senegal': '🇸🇳',
  'South Korea': '🇰🇷', 'Iran': '🇮🇷', 'Serbia': '🇷🇸', 'Ecuador': '🇪🇨',
  'Ghana': '🇬🇭', 'Cameroon': '🇨🇲', 'Tunisia': '🇹🇳', 'Poland': '🇵🇱',
  'Denmark': '🇩🇰', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Costa Rica': '🇨🇷', 'Turkey': '🇹🇷',
  'Türkiye': '🇹🇷', 'Saudi Arabia': '🇸🇦', 'Japan': '🇯🇵',
};

function flag(name) {
  return FLAG_MAP[name] || '🏳️';
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function isLocked(dateIso) {
  return new Date(dateIso) <= new Date();
}

export default function MatchCard({ match, existingTip, onTipSaved }) {
  const locked = isLocked(match.date);
  const finished = ['FT', 'AET', 'PEN'].includes(match.status);

  const [home, setHome] = useState(existingTip?.scoreHome ?? 1);
  const [away, setAway] = useState(existingTip?.scoreAway ?? 1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!existingTip);
  const [error, setError] = useState('');

  function tendency() {
    if (home > away) return '1';
    if (home < away) return '2';
    return 'X';
  }

  async function handleSubmit() {
    setSaving(true);
    setError('');
    try {
      await api.submitTip(match.id, Number(home), Number(away));
      setSaved(true);
      onTipSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const resultBadge = () => {
    if (!existingTip?.evaluated) return null;
    const map = { exact: ['Exact score', 'var(--success)', 'var(--success-bg)'], correct_winner: ['Correct winner', 'var(--accent)', 'var(--accent-bg)'], wrong: ['Wrong', 'var(--text-muted)', 'var(--border)'] };
    const [label, color, bg] = map[existingTip.result] || map.wrong;
    return <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 4, background: bg, color }}>{label} · {existingTip.points} pts</span>;
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--accent-text)', background: 'var(--accent-bg)', padding: '3px 8px', borderRadius: 4 }}>{match.round}</span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(match.date)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>{match.venue}, {match.city}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 26 }}>{flag(match.homeTeam.name)}</div>
          <div style={{ fontSize: 14, fontWeight: 500, marginTop: 3 }}>{match.homeTeam.name}</div>
        </div>

        {finished ? (
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '6px 16px', fontSize: 20, fontWeight: 600, minWidth: 72, textAlign: 'center' }}>
            {match.score.home} : {match.score.away}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text-hint)', fontWeight: 500 }}>vs</div>
        )}

        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 26 }}>{flag(match.awayTeam.name)}</div>
          <div style={{ fontSize: 14, fontWeight: 500, marginTop: 3 }}>{match.awayTeam.name}</div>
        </div>
      </div>

      {resultBadge() && <div style={{ marginBottom: 10 }}>{resultBadge()}</div>}

      {!finished && !locked && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {['1', 'X', '2'].map(t => (
              <button key={t} onClick={() => {
                if (t === '1' && !(home > away)) setHome(h => Math.max(0, Number(h) + 1 - (home === away ? 1 : 0)));
                if (t === 'X' && home !== away) { const v = Math.min(home, away); setHome(v); setAway(v); }
                if (t === '2' && !(away > home)) setAway(a => Math.max(0, Number(a) + 1 - (home === away ? 1 : 0)));
              }} style={{
                flex: 1, padding: '7px 0', fontSize: 13,
                border: `1px solid ${tendency() === t ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                background: tendency() === t ? 'var(--accent-bg)' : 'transparent',
                color: tendency() === t ? 'var(--accent-text)' : 'var(--text-muted)',
                fontWeight: tendency() === t ? 500 : 400,
              }}>
                {t === '1' ? `1 ${match.homeTeam.name.split(' ')[0]}` : t === '2' ? `2 ${match.awayTeam.name.split(' ')[0]}` : 'X Draw'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
            <input type="number" min="0" max="20" value={home} onChange={e => setHome(Number(e.target.value))}
              style={{ width: 52, textAlign: 'center', fontSize: 20, fontWeight: 600, padding: '5px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)', color: 'var(--text)' }} />
            <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>:</span>
            <input type="number" min="0" max="20" value={away} onChange={e => setAway(Number(e.target.value))}
              style={{ width: 52, textAlign: 'center', fontSize: 20, fontWeight: 600, padding: '5px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)', color: 'var(--text)' }} />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 8 }}>{error}</p>}

          <button onClick={handleSubmit} disabled={saving} style={{
            width: '100%', padding: '8px', fontSize: 14, fontWeight: 500,
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            background: saved ? 'var(--success-bg)' : 'transparent',
            color: saved ? 'var(--success)' : 'var(--text)',
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving…' : saved ? '✓ Tip saved — update' : 'Save tip'}
          </button>
        </>
      )}

      {locked && !finished && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }}>
          🔒 Tipping locked — match in progress
          {existingTip && <span style={{ marginLeft: 8, color: 'var(--text-hint)' }}>Your tip: {existingTip.scoreHome}:{existingTip.scoreAway}</span>}
        </div>
      )}
    </div>
  );
}
