import type { Request, Response } from 'express';
import 'multer';
import { ScanSituationTextRequestSchema } from '../schemas/scanSituationSchema';
import { scanSituationService } from '../services/scanSituationService';

export async function scanSituationController(
  req: Request,
  res: Response,
) {
  try {
    const {
      question1,
      question2,
      question3,
      question4,
      message,
    } = ScanSituationTextRequestSchema.parse(JSON.parse(req.body.text));

    const files = Array.isArray(req.files)
      ? (req.files as Express.Multer.File[])
      : [];

    const result = await scanSituationService({
      question1,
      question2,
      question3,
      question4,
      message,
      files,
    });

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Не удалось выполнить анализ. Попробуйте позже.',
    });
  }
}