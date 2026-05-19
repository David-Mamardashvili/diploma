import 'multer';
import OpenAI from 'openai';
import {
  ScanLinksWithGoogleSafeBrowsingResponseSchema,
  ScanSituationWithOpenAIResponseSchema,
} from '../schemas/scanSituationSchema';

const openAIApiKey = process.env.OPENAI_API_KEY;

if (!openAIApiKey) {
  throw new Error('OPENAI_API_KEY is missing');
}

const openai = new OpenAI({
  apiKey: openAIApiKey,
});

type ScanSituationServiceParams = {
  channel: { question: string; answer: string };
  sender: { question: string; answer: string };
  senderScenario: { question: string; answer: string };
  message: string;
  files: Express.Multer.File[];
};

function extractLinksFromText(text: string) {
  const urlRegex = /https?:\/\/[^\s"'<>]+/g;

  return text.match(urlRegex) ?? [];
}

async function scanLinksWithGoogleSafeBrowsing(links: string[]) {
  if (links.length === 0) {
    return ScanLinksWithGoogleSafeBrowsingResponseSchema.parse({});
  }

  const googleSafeBrowsingApiKey =
    process.env.GOOGLE_SAFE_BROWSING_API_KEY;

  if (!googleSafeBrowsingApiKey) {
    throw new Error('GOOGLE_SAFE_BROWSING_API_KEY is missing');
  }

  const response = await fetch(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${googleSafeBrowsingApiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client: {
          clientId: 'user',
          clientVersion: '1.5.2',
        },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: links.map((url) => ({ url })),
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error('Safe Browsing API error');
  }

  return ScanLinksWithGoogleSafeBrowsingResponseSchema.parse(
    await response.json(),
  );
}

export async function scanSituationService({
  channel,
  sender,
  senderScenario,
  message,
  files,
}: ScanSituationServiceParams) {
  const textContent = {
    type: 'input_text',
    text: `
      Пользовательские данные:
        Вопрос: ${channel.question}
        Ответ: ${channel.answer}

        Вопрос: ${sender.question}
        Ответ: ${sender.answer}

        Вопрос: ${senderScenario.question}
        Ответ: ${senderScenario.answer}

        Текст сообщения:
        ${message || 'Не указано'}
    `,
  } as const;

  const imageContent = files.map((file) => ({
    type: 'input_image',
    detail: 'auto',
    image_url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
  } as const));

  const response = await openai.responses.create({
    model: 'gpt-5.4-mini',
    reasoning: { effort: 'low' },
    input: [
      {
        role: 'developer',
        content: `
          Ты рекомендательная система распознавания мошеннических ситуаций, проанализируй пользовательские данные.
        `,
      },
      {
        role: 'user',
        content: [textContent, ...imageContent],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'scan-situation-result',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            riskLevel: {
              type: 'string',
              enum: ['Низкий риск', 'Средний риск', 'Высокий риск'],
              description: 'Уровень риска мошенничества',
            },
            riskPercentage: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Процентная оценка риска мошенничества',
            },
            fraudScheme: {
              type: 'string',
              description:
                'Предполагаемая мошенническая схема с кратким объяснением',
            },
            riskSigns: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              maxItems: 5,
              description:
                'Список признаков, указывающих на возможное мошенничество',
            },
            recommendations: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              maxItems: 5,
              description:
                'Массив строк, где каждый элемент начинается с номера шага в формате "1.", "2.", "3." и так далее, а также содержит рекомендуемое действие для пользователя в порядке приоритета',
            },
            detectedLinks: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Все URL, обнаруженные на скриншотах. Если ссылок на скриншотах нет — верни пустой массив.',
            },
          },
          required: [
            'riskLevel',
            'riskPercentage',
            'fraudScheme',
            'riskSigns',
            'recommendations',
            'detectedLinks',
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const result = ScanSituationWithOpenAIResponseSchema.parse(
    JSON.parse(response.output_text),
  );

  const linksFromText = [
    ...extractLinksFromText(channel.answer),
    ...extractLinksFromText(sender.answer),
    ...extractLinksFromText(senderScenario.answer),
    ...extractLinksFromText(message),
  ];

  const uniqueLinks = [
    ...new Set([
      ...linksFromText,
      ...result.detectedLinks,
    ]),
  ];

  const scanLinksResult =
    uniqueLinks.length > 0
      ? await scanLinksWithGoogleSafeBrowsing(uniqueLinks)
      : ScanLinksWithGoogleSafeBrowsingResponseSchema.parse({});

  const flaggedLinks =
    scanLinksResult.matches?.map((match) => match.threat.url) ?? [];

  const unflaggedLinks = uniqueLinks.filter(
    (link) => !flaggedLinks.includes(link),
  );

  const { detectedLinks, ...resultWithoutDetectedLinks } = result;

  return {
    ...resultWithoutDetectedLinks,
    flaggedLinks,
    unflaggedLinks,
  };
}