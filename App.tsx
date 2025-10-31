
import React, { useState, useCallback } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { ResultScreen } from './components/ResultScreen';
import { Loader } from './components/Loader';
import { identifyAquariumObject, identifyByText, generateImageForObject } from './services/geminiService';
import type { IdentificationReport } from './types';
import { SearchQuestionIcon, LogoIcon } from './components/icons';

type Screen = 'home' | 'loading' | 'result' | 'error' | 'not_found';

const NotFoundScreen: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 animate-fade-in">
      <SearchQuestionIcon />
      <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-2">Нічого не знайдено</h2>
      <p className="text-gray-600 max-w-md mb-8">
        На жаль, нам не вдалося розпізнати рибу чи рослину. Будь ласка, спробуйте уточнити опис або завантажте більш чітке фото.
      </p>
      <button
        onClick={onReset}
        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
      >
        Спробувати ще раз
      </button>
    </div>
  );
};

const Header: React.FC = () => (
    <header className="py-4 md:py-6">
      <div className="container mx-auto flex items-center justify-center gap-3 text-center">
        <LogoIcon />
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900 tracking-tight">Aqua Vision</h1>
      </div>
    </header>
  );

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [result, setResult] = useState<IdentificationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const handleImageUpload = useCallback(async (file: File, description: string) => {
    if (!file) return;

    setLoadingMessage('Аналізуємо ваше зображення...');
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
        const identifiedObject = await identifyAquariumObject(base64Data, file.type, description);
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

  const handleTextSearch = useCallback(async (description: string) => {
    if (!description) return;

    setLoadingMessage('Шукаємо за вашим описом...');
    setScreen('loading');
    setError(null);
    setResult(null);
    setImageDataUrl(null);

    try {
        const identifiedObject = await identifyByText(description);
        setResult(identifiedObject);

        setLoadingMessage('Створюємо зображення для вас...');
        const objectName = identifiedObject['Назва (лат.)'] || identifiedObject['Назва (укр.)'];
        const imageBase64 = await generateImageForObject(objectName);
        const dataUrl = `data:image/png;base64,${imageBase64}`;
        setImageDataUrl(dataUrl);

        setScreen('result');
    } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'Не вдалося знайти об\'єкт за описом.';
        if (errorMessage.includes('не розпізнано') || errorMessage.includes('не містить очікуваних даних') || errorMessage.includes('неможливо ідентифікувати')) {
            setScreen('not_found');
        } else {
            setError(errorMessage);
            setScreen('error');
        }
    }
  }, []);

  const handleReset = () => {
    setScreen('home');
    setImageDataUrl(null);
    setResult(null);
    setError(null);
    setLoadingMessage('');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'loading':
        return <Loader message={loadingMessage} />;
      case 'result':
        return result && imageDataUrl && <ResultScreen result={result} imageUrl={imageDataUrl} onReset={handleReset} />;
      case 'not_found':
        return <NotFoundScreen onReset={handleReset} />;
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 animate-fade-in">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Сталася помилка</h2>
            <p className="text-gray-700 max-w-md mb-8">{error}</p>
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              Спробувати ще
            </button>
          </div>
        );
      case 'home':
      default:
        return <HomeScreen onImageUpload={handleImageUpload} onTextSearch={handleTextSearch} />;
    }
  };

  return (
    <div className="min-h-screen text-gray-800 flex flex-col p-4 antialiased">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white/60 backdrop-blur-md rounded-2xl shadow-2xl shadow-blue-200/20 border border-white/50">
           <div className="p-2">
             <div className="bg-white/80 rounded-xl overflow-hidden">
                {renderScreen()}
             </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;
