import { Router } from 'express';
import { getWeightAndSizeByMissileId, createWeightAndSizeEntry, deleteWeightAndSizeByMissileId } from '../controllers/weightAndSizeController';

const router = Router();

router.get('/:missileId', getWeightAndSizeByMissileId);
router.post('/', createWeightAndSizeEntry);
router.delete('/:missileId', deleteWeightAndSizeByMissileId);

export default router;
