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
