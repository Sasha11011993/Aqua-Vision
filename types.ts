
export enum ObjectType {
  Fish = 'Риба',
  Plant = 'Рослина',
}

export enum CareDifficulty {
  Easy = 'Легкий',
  Medium = 'Середній',
  Hard = 'Складний',
}

export interface FishReport {
  'Назва (укр.)': string;
  'Назва (лат.)': string;
  'Тип': ObjectType.Fish;
  'Загальний опис': string;
  'Умови утримання': string;
  'Сумісність': string;
  'Годування': string;
  'Розмноження': string;
  'Складність догляду': CareDifficulty;
}

export interface PlantReport {
  'Назва (укр.)': string;
  'Назва (лат.)': string;
  'Тип': ObjectType.Plant;
  'Загальний опис': string;
  'Умови утримання': string;
  'Освітлення': string;
  'CO2 та добрива': string;
  'Розміщення в акваріумі': string;
  'Складність догляду': CareDifficulty;
}

export type IdentificationReport = FishReport | PlantReport;
