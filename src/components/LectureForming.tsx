import { useState, useEffect } from 'react';
import { ClipboardList, Save } from 'lucide-react';
import { db, Employee, TimelinePlan, Program } from '../db';

const MONTHS = ['سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو'];

export default function LectureForming() {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0]);
  const [timelinePlans, setTimelinePlans] = useState<TimelinePlan[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedTimelineId, setSelectedTimelineId] = useState<number>(0);
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignedIds, setAssignedIds] = useState<number[]>([]);
  const [assignmentRecordId, setAssignmentRecordId] = useState<number | undefined>(undefined);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const loadBaseData = async () => {
      setEmployees(await db.employees.toArray());
      setPrograms(await db.programs.toArray());
    };
    loadBaseData();
  }, []);

  useEffect(() => {
    const loadTimeline = async () => {
      const plans = await db.timeline.where('month').equals(selectedMonth).toArray();
      setTimelinePlans(plans);
      
      if (plans.length > 0 && plans[0].id) {
        setSelectedTimelineId(plans[0].id);
      } else {
        setSelectedTimelineId(0);
        setAssignedIds([]);
        setAssignmentRecordId(undefined);
      }
    };
    loadTimeline();
  }, [selectedMonth]);

  useEffect(() => {
    const loadAssignments = async () => {
      if (selectedTimelineId === 0) return;
      
      const assignment = await db.lectureAssignments.where('timelineId').equals(selectedTimelineId).first();
        
      if (assignment) {
        setAssignedIds(assignment.employeeIds || []);
        setAssignmentRecordId(assignment.id);
      } else {
        setAssignedIds([]);
        setAssignmentRecordId(undefined);
      }
    };
    loadAssignments();
  }, [selectedTimelineId]);

  const getProgramName = (programId: number) => {
    const prog = programs.find(p => p.id === programId);
    return prog ? prog.name : 'برنامج غير معروف';
  };

  const handleToggleEmployee = (employeeId: number | undefined) => {
    if (!employeeId) return;
    
    setAssignedIds(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId) 
        : [...prev, employeeId]
    );
  };


  const handleSave = async () => {
    if (selectedTimelineId === 0) return;

    const record = {
      id: assignmentRecordId,
      timelineId: selectedTimelineId,
      employeeIds: assignedIds
    };

    const savedId = await db.lectureAssignments.put(record);
    setAssignmentRecordId(savedId);
    
    setSaveMessage('تم حفظ الموظفين المعينين للمحاضرة بنجاح!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const selectStyles = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-slate-800 font-medium cursor-pointer shadow-sm";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
          <ClipboardList className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">تشكيل المحاضرات</h2>
      </div>

      {/* Top Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">اختر الشهر:</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={selectStyles}
          >
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">اختر المحاضرة (بناءً على خطة الشهر):</label>
          <select 
            value={selectedTimelineId} 
            onChange={(e) => setSelectedTimelineId(Number(e.target.value))}
            className={selectStyles}
            disabled={timelinePlans.length === 0}
          >
            {timelinePlans.length === 0 ? (
              <option value={0}>لا توجد محاضرات في هذا الشهر</option>
            ) : (
              timelinePlans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {getProgramName(plan.programId)} - {plan.date || 'بدون تاريخ'}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Employee Selection Table */}
      {selectedTimelineId > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-slate-500 font-medium mb-6">حدد الموظفين المطلوب حضورهم لهذه المحاضرة:</p>
          
          <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm mb-8">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold w-24 text-center">تعيين</th>
                  <th className="px-6 py-4 font-bold">اسم المعلم</th>
                  <th className="px-6 py-4 font-bold">التخصص</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">لا يوجد موظفين مسجلين</td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr 
                      key={emp.id} 
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                      onClick={() => handleToggleEmployee(emp.id)}
                    >
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <input 
                            type="checkbox" 
                            checked={emp.id ? assignedIds.includes(emp.id) : false} 
                            readOnly 
                            className="w-5 h-5 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer transition-all" 
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{emp.name}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{emp.specialization}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-4 border-t border-slate-100 pt-6 mt-4">
            <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-[0.98]">
              <Save className="w-5 h-5" />
              حفظ قائمة الحضور
            </button>
            {saveMessage && <span className="text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">{saveMessage}</span>}
          </div>
        </div>
      )}

    </div>
  );
}