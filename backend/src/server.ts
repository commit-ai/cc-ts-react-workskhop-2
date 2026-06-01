import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get proper __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.TEST_PORT || process.env.PORT || 3000;

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
    const superheroes = JSON.parse(data);
    const sortBy = String(req.query.sortBy || 'name');
    const order = String(req.query.order || 'asc');

    const sortedSuperheroes = [...superheroes].sort((leftHero, rightHero) => {
      if (sortBy === 'name') {
        if (order === 'desc') {
          return rightHero.name.localeCompare(leftHero.name);
        }

        return leftHero.name.localeCompare(rightHero.name);
      }

      const leftValue = leftHero.powerstats[sortBy];
      const rightValue = rightHero.powerstats[sortBy];

      if (order === 'desc') {
        return rightValue - leftValue;
      }

      return leftValue - rightValue;
    });

    res.json(sortedSuperheroes);
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