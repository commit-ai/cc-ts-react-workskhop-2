import { Router } from 'express';
import { loadHeroes, parseHeroId } from '../services/heroes.service.js';

const router = Router();

router.get('/', (req, res) => {
  loadHeroes(res, (heroes) => res.json(heroes));
});

router.get('/search', (req, res) => {
  const query = req.query.name;
  if (typeof query !== 'string') {
    res.status(400).json({ error: 'Missing required query parameter: name' });
    return;
  }
  const lower = query.toLowerCase();
  loadHeroes(res, (heroes) => {
    res.json(heroes.filter((h) => h.name.toLowerCase().includes(lower)));
  });
});

router.get('/:id', (req, res) => {
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

router.get('/:id/powerstats', (req, res) => {
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

export default router;
