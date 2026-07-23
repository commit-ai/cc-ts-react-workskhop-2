import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type Hero = { id: number; name: string; powerstats: Record<string, number>; [key: string]: unknown };

export function loadHeroes(
  res: express.Response,
  callback: (heroes: Hero[]) => void
) {
  const dataPath = path.join(__dirname, '../../data/superheroes.json');
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

export function parseHeroId(idParam: string, res: express.Response): number | null {
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
