const express = require('express');
const { evaluateFinishedMatches } = require('../services/evaluation');
const { getFixtures } = require('../services/football');
const { db } = require('../firebase');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    await evaluateFinishedMatches();
    res.json({ success: true, message: 'Evaluation complete' });
  } catch (err) {
    console.error('Evaluate error:', err.message);
    res.status(500).json({ error: 'Evaluation failed' });
  }
});

// POST /api/evaluate/reset — reset all evaluated tips and user points, then re-evaluate
router.post('/reset', async (req, res) => {
  try {
    const tipsSnap = await db.collection('tips').where('evaluated', '==', true).get();
    const usersSnap = await db.collection('users').get();

    const batch = db.batch();

    // Reset all evaluated tips
    tipsSnap.docs.forEach(doc => {
      batch.update(doc.ref, { evaluated: false, points: null, result: null, actualHome: null, actualAway: null });
    });

    // Reset all user points
    usersSnap.docs.forEach(doc => {
      batch.update(doc.ref, { totalPoints: 0, tipsEvaluated: 0, exactScores: 0, correctWinners: 0 });
    });

    await batch.commit();
    await evaluateFinishedMatches();
    res.json({ success: true, reset: tipsSnap.size });
  } catch (err) {
    console.error('Reset error:', err.message);
    res.status(500).json({ error: 'Reset failed' });
  }
});

// GET /api/evaluate/debug-fixture/:id — see raw score fields for a fixture
router.get('/debug-fixture/:id', async (req, res) => {
  try {
    const axios = require('axios');
    const result = await axios.get(`https://api.football-data.org/v4/matches/${req.params.id}`, {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_KEY },
    });
    const m = result.data;
    res.json({ status: m.status, score: m.score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/evaluate/backfill-teams — fill missing homeTeam/awayTeam on existing tips
router.post('/backfill-teams', async (req, res) => {
  try {
    const allFixtures = await getFixtures();
    const fixtureMap = {};
    allFixtures.forEach(f => { fixtureMap[f.id] = f; });

    const snap = await db.collection('tips').get();
    const batch = db.batch();
    let count = 0;

    snap.docs.forEach(doc => {
      const tip = doc.data();
      if (tip.homeTeam && tip.awayTeam) return;
      const fixture = fixtureMap[Number(tip.fixtureId)];
      if (!fixture) return;
      batch.update(doc.ref, { homeTeam: fixture.homeTeam.name, awayTeam: fixture.awayTeam.name });
      count++;
    });

    await batch.commit();
    res.json({ success: true, updated: count });
  } catch (err) {
    console.error('Backfill error:', err.message);
    res.status(500).json({ error: 'Backfill failed' });
  }
});

module.exports = router;
