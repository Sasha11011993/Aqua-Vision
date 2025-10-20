
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-600">Розпізнаємо об'єкт...</p>
      <p className="mt-2 text-sm text-gray-400">Це може зайняти кілька секунд.</p>
    </div>
  );
};
