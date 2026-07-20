import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || '';

async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

async function apiFetch(path, options = {}) {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  getMatches: (round) =>
    apiFetch(`/api/matches${round ? `?round=${encodeURIComponent(round)}` : ''}`),

  getRounds: () => apiFetch('/api/matches/rounds'),

  getMyTips: () => apiFetch('/api/tips/me'),
  getAllTips: () => apiFetch('/api/tips/all'),

  getTipForFixture: (fixtureId) => apiFetch(`/api/tips/fixture/${fixtureId}`),

  submitTip: (fixtureId, scoreHome, scoreAway, homeTeam, awayTeam) =>
    apiFetch('/api/tips', {
      method: 'POST',
      body: JSON.stringify({ fixtureId, scoreHome, scoreAway, homeTeam, awayTeam }),
    }),

  getLeaderboard: () => apiFetch('/api/leaderboard'),

  updateDisplayName: (displayName) =>
    apiFetch('/api/profile/display-name', { method: 'POST', body: JSON.stringify({ displayName }) }),

  getAllTournamentTips: () => apiFetch('/api/tournament/all'),
  getTournamentTip: () => apiFetch('/api/tournament/me'),
  submitTournamentTip: (pick1, pick2, pick3) =>
    apiFetch('/api/tournament', { method: 'POST', body: JSON.stringify({ pick1, pick2, pick3 }) }),
};
