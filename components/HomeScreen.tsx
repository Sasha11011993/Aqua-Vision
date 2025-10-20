
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center" onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}>
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">Aqua Vision</h1>
        <p className="text-lg text-gray-600 mb-8">Ваш експертний гід у світі акваріумістики. Розпізнайте будь-яку рибу чи рослину за фото.</p>
        
        <div className={`border-dashed rounded-xl p-8 md:p-12 transition-all duration-300 ease-in-out transform ${isDragging ? 'border-blue-500 bg-blue-100/80 border-4 scale-105 shadow-xl' : 'border-gray-300 bg-white/50 border-2'}`}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <label className="flex-1 w-full cursor-pointer px-6 py-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center justify-center gap-3">
              <UploadIcon />
              <span>Завантажити фото</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            
            <span className="text-gray-500 font-medium">або</span>

            <label className="flex-1 w-full cursor-pointer px-6 py-4 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all transform hover:scale-105 flex items-center justify-center gap-3">
              <CameraIcon />
              <span>Зробити фото</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            {isDragging ? "Відпустіть файл для завантаження" : "Або просто перетягніть зображення сюди"}
          </p>
        </div>

        <p className="mt-8 text-xs text-gray-400">Для найкращого результату зробіть чітке фото об'єкта у фокусі.</p>
      </div>
    </div>
  );
};