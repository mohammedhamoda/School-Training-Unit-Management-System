import { useState } from 'react';
import { Lock } from 'lucide-react';
import './App.css';
import logoImg from './assets/logo.png';
import SplashScreen from './components/SplashScreen';
import SchoolDetails from './components/SchoolDetails';
import Employees from './components/Employees';
import AdminDetails from './components/AdminDetails';
import Programs from './components/Programs';
import Timeline from './components/Timeline';
import CareerImprovement from './components/CareerImprovement';
import Resources from './components/Resources';
import TrainingUnit from './components/TrainingUnit';
import LectureForming from './components/LectureForming';
import VideoLibrary from './components/VideoLibrary';
import Reports from './components/Reports';
function App() {
  const [showSplash, setShowSplash] = useState(true); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('school'); 

  const MASTER_PASSWORD = 'admin'; 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === MASTER_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى'); 
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 font-sans relative overflow-hidden" dir="rtl">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-md w-full z-10 animate-fade-up">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-white p-1 rounded-3xl shadow-xl shadow-blue-900/10 border border-slate-100 mb-4 overflow-hidden">
                <img src={logoImg} alt="Logo" className="w-full h-full object-contain rounded-2xl" />
            </div>
            <div className="text-center">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">مدرسة .....</h2>
                <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">وحدة التدريب والجودة</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-blue-900/10 p-10 border border-white/50 space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                    <Lock className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-extrabold text-slate-900">تسجيل الدخول</h3>
                    <p className="text-xs font-bold text-slate-400">يرجى إدخال كلمة المرور</p>
                </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all text-center text-xl font-bold tracking-[0.5em]"
                placeholder="••••••••"
                dir="ltr"
              />
              {error && <div className="text-red-600 text-sm font-bold text-center animate-shake">{error}</div>}
              <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-blue-600 transition-all active:scale-[0.97]">فتح النظام</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 3. The Main Dashboard (Shows after login)
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900" dir="rtl">
      
      {/* Crisp Enterprise Sidebar */}
      <div className="w-72 bg-white border-l border-slate-200 flex flex-col shadow-sm z-10 relative">
        
        {/* Logo Area */}
        <div className="p-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">

            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">نظام التدريب</h1>
          </div>
          <p className="text-slate-500 text-xs font-semibold">إدارة الجودة والتطوير المهني</p>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar">
          <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 mt-2">القائمة الرئيسية</p>

          {[
            { id: 'school', label: 'بيانات المدرسة' },
            { id: 'admin', label: 'مسئول الوحدة' },
            { id: 'employees', label: 'بيانات العاملين' },
            { id: 'unit', label: 'تشكيل وحدة التدريب' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-right px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                activeTab === item.id 
                ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm translate-x-1' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={`w-2 h-2 rounded-full transition-colors ${activeTab === item.id ? 'bg-blue-600' : 'bg-slate-300'}`} />
              {item.label}
            </button>
          ))}

          <div className="h-4"></div>
          <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 mt-4">الخطط والبرامج</p>

          {[
            { id: 'programs', label: 'الرؤية والبرامج' },
            { id: 'timeline', label: 'الخطة الزمنية' },
            { id: 'lectures', label: 'تشكيل المحاضرات' },
            { id: 'career', label: 'التنمية المهنية' },
            { id: 'resources', label: 'الموارد والأجهزة' },
            { id: 'videos', label: 'مكتبة الفيديو' }, // <-- الزر الجديد
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-right px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                activeTab === item.id 
                ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm translate-x-1' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={`w-2 h-2 rounded-full transition-colors ${activeTab === item.id ? 'bg-blue-600' : 'bg-slate-300'}`} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Action Bottom */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full text-center px-4 py-3 rounded-xl font-bold transition-all duration-200 mb-3 flex items-center justify-center gap-2 border ${
              activeTab === 'reports' 
              ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
            }`}
          >
            طباعة التقارير (PDF)
          </button>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="w-full text-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold text-sm"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-50">
        
        {/* Ultra-clean Header */}
        <header className="bg-white border-b border-slate-200 z-0 px-8 py-5 flex justify-between items-center shadow-sm">
          <h2 className="text-slate-800 font-bold text-xl flex items-center gap-2">
            {activeTab === 'school' && 'نظرة عامة على بيانات المدرسة'}
            {activeTab === 'admin' && 'إدارة مسئول وحدة التدريب'}
            {activeTab === 'employees' && 'إدارة الموارد البشرية'}
            {activeTab === 'unit' && 'هيكلة وحدة التدريب'}
            {activeTab === 'programs' && 'الرؤية والبرامج التدريبية'}
            {activeTab === 'timeline' && 'تخطيط الخطة الزمنية'}
            {activeTab === 'lectures' && 'إدارة وحضور المحاضرات'}
            {activeTab === 'career' && 'متابعة التنمية المهنية'}
            {activeTab === 'resources' && 'إدارة الموارد والأجهزة'}
            {activeTab === 'videos' && 'مكتبة الفيديو والملاحظات'} {/* <-- عنوان الصفحة في الشريط العلوي */}
            {activeTab === 'reports' && 'مركز تصدير المستندات'}
          </h2>

        </header>

        {/* Dynamic Component Rendering */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
            {activeTab === 'school' && <SchoolDetails />}
            {activeTab === 'employees' && <Employees />}
            {activeTab === 'admin' && <AdminDetails />}
            {activeTab === 'programs' && <Programs />}
            {activeTab === 'timeline' && <Timeline />}
            {activeTab === 'career' && <CareerImprovement />}
            {activeTab === 'resources' && <Resources />}
            {activeTab === 'unit' && <TrainingUnit />}
            {activeTab === 'lectures' && <LectureForming />}
            {activeTab === 'videos' && <VideoLibrary />} 
            {activeTab === 'reports' && <Reports />}
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default App;