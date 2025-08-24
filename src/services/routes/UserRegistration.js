// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  ensureUser,
  addPreference,
  setPreferences,
  getPreferences,
} = require('../api/UserRegistration.js');

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { googleId, sport, league } = req.body;
    if (!googleId || !sport || !league) {
      return res.status(400).json({ error: 'googleId, sport and league are required' });
    }

    await ensureUser(googleId);
    await addPreference(googleId, sport, league);

    const prefs = await getPreferences(googleId);
    res.status(201).json({ googleId, preferences: prefs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// PUT /api/users/:googleId/preferences
router.put('/users/:googleId/preferences', async (req, res) => {
  try {
    const { googleId } = req.params;
    const { preferences } = req.body;

    if (!Array.isArray(preferences)) {
      return res.status(400).json({ error: 'preferences must be an array' });
    }

    await ensureUser(googleId);
    await setPreferences(googleId, preferences);

    const prefs = await getPreferences(googleId);
    res.json({ googleId, preferences: prefs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// GET /api/users/:googleId/preferences
router.get('/users/:googleId/preferences', async (req, res) => {
  try {
    const { googleId } = req.params;
    const prefs = await getPreferences(googleId);
    res.json({ googleId, preferences: prefs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
