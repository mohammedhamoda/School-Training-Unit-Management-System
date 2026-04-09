import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { db, Employee } from '../db';

export default function CareerImprovement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const loadEmployees = async () => {
    const allEmployees = await db.employees.toArray();
    setEmployees(allEmployees);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleToggle = async (id: number | undefined, currentValue: boolean | undefined) => {
    if (!id) return;
    
    const newValue = !currentValue;
    await db.employees.update(id, { needsCareerImprovement: newValue });

    setEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, needsCareerImprovement: newValue } : emp
    ));
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
          <TrendingUp className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">التنمية المهنية</h2>
      </div>
      
      <p className="text-slate-500 font-medium mb-8">
        قم بتحديد الموظفين المرشحين لبرامج التنمية المهنية والتحسين الوظيفي. سيتم حفظ التغييرات تلقائياً.
      </p>

      <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold w-24 text-center">تحديد</th>
              <th className="px-6 py-4 font-bold">اسم المعلم</th>
              <th className="px-6 py-4 font-bold">التخصص</th>
              <th className="px-6 py-4 font-bold">وظيفة الكادر</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">
                  لم يتم إضافة موظفين بعد. يرجى إضافتهم من قسم "بيانات العاملين"
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr 
                  key={emp.id} 
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group" 
                  onClick={() => handleToggle(emp.id, emp.needsCareerImprovement)}
                >
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <input 
                        type="checkbox" 
                        checked={emp.needsCareerImprovement || false} 
                        readOnly 
                        className="w-5 h-5 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer transition-all" 
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{emp.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{emp.specialization}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{emp.cadreJob}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}