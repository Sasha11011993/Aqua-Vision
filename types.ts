export enum ObjectType {
  Fish = 'Риба',
  Plant = 'Рослина',
}

export enum CareDifficulty {
  Easy = 'Легкий',
  Medium = 'Середній',
  Hard = 'Складний',
}

export interface CareConditions {
  'Температура': string;
  'pH': string;
  'Жорсткість (GH)': string;
  'Опис': string;
}

export interface FishCareConditions extends CareConditions {
  'Об\'єм акваріума': string;
}

export interface PlantCareConditions extends CareConditions {}

export interface FishReport {
  'Назва (укр.)': string;
  'Назва (лат.)': string;
  'Тип': ObjectType.Fish;
  'Загальний опис': string;
  'Умови утримання': FishCareConditions;
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
  'Умови утримання': PlantCareConditions;
  'Освітлення': string;
  'CO2 та добрива': string;
  'Розміщення в акваріумі': string;
  'Складність догляду': CareDifficulty;
}

export type IdentificationReport = FishReport | PlantReport;

export interface SimilarObject {
  'Назва': string;
  'Причина схожості': string;
}
