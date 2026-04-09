import { useState, useEffect } from 'react';
import { Target, BookOpen, Trash2 } from 'lucide-react';
import { db, Program } from '../db';

export default function Programs() {
  const [vision, setVision] = useState('');
  const [visionMessage, setVisionMessage] = useState('');

  const [programs, setPrograms] = useState<Program[]>([]);
  const [programForm, setProgramForm] = useState<Program>({ name: '', category: '' });

  const loadData = async () => {
    const settings = await db.settings.get(1);
    if (settings && settings.visionText) {
      setVision(settings.visionText);
    }
    const allPrograms = await db.programs.toArray();
    setPrograms(allPrograms);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveVision = async () => {
    const existing = await db.settings.get(1);
    await db.settings.put({ 
      ...existing, 
      id: 1, 
      visionText: vision, 
      masterPassword: existing?.masterPassword || 'admin' 
    });
    setVisionMessage('تم حفظ الرؤية بنجاح!');
    setTimeout(() => setVisionMessage(''), 3000);
  };

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.name) return;
    
    await db.programs.add(programForm);
    setProgramForm({ name: '', category: '' });
    loadData();
  };

  const handleDeleteProgram = async (id?: number) => {
    if (id) {
      await db.programs.delete(id);
      loadData();
    }
  };

  const inputStyles = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 font-medium";

  return (
    <div className="space-y-8">
      
      {/* 1. The Vision Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">رؤية المنشأة</h2>
        </div>
        <textarea
          value={vision}
          onChange={(e) => setVision(e.target.value)}
          placeholder="اكتب رؤية المنشأة هنا..."
          className={`${inputStyles} min-h-[120px] resize-y`}
        />
        <div className="flex items-center gap-4 mt-6">
          <button onClick={handleSaveVision} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-[0.98]">
            حفظ الرؤية
          </button>
          {visionMessage && <span className="text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">{visionMessage}</span>}
        </div>
      </div>

      {/* 2. Suggested Programs Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">البرامج التدريبية المقترحة</h2>
        </div>

        {/* Add Form */}
        <form onSubmit={handleAddProgram} className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input 
              required 
              type="text" 
              name="name" 
              placeholder="اسم البرنامج" 
              value={programForm.name} 
              onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })} 
              className={inputStyles} 
            />
          </div>
          <div className="flex-1">
            <input 
              type="text" 
              name="category" 
              placeholder="الفئة الخاصة بها (مثال: المعلمين، الإداريين)" 
              value={programForm.category} 
              onChange={(e) => setProgramForm({ ...programForm, category: e.target.value })} 
              className={inputStyles} 
            />
          </div>
          <button type="submit" className="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all shadow-sm active:scale-[0.98] whitespace-nowrap">
            إضافة للجدول
          </button>
        </form>

        {/* Display Table */}
        <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">اسم البرنامج التدريبي</th>
                <th className="px-6 py-4 font-bold">الفئة الخاصة بها</th>
                <th className="px-6 py-4 font-bold w-24 text-center">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {programs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">لم يتم إضافة برامج تدريبية بعد</td>
                </tr>
              ) : (
                programs.map((prog) => (
                  <tr key={prog.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{prog.name}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{prog.category}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDeleteProgram(prog.id)} className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" title="حذف البرنامج">
                        <Trash2 className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}