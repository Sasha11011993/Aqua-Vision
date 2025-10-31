
import React, { useCallback, useState } from 'react';
import { UploadIcon, CameraIcon } from './icons';

interface HomeScreenProps {
  onImageUpload: (file: File) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
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
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-16" onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Розпізнайте мешканця акваріума</h2>
        <p className="text-lg text-gray-600 mb-10 max-w-xl">Завантажте або зробіть фотографію риби чи рослини, щоб отримати повний звіт про догляд та сумісність.</p>
        
        <div 
          className={`w-full max-w-lg border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50/70'}`}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-blue-500"><UploadIcon /></div>
            <p className="text-gray-600 font-semibold">{isDragging ? "Відпустіть файл для завантаження" : "Перетягніть зображення сюди"}</p>
            <p className="text-gray-500">або</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <label className="flex-1 cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center justify-center gap-3 font-semibold">
                <span>Обрати файл</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>

              <label className="flex-1 cursor-pointer px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all transform hover:scale-105 flex items-center justify-center gap-3 font-semibold">
                <CameraIcon />
                <span>Зробити фото</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>
        </div>

        <p className="mt-8 text-sm text-gray-500">Для найкращого результату фото має бути чітким та у фокусі.</p>
    </div>
  );
};