import { Router } from 'express';
import { addScore, getTopScores } from '../config/database.js';

const router = Router();

// Get Top Scores for a Game
router.get('/:gameId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '10', 10);
    const scores = await getTopScores(req.params.gameId, limit);
    res.json({ success: true, gameId: req.params.gameId, scores });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Submit a new high score
router.post('/', async (req, res) => {
  try {
    const { gameId, playerName, score } = req.body;

    if (!gameId || score === undefined) {
      return res.status(400).json({ success: false, error: 'gameId and score are required' });
    }

    const saved = await addScore(gameId, playerName || 'Anonymous', score);

    // If global broadcast function is attached to app, notify connected clients
    const wss = req.app.get('wss');
    if (wss) {
      const broadcastMsg = JSON.stringify({
        type: 'NEW_HIGH_SCORE',
        payload: {
          gameId,
          playerName: playerName || 'Anonymous',
          score: parseInt(score, 10),
          createdAt: new Date().toISOString()
        }
      });
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(broadcastMsg);
        }
      });
    }

    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
