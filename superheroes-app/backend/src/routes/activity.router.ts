import { Router } from 'express';
import { getLog } from '../services/activityLog.js';

const router = Router();

router.get('/', (req, res) => {
  const pathFilter = typeof req.query.path === 'string' ? req.query.path : undefined;
  res.json(getLog(pathFilter));
});

export default router;
