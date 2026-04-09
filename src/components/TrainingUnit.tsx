import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { db, Employee } from '../db';

export default function TrainingUnit() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const loadEmployees = async () => {
    const allEmployees = await db.employees.toArray();
    setEmployees(allEmployees);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleRoleChange = async (id: number | undefined, newRole: any) => {
    if (!id) return;
    await db.employees.update(id, { unitRole: newRole });
    setEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, unitRole: newRole } : emp
    ));
  };

  const selectStyles = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 font-medium cursor-pointer shadow-sm";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">تشكيل وحدة التدريب</h2>
      </div>
      
      <p className="text-slate-500 font-medium mb-8">
        قم بتحديد دور كل موظف داخل وحدة التدريب (رئيس الوحدة، مسئول الوحدة، أو عضو). سيتم حفظ التغييرات تلقائياً.
      </p>

      <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">اسم المعلم</th>
                <th className="px-6 py-4 font-bold">التخصص</th>
                <th className="px-6 py-4 font-bold w-1/3">الدور في الوحدة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">
                    لم يتم إضافة موظفين بعد. يرجى إضافتهم من قسم "بيانات العاملين"
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">{emp.name}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{emp.specialization}</td>
                    <td className="p-3">
                      <select 
                        value={emp.unitRole || ''} 
                        onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                        className={selectStyles}
                      >
                        <option value="">غير محدد (ليس في الوحدة)</option>
                        <option value="رئيس الوحدة">رئيس الوحدة</option>
                        <option value="مسئول الوحدة">مسئول الوحدة</option>
                        <option value="عضو">عضو</option>
                      </select>
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