import { Router } from 'express';
import { saveFullMissile, getFullMissile } from '../controllers/fullMissileController';

const router = Router();

router.post('/save', saveFullMissile);
router.get('/:id', getFullMissile);

export default router;
