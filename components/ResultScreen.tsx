import React, { useState } from 'react';
import type { IdentificationReport, FishReport, PlantReport, FishCareConditions, PlantCareConditions, SimilarObject } from '../types';
import { ObjectType } from '../types';
import { findSimilarObjects } from '../services/geminiService';
import { FishIcon, PlantIcon, DropletIcon, RulersIcon, UsersIcon, LeafIcon, LightbulbIcon, SyringeIcon, BackIcon, ShareIcon, ThermometerIcon, PhIcon, HardnessIcon, AquariumIcon, SparklesIcon } from './icons';

interface ResultScreenProps {
  result: IdentificationReport;
  imageUrl: string;
  onReset: () => void;
}

const CareParameter: React.FC<{ icon: React.ReactNode; label: string; value: string | undefined; }> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col items-center justify-center p-4 text-center bg-gray-50/50 rounded-lg shadow-sm border border-gray-200/80">
      <div className="mb-2 transition-transform duration-200 ease-in-out hover:scale-110">{icon}</div>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
};

const AccordionItem: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const id = `accordion-content-${title.replace(/\s+/g, '-')}`;

  return (
    <div className="border-b border-gray-200">
      <h2 id={`accordion-header-${title.replace(/\s+/g, '-')}`}>
        <button
          type="button"
          className="group flex items-center justify-between w-full p-5 font-medium text-left text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={id}
        >
          <span className="flex items-center gap-3">
            <div className="transition-transform duration-200 ease-in-out group-hover:scale-110">{icon}</div>
            {title}
          </span>
          <svg className={`w-3 h-3 shrink-0 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5"/>
          </svg>
        </button>
      </h2>
      <div
        id={id}
        className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        role="region"
        aria-labelledby={`accordion-header-${title.replace(/\s+/g, '-')}`}
      >
        <div className="overflow-hidden">
          <div className="p-5 border-t border-gray-200 bg-white">
            <div className="text-gray-500 whitespace-pre-line">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ResultScreen: React.FC<ResultScreenProps> = ({ result, imageUrl, onReset }) => {
  const isFish = result.Тип === ObjectType.Fish;
  const fishResult = result as FishReport;
  const plantResult = result as PlantReport;
  const careConditions = result['Умови утримання'];

  const [similarObjects, setSimilarObjects] = useState<SimilarObject[] | null>(null);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [similarError, setSimilarError] = useState<string | null>(null);

  const difficultyColorMap = {
    'Легкий': 'bg-green-100 text-green-800',
    'Середній': 'bg-yellow-100 text-yellow-800',
    'Складний': 'bg-red-100 text-red-800',
  };

  const handleFindSimilar = async () => {
    setIsLoadingSimilar(true);
    setSimilarError(null);
    setSimilarObjects(null);
    try {
      const similar = await findSimilarObjects(result);
      setSimilarObjects(similar);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не вдалося знайти схожі види.';
      setSimilarError(errorMessage);
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
          <button onClick={onReset} className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-blue-500">
            <div className="transition-transform duration-200 ease-in-out group-hover:scale-110"><BackIcon /></div>
            Назад
          </button>
          <button onClick={() => navigator.share ? navigator.share({ title: result['Назва (укр.)'], text: result['Загальний опис'] }) : alert('Share not supported')} className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-blue-500">
            <div className="transition-transform duration-200 ease-in-out group-hover:scale-110"><ShareIcon /></div>
            Поділитись
          </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img className="h-64 w-full object-cover md:w-64" src={imageUrl} alt={result['Назва (укр.)']} />
          </div>
          <div className="p-8">
            <div className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mb-2 ${difficultyColorMap[result['Складність догляду']]}`}>
              Складність: {result['Складність догляду']}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{result['Назва (укр.)']}</h1>
            <p className="mt-1 text-md text-gray-500 italic">{result['Назва (лат.)']}</p>
            <p className="mt-4 text-gray-600">{result['Загальний опис']}</p>
          </div>
        </div>

        <div className="px-8 pb-6">
          <button 
              onClick={handleFindSimilar}
              disabled={isLoadingSimilar}
              className="group w-full flex items-center justify-center gap-3 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all transform hover:scale-105 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
              {isLoadingSimilar ? (
                  <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Шукаємо...
                  </>
              ) : (
                  <>
                      <div className="transition-transform duration-200 ease-in-out group-hover:scale-110"><SparklesIcon /></div>
                      Знайти схожих
                  </>
              )}
          </button>
        </div>

        {(similarObjects || similarError) && (
            <div className="px-8 pb-8 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Схожі види</h3>
                {similarObjects && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {similarObjects.map((item, index) => (
                            <div key={index} className="bg-gray-50/80 p-4 rounded-lg border border-gray-200 shadow-sm">
                                <p className="font-bold text-gray-900">{item['Назва']}</p>
                                <p className="text-sm text-gray-600 mt-1">{item['Причина схожості']}</p>
                            </div>
                        ))}
                    </div>
                )}
                {similarError && (
                    <p className="text-red-600 bg-red-100 p-3 rounded-lg">{similarError}</p>
                )}
            </div>
        )}
        
        <div className="bg-gray-50">
            {isFish ? (
                <>
                    <AccordionItem title="Умови утримання" icon={<DropletIcon />}>
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <CareParameter icon={<ThermometerIcon />} label="Температура" value={(careConditions as FishCareConditions)['Температура']} />
                          <CareParameter icon={<PhIcon />} label="pH" value={(careConditions as FishCareConditions)['pH']} />
                          <CareParameter icon={<HardnessIcon />} label="Жорсткість" value={(careConditions as FishCareConditions)['Жорсткість (GH)']} />
                          <CareParameter icon={<AquariumIcon />} label="Об'єм" value={(careConditions as FishCareConditions)['Об\'єм акваріума']} />
                        </div>
                        <p>{careConditions.Опис}</p>
                      </>
                    </AccordionItem>
                    <AccordionItem title="Сумісність" icon={<UsersIcon />}>{fishResult['Сумісність']}</AccordionItem>
                    <AccordionItem title="Годування" icon={<LeafIcon />}>{fishResult['Годування']}</AccordionItem>
                    <AccordionItem title="Розмноження" icon={<FishIcon />}>{fishResult['Розмноження']}</AccordionItem>
                </>
            ) : (
                <>
                    <AccordionItem title="Умови утримання" icon={<DropletIcon />}>
                       <>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          <CareParameter icon={<ThermometerIcon />} label="Температура" value={(careConditions as PlantCareConditions)['Температура']} />
                          <CareParameter icon={<PhIcon />} label="pH" value={(careConditions as PlantCareConditions)['pH']} />
                          <CareParameter icon={<HardnessIcon />} label="Жорсткість" value={(careConditions as PlantCareConditions)['Жорсткість (GH)']} />
                        </div>
                        <p>{careConditions.Опис}</p>
                      </>
                    </AccordionItem>
                    <AccordionItem title="Освітлення" icon={<LightbulbIcon />}>{plantResult['Освітлення']}</AccordionItem>
                    <AccordionItem title="CO2 та добрива" icon={<SyringeIcon />}>{plantResult['CO2 та добрива']}</AccordionItem>
                    <AccordionItem title="Розміщення" icon={<RulersIcon />}>{plantResult['Розміщення в акваріумі']}</AccordionItem>
                </>
            )}
        </div>
      </div>
    </div>
  );
};
