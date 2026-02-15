import { Router } from 'express';
import { getAllMissiles, getMissileById, createMissile, updateMissile, deleteMissile } from '../controllers/missileController';
import { saveFullMissile, getFullMissile } from '../controllers/fullMissileController';

const router = Router();

router.get('/', getAllMissiles);
router.get('/:id', getMissileById);
router.post('/', createMissile);
router.put('/:id', updateMissile);
router.delete('/:id', deleteMissile);

// Unified Persistence Endpoints (Moved to fullMissileRoutes)
router.post('/full', saveFullMissile);
router.get('/:id/full', getFullMissile);

export default router;
