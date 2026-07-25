import express from 'express';
import heroesRouter from './routes/heroes.router.js';
import activityRouter from './routes/activity.router.js';
import { record } from './services/activityLog.js';

const app = express();

app.use((req, _res, next) => {
  if (req.path.startsWith('/api/') && req.path !== '/api/activity') {
    record({ path: req.path, method: req.method, timestamp: new Date().toISOString() });
  }
  next();
});

app.get('/', (req, res) => {
  res.send('Save the World!');
});

app.use('/api/superheroes', heroesRouter);
app.use('/api/activity', activityRouter);

export default app;
