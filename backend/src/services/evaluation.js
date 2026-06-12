const { db } = require('../firebase');
const { getFixtures } = require('./football');

const POINTS_EXACT = 7;
const POINTS_TENDENCY = 4;
const POINTS_GOAL = 1; // per team with correct goal count

function getTendency(home, away) {
  if (home > away) return '1';
  if (home < away) return '2';
  return 'X';
}

function calcPoints(tipHome, tipAway, actualHome, actualAway) {
  if (tipHome === actualHome && tipAway === actualAway) {
    return { points: POINTS_EXACT, result: 'exact' };
  }
  const tendencyCorrect = getTendency(tipHome, tipAway) === getTendency(actualHome, actualAway);
  const homeGoal = tipHome === actualHome ? 1 : 0;
  const awayGoal = tipAway === actualAway ? 1 : 0;
  const diffCorrect = (tipHome - tipAway) === (actualHome - actualAway) ? 1 : 0;
  const bonus = homeGoal + awayGoal + diffCorrect;
  const points = (tendencyCorrect ? POINTS_TENDENCY : 0) + bonus;
  const result = points === 0 ? 'wrong' : tendencyCorrect ? 'correct_winner' : 'goal_bonus';
  return { points, result };
}

async function evaluateFinishedMatches() {
  const tipsSnap = await db.collection('tips').where('evaluated', '==', false).get();
  if (tipsSnap.empty) return;

  const byFixture = {};
  tipsSnap.docs.forEach(doc => {
    const tip = doc.data();
    if (!byFixture[tip.fixtureId]) byFixture[tip.fixtureId] = [];
    byFixture[tip.fixtureId].push({ id: doc.id, ...tip });
  });

  // Load all fixtures from cache (one API call max) and index by id
  const allFixtures = await getFixtures();
  const fixtureMap = {};
  allFixtures.forEach(f => { fixtureMap[f.id] = f; });

  const batch = db.batch();

  for (const fixtureId of Object.keys(byFixture)) {
    const fixture = fixtureMap[Number(fixtureId)];
    if (!fixture) continue;
    if (!['FT', 'AET', 'PEN'].includes(fixture.status)) continue;

    const actualHome = fixture.score.home;
    const actualAway = fixture.score.away;

    for (const tip of byFixture[fixtureId]) {
      const { points, result } = calcPoints(tip.scoreHome, tip.scoreAway, actualHome, actualAway);

      batch.update(db.collection('tips').doc(tip.id), {
        evaluated: true, points, result, actualHome, actualAway,
      });

      batch.set(db.collection('users').doc(tip.userId), {
        totalPoints: require('firebase-admin').firestore.FieldValue.increment(points),
        tipsEvaluated: require('firebase-admin').firestore.FieldValue.increment(1),
        ...(result === 'exact' ? { exactScores: require('firebase-admin').firestore.FieldValue.increment(1) } : {}),
        ...(result === 'correct_winner' ? { correctWinners: require('firebase-admin').firestore.FieldValue.increment(1) } : {}),
      }, { merge: true });
    }
  }

  await batch.commit();
}

module.exports = { evaluateFinishedMatches, getTendency, POINTS_EXACT, POINTS_TENDENCY, POINTS_GOAL };
