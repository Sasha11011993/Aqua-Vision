import { GoogleGenAI, Type } from "@google/genai";
import type { IdentificationReport } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder check. In a real environment, the key would be set.
  // In this context, we assume it's available.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// FIX: Replaced separate fish and plant schemas with a unified schema.
// The `oneOf` keyword is not reliably supported for responseSchema, so a single schema is more robust.
const identificationSchema = {
  type: Type.OBJECT,
  properties: {
    "Тип": { type: Type.STRING, enum: ["Риба", "Рослина"], description: "Тип об'єкта: Риба або Рослина." },
    "Назва (укр.)": { type: Type.STRING, description: "Поширена українська назва." },
    "Назва (лат.)": { type: Type.STRING, description: "Наукова назва." },
    "Загальний опис": { type: Type.STRING, description: "Походження, характерні риси (розмір, колір, форма) для риб, або походження, висота, швидкість росту для рослин." },
    "Умови утримання": { type: Type.STRING, description: "Рекомендований об'єм акваріума, температура води, pH, жорсткість." },
    "Складність догляду": { type: Type.STRING, enum: ["Легкий", "Середній", "Складний"] },
    // Fish-specific properties
    "Сумісність": { type: Type.STRING, description: "Тільки для риб. З якими рибами та безхребетними добре уживається, а з якими – ні." },
    "Годування": { type: Type.STRING, description: "Тільки для риб. Тип корму (сухий, живий, рослинний), частота." },
    "Розмноження": { type: Type.STRING, description: "Тільки для риб. Коротка інформація про нерест." },
    // Plant-specific properties
    "Освітлення": { type: Type.STRING, description: "Тільки для рослин. Необхідна інтенсивність (Низька, Середня, Висока) та тривалість." },
    "CO2 та добрива": { type: Type.STRING, description: "Тільки для рослин. Чи потрібне додаткове CO2, які макро- та мікроелементи критичні." },
    "Розміщення в акваріумі": { type: Type.STRING, description: "Тільки для рослин. Передній, середній чи задній план." },
  },
  required: ["Тип", "Назва (укр.)", "Назва (лат.)", "Загальний опис", "Умови утримання", "Складність догляду"],
};


export async function identifyAquariumObject(imageBase64: string, mimeType: string): Promise<IdentificationReport> {
  // FIX: Updated prompt to work with the new unified schema.
  const prompt = `Ви — експертна система для розпізнавання акваріумних риб та рослин. Проаналізуйте надане зображення. Чітко визначте, чи це риба, чи рослина. Визначте точну наукову (латинську) та поширену (українську) назви об'єкта. Надайте вичерпну інформацію у форматі JSON, що відповідає наданій схемі. Заповнюйте лише ті поля, що стосуються визначеного типу об'єкта (риба або рослина). Вся текстова інформація має бути українською мовою. Якщо об'єкт неможливо ідентифікувати як акваріумну рибу або рослину, поверніть помилку.`;

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType
    }
  };
  
  const textPart = { text: prompt };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
        responseMimeType: "application/json",
        responseSchema: identificationSchema
    }
  });

  const jsonString = response.text;
  if (!jsonString) {
    throw new Error("API не повернуло результат. Можливо, об'єкт не розпізнано.");
  }

  try {
    // FIX: The response is now a flat JSON object, not nested.
    const data = JSON.parse(jsonString);
    if (typeof data !== 'object' || data === null || !data['Тип']) {
      throw new Error("Відповідь API не містить очікуваних даних.");
    }
    return data as IdentificationReport;
  } catch (e) {
    console.error("Failed to parse JSON response:", jsonString, e);
    if (e instanceof Error && e.message === "Відповідь API не містить очікуваних даних.") {
      throw e;
    }
    throw new Error("Отримана відповідь має невірний формат.");
  }
}
