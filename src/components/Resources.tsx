import { useState, useEffect } from 'react';
import { Monitor, Plus, Save, Trash2 } from 'lucide-react';
import { db, Resource } from '../db';

export default function Resources() {
  const [rows, setRows] = useState<Partial<Resource>[]>([]);
  const [saveMessage, setSaveMessage] = useState('');

  const loadData = async () => {
    const data = await db.resources.toArray();
    if (data.length > 0) {
      setRows(data);
    } else {
      setRows([
        { deviceName: '', type: '', quantity: 1, room: '' },
        { deviceName: '', type: '', quantity: 1, room: '' },
        { deviceName: '', type: '', quantity: 1, room: '' }
      ]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRowChange = (index: number, field: keyof Resource, value: any) => {
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setRows(updatedRows);
  };

  const handleAddRow = () => {
    setRows([...rows, { deviceName: '', type: '', quantity: 1, room: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  const handleSave = async () => {
    await db.resources.clear();
    
    const validRows = rows.filter(r => r.deviceName && r.deviceName.trim() !== '') as Resource[];
    
    await db.resources.bulkAdd(validRows);
    
    setSaveMessage('تم حفظ الموارد والأجهزة بنجاح!');
    setTimeout(() => setSaveMessage(''), 3000);
    loadData(); 
  };

  const inputStyles = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 font-medium";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
          <Monitor className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">الموارد والأجهزة</h2>
      </div>
      
      <p className="text-slate-500 font-medium mb-8">
        قم بإدراج الأجهزة والموارد المتاحة في حجرات التدريب المختلفة.
      </p>

      {/* Dynamic Table */}
      <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">اسم الجهاز</th>
                <th className="px-6 py-4 font-bold w-1/4">النوع</th>
                <th className="px-6 py-4 font-bold w-32">العدد</th>
                <th className="px-6 py-4 font-bold w-1/4">الحجرة</th>
                <th className="px-6 py-4 font-bold text-center w-16">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-3">
                    <input 
                      type="text" 
                      value={row.deviceName || ''} 
                      onChange={(e) => handleRowChange(index, 'deviceName', e.target.value)} 
                      className={inputStyles} 
                      placeholder="مثال: داتا شو، كمبيوتر..." 
                    />
                  </td>
                  <td className="p-3">
                    <input 
                      type="text" 
                      value={row.type || ''} 
                      onChange={(e) => handleRowChange(index, 'type', e.target.value)} 
                      className={inputStyles} 
                    />
                  </td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      min="1"
                      value={row.quantity || ''} 
                      onChange={(e) => handleRowChange(index, 'quantity', Number(e.target.value))} 
                      className={inputStyles} 
                    />
                  </td>
                  <td className="p-3">
                    <input 
                      type="text" 
                      value={row.room || ''} 
                      onChange={(e) => handleRowChange(index, 'room', e.target.value)} 
                      className={inputStyles} 
                      placeholder="مكان تواجد الجهاز" 
                    />
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleRemoveRow(index)} className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" title="حذف الصف">
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
        <button onClick={handleAddRow} className="flex items-center justify-center gap-2 px-6 py-3 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl font-bold transition-all w-full sm:w-auto active:scale-[0.98]">
          <Plus className="w-5 h-5" />
          إضافة صف جديد
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {saveMessage && <span className="text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 w-full sm:w-auto text-center">{saveMessage}</span>}
          <button onClick={handleSave} className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm w-full sm:w-auto active:scale-[0.98]">
            <Save className="w-5 h-5" />
            حفظ الموارد
          </button>
        </div>
      </div>

    </div>
  );
}