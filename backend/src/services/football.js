const axios = require('axios');
const { db } = require('../firebase');

const API_KEY = process.env.API_FOOTBALL_KEY;
const LEAGUE = process.env.API_FOOTBALL_WC_LEAGUE || '1';
const SEASON = process.env.API_FOOTBALL_WC_SEASON || '2026';
const BASE_URL = 'https://v3.football.api-sports.io';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'x-apisports-key': API_KEY },
});

// Fetch fixtures from API-Football and cache in Firestore for 30 min
async function getFixtures({ round } = {}) {
  const cacheKey = `fixtures_${round || 'all'}`;
  const cacheRef = db.collection('_cache').doc(cacheKey);
  const cached = await cacheRef.get();

  if (cached.exists) {
    const data = cached.data();
    const age = Date.now() - data.fetchedAt;
    if (age < 30 * 60 * 1000) {
      return data.fixtures;
    }
  }

  const params = { league: LEAGUE, season: SEASON };
  if (round) params.round = round;

  const res = await client.get('/fixtures', { params });
  const fixtures = res.data.response.map(mapFixture);

  await cacheRef.set({ fixtures, fetchedAt: Date.now() });
  return fixtures;
}

// Fetch a single fixture by ID (live score)
async function getFixtureById(fixtureId) {
  const res = await client.get('/fixtures', { params: { id: fixtureId } });
  if (!res.data.response.length) return null;
  return mapFixture(res.data.response[0]);
}

// Get all available rounds
async function getRounds() {
  const res = await client.get('/fixtures/rounds', {
    params: { league: LEAGUE, season: SEASON },
  });
  return res.data.response;
}

function mapFixture(f) {
  return {
    id: f.fixture.id,
    date: f.fixture.date,
    status: f.fixture.status.short, // NS, 1H, HT, 2H, FT, AET, PEN
    round: f.league.round,
    venue: f.fixture.venue.name,
    city: f.fixture.venue.city,
    homeTeam: {
      id: f.teams.home.id,
      name: f.teams.home.name,
      logo: f.teams.home.logo,
    },
    awayTeam: {
      id: f.teams.away.id,
      name: f.teams.away.name,
      logo: f.teams.away.logo,
    },
    score: {
      home: f.goals.home,
      away: f.goals.away,
    },
  };
}

module.exports = { getFixtures, getFixtureById, getRounds };
