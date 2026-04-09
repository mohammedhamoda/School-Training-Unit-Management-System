import { useState, useEffect } from 'react';
import { db, AdminDetails as AdminDetailsType } from '../db';
import { UserCheck } from 'lucide-react';

export default function AdminDetails() {
  const [formData, setFormData] = useState<AdminDetailsType>({
    management: '', school: '', principal: '', unitManager: '',
    qualification: '', cadreJob: '', phone: '', unitStartDate: '', currentYear: ''
  });

  const [saveMessage, setSaveMessage] = useState('');

  // Load existing data
  useEffect(() => {
    const loadData = async () => {
      const data = await db.adminDetails.get(1);
      if (data) setFormData(data);
    };
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.adminDetails.put({ ...formData, id: 1 });
      setSaveMessage('تم حفظ بيانات مسئول الوحدة بنجاح!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('حدث خطأ أثناء الحفظ');
    }
  };

  const inputStyles = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 font-medium";
  const labelStyles = "block text-sm font-bold text-slate-700 mb-2";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
          <UserCheck className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">بيانات مسئول وحدة التدريب</h2>
      </div>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <label className={labelStyles}>الإدارة</label>
            <input type="text" name="management" value={formData.management} onChange={handleChange} className={inputStyles} />
          </div>

          <div>
            <label className={labelStyles}>المدرسة</label>
            <input type="text" name="school" value={formData.school} onChange={handleChange} className={inputStyles} />
          </div>

          <div>
            <label className={labelStyles}>مدير المدرسة</label>
            <input type="text" name="principal" value={formData.principal} onChange={handleChange} className={inputStyles} />
          </div>

          <div>
            <label className={labelStyles}>مسئول وحدة التدريب</label>
            <input type="text" name="unitManager" value={formData.unitManager} onChange={handleChange} className={inputStyles} />
          </div>

          <div>
            <label className={labelStyles}>المؤهل الدراسي</label>
            <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} className={inputStyles} />
          </div>

          <div>
            <label className={labelStyles}>الوظيفة على الكادر</label>
            <input type="text" name="cadreJob" value={formData.cadreJob} onChange={handleChange} className={inputStyles} />
          </div>

          <div>
            <label className={labelStyles}>التليفون</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={`${inputStyles} text-left`} dir="ltr" />
          </div>

          <div>
            <label className={labelStyles}>بداية وحدة التدريب (تاريخ)</label>
            <input type="date" name="unitStartDate" value={formData.unitStartDate} onChange={handleChange} className={inputStyles} />
          </div>

          <div className="md:col-span-2">
            <label className={labelStyles}>العام الحالي</label>
            <input type="text" name="currentYear" placeholder="مثال: 2025/2026" value={formData.currentYear} onChange={handleChange} className={inputStyles} />
          </div>

        </div>

        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
          <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-[0.98]">
            حفظ البيانات
          </button>
          {saveMessage && <span className="text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">{saveMessage}</span>}
        </div>
      </form>
    </div>
  );
}