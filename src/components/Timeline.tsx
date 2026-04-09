import { useState, useEffect } from 'react';
import { Calendar, Plus, Save, Trash2 } from 'lucide-react';
import { db, Program, TimelinePlan } from '../db';

const MONTHS = ['سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو'];

// Extend Partial<TimelinePlan> to include a stable UI key for React rendering
interface TimelineRow extends Partial<TimelinePlan> {
  _uiId: string;
}

export default function Timeline() {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [rows, setRows] = useState<TimelineRow[]>([]);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const loadPrograms = async () => {
      const allPrograms = await db.programs.toArray();
      setPrograms(allPrograms);
    };
    loadPrograms();
  }, []);

  useEffect(() => {
    const loadMonthData = async () => {
      const monthData = await db.timeline.where('month').equals(selectedMonth).toArray();
      
      if (monthData.length > 0) {
        // Attach a unique ID to existing database records for UI stability
        setRows(monthData.map(row => ({ ...row, _uiId: crypto.randomUUID() })));
      } else {
        // Generate 4 empty rows with unique IDs
        setRows(Array.from({ length: 4 }).map(() => ({
          _uiId: crypto.randomUUID(),
          programId: 0, 
          trainerName: '', 
          date: '', 
          day: '', 
          category: '', 
          isSuggested: false 
        })));
      }
    };
    loadMonthData();
  }, [selectedMonth]);

  const handleRowChange = (index: number, field: keyof TimelinePlan, value: any) => {
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    
    if (field === 'programId') {
      const selectedProgram = programs.find(p => p.id === Number(value));
      if (selectedProgram) {
        updatedRows[index].category = selectedProgram.category;
      }
    }
    
    setRows(updatedRows);
  };

  const handleAddRow = () => {
    setRows([
      ...rows, 
      { 
        _uiId: crypto.randomUUID(), 
        programId: 0, 
        trainerName: '', 
        date: '', 
        day: '', 
        category: '', 
        isSuggested: false 
      }
    ]);
  };

  const handleRemoveRow = (uiIdToRemove: string) => {
    // Filter by the unique UI ID rather than the index
    const updatedRows = rows.filter(row => row._uiId !== uiIdToRemove);
    setRows(updatedRows);
  };

  const handleSave = async () => {
    const currentMonthRecords = await db.timeline.where('month').equals(selectedMonth).toArray();
    
    for (const record of currentMonthRecords) {
        if(record.id) await db.timeline.delete(record.id);
    }

    const validRows = rows.filter(r => r.programId !== 0 || r.trainerName !== '');
    
    const rowsToSave = validRows.map(({ _uiId, ...row }) => ({
      ...row,
      month: selectedMonth
    })) as TimelinePlan[];

    await db.timeline.bulkAdd(rowsToSave);
    
    setSaveMessage(`تم حفظ خطة شهر ${selectedMonth} بنجاح!`);
    setTimeout(() => setSaveMessage(''), 3000);
    
    const refreshedData = await db.timeline.where('month').equals(selectedMonth).toArray();
    setRows(
      refreshedData.length > 0 
        ? refreshedData.map(row => ({ ...row, _uiId: crypto.randomUUID() })) 
        : rows
    ); 
  };

  const tableInputStyles = "w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-slate-50 focus:bg-white text-slate-800 font-medium transition-all shadow-sm";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      
      {/* Header & Month Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">الخطة الزمنية</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="font-bold text-slate-700">اختر الشهر:</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-slate-800 font-bold cursor-pointer shadow-sm min-w-[150px]"
          >
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Dynamic Table */}
      <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 font-bold min-w-[200px]">اسم البرنامج</th>
                <th className="px-4 py-4 font-bold min-w-[150px]">اسم المدرب</th>
                <th className="px-4 py-4 font-bold min-w-[150px]">التاريخ</th>
                <th className="px-4 py-4 font-bold min-w-[120px]">اليوم</th>
                <th className="px-4 py-4 font-bold min-w-[150px]">الفئة</th>
                <th className="px-4 py-4 font-bold text-center">مقترحة</th>
                <th className="px-2 py-4 font-bold text-center w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row, index) => (
                <tr key={row._uiId} className="hover:bg-blue-50/30 transition-colors group">
                  {/* 1. Program Dropdown */}
                  <td className="p-3">
                    <select 
                      value={row.programId || 0} 
                      onChange={(e) => handleRowChange(index, 'programId', Number(e.target.value))}
                      className={tableInputStyles}
                    >
                      <option value={0} disabled>اختر البرنامج...</option>
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                  
                  {/* 2. Trainer Name */}
                  <td className="p-3">
                    <input type="text" value={row.trainerName || ''} onChange={(e) => handleRowChange(index, 'trainerName', e.target.value)} className={tableInputStyles} placeholder="اسم المدرب" />
                  </td>
                  
                  {/* 3. Date */}
                  <td className="p-3">
                    <input type="date" value={row.date || ''} onChange={(e) => handleRowChange(index, 'date', e.target.value)} className={tableInputStyles} />
                  </td>

                  {/* 4. Day */}
                  <td className="p-3">
                    <input type="text" value={row.day || ''} onChange={(e) => handleRowChange(index, 'day', e.target.value)} className={tableInputStyles} placeholder="مثال: الأحد" />
                  </td>

                  {/* 5. Category */}
                  <td className="p-3">
                    <input type="text" value={row.category || ''} onChange={(e) => handleRowChange(index, 'category', e.target.value)} className={`${tableInputStyles} bg-slate-100`} placeholder="الفئة المستهدفة" />
                  </td>

                  {/* 6. Suggested Checkbox */}
                  <td className="p-3 text-center">
                    <input type="checkbox" checked={row.isSuggested || false} onChange={(e) => handleRowChange(index, 'isSuggested', e.target.checked)} className="w-5 h-5 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer transition-all" />
                  </td>

                  {/* Delete Row Button */}
                  <td className="p-3 text-center">
                    <button onClick={() => handleRemoveRow(row._uiId)} className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" title="حذف الصف">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
        <button onClick={handleAddRow} className="flex items-center justify-center gap-2 px-6 py-3 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl font-bold transition-all w-full sm:w-auto active:scale-[0.98]">
          <Plus className="w-5 h-5" />
          إضافة صف جديد
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {saveMessage && <span className="text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 w-full sm:w-auto text-center">{saveMessage}</span>}
          <button onClick={handleSave} className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm w-full sm:w-auto active:scale-[0.98]">
            <Save className="w-5 h-5" />
            حفظ خطة الشهر
          </button>
        </div>
      </div>

    </div>
  );
}