const express = require('express');
const { db } = require('../firebase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const DEADLINE = new Date('2026-06-18T00:00:00Z');

// GET /api/tournament/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const doc = await db.collection('tournamentTips').doc(req.user.uid).get();
    res.json({ tip: doc.exists ? doc.data() : null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tournament tip' });
  }
});

// POST /api/tournament
router.post('/', requireAuth, async (req, res) => {
  if (new Date() > DEADLINE) {
    return res.status(403).json({ error: 'Deadline has passed' });
  }
  const { pick1, pick2, pick3 } = req.body;
  if (!pick1 || !pick2 || !pick3) {
    return res.status(400).json({ error: 'All 3 picks are required' });
  }
  if (new Set([pick1, pick2, pick3]).size !== 3) {
    return res.status(400).json({ error: 'All picks must be different teams' });
  }
  try {
    await db.collection('tournamentTips').doc(req.user.uid).set({
      userId: req.user.uid,
      pick1, pick2, pick3,
      submittedAt: Date.now(),
      evaluated: false,
      points: 0,
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save tournament tip' });
  }
});

// POST /api/tournament/evaluate — set actual results and award points
// Body: { first: "Team A", second: "Team B", third: "Team C" }
router.post('/evaluate', async (req, res) => {
  const { first, second, third } = req.body;
  if (!first || !second || !third) {
    return res.status(400).json({ error: 'first, second, third required' });
  }

  const rankOf = (team) => {
    if (team === first) return 1;
    if (team === second) return 2;
    if (team === third) return 3;
    return null;
  };

  const basePoints = { 1: 20, 2: 12, 3: 8 };

  function calcPoints(pick, pickedRank) {
    const actual = rankOf(pick);
    if (!actual) return 0;
    let pts = basePoints[actual];
    if (actual === pickedRank) pts += 10;
    return pts;
  }

  try {
    const snap = await db.collection('tournamentTips').where('evaluated', '==', false).get();
    const batch = db.batch();

    snap.docs.forEach(doc => {
      const { pick1, pick2, pick3, userId } = doc.data();
      const pts1 = calcPoints(pick1, 1);
      const pts2 = calcPoints(pick2, 2);
      const pts3 = calcPoints(pick3, 3);
      const total = pts1 + pts2 + pts3;

      batch.update(doc.ref, { evaluated: true, points: total, pts1, pts2, pts3 });

      const userRef = db.collection('users').doc(userId);
      batch.set(userRef, {
        totalPoints: require('firebase-admin').firestore.FieldValue.increment(total),
        tournamentPoints: require('firebase-admin').firestore.FieldValue.increment(total),
      }, { merge: true });
    });

    await batch.commit();
    res.json({ ok: true, evaluated: snap.size });
  } catch (err) {
    res.status(500).json({ error: 'Evaluation failed' });
  }
});

module.exports = router;
