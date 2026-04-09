import { useState, useEffect } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { db, Employee } from '../db';

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<Employee>({
    name: '', qualification: '', nationalId: '', hireDate: '',
    cadreJob: '', financialDegree: '', degreeDate: '',
    address: '', phone: '', specialization: ''
  });

  const loadEmployees = async () => {
    const allEmployees = await db.employees.toArray();
    setEmployees(allEmployees);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return; 
    
    await db.employees.add(formData);
    
    setFormData({
      name: '', qualification: '', nationalId: '', hireDate: '',
      cadreJob: '', financialDegree: '', degreeDate: '',
      address: '', phone: '', specialization: ''
    });
    loadEmployees();
  };

  const handleDelete = async (id?: number) => {
    if (id) {
      await db.employees.delete(id);
      loadEmployees();
    }
  };

  const inputStyles = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 font-medium";
  const labelStyles = "block text-sm font-bold text-slate-700 mb-2";

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">إضافة موظف جديد</h2>
        </div>
        
        <form onSubmit={handleAddEmployee} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className={labelStyles}>اسم المعلم</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>المؤهل الدراسي</label>
              <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>التخصص</label>
              <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>الرقم القومي</label>
              <input type="text" name="nationalId" value={formData.nationalId} onChange={handleChange} className={`${inputStyles} text-left`} dir="ltr" />
            </div>
            <div>
              <label className={labelStyles}>تاريخ التعيين</label>
              <input type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>وظيفة الكادر</label>
              <input type="text" name="cadreJob" value={formData.cadreJob} onChange={handleChange} className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>الدرجة المالية</label>
              <input type="text" name="financialDegree" value={formData.financialDegree} onChange={handleChange} className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>تاريخ الدرجة</label>
              <input type="date" name="degreeDate" value={formData.degreeDate} onChange={handleChange} className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>رقم التليفون</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={`${inputStyles} text-left`} dir="ltr" />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className={labelStyles}>العنوان</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputStyles} />
            </div>
          </div>
          <div className="pt-4 mt-6 border-t border-slate-100">
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-[0.98]">
              إضافة الموظف
            </button>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">الاسم</th>
                <th className="px-6 py-4 font-bold">التخصص</th>
                <th className="px-6 py-4 font-bold">الرقم القومي</th>
                <th className="px-6 py-4 font-bold">وظيفة الكادر</th>
                <th className="px-6 py-4 font-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">لا يوجد موظفين مضافين حتى الآن</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{emp.name}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{emp.specialization}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium" dir="ltr">{emp.nationalId}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{emp.cadreJob}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDelete(emp.id)} className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" title="حذف الموظف">
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