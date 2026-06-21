import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

// Get proper __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.TEST_PORT || process.env.PORT || 3000;

interface ActivityEntry {
  id: string;
  method: string;
  path: string;
  timestamp: string;
  status: number;
}

const activityLog: ActivityEntry[] = [];

// Record all requests except /activity
app.use((req, res, next) => {
  if (req.path === '/activity') {
    return next();
  }
  const entry: ActivityEntry = {
    id: randomUUID(),
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
    status: 0,
  };
  res.on('finish', () => {
    entry.status = res.statusCode;
    activityLog.push(entry);
  });
  next();
});

// Activity log endpoint
app.get('/activity', (req, res) => {
  const pathFilter = typeof req.query.path === 'string' ? req.query.path.toLowerCase() : null;
  const results = pathFilter
    ? activityLog.filter((e) => e.path.toLowerCase().includes(pathFilter))
    : activityLog;
  res.json(results);
});

// Root route
app.get('/', (req, res) => {
  res.send('Save the World!');
});

// API route to fetch superheroes data
app.get('/api/superheroes', (req, res) => {
  const dataPath = path.join(__dirname, '../data/superheroes.json');
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading superheroes data:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(JSON.parse(data));
  });
});

// API route to fetch a single superhero by id
app.get('/api/superheroes/:id', (req, res) => {
  const dataPath = path.join(__dirname, '../data/superheroes.json');
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || !Number.isInteger(id)) {
    res.status(400).json({ error: 'Invalid id - must be an integer' });
    return;
  }
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Internal Server Error');
      return;
    }
    const heroes = JSON.parse(data);
    const hero = heroes.find((h: { id: number }) => h.id === id);
    if (!hero) {
      res.status(404).json({ error: 'Superhero not found' });
      return;
    }
    res.json(hero);
  });
});

// API route to fetch powerstats for a superhero by id
app.get('/api/superheroes/:id/powerstats', (req, res) => {
  const dataPath = path.join(__dirname, '../data/superheroes.json');
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || !Number.isInteger(id)) {
    res.status(400).json({ error: 'Invalid id - must be an integer' });
    return;
  }
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Internal Server Error');
      return;
    }
    const heroes = JSON.parse(data);
    const hero = heroes.find((h: { id: number }) => h.id === id);
    if (!hero) {
      res.status(404).json({ error: 'Superhero not found' });
      return;
    }
    res.json(hero.powerstats);
  });
});

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  }).on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;