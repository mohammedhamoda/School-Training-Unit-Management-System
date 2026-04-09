import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, FileText, Upload, Trash2, Plus, X, CheckCircle, FileUp, Calendar, Users, Target, Building2, TrendingUp, BookOpen } from 'lucide-react';
import { db, SchoolDetails, Employee, TimelinePlan, Program, AdminDetails, CustomPDF } from '../db';
import { writeFile } from "@tauri-apps/plugin-fs";
import { openPath } from "@tauri-apps/plugin-opener";
import { tempDir, join, BaseDirectory } from '@tauri-apps/api/path';

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
    __TAURI__?: unknown;
  }
}

interface DynamicReport {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
}

interface RenderSection {
  name: string;
  isStandard: boolean;
  pdf?: CustomPDF;
}

const STANDARD_SECTIONS: string[] = [
  'أهداف الوحدة',
  'تقرير المدرب',
  'التقرير الشهري',
  'برامج مقترحة',
  'بعثات خارجية',
  'سجل التحفيز',
  'سجل النشرات',
  'الفهرس'
];

const DYNAMIC_REPORTS: DynamicReport[] = [
  { id: 'school', title: 'صحيفة بيانات المدرسة', desc: 'البيانات الأساسية وإحصاءات الطلاب', icon: Building2 },
  { id: 'admin', title: 'بيانات مسئول التدريب', desc: 'بيانات التكليف ومدير المدرسة', icon: FileText },
  { id: 'vision', title: 'رؤية ورسالة المنشأة', desc: 'الرؤية المعتمدة للطباعة كواجهة', icon: Target },
  { id: 'employees', title: 'كشف بيانات العاملين', desc: 'قاعدة بيانات جميع الموظفين', icon: Users },
  { id: 'career', title: 'المستهدفون بالتنمية المهنية', desc: 'كشف المعلمين المستهدفين للتدريب', icon: TrendingUp },
  { id: 'programs', title: 'البرامج التدريبية المقترحة', desc: 'بيان البرامج والفئات المستهدفة', icon: BookOpen },
  { id: 'timeline', title: 'الخطة الزمنية الشاملة', desc: 'جدول توزيع التدريبات على الأشهر', icon: Calendar },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'dynamic' | 'external'>('dynamic');
  const [reportType, setReportType] = useState<string>('school');
  const [schoolData, setSchoolData] = useState<SchoolDetails | undefined>();
  const [adminData, setAdminData] = useState<AdminDetails | undefined>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [timeline, setTimeline] = useState<TimelinePlan[]>([]);
  const [visionText, setVisionText] = useState<string>('');
  const [customPdfs, setCustomPdfs] = useState<CustomPDF[]>([]); 
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  const componentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadSection, setActiveUploadSection] = useState<string | null>(null);
  const [showNewSectionModal, setShowNewSectionModal] = useState<boolean>(false);
  const [newSectionName, setNewSectionName] = useState<string>('');
  const [newSectionFile, setNewSectionFile] = useState<File | null>(null);

  useEffect(() => {
    const storedHidden = localStorage.getItem('hidden_sections');
    if (storedHidden) {
      try { setHiddenSections(JSON.parse(storedHidden) as string[]); } catch(e: unknown) {}
    }
    loadAllData();
  }, []);

  const loadAllData = async (): Promise<void> => {
    setSchoolData(await db.schoolDetails.get(1));
    setAdminData(await db.adminDetails.get(1));
    setEmployees(await db.employees.toArray());
    setPrograms(await db.programs.toArray());
    setTimeline(await db.timeline.toArray());
    
    if (db.customPdfs) {
      setCustomPdfs(await db.customPdfs.toArray());
    }
    
    // Using explicit typing cast since db.settings typings aren't visible in imports here.
    const settings = await (db as unknown as { settings: { get: (id: number) => Promise<{ visionText?: string } | undefined> } }).settings.get(1);
    if (settings && settings.visionText) {
      setVisionText(settings.visionText);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `تقرير_الجودة`,
  });

  const printDynamicReport = (type: string): void => {
    setReportType(type);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const getProgramName = (id: number): string => {
    const prog = programs.find(p => p.id === id);
    return prog ? prog.name : '';
  };

  const triggerUploadForSection = (sectionName: string): void => {
    setActiveUploadSection(sectionName);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadSection) return;
    
    if (file.type !== 'application/pdf') {
      alert('يرجى اختيار ملف بصيغة PDF فقط.');
      return;
    }

    const existingPdf = customPdfs.find(p => p.name === activeUploadSection);
    if (existingPdf && existingPdf.id) {
      await db.customPdfs.delete(existingPdf.id);
    }

    const newPdf: CustomPDF = {
      name: activeUploadSection,
      file: file,
      uploadDate: new Date().toLocaleDateString('ar-EG')
    };

    await db.customPdfs.add(newPdf);
    loadAllData();
    setActiveUploadSection(null);
    if (fileInputRef.current) fileInputRef.current.value = ''; 
  };

  const handleAddCustomSection = async (): Promise<void> => {
    if (!newSectionName.trim() || !newSectionFile) {
      alert('يرجى إدخال اسم القسم واختيار ملف الـ PDF');
      return;
    }

    if (newSectionFile.type !== 'application/pdf') {
      alert('الملف يجب أن يكون PDF');
      return;
    }

    const newPdf: CustomPDF = {
      name: newSectionName.trim(),
      file: newSectionFile,
      uploadDate: new Date().toLocaleDateString('ar-EG')
    };

    await db.customPdfs.add(newPdf);
    loadAllData();
    
    setShowNewSectionModal(false);
    setNewSectionName('');
    setNewSectionFile(null);
  };

  const handleDeleteSection = async (sectionName: string, pdfId?: number): Promise<void> => {
    if (window.confirm(`هل أنت متأكد من حذف قسم "${sectionName}" بالكامل؟\nسيتم إخفاؤه وحذف الملف الخاص به.`)) {
      if (pdfId) {
        await db.customPdfs.delete(pdfId);
      }
      if (STANDARD_SECTIONS.includes(sectionName)) {
        const updatedHidden = [...hiddenSections, sectionName];
        setHiddenSections(updatedHidden);
        localStorage.setItem('hidden_sections', JSON.stringify(updatedHidden));
      }
      loadAllData();
    }
  };

  const handleRestoreSections = (): void => {
    if (window.confirm('هل تريد استعادة جميع الأقسام الأساسية التي قمت بحذفها؟')) {
      setHiddenSections([]);
      localStorage.removeItem('hidden_sections');
    }
  };

  const handleOpenPdf = async (blob: Blob | undefined, fileName: string): Promise<void> => {
    try {
      if (!blob) {
        alert("خطأ: الملف غير موجود. قد تحتاج لحذفه ورفعه مرة أخرى.");
        return;
      }

      const isTauri = window.__TAURI_INTERNALS__ || window.__TAURI__;

      if (isTauri) {
        let uint8Array: Uint8Array;
        try {
          const arrayBuffer = await blob.arrayBuffer();
          uint8Array = new Uint8Array(arrayBuffer);
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          throw new Error("فشل تحويل الملف (قد يكون تالفاً في قاعدة البيانات): " + errorMessage);
        }

        const safeFileName = `print_${Date.now()}.pdf`;
        try {
          await writeFile(safeFileName, uint8Array, {
            baseDir: BaseDirectory.Temp
          });
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          throw new Error(`فشل حفظ الملف مؤقتاً (تأكد من صلاحيات Tauri fs): ${errorMessage}`);
        }
        try {
          const tempDirPath = await tempDir();
          const fullPath = await join(tempDirPath, safeFileName);
          
          await openPath(fullPath);
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          throw new Error(`فشل فتح الملف (تأكد من صلاحيات Tauri opener): ${errorMessage}`);
        }

        return;
      }
      const url = URL.createObjectURL(blob);
      const opened = window.open(url, '_blank');
      
      if (!opened) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setTimeout(() => URL.revokeObjectURL(url), 5000);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(errorMessage);
      console.error("Full PDF Error:", error);
    }
  };

  const userAddedSections = customPdfs.filter(pdf => !STANDARD_SECTIONS.includes(pdf.name));
  const allSectionsToRender: RenderSection[] = [
    ...STANDARD_SECTIONS.filter(s => !hiddenSections.includes(s)).map(name => ({
      name,
      isStandard: true,
      pdf: customPdfs.find(p => p.name === name)
    })),
    ...userAddedSections.map(pdf => ({
      name: pdf.name,
      isStandard: false,
      pdf: pdf
    }))
  ];

  return (
    <div className="space-y-8 relative">

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner">
            <Printer className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900">مركز الطباعة والمستندات</h2>
            <p className="text-slate-500 font-medium mt-1">إدارة وطباعة جميع سجلات وحدة التدريب والجودة.</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto border border-slate-200">
          <button
            onClick={() => setActiveTab('dynamic')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'dynamic'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            النماذج التلقائية
          </button>
          <button
            onClick={() => setActiveTab('external')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'external'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <FileUp className="w-4 h-4" />
            نماذج PDF المرفوعة
          </button>
        </div>
      </div>

      <div className="print:hidden">
        
        {activeTab === 'dynamic' && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800">النماذج التلقائية (من البيانات)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {DYNAMIC_REPORTS.map((report) => {
                const Icon = report.icon;
                return (
                  <div key={report.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full hover:shadow-md hover:border-indigo-300 transition-all group">
                    <div className="flex-1">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg leading-tight mb-2">{report.title}</h4>
                      <p className="text-sm text-slate-500 font-medium mb-6">{report.desc}</p>
                    </div>
                    
                    <button 
                      onClick={() => printDynamicReport(report.id)} 
                      className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Printer className="w-4 h-4" /> طباعة النموذج
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'external' && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-inner">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <FileUp className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800">نماذج الـ PDF الخارجية</h3>
            </div>

            <input 
              type="file" 
              accept="application/pdf" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

              {allSectionsToRender.map((section) => {
                const { name, isStandard, pdf } = section;
                return (
                  <div key={name} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full hover:border-emerald-300 transition-all relative overflow-hidden group">
                    
                    <button 
                      onClick={() => handleDeleteSection(name, pdf?.id)} 
                      className="absolute top-4 left-4 p-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-100" 
                      title="حذف القسم بالكامل من الشاشة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {!isStandard && (
                      <span className="absolute top-4 right-4 px-2 py-1 bg-purple-50 text-purple-600 text-[10px] font-black rounded-md border border-purple-100">
                        قسم إضافي
                      </span>
                    )}

                    <div className={`flex-1 ${!isStandard ? 'mt-8' : 'mt-4'}`}>
                      <h4 className="font-bold text-slate-800 text-lg leading-tight mb-4 pr-10">{name}</h4>
                      
                      {pdf ? (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-3 py-1.5 rounded-lg border border-emerald-100">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-bold">مرفوع وجاهز</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-200">
                          <Upload className="w-4 h-4" />
                          <span className="text-xs font-bold">بانتظار الرفع</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                      {pdf ? (
                        <>
                          <button onClick={() => handleOpenPdf(pdf.file, name)} className="flex-[2] py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                            <Printer className="w-4 h-4" /> طباعة
                          </button>
                          <button onClick={() => triggerUploadForSection(name)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2" title="تغيير الملف">
                            <Upload className="w-4 h-4" /> تغيير
                          </button>
                        </>
                      ) : (
                        <button onClick={() => triggerUploadForSection(name)} className="w-full py-2 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 border border-slate-700">
                          <Upload className="w-4 h-4" /> رفع النموذج (PDF)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <div 
                onClick={() => setShowNewSectionModal(true)}
                className="border-2 border-dashed border-slate-300 bg-slate-100/50 hover:bg-emerald-50/50 hover:border-emerald-300 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group min-h-[200px]"
              >
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 group-hover:scale-110 transition-transform mb-4">
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-emerald-500" />
                </div>
                <h4 className="font-bold text-slate-600 group-hover:text-emerald-600">إضافة نموذج جديد</h4>
                <p className="text-xs text-slate-400 text-center mt-2">انقر لإنشاء قسم مخصص ورفع ملف الـ PDF الخاص به.</p>
              </div>

            </div>

            {hiddenSections.length > 0 && (
              <div className="mt-8 text-right px-4">
                <button 
                  onClick={handleRestoreSections}
                  className="text-sm text-slate-400 hover:text-emerald-600 font-bold flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> استعادة الأقسام الأساسية التي تم حذفها ({hiddenSections.length})
                </button>
              </div>
            )}
          </section>
        )}

      </div>

      <div className="hidden print:flex print:justify-center print:w-full print:bg-white">
        <div ref={componentRef} className="bg-white p-10 w-full max-w-[210mm] min-h-[297mm] text-black font-sans relative" dir="rtl">
          
          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-8">
            <div className="text-right leading-relaxed font-bold text-sm w-1/3">
              <p>محافظة: ........................</p>
              <p>إدارة: {schoolData?.managementName || '........................'}</p>
              <p>مدرسة: {schoolData?.schoolName || '........................'}</p>
            </div>
            <div className="text-center w-1/3">
              <h1 className="text-xl font-extrabold mb-1 underline underline-offset-4">وحدة التدريب والجودة</h1>
              <p className="text-sm font-bold mt-2">سجل العام الدراسي: {adminData?.currentYear || '2025 / 2026'}</p>
            </div>
            <div className="w-1/3"></div>
          </div>

          {reportType === 'vision' && (
            <div className="flex flex-col h-[700px]">
              <h2 className="text-3xl font-black text-center mb-12 bg-gray-100 py-4 border-2 border-black rounded-sm w-3/4 mx-auto shadow-sm tracking-wide">رؤية ورسالة المنشأة</h2>
              <div className="flex-1 border-4 border-double border-gray-800 p-12 flex flex-col justify-center items-center text-center relative bg-gray-50/50">
                <span className="absolute top-4 right-8 text-6xl text-gray-300 font-serif">"</span>
                <p className="text-3xl font-extrabold text-gray-900 leading-[2.5] whitespace-pre-wrap">{visionText || 'لم يتم إضافة الرؤية.'}</p>
                <span className="absolute bottom-[-10px] left-8 text-6xl text-gray-300 font-serif rotate-180">"</span>
              </div>
            </div>
          )}

          {reportType === 'school' && (
            <div>
              <h2 className="text-2xl font-extrabold text-center mb-8 bg-gray-100 py-3 border-2 border-black rounded-sm w-3/4 mx-auto">البيانات الأساسية للمدرسة</h2>
              <div className="border-2 border-black text-sm font-bold mb-12">
                <div className="flex border-b border-black"><div className="w-1/3 bg-gray-100 p-3 border-l border-black">اسم المدرسة</div><div className="w-2/3 p-3">{schoolData?.schoolName}</div></div>
                <div className="flex border-b border-black"><div className="w-1/3 bg-gray-100 p-3 border-l border-black">الرقم الإحصائي</div><div className="w-2/3 p-3">{schoolData?.statisticalNumber}</div></div>
                <div className="flex border-b border-black"><div className="w-1/4 bg-gray-100 p-3 border-l border-black text-center">التبعية</div><div className="w-1/4 p-3 border-l border-black">{schoolData?.affiliation}</div><div className="w-1/4 bg-gray-100 p-3 border-l border-black text-center">المرحلة</div><div className="w-1/4 p-3">{schoolData?.stage}</div></div>
                <div className="flex border-b border-black"><div className="w-1/3 bg-gray-100 p-3 border-l border-black">ملكية المبنى</div><div className="w-2/3 p-3">{schoolData?.buildingOwnership}</div></div>
                <div className="flex border-b border-black"><div className="w-1/3 bg-gray-100 p-3 border-l border-black">العنوان بالتفصيل</div><div className="w-2/3 p-3">{schoolData?.address}</div></div>
                <div className="flex border-b border-black"><div className="w-1/4 bg-gray-100 p-3 border-l border-black text-center">التليفون</div><div className="w-1/4 p-3 border-l border-black" dir="ltr">{schoolData?.phone}</div><div className="w-1/4 bg-gray-100 p-3 border-l border-black text-center">الفترات</div><div className="w-1/4 p-3">{schoolData?.periods}</div></div>
                <div className="flex border-b border-black"><div className="w-1/3 bg-gray-100 p-3 border-l border-black">الإيميل</div><div className="w-2/3 p-3" dir="ltr">{schoolData?.email}</div></div>
              </div>
            </div>
          )}

          {reportType === 'admin' && (
            <div>
              <h2 className="text-2xl font-extrabold text-center mb-8 bg-gray-100 py-3 border-2 border-black rounded-sm w-3/4 mx-auto">بيانات مسئول وحدة التدريب والجودة</h2>
              <div className="border-2 border-black text-sm font-bold mb-12">
                <div className="flex border-b border-black"><div className="w-1/4 bg-gray-100 p-4 border-l border-black text-center">الإدارة التعليمية</div><div className="w-1/4 p-4 border-l border-black">{adminData?.management || '---'}</div><div className="w-1/4 bg-gray-100 p-4 border-l border-black text-center">اسم المدرسة</div><div className="w-1/4 p-4">{adminData?.school || '---'}</div></div>
                <div className="flex border-b border-black"><div className="w-1/4 bg-gray-100 p-4 border-l border-black text-center flex items-center justify-center">اسم مسئول الوحدة</div><div className="w-3/4 p-4 font-extrabold text-lg">{adminData?.unitManager || '---'}</div></div>
                <div className="flex border-b border-black"><div className="w-1/4 bg-gray-100 p-4 border-l border-black text-center">المؤهل الدراسي</div><div className="w-1/4 p-4 border-l border-black">{adminData?.qualification || '---'}</div><div className="w-1/4 bg-gray-100 p-4 border-l border-black text-center">الوظيفة على الكادر</div><div className="w-1/4 p-4">{adminData?.cadreJob || '---'}</div></div>
                <div className="flex border-b border-black"><div className="w-1/4 bg-gray-100 p-4 border-l border-black text-center">رقم التليفون</div><div className="w-1/4 p-4 border-l border-black" dir="ltr">{adminData?.phone || '---'}</div><div className="w-1/4 bg-gray-100 p-4 border-l border-black text-center">تاريخ العمل بالوحدة</div><div className="w-1/4 p-4">{adminData?.unitStartDate || '---'}</div></div>
              </div>
            </div>
          )}

          {reportType === 'employees' && (
            <div>
              <h2 className="text-2xl font-extrabold text-center mb-8 bg-gray-100 py-3 border-2 border-black rounded-sm w-3/4 mx-auto">قاعدة بيانات العاملين بالمدرسة</h2>
              <table className="w-full text-right text-sm border-collapse border-2 border-black mb-12"><thead className="bg-gray-100"><tr><th className="border border-black p-3 font-bold w-12 text-center">م</th><th className="border border-black p-3 font-bold">الاسم</th><th className="border border-black p-3 font-bold">الوظيفة</th><th className="border border-black p-3 font-bold">المؤهل</th><th className="border border-black p-3 font-bold text-center">رقم الهاتف</th></tr></thead><tbody>{employees.map((emp, index) => (<tr key={emp.id} className="even:bg-gray-50"><td className="border border-black p-2 text-center font-bold">{index + 1}</td><td className="border border-black p-2 font-bold">{emp.name}</td><td className="border border-black p-2 font-medium">{emp.cadreJob}</td><td className="border border-black p-2 font-medium">{emp.qualification}</td><td className="border border-black p-2 text-center font-medium" dir="ltr">{emp.phone || '---'}</td></tr>))}</tbody></table>
            </div>
          )}

          {reportType === 'career' && (
            <div>
              <h2 className="text-2xl font-extrabold text-center mb-8 bg-gray-100 py-3 border-2 border-black rounded-sm w-3/4 mx-auto">بيانات المستهدفين ببرامج التنمية المهنية</h2>
              <table className="w-full text-right text-sm border-collapse border-2 border-black mb-12"><thead className="bg-gray-100"><tr><th className="border border-black p-3 font-bold w-12 text-center">م</th><th className="border border-black p-3 font-bold w-1/4">الاسم</th><th className="border border-black p-3 font-bold w-1/6">الوظيفة</th><th className="border border-black p-3 font-bold w-1/6">التخصص</th><th className="border border-black p-3 font-bold w-1/3 text-center">التوقيع</th></tr></thead><tbody>{employees.filter(emp => emp.needsCareerImprovement).map((emp, index) => (<tr key={emp.id} className="even:bg-gray-50"><td className="border border-black p-4 text-center font-bold">{index + 1}</td><td className="border border-black p-4 font-bold">{emp.name}</td><td className="border border-black p-4 font-medium">{emp.cadreJob || '---'}</td><td className="border border-black p-4 font-medium">{emp.specialization || '---'}</td><td className="border border-black p-4 text-center text-gray-400 align-middle">......................................</td></tr>))}</tbody></table>
            </div>
          )}

          {reportType === 'programs' && (
            <div>
              <h2 className="text-2xl font-extrabold text-center mb-8 bg-gray-100 py-3 border-2 border-black rounded-sm w-3/4 mx-auto">بيان بالبرامج التدريبية المقترحة</h2>
              <table className="w-full text-right text-sm border-collapse border-2 border-black mb-12"><thead className="bg-gray-100"><tr><th className="border border-black p-3 font-bold w-16 text-center">م</th><th className="border border-black p-3 font-bold w-1/2">اسم البرنامج التدريبي</th><th className="border border-black p-3 font-bold w-1/2">الفئة المستهدفة</th></tr></thead><tbody>{programs.map((prog, index) => (<tr key={prog.id} className="even:bg-gray-50"><td className="border border-black p-4 text-center font-bold">{index + 1}</td><td className="border border-black p-4 font-bold">{prog.name}</td><td className="border border-black p-4 font-medium">{prog.category || '---'}</td></tr>))}</tbody></table>
            </div>
          )}

          {reportType === 'timeline' && (
            <div>
              <h2 className="text-2xl font-extrabold text-center mb-8 bg-gray-100 py-3 border-2 border-black rounded-sm w-3/4 mx-auto">الخطة السنوية لتنفيذ البرامج التدريبية</h2>
              <table className="w-full text-right text-sm border-collapse border-2 border-black mb-12"><thead className="bg-gray-100"><tr><th className="border border-black p-3 font-bold w-24">الشهر</th><th className="border border-black p-3 font-bold">البرنامج التدريبي</th><th className="border border-black p-3 font-bold">الفئة المستهدفة</th><th className="border border-black p-3 font-bold">توقيت التنفيذ</th><th className="border border-black p-3 font-bold">مسئول التنفيذ</th></tr></thead><tbody>{timeline.filter(t => t.programId !== 0).map((row, index) => (<tr key={index} className="even:bg-gray-50"><td className="border border-black p-2 font-bold bg-gray-50 text-center">{row.month}</td><td className="border border-black p-2 font-bold">{getProgramName(row.programId)}</td><td className="border border-black p-2 font-medium">{row.category}</td><td className="border border-black p-2 font-medium text-center" dir="ltr">{row.date}</td><td className="border border-black p-2 font-medium text-center">{row.trainerName}</td></tr>))}</tbody></table>
            </div>
          )}

          <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end px-4 text-lg font-bold">
            <div className="text-center">
              <p>مسئول وحدة التدريب والجودة</p>
              <p className="mt-8 text-xl text-gray-700">{adminData?.unitManager ? adminData.unitManager : '......................................'}</p>
            </div>
            <div className="text-center">
              <p>يعتمد ،،، مدير المدرسة</p>
              <p className="mt-8 text-xl text-gray-700">{adminData?.principal ? adminData.principal : '......................................'}</p>
            </div>
          </div>
        </div>
      </div>

      {showNewSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-extrabold text-slate-800">إضافة نموذج مخصص</h3>
              <button onClick={() => setShowNewSectionModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">اسم النموذج / القسم</label>
                <input 
                  type="text" 
                  value={newSectionName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSectionName(e.target.value)}
                  placeholder="مثال: كشف الغياب والتأخير"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-slate-50 focus:bg-white text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ملف الـ PDF للطباعة</label>
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSectionFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setShowNewSectionModal(false)}
                className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleAddCustomSection}
                disabled={!newSectionName.trim() || !newSectionFile}
                className="flex-[2] py-3 px-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إضافة النموذج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}