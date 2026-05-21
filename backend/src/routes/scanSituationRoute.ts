import { Router } from 'express';
import multer from 'multer';
import { scanSituationController } from '../controllers/scanSituationController';

const router = Router();

router.post( 
    '/scan-situation',
    multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }).array('files', 3),
    scanSituationController,
  );

export default router;