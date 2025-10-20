import React, { useState } from 'react';
import type { IdentificationReport, FishReport, PlantReport } from '../types';
import { ObjectType } from '../types';
import { FishIcon, PlantIcon, DropletIcon, RulersIcon, UsersIcon, LeafIcon, LightbulbIcon, SyringeIcon, BackIcon, ShareIcon } from './icons';

interface ResultScreenProps {
  result: IdentificationReport;
  imageUrl: string;
  onReset: () => void;
}

const AccordionItem: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const id = `accordion-content-${title.replace(/\s+/g, '-')}`;

  return (
    <div className="border-b border-gray-200">
      <h2 id={`accordion-header-${title.replace(/\s+/g, '-')}`}>
        <button
          type="button"
          className="flex items-center justify-between w-full p-5 font-medium text-left text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={id}
        >
          <span className="flex items-center gap-3">
            {icon}
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
            <p className="text-gray-500 whitespace-pre-line">{children}</p>
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

  const difficultyColorMap = {
    'Легкий': 'bg-green-100 text-green-800',
    'Середній': 'bg-yellow-100 text-yellow-800',
    'Складний': 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
          <button onClick={onReset} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-blue-500">
            <BackIcon />
            Назад
          </button>
          <button onClick={() => navigator.share ? navigator.share({ title: result['Назва (укр.)'], text: result['Загальний опис'] }) : alert('Share not supported')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-blue-500">
            <ShareIcon />
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
        
        <div className="bg-gray-50">
            {isFish ? (
                <>
                    <AccordionItem title="Умови утримання" icon={<DropletIcon />}>{fishResult['Умови утримання']}</AccordionItem>
                    <AccordionItem title="Сумісність" icon={<UsersIcon />}>{fishResult['Сумісність']}</AccordionItem>
                    <AccordionItem title="Годування" icon={<LeafIcon />}>{fishResult['Годування']}</AccordionItem>
                    <AccordionItem title="Розмноження" icon={<FishIcon />}>{fishResult['Розмноження']}</AccordionItem>
                </>
            ) : (
                <>
                    <AccordionItem title="Умови утримання" icon={<DropletIcon />}>{plantResult['Умови утримання']}</AccordionItem>
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