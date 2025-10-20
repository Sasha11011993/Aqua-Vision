import { GoogleGenAI, Type } from "@google/genai";
import type { IdentificationReport } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder check. In a real environment, the key would be set.
  // In this context, we assume it's available.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const fishSchema = {
  type: Type.OBJECT,
  properties: {
    "Назва (укр.)": { type: Type.STRING, description: "Поширена українська назва." },
    "Назва (лат.)": { type: Type.STRING, description: "Наукова назва." },
    "Тип": { type: Type.STRING, enum: ["Риба"], description: "Тип об'єкта." },
    "Загальний опис": { type: Type.STRING, description: "Походження, характерні риси (розмір, колір, форма)." },
    "Умови утримання": { type: Type.STRING, description: "Рекомендований об'єм акваріума, температура води, pH, жорсткість." },
    "Сумісність": { type: Type.STRING, description: "З якими рибами та безхребетними добре уживається, а з якими – ні." },
    "Годування": { type: Type.STRING, description: "Тип корму (сухий, живий, рослинний), частота." },
    "Розмноження": { type: Type.STRING, description: "Коротка інформація про нерест." },
    "Складність догляду": { type: Type.STRING, enum: ["Легкий", "Середній", "Складний"] }
  },
  required: ["Назва (укр.)", "Назва (лат.)", "Тип", "Загальний опис", "Умови утримання", "Сумісність", "Годування", "Розмноження", "Складність догляду"]
};

const plantSchema = {
    type: Type.OBJECT,
    properties: {
        "Назва (укр.)": { type: Type.STRING, description: "Поширена українська назва." },
        "Назва (лат.)": { type: Type.STRING, description: "Наукова назва." },
        "Тип": { type: Type.STRING, enum: ["Рослина"], description: "Тип об'єкта." },
        "Загальний опис": { type: Type.STRING, description: "Походження, висота, швидкість росту." },
        "Умови утримання": { type: Type.STRING, description: "Рекомендована температура води, pH, жорсткість." },
        "Освітлення": { type: Type.STRING, description: "Необхідна інтенсивність (Низька, Середня, Висока) та тривалість." },
        "CO2 та добрива": { type: Type.STRING, description: "Чи потрібне додаткове CO2, які макро- та мікроелементи критичні." },
        "Розміщення в акваріумі": { type: Type.STRING, description: "Передній, середній чи задній план." },
        "Складність догляду": { type: Type.STRING, enum: ["Легкий", "Середній", "Складний"] }
    },
    required: ["Назва (укр.)", "Назва (лат.)", "Тип", "Загальний опис", "Умови утримання", "Освітлення", "CO2 та добрива", "Розміщення в акваріумі", "Складність догляду"]
};


export async function identifyAquariumObject(imageBase64: string, mimeType: string): Promise<IdentificationReport> {
  const prompt = `Ви — експертна система для розпізнавання акваріумних риб та рослин. Проаналізуйте надане зображення. Чітко визначте, чи це риба, чи рослина. Визначте точну наукову (латинську) та поширену (українську) назви об'єкта. Надайте вичерпну інформацію у форматі JSON, що відповідає наданій схемі. Якщо на фото риба, використовуйте схему для риби. Якщо рослина — схему для рослини. Вся текстова інформація має бути українською мовою. Якщо об'єкт неможливо ідентифікувати як акваріумну рибу або рослину, поверніть помилку.`;

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType
    }
  };
  
  const textPart = { text: prompt };

  const combinedSchema = {
    type: Type.OBJECT,
    properties: {
      identification: {
        oneOf: [fishSchema, plantSchema]
      }
    },
    required: ['identification']
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
        responseMimeType: "application/json",
        responseSchema: combinedSchema
    }
  });

  const jsonString = response.text;
  if (!jsonString) {
    throw new Error("API не повернуло результат. Можливо, об'єкт не розпізнано.");
  }

  try {
    const parsedResponse = JSON.parse(jsonString);
    const data = parsedResponse.identification;
    if (!data) {
      throw new Error("Відповідь API не містить очікуваних даних.");
    }
    return data as IdentificationReport;
  } catch (e) {
    console.error("Failed to parse JSON response:", jsonString);
    throw new Error("Отримана відповідь має невірний формат.");
  }
}