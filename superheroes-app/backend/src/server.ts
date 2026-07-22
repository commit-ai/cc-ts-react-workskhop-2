import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get proper __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.TEST_PORT || process.env.PORT || 41071;

type Hero = { id: number; name: string; powerstats: Record<string, number>; [key: string]: unknown };

function loadHeroes(
  res: express.Response,
  callback: (heroes: Hero[]) => void
) {
  const dataPath = path.join(__dirname, '../data/superheroes.json');
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading superheroes data:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    let heroes: Hero[];
    try {
      heroes = JSON.parse(data);
    } catch {
      console.error('Error parsing superheroes data');
      res.status(500).send('Internal Server Error');
      return;
    }
    if (!Array.isArray(heroes)) {
      console.error('Unexpected superheroes data format');
      res.status(500).send('Internal Server Error');
      return;
    }
    try {
      callback(heroes);
    } catch (callbackErr) {
      console.error('Error processing superheroes data:', callbackErr);
      if (!res.headersSent) {
        res.status(500).send('Internal Server Error');
      }
    }
  });
}

function parseHeroId(idParam: string, res: express.Response): number | null {
  if (!/^\d+$/.test(idParam)) {
    res.status(400).json({ error: 'Invalid id - must be an integer' });
    return null;
  }
  const id = parseInt(idParam, 10);
  if (!Number.isSafeInteger(id) || id < 0) {
    res.status(400).json({ error: 'Invalid id - must be an integer' });
    return null;
  }
  return id;
}

// Root route
app.get('/', (req, res) => {
  res.send('Save the World!');
});

// API route to fetch superheroes data
app.get('/api/superheroes', (req, res) => {
  loadHeroes(res, (heroes) => res.json(heroes));
});

// API route to fetch a single superhero by id
app.get('/api/superheroes/:id', (req, res) => {
  const id = parseHeroId(req.params.id, res);
  if (id === null) return;
  loadHeroes(res, (heroes) => {
    const hero = heroes.find((h) => h.id === id);
    if (!hero) {
      res.status(404).json({ error: 'Superhero not found' });
      return;
    }
    res.json(hero);
  });
});

// API route to fetch powerstats for a single superhero by id
app.get('/api/superheroes/:id/powerstats', (req, res) => {
  const id = parseHeroId(req.params.id, res);
  if (id === null) return;
  loadHeroes(res, (heroes) => {
    const hero = heroes.find((h) => h.id === id);
    if (!hero) {
      res.status(404).json({ error: 'Superhero not found' });
      return;
    }
    res.json(hero.powerstats);
  });
});

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  }).on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });

  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export default app;