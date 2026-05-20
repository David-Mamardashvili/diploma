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

function isValidExternalUrl(link: string) {
  try {
    const url = new URL(link);

    return (
      (url.protocol === 'http:' ||
        url.protocol === 'https:') &&
      url.hostname !== 'localhost'
    );
  } catch {
    return false;
  }
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

// async function generateRecommendationsWithLinks({
//   riskLevel,
//   riskPercentage,
//   warningSigns,
//   fraudScheme,
//   flaggedLinks,
//   unflaggedLinks,
// }: {
//   riskLevel: string;
//   riskPercentage: number;
//   warningSigns: string[];
//   fraudScheme: { title: string; description: string };
//   flaggedLinks: string[];
//   unflaggedLinks: string[];
// }) {
//   const response = await openai.responses.create({
//     model: 'gpt-5.4-mini',
//     reasoning: { effort: 'low' },
//     input: [
//       {
//         role: 'developer',
//         content: `
//           Ты система генерации финальных рекомендаций по защите от мошенничества. 
//           Возвращай рекомендации с учетом общего анализа ситуации и результата проверки ссылок.
//           Если ссылка из flaggedLinks обязательно сообщи об угрозе.
//           Если ссылка из unflaggedLinks обязательно сообщи о том что она была проверена и угроз не найдено и исходя из этого давай рекомендации.
//         `,
//       },
//       {
//         role: 'user',
//         content: `
//           Уровень риска: ${riskLevel}

//           Процент риска: ${riskPercentage}

//           Обнаруженные тревожные признаки: ${warningSigns.join('\n') || 'Не обнаружены'}

//           Возможная схема мошенничества:
//           ${fraudScheme.title}
//           ${fraudScheme.description}

//           Ссылки, в которых не выявлена угроза: ${unflaggedLinks.join('\n') || 'Не обнаружены'}

//           Ссылки, в которых выявлена угроза: ${flaggedLinks.join('\n') || 'Не обнаружены'}
//         `,
//       },
//     ],
//     text: {
//       format: {
//         type: 'json_schema',
//         name: 'scan-situation-result-with-links',
//         strict: true,
//         schema: {
//           type: 'object',
//           properties: {
//             recommendations: {
//               type: 'array',
//               items: { type: 'string' },
//               minItems: 2,
//               maxItems: 4,
//             },
//           },
//           required: ['recommendations'],
//           additionalProperties: false,
//         },
//       },
//     },
//   });

//   const result = JSON.parse(response.output_text) as {
//     recommendations: string[];
//   };

//   return result.recommendations;
// }

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
        Ты система анализа мошеннических ситуаций. 
        Проанализируй пользовательские данные и оцени вероятность мошенничества.
      
        Правила для поля riskLevel:
          1. Возвращай 'Низкий риск' исключительно при отсутствующих или при минимальных тревожных признаках.
          2. Возвращай 'Средний риск' исключительно при одном тревожном признаке.
          3. Возвращай 'Высокий риск' исключительно при нескольких тревожных признаках.
          4. Возвращай 'Критический риск' исключительно при явной попытке мошенничества.

        Правила для поля riskPercentage:
          1. Возвращай оценку риска в диапазоне от 0 до 25 исключительно при отсутствующих или при минимальных тревожных признаках.
          2. Возвращай оценку риска в диапазоне от 26 до 50 исключительно при одном тревожном признаке.
          3. Возвращай оценку риска в диапазоне от 51 до 75 исключительно при нескольких тревожных признаках.
          4. Возвращай оценку риска в диапазоне от 76 до 100 исключительно при явной попытке мошенничества.
      
        Правила для поля warningSigns:
          1. Возвращай исключительно тревожные признаки.
          2. Если тревожных признаков нет — возвращай пустой массив.

        Правила для поля fraudScheme:
          1. В поле title возвращай исключительно краткое название возможной схемы мошенничества.
          2. В поле description возвращай исключительно краткое объяснение возможной схемы мошенничества.
      
        Правила для поля recommendations:
          Возвращай рекомендации с учётом общего анализа ситуации.
      
        Правила для поля fileLinks:
          1. Возвращай все ссылки, найденные на скриншотах.
          2. Если ссылка указана без протокола, приводи её к формату 'https://'.
          3. Если ссылок нет — возвращай пустой массив.
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
              enum: ['Низкий риск', 'Средний риск', 'Высокий риск', 'Критический риск'],
              description: `
                1. Возвращай 'Низкий риск' исключительно при отсутствующих или при минимальных тревожных признаках.
                2. Возвращай 'Средний риск' исключительно при одном тревожном признаке.
                3. Возвращай 'Высокий риск' исключительно при нескольких тревожных признаках.
                4. Возвращай 'Критический риск' исключительно при явной попытке мошенничества.
              `,
            },
            riskPercentage: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: `
                1. Возвращай оценку риска в диапазоне от 0 до 25 исключительно при отсутствующих или при минимальных тревожных признаках.
                2. Возвращай оценку риска в диапазоне от 26 до 50 исключительно при одном тревожном признаке.
                3. Возвращай оценку риска в диапазоне от 51 до 75 исключительно при нескольких тревожных признаках.
                4. Возвращай оценку риска в диапазоне от 76 до 100 исключительно при явной попытке мошенничества.
              `,
            },
            warningSigns: {
              type: 'array',
              items: { type: 'string' },
              maxItems: 4,
              description: `
                1. Возвращай исключительно тревожные признаки.
                2. Если тревожных признаков нет — возвращай пустой массив.
              `,
            },
            fraudScheme: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: `
                    Возвращай исключительно краткое название возможной схемы мошенничества.
                  `,
                },
                description: {
                  type: 'string',
                  description: `
                    Возвращай исключительно краткое объяснение возможной схемы мошенничества.
                  `,
                },
              },
              required: ['title', 'description'],
              additionalProperties: false,
            },
            recommendations: {
              type: 'array',
              items: { type: 'string' },
              minItems: 2,
              maxItems: 4,
              description: `
                Возвращай рекомендации с учётом общего анализа ситуации.
              `,

            },
            fileLinks: {
              type: 'array',
              items: { type: 'string' },
              description: `
                1. Возвращай все ссылки, найденные на скриншотах.
                2. Если ссылка указана без протокола, приводи её к формату 'https://'.
                3. Если ссылок нет — возвращай пустой массив.
              `,
            },
          },
          required: [
            'riskLevel',
            'riskPercentage',
            'warningSigns',
            'fraudScheme',
            'recommendations',
            'fileLinks',
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
      ...result.fileLinks,
    ]),
  ].filter(isValidExternalUrl);
  
  const scanLinksResult =
    uniqueLinks.length > 0
      ? await scanLinksWithGoogleSafeBrowsing(uniqueLinks)
      : ScanLinksWithGoogleSafeBrowsingResponseSchema.parse({});
  
  // const flaggedLinks =
  //   scanLinksResult.matches?.map((match) => match.threat.url) ?? [];
  
  // const unflaggedLinks = uniqueLinks.filter(
  //   (link) => !flaggedLinks.includes(link),
  // );

  // const recommendations =
  //   uniqueLinks.length > 0
  //     ? await generateRecommendationsWithLinks({
  //         riskLevel: result.riskLevel,
  //         riskPercentage: result.riskPercentage,
  //         warningSigns: result.warningSigns,
  //         fraudScheme: result.fraudScheme,
  //         flaggedLinks,
  //         unflaggedLinks,
  //       })
  //     : result.recommendations;
  
  // const { fileLinks, ...resultWithoutFilesLinks } = result;
  
  // return {
  //   ...resultWithoutFilesLinks,
  //   recommendations,
  //   flaggedLinks,
  // };
  const flaggedLinks =
  scanLinksResult.matches?.map((match) => match.threat.url) ?? [];

  const { fileLinks, ...resultWithoutFilesLinks } = result;

  return {
    ...resultWithoutFilesLinks,
    flaggedLinks,
};
}