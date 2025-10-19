import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// __dirname replacement for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Allow cross-origin requests (useful during development or when client is served from a different origin)
app.use(cors());
app.use(express.json());

app.post('/api/save-data', async (req, res) => {
  const { type, data } = req.body;

  const fileMap = {
    fixtures: 'leagueFixtures.json',
    odds: 'leagueOdds.json',
    standings: 'leagueStandings.json',
  };

  if (!fileMap[type]) return res.status(400).json({ error: 'Invalid type' });

  try {
    const dir = path.join(__dirname, '../public/store');
    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, fileMap[type]);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    res.status(200).json({ message: `Saved ${type}`, ok: true });
  } catch (error) {
    console.error(`Error saving ${type}:`, error);
    res.status(500).json({ error: 'Save failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  // Server started successfully
});
