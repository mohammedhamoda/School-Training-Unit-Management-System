import { useState, useEffect } from 'react';
import { db, SchoolDetails as SchoolDetailsType } from '../db';
import { Building } from 'lucide-react'; // Added this import for the new header icon

export default function SchoolDetails() {
  const [formData, setFormData] = useState<SchoolDetailsType>({
    managementName: '', schoolName: '', statisticalNumber: '',
    affiliation: '', buildingOwnership: '', email: '',
    phone: '', schoolCommunity: '', stage: '',
    periods: '', address: '', website: '',
    girlsCount: 0, boysCount: 0
  });

  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const data = await db.schoolDetails.get(1);
      if (data) setFormData(data);
    };
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.schoolDetails.put({ ...formData, id: 1 }); // ID 1 ensures we only ever have one record
      setSaveMessage('تم حفظ البيانات بنجاح!');
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
          <Building className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">بيانات المدرسة</h2>
      </div>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <label className={labelStyles}>اسم الإدارة</label>
            <input type="text" name="managementName" value={formData.managementName} onChange={handleChange} className={inputStyles} />
          </div>

          <div>
            <label className={labelStyles}>اسم المدرسة</label>
            <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} className={inputStyles} />
          </div>

          <div>
            <label className={labelStyles}>الرقم الإحصائي</label>
            <input type="text" name="statisticalNumber" value={formData.statisticalNumber} onChange={handleChange} className={inputStyles} />
          </div>

          <div>
            <label className={labelStyles}>التبعية</label>
            <input type="text" name="affiliation" value={formData.affiliation} onChange={handleChange} className={inputStyles} />
          </div>

          <div>
            <label className={labelStyles}>ملكية المبنى</label>
            <input type="text" name="buildingOwnership" value={formData.buildingOwnership} onChange={handleChange} className={inputStyles} />
          </div>

          <div>
            <label className={labelStyles}>البريد الإلكتروني</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={`${inputStyles} text-left`} dir="ltr" />
          </div>

          <div>
            <label className={labelStyles}>تليفون المدرسة</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={`${inputStyles} text-left`} dir="ltr" />
          </div>

          <div>
            <label className={labelStyles}>مجتمع المدرسة</label>
            <input type="text" name="schoolCommunity" value={formData.schoolCommunity} onChange={handleChange} className={inputStyles} />
          </div>

          <div>
            <label className={labelStyles}>المرحلة</label>
            <input type="text" name="stage" value={formData.stage} onChange={handleChange} className={inputStyles} />
          </div>

          <div>
            <label className={labelStyles}>الفترات</label>
            <input type="text" name="periods" value={formData.periods} onChange={handleChange} className={inputStyles} />
          </div>

          <div className="md:col-span-2">
            <label className={labelStyles}>العنوان</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputStyles} />
          </div>

          <div className="md:col-span-2">
            <label className={labelStyles}>الموقع الإلكتروني</label>
            <input type="text" name="website" value={formData.website} onChange={handleChange} className={`${inputStyles} text-left`} dir="ltr" />
          </div>

          <div>
            <label className={labelStyles}>عدد البنات</label>
            <input type="number" name="girlsCount" value={formData.girlsCount} onChange={handleChange} className={inputStyles} />
          </div>

          <div>
            <label className={labelStyles}>عدد البنين</label>
            <input type="number" name="boysCount" value={formData.boysCount} onChange={handleChange} className={inputStyles} />
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