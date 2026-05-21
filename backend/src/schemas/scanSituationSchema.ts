import { z } from 'zod';

export const ScanSituationTextRequestSchema = z.object({
  question1: z.object({
    question: z.string(),
    answer: z.string(),
  }),
  question2: z.object({
    question: z.string(),
    answer: z.string(),
  }),
  question3: z.object({
    question: z.string(),
    answer: z.string(),
  }),
  question4: z.object({
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
    'Критический риск',
  ]),
  riskPercentage: z.number().min(0).max(100),
  warningSigns: z.array(z.string()),
  psychologicalManipulations: z.array(z.string()),
  fraudScheme: z.object({
    title: z.string(),
    description: z.string(),
  }),
  recommendations: z.array(z.string()),
  fileLinks: z.array(z.string()),
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