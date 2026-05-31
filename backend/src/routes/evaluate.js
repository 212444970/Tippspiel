const express = require('express');
const { evaluateFinishedMatches } = require('../services/evaluation');

const router = express.Router();

// POST /api/evaluate — manually trigger evaluation (useful for testing)
// In production this is called by the cron job automatically
router.post('/', async (req, res) => {
  try {
    await evaluateFinishedMatches();
    res.json({ success: true, message: 'Evaluation complete' });
  } catch (err) {
    console.error('Evaluate error:', err.message);
    res.status(500).json({ error: 'Evaluation failed' });
  }
});

module.exports = router;
