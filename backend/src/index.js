require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const matchesRouter = require('./routes/matches');
const tipsRouter = require('./routes/tips');
const leaderboardRouter = require('./routes/leaderboard');
const evaluateRouter = require('./routes/evaluate');
const tournamentRouter = require('./routes/tournament');
const profileRouter = require('./routes/profile');
const { evaluateFinishedMatches } = require('./services/evaluation');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/matches', matchesRouter);
app.use('/api/tips', tipsRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/evaluate', evaluateRouter);
app.use('/api/tournament', tournamentRouter);
app.use('/api/profile', profileRouter);

// Auto-evaluate finished matches every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  console.log('[cron] Running evaluation of finished matches...');
  try {
    await evaluateFinishedMatches();
    console.log('[cron] Evaluation done');
  } catch (err) {
    console.error('[cron] Evaluation error:', err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Tippspiel backend running on port ${PORT}`);
});
