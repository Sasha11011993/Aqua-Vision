
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { IdentificationReport, SimilarObject } from '../types';
import { ObjectType } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder check. In a real environment, the key would be set.
  // In this context, we assume it's available.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const careConditionsSchema = {
    type: Type.OBJECT,
    description: "Параметри води та акваріума.",
    properties: {
        "Температура": { type: Type.STRING, description: "Діапазон температур у градусах Цельсія, наприклад '24-28°C'." },
        "pH": { type: Type.STRING, description: "Діапазон кислотності води, наприклад '6.5-7.5'." },
        "Жорсткість (GH)": { type: Type.STRING, description: "Діапазон загальної жорсткості води, наприклад '5-15 dGH'." },
        "Опис": { type: Type.STRING, description: "Додатковий текстовий опис умов утримання." }
    },
    required: ["Температура", "pH", "Жорсткість (GH)", "Опис"]
};

const fishSchema = {
  type: Type.OBJECT,
  properties: {
    "Назва (укр.)": { type: Type.STRING, description: "Поширена українська назва." },
    "Назва (лат.)": { type: Type.STRING, description: "Наукова назва." },
    "Тип": { type: Type.STRING, enum: ["Риба"], description: "Тип об'єкта." },
    "Загальний опис": { type: Type.STRING, description: "Походження, характерні риси (розмір, колір, форма)." },
    "Умови утримання": { 
        ...careConditionsSchema,
        properties: {
            ...careConditionsSchema.properties,
            "Об'єм акваріума": { type: Type.STRING, description: "Мінімальний рекомендований об'єм акваріума в літрах, наприклад 'від 100 л'." },
        },
        required: [...careConditionsSchema.required, "Об'єм акваріума"]
    },
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
        "Умови утримання": careConditionsSchema,
        "Освітлення": { type: Type.STRING, description: "Необхідна інтенсивність (Низька, Середня, Висока) та тривалість." },
        "CO2 та добрива": { type: Type.STRING, description: "Чи потрібне додаткове CO2, які макро- та мікроелементи критичні." },
        "Розміщення в акваріумі": { type: Type.STRING, description: "Передній, середній чи задній план." },
        "Складність догляду": { type: Type.STRING, enum: ["Легкий", "Середній", "Складний"] }
    },
    required: ["Назва (укр.)", "Назва (лат.)", "Тип", "Загальний опис", "Умови утримання", "Освітлення", "CO2 та добрива", "Розміщення в акваріумі", "Складність догляду"]
};

const combinedSchema = {
    type: Type.OBJECT,
    properties: {
      identification: {
        oneOf: [fishSchema, plantSchema]
      }
    },
    required: ['identification']
};

async function parseIdentificationResponse(responsePromise: Promise<{ text: string }>): Promise<IdentificationReport> {
    const response = await responsePromise;
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

export async function identifyByText(description: string): Promise<IdentificationReport> {
    const prompt = `Ви — експертна система для розпізнавання акваріумних риб та рослин. Проаналізуйте наданий текстовий опис. Визначте, чи це риба, чи рослина. Визначте точну наукову (латинську) та поширену (українську) назви об'єкта. Надайте вичерпну інформацію у форматі JSON, що відповідає наданій схемі.
  
Опис від користувача: "${description}"
  
Якщо описаний об'єкт - риба, використовуйте схему для риби. Якщо рослина — схему для рослини. Вся текстова інформація має бути українською мовою. Якщо об'єкт неможливо ідентифікувати за описом, поверніть помилку.`;

    const response = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: combinedSchema
        }
    });

    return parseIdentificationResponse(response);
}


export async function identifyAquariumObject(imageBase64: string, mimeType: string, description: string): Promise<IdentificationReport> {
  let prompt = `Ви — експертна система для розпізнавання акваріумних риб та рослин. Проаналізуйте надане зображення. Чітко визначте, чи це риба, чи рослина. Визначте точну наукову (латинську) та поширену (українську) назви об'єкта. Надайте вичерпну інформацію у форматі JSON, що відповідає наданій схемі.
  
Для поля "Умови утримання" надайте як структуровані дані (температура, pH, жорсткість, об'єм акваріума для риб), так і загальний текстовий опис у полі "Опис".
  
Якщо на фото риба, використовуйте схему для риби. Якщо рослина — схему для рослини. Вся текстова інформація має бути українською мовою. Якщо об'єкт неможливо ідентифікувати як акваріумну рибу або рослину, поверніть помилку.`;

  if (description && description.trim() !== '') {
    prompt += `\n\nКористувач надав додатковий контекст: "${description}". Будь ласка, врахуйте цю інформацію під час аналізу зображення.`;
  }

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType
    }
  };
  
  const textPart = { text: prompt };

  const response = ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
        responseMimeType: "application/json",
        responseSchema: combinedSchema
    }
  });

  return parseIdentificationResponse(response);
}

export async function generateImageForObject(objectName: string): Promise<string> {
    const prompt = `A realistic, high-quality, vibrant photograph of a single "${objectName}" in a beautiful, well-lit aquarium setting. The subject should be in clear focus.`;
  
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });
  
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
  
    throw new Error("Could not generate an image for the object.");
}

const similarObjectsSchema = {
    type: Type.ARRAY,
    description: "Список схожих акваріумних риб або рослин.",
    items: {
        type: Type.OBJECT,
        properties: {
            "Назва": { type: Type.STRING, description: "Українська назва схожого виду." },
            "Причина схожості": { type: Type.STRING, description: "Коротке пояснення, чому цей вид схожий (наприклад, за умовами утримання, зовнішнім виглядом, поведінкою)." }
        },
        required: ["Назва", "Причина схожості"]
    }
};

export async function findSimilarObjects(report: IdentificationReport): Promise<SimilarObject[]> {
  const objectType = report.Тип === ObjectType.Fish ? 'рибу' : 'рослину';
  const objectName = report['Назва (укр.)'];
  const careConditions = report['Умови утримання'];

  let description = `Назва: ${objectName}.`;
  if (typeof careConditions === 'object' && careConditions !== null) {
      const conditions = careConditions as { 'Температура'?: string; 'pH'?: string; 'Жорсткість (GH)'?: string };
      description += ` Умови: Температура ${conditions['Температура']}, pH ${conditions['pH']}, Жорсткість ${conditions['Жорсткість (GH)']}.`;
  }

  const prompt = `На основі характеристик акваріумної ${objectType} "${description}", запропонуй 3 схожі види. Схожість може бути за зовнішнім виглядом, умовами утримання або поведінкою (для риб). Надай результат у форматі JSON, що відповідає наданій схемі. Вся інформація має бути українською мовою.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }] },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                similar: similarObjectsSchema
            },
            required: ['similar']
        }
    }
  });

  const jsonString = response.text;
  if (!jsonString) {
    throw new Error("API не повернуло схожих об'єктів.");
  }

  try {
    const parsedResponse = JSON.parse(jsonString);
    const data = parsedResponse.similar;
    if (!Array.isArray(data)) {
        throw new Error("Відповідь API не містить очікуваного масиву даних.");
    }
    return data as SimilarObject[];
  } catch (e) {
    console.error("Failed to parse JSON response for similar objects:", jsonString);
    throw new Error("Отримана відповідь про схожі об'єкти має невірний формат.");
  }
}
