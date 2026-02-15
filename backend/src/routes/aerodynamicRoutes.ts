import { Router } from 'express';
import { getAerodynamicsByMissileId, createAerodynamicProfile, deleteAerodynamicsByMissileId } from '../controllers/aerodynamicController';

const router = Router();

router.get('/:missileId', getAerodynamicsByMissileId);
router.post('/', createAerodynamicProfile);
router.delete('/:missileId', deleteAerodynamicsByMissileId);

export default router;
