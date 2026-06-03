const axios = require('axios');
const { db } = require('../firebase');

const API_KEY = process.env.FOOTBALL_DATA_KEY;
const COMPETITION = process.env.FOOTBALL_DATA_COMPETITION || 'WC';
const BASE_URL = 'https://api.football-data.org/v4';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'X-Auth-Token': API_KEY },
});

function statusMap(status) {
  switch (status) {
    case 'FINISHED': return 'FT';
    case 'IN_PLAY': return '1H';
    case 'PAUSED': return 'HT';
    case 'EXTRA_TIME': return 'AET';
    case 'PENALTY_SHOOTOUT': return 'PEN';
    default: return 'NS';
  }
}

function getRoundLabel(match) {
  if (match.matchday) return `Matchday ${match.matchday}`;
  return match.stage || 'Unknown';
}

function mapMatch(m) {
  return {
    id: m.id,
    date: m.utcDate,
    status: statusMap(m.status),
    round: getRoundLabel(m),
    venue: m.venue || '',
    city: '',
    homeTeam: {
      id: m.homeTeam.id,
      name: m.homeTeam.name,
      logo: m.homeTeam.crest,
    },
    awayTeam: {
      id: m.awayTeam.id,
      name: m.awayTeam.name,
      logo: m.awayTeam.crest,
    },
    score: {
      home: m.score.fullTime.home,
      away: m.score.fullTime.away,
    },
  };
}

async function getAllFixtures() {
  const cacheRef = db.collection('_cache').doc('fixtures_all');
  const cached = await cacheRef.get();

  if (cached.exists) {
    const data = cached.data();
    if (Date.now() - data.fetchedAt < 30 * 60 * 1000) return data.fixtures;
  }

  const res = await client.get(`/competitions/${COMPETITION}/matches`);
  const fixtures = res.data.matches.map(mapMatch);
  await cacheRef.set({ fixtures, fetchedAt: Date.now() });
  return fixtures;
}

async function getFixtures({ round } = {}) {
  const fixtures = await getAllFixtures();
  if (!round) return fixtures;
  return fixtures.filter(f => f.round === round);
}

async function getFixtureById(fixtureId) {
  const res = await client.get(`/matches/${fixtureId}`);
  if (!res.data) return null;
  return mapMatch(res.data);
}

async function getRounds() {
  const fixtures = await getAllFixtures();
  const seen = new Set();
  return fixtures.map(f => f.round).filter(r => {
    if (seen.has(r)) return false;
    seen.add(r);
    return true;
  });
}

module.exports = { getFixtures, getFixtureById, getRounds };
