import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import logoImg from '../assets/logo.png'; 

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showCredits, setShowCredits] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCredits(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    setIsFadingOut(true); 
    setTimeout(() => {
      onComplete(); 
    }, 600);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 transition-opacity duration-700 overflow-hidden ${isFadingOut ? 'opacity-0' : 'opacity-100'} p-4`} 
      dir="rtl">

      <div className="w-full max-w-2xl h-full max-h-[900px] flex flex-col items-center justify-center">
        <div 
          className={`relative flex items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] animate-logo-initial flex-shrink-0 ${
            showCredits 
              ? 'w-24 h-24 sm:w-32 sm:h-32 mb-4 sm:mb-6' 
              : 'w-48 h-48 sm:w-64 sm:h-64 mb-0'
          }`}
        >
          <div className="absolute inset-0 bg-blue-500 blur-[40px] opacity-15 rounded-full scale-75"></div>
          <img 
            src={logoImg} 
            alt="شعار المدرسة" 
            className="w-full h-full object-contain relative z-10 drop-shadow-xl" 
          />
        </div>

        <div 
          className={`w-full flex flex-col items-center transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
            showCredits ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          
          <div className="text-center space-y-1 animate-fade-up flex-shrink-0" style={{ animationDelay: '0.4s' }}>
            <p className="text-sm sm:text-base font-bold text-slate-600">محافظة .....</p>
            <p className="text-lg sm:text-xl font-extrabold text-slate-800">ادارة ..... التعليمه</p>
          </div>

          <div className="text-center space-y-2 mt-3 sm:mt-5 animate-fade-up flex-shrink-0" style={{ animationDelay: '0.6s' }}>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">مدرسة .....</h1>
            <div className="inline-block mt-1 sm:mt-2">
              <p className="text-base sm:text-lg font-extrabold text-blue-700 bg-blue-50 px-6 py-1.5 sm:py-2 rounded-full border border-blue-100 shadow-sm">
                وحدة التدريب والجوده
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full mt-6 sm:mt-8 animate-fade-up flex-shrink-0" style={{ animationDelay: '0.8s' }}>
            
            <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center text-center hover:border-blue-300 transition-all">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 mb-1">مدير عام الادارة</span>
              <span className="text-sm sm:text-lg font-extrabold text-slate-800 line-clamp-1">أ/ .......... </span>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center text-center hover:border-blue-300 transition-all">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 mb-1">وكيل عام الادارة</span>
              <span className="text-sm sm:text-lg font-extrabold text-slate-800 line-clamp-1">أ/ ..........</span>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center text-center hover:border-blue-300 transition-all">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 mb-1">مدير المدرسه</span>
              <span className="text-sm sm:text-lg font-extrabold text-slate-800 line-clamp-1">أ/ .......... </span>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center text-center hover:border-blue-300 transition-all">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 mb-1">وكيل المدرسة</span>
              <span className="text-sm sm:text-lg font-extrabold text-slate-800 line-clamp-1">أ/ .......... </span>
            </div>

          </div>

          <div className="mt-8 sm:mt-10 mb-4 animate-fade-up flex-shrink-0" style={{ animationDelay: '1.2s' }}>
            <button 
              onClick={handleStart} 
              className="flex items-center justify-center gap-3 px-8 sm:px-10 py-3 sm:py-4 bg-blue-600 text-white font-bold text-lg sm:text-xl rounded-2xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 w-full sm:w-auto"
            >
              <span>الدخول للنظام</span>
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}