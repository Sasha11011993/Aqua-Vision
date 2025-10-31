
import React, { useCallback, useState } from 'react';
import { UploadIcon, CameraIcon } from './icons';

interface HomeScreenProps {
  onImageUpload: (file: File, description: string) => void;
  onTextSearch: (description: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onImageUpload, onTextSearch }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [description, setDescription] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0], description);
    }
  };
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0], description);
    }
  }, [onImageUpload, description]);

  const handleTextSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (description.trim()) {
        onTextSearch(description);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12" onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Розпізнайте мешканця акваріума</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-xl">Введіть опис або завантажте фотографію, щоб отримати повний звіт про догляд та сумісність.</p>
        
        <div className="w-full max-w-lg mb-4">
            <label htmlFor="description" className="sr-only">
                Назва або опис
            </label>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && description.trim()) { onTextSearch(description)}}}
                    placeholder="Наприклад, 'неонова тетра' або 'червона рибка з вуалевим хвостом'"
                    className="flex-grow w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/70"
                />
                <button 
                    onClick={handleTextSearch}
                    disabled={!description.trim()}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed disabled:scale-100">
                    Знайти
                </button>
            </div>
        </div>

        <div className="flex items-center w-full max-w-lg my-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-500 font-medium">АБО</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div 
          className={`w-full max-w-lg border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50/70'}`}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-blue-500"><UploadIcon /></div>
            <p className="text-gray-600 font-semibold">{isDragging ? "Відпустіть файл для завантаження" : "Перетягніть зображення сюди"}</p>
            <p className="text-gray-500">для розпізнавання по фото</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full pt-2">
              <label className="flex-1 cursor-pointer px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center gap-3 font-semibold">
                <span>Обрати файл</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>

              <label className="flex-1 cursor-pointer px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center gap-3 font-semibold">
                <CameraIcon />
                <span>Зробити фото</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>
        </div>

        <p className="mt-8 text-sm text-gray-500 max-w-lg">При завантаженні фото, введений вище опис буде використаний для уточнення результату.</p>
    </div>
  );
};
