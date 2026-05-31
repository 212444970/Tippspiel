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

  getTipForFixture: (fixtureId) => apiFetch(`/api/tips/fixture/${fixtureId}`),

  submitTip: (fixtureId, scoreHome, scoreAway) =>
    apiFetch('/api/tips', {
      method: 'POST',
      body: JSON.stringify({ fixtureId, scoreHome, scoreAway }),
    }),

  getLeaderboard: () => apiFetch('/api/leaderboard'),
};
