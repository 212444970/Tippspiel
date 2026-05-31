const { db } = require('../firebase');
const { getFixtureById } = require('./football');

// Points system
const POINTS_EXACT = 4;   // exact score
const POINTS_WINNER = 2;  // correct tendency (1/X/2)
const POINTS_WRONG = 0;

function getTendency(home, away) {
  if (home > away) return '1';
  if (home < away) return '2';
  return 'X';
}

// Evaluate all unevaluated tips for finished matches
async function evaluateFinishedMatches() {
  // Get tips that are submitted but not yet evaluated
  const tipsSnap = await db.collection('tips')
    .where('evaluated', '==', false)
    .get();

  if (tipsSnap.empty) return;

  // Group tips by fixtureId
  const byFixture = {};
  tipsSnap.docs.forEach(doc => {
    const tip = doc.data();
    if (!byFixture[tip.fixtureId]) byFixture[tip.fixtureId] = [];
    byFixture[tip.fixtureId].push({ id: doc.id, ...tip });
  });

  const batch = db.batch();

  for (const fixtureId of Object.keys(byFixture)) {
    const fixture = await getFixtureById(fixtureId);
    if (!fixture) continue;

    // Only evaluate finished matches
    const finishedStatuses = ['FT', 'AET', 'PEN'];
    if (!finishedStatuses.includes(fixture.status)) continue;

    const actualHome = fixture.score.home;
    const actualAway = fixture.score.away;
    const actualTendency = getTendency(actualHome, actualAway);

    for (const tip of byFixture[fixtureId]) {
      let points = POINTS_WRONG;
      let result = 'wrong';

      if (tip.scoreHome === actualHome && tip.scoreAway === actualAway) {
        points = POINTS_EXACT;
        result = 'exact';
      } else if (getTendency(tip.scoreHome, tip.scoreAway) === actualTendency) {
        points = POINTS_WINNER;
        result = 'correct_winner';
      }

      const tipRef = db.collection('tips').doc(tip.id);
      batch.update(tipRef, {
        evaluated: true,
        points,
        result,
        actualHome,
        actualAway,
      });

      // Update user total points
      const userRef = db.collection('users').doc(tip.userId);
      batch.set(userRef, {
        totalPoints: require('firebase-admin').firestore.FieldValue.increment(points),
        tipsEvaluated: require('firebase-admin').firestore.FieldValue.increment(1),
        ...(result === 'exact' ? { exactScores: require('firebase-admin').firestore.FieldValue.increment(1) } : {}),
        ...(result === 'correct_winner' ? { correctWinners: require('firebase-admin').firestore.FieldValue.increment(1) } : {}),
      }, { merge: true });
    }
  }

  await batch.commit();
}

module.exports = { evaluateFinishedMatches, getTendency, POINTS_EXACT, POINTS_WINNER };
