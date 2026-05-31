const express = require('express');
const { getFixtures, getRounds } = require('../services/football');

const router = express.Router();

// GET /api/matches?round=Group+Stage+-+1
router.get('/', async (req, res) => {
  try {
    const { round } = req.query;
    const fixtures = await getFixtures({ round });
    res.json({ fixtures });
  } catch (err) {
    console.error('Error fetching matches:', err.message);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// GET /api/matches/rounds
router.get('/rounds', async (req, res) => {
  try {
    const rounds = await getRounds();
    res.json({ rounds });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rounds' });
  }
});

module.exports = router;
