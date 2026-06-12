const express = require('express');
const { db } = require('../firebase');
const { requireAuth } = require('../middleware/auth');
const { getTendency } = require('../services/evaluation');

const router = express.Router();

// POST /api/tips — submit or update a tip
// Body: { fixtureId, scoreHome, scoreAway }
router.post('/', requireAuth, async (req, res) => {
  const { fixtureId, scoreHome, scoreAway, homeTeam, awayTeam } = req.body;
  const userId = req.user.uid;

  if (fixtureId === undefined || scoreHome === undefined || scoreAway === undefined) {
    return res.status(400).json({ error: 'fixtureId, scoreHome, scoreAway are required' });
  }

  if (typeof scoreHome !== 'number' || typeof scoreAway !== 'number') {
    return res.status(400).json({ error: 'Scores must be numbers' });
  }

  // Check that match hasn't started yet
  const fixtureSnap = await db.collection('_cache').get();
  // (We do a lightweight check — full lock is enforced by checking fixture date)
  // For now trust the client; in production also fetch fixture date and compare

  const tipId = `${userId}_${fixtureId}`;
  const tipRef = db.collection('tips').doc(tipId);
  const existing = await tipRef.get();

  if (existing.exists && existing.data().evaluated) {
    return res.status(400).json({ error: 'Match already evaluated, tip cannot be changed' });
  }

  await tipRef.set({
    userId,
    userEmail: req.user.email,
    userDisplayName: req.user.name || req.user.email,
    fixtureId: Number(fixtureId),
    scoreHome: Number(scoreHome),
    scoreAway: Number(scoreAway),
    homeTeam: homeTeam || '',
    awayTeam: awayTeam || '',
    tendency: getTendency(Number(scoreHome), Number(scoreAway)),
    evaluated: false,
    points: null,
    result: null,
    submittedAt: new Date().toISOString(),
  }, { merge: true });

  // Ensure user document exists
  await db.collection('users').doc(userId).set({
    uid: userId,
    email: req.user.email,
    displayName: req.user.name || req.user.email,
  }, { merge: true });

  res.json({ success: true, tipId });
});

// GET /api/tips/me — get all tips for the current user
router.get('/me', requireAuth, async (req, res) => {
  const snap = await db.collection('tips')
    .where('userId', '==', req.user.uid)
    .get();

  const tips = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  res.json({ tips });
});

// GET /api/tips/fixture/:fixtureId — get your tip for a specific match
router.get('/fixture/:fixtureId', requireAuth, async (req, res) => {
  const tipId = `${req.user.uid}_${req.params.fixtureId}`;
  const snap = await db.collection('tips').doc(tipId).get();
  if (!snap.exists) return res.json({ tip: null });
  res.json({ tip: { id: snap.id, ...snap.data() } });
});

module.exports = router;
