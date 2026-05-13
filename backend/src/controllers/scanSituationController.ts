import type { Request, Response } from 'express';
import { openai } from '../services/openaiService';

export async function scanSituationController(req: Request, res: Response) {
  try {
    const { channel, sender, message } = req.body;
    const response = await openai.responses.create({
      model: 'gpt-5.4-mini',
      input: 
      ` 
        Ты рекомендательная система распознавания мошеннических ситуаций.

        Проанализируй пользовательские данные и верни только JSON-объект без дополнительного текста, строго соответствующий следующей структуре:
            {
                "riskLevel": "Низкий риск" | "Средний риск" | "Высокий риск", // уровень риска мошенничества
                "riskPercentage": number (1-100), // уровень риска мошенничества
                "riskFactors": string[] (1-5 элементов), // признаки, указывающие на риск
                "recommendations": string[] (1-5 элементов) // рекомендуемые действия
            }

        Пользовательские данные:
            Канал коммуникации: ${channel}
            Отправитель сообщения: ${sender}
            Текст сообщения: ${message}
      `,
    });
    const result = JSON.parse(response.output_text);
    res.json(result);
  } 
  catch {
    res.status(500).json({ error: 'Ошибка анализа' });
  }
}