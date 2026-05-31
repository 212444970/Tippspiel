const express = require('express');
const { db } = require('../firebase');

const router = express.Router();

// GET /api/leaderboard
router.get('/', async (req, res) => {
  try {
    const usersSnap = await db.collection('users').get();
    const users = usersSnap.docs.map(doc => {
      const d = doc.data();
      const tipsEvaluated = d.tipsEvaluated || 0;
      const exactScores = d.exactScores || 0;
      const correctWinners = d.correctWinners || 0;
      const totalPoints = d.totalPoints || 0;
      const accuracy = tipsEvaluated > 0
        ? Math.round(((exactScores + correctWinners) / tipsEvaluated) * 100)
        : 0;

      return {
        uid: doc.id,
        displayName: d.displayName || d.email,
        totalPoints,
        tipsEvaluated,
        exactScores,
        correctWinners,
        accuracy,
      };
    });

    // Sort by points desc, then accuracy desc
    users.sort((a, b) => b.totalPoints - a.totalPoints || b.accuracy - a.accuracy);

    // Add rank
    users.forEach((u, i) => { u.rank = i + 1; });

    res.json({ leaderboard: users });
  } catch (err) {
    console.error('Leaderboard error:', err.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
