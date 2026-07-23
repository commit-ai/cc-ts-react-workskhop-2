import express from 'express';
import heroesRouter from './routes/heroes.router.js';

const app = express();

app.get('/', (req, res) => {
  res.send('Save the World!');
});

app.use('/api/superheroes', heroesRouter);

export default app;
