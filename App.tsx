
import React, { useState, useCallback } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { ResultScreen } from './components/ResultScreen';
import { Loader } from './components/Loader';
import { identifyAquariumObject } from './services/geminiService';
import type { IdentificationReport } from './types';
import { SearchQuestionIcon } from './components/icons';

type Screen = 'home' | 'loading' | 'result' | 'error' | 'not_found';

const NotFoundScreen: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4 animate-fade-in">
      <SearchQuestionIcon />
      <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-2">Нічого не знайдено</h2>
      <p className="text-gray-600 max-w-md mb-8">
        На жаль, нам не вдалося розпізнати рибу чи рослину на цьому зображенні. Будь ласка, спробуйте зробити більш чітке фото та завантажте його знову.
      </p>
      <button
        onClick={onReset}
        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-blue-500"
      >
        Спробувати ще раз
      </button>
    </div>
  );
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [result, setResult] = useState<IdentificationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file) return;

    setScreen('loading');
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setImageDataUrl(dataUrl);
      
      try {
        const base64Data = dataUrl.split(',')[1];
        if (!base64Data) {
            throw new Error("Could not extract base64 data from image.");
        }
        const identifiedObject = await identifyAquariumObject(base64Data, file.type);
        setResult(identifiedObject);
        setScreen('result');
      } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'Не вдалося розпізнати об\'єкт. Спробуйте інше фото.';
        if (errorMessage.includes('не розпізнано') || errorMessage.includes('не містить очікуваних даних')) {
            setScreen('not_found');
        } else {
            setError(errorMessage);
            setScreen('error');
        }
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleReset = () => {
    setScreen('home');
    setImageDataUrl(null);
    setResult(null);
    setError(null);
  };

  const renderScreen = () => {
    switch (screen) {
      case 'loading':
        return <Loader />;
      case 'result':
        return result && imageDataUrl && <ResultScreen result={result} imageUrl={imageDataUrl} onReset={handleReset} />;
      case 'not_found':
        return <NotFoundScreen onReset={handleReset} />;
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-screen text-center p-4">
            <h2 className="text-xl font-bold text-red-600 mb-4">Помилка</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Спробувати ще
            </button>
          </div>
        );
      case 'home':
      default:
        return <HomeScreen onImageUpload={handleImageUpload} />;
    }
  };

  return (
    <div className="min-h-screen text-gray-800">
      <main className="container mx-auto p-4 md:p-8">
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;
