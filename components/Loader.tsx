
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-16 md:p-24 min-h-[400px]">
       <div className="relative w-24 h-24">
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bubble" style={{animationDelay: '0s'}}></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bubble" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bubble" style={{animationDelay: '0.4s'}}></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bubble" style={{animationDelay: '0.6s'}}></div>
            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bubble" style={{animationDelay: '0.8s'}}></div>
         </div>
         <svg className="w-24 h-24 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.043 5.928c.456-.412 1.12-.628 1.766-.628 1.43 0 2.589 1.49 2.589 3.333 0 .75-.205 1.454-.582 2.068M12 21c-3.314 0-6-2.239-6-5s2.686-5 6-5 6 2.239 6 5-2.686 5-6 5zm0 0v-5m0 5c-3.314 0-6-2.239-6-5s2.686-5 6-5m-6 5h12m-6 5c3.314 0 6-2.239 6-5s-2.686-5-6-5"></path></svg>
       </div>
      <p className="mt-8 text-xl font-semibold text-gray-700">Розпізнаємо об'єкт...</p>
      <p className="mt-2 text-gray-500">Це може зайняти кілька секунд.</p>
      <style>{`
        @keyframes bubble {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { opacity: 0.7; }
          100% { transform: translateY(-40px) scale(0); opacity: 0; }
        }
        .animate-bubble {
          animation: bubble 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};