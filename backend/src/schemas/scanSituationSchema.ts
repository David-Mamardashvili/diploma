import { z } from 'zod';

export const ScanSituationTextRequestSchema = z.object({
  channel: z.object({
    question: z.string(),
    answer: z.string(),
  }),

  sender: z.object({
    question: z.string(),
    answer: z.string(),
  }),

  senderScenario: z.object({
    question: z.string(),
    answer: z.string(),
  }),

  message: z.string(),
});

export const ScanSituationWithOpenAIResponseSchema = z.object({
  riskLevel: z.enum([
    'Низкий риск',
    'Средний риск',
    'Высокий риск',
  ]),

  riskPercentage: z.number().min(0).max(100),

  fraudScheme: z.string(),

  riskSigns: z.array(z.string()),

  recommendations: z.array(z.string()),

  detectedLinks: z.array(z.string()),
});

export const ScanLinksWithGoogleSafeBrowsingResponseSchema = z.object({
  matches: z
    .array(
      z.object({
        threatType: z.string(),
        platformType: z.string(),
        threat: z.object({
          url: z.string(),
        }),
      }),
    )
    .optional(),
});