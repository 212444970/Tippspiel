const express = require('express');
const { db } = require('../firebase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/display-name', requireAuth, async (req, res) => {
  const { displayName } = req.body;
  if (!displayName || !displayName.trim()) {
    return res.status(400).json({ error: 'Display name is required' });
  }
  if (displayName.trim().length > 30) {
    return res.status(400).json({ error: 'Display name must be 30 characters or less' });
  }
  try {
    await db.collection('users').doc(req.user.uid).set(
      { displayName: displayName.trim() },
      { merge: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update display name' });
  }
});

module.exports = router;
