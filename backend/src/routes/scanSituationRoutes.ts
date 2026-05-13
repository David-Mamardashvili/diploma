import { Router } from 'express';
import { scanSituationController } from '../controllers/scanSituationController';

const router = Router();

router.post('/scan-situation', scanSituationController);

export default router;