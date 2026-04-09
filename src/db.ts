import Dexie, { type Table } from 'dexie';

export interface LectureAssignment {
  id?: number;
  timelineId: number; 
  employeeIds: number[]; 
}

export interface SchoolDetails {
  id?: number; 
  managementName: string; 
  schoolName: string; 
  statisticalNumber: string; 
  affiliation: string; 
  buildingOwnership: string; 
  email: string; 
  phone: string; 
  schoolCommunity: string; 
  stage: string; 
  periods: string; 
  address: string; 
  website: string; 
  girlsCount: number; 
  boysCount: number; 
}

export interface Employee {
  id?: number;
  name: string; 
  qualification: string; 
  nationalId: string; 
  hireDate: string; 
  cadreJob: string; 
  financialDegree: string; 
  degreeDate: string; 
  address: string; 
  phone: string; 
  specialization: string; 
  unitRole?: 'رئيس الوحدة' | 'مسئول الوحدة' | 'عضو' | ''; 
  needsCareerImprovement?: boolean; 
}

export interface Program {
  id?: number;
  name: string; 
  category: string; 
}

export interface TimelinePlan {
  id?: number;
  month: string; 
  programId: number; 
  trainerName: string; 
  date: string; 
  day: string; 
  category: string; 
  isSuggested: boolean; 
}

export interface Resource {
  id?: number;
  deviceName: string; 
  type: string; 
  quantity: number; 
  room: string; 
}

export interface AppSettings {
  id?: number; 
  masterPassword: string; 
  visionText: string; 
}

export interface AdminDetails {
  id?: number;
  management: string; 
  school: string; 
  principal: string; 
  unitManager: string; 
  qualification: string; 
  cadreJob: string; 
  phone: string; 
  unitStartDate: string; 
  currentYear: string; 
}


export interface VideoNote {
  id?: number;
  title: string; 
  url: string; 
  videoBlob?: Blob;
  isVideoLocal: boolean;
  notes: string; 
  dateAdded: string; 
}


export interface CustomPDF {
  id?: number;
  name: string;
  file: Blob;
  uploadDate: string;
}

export class SchoolDatabase extends Dexie {
  schoolDetails!: Table<SchoolDetails, number>;
  employees!: Table<Employee, number>;
  programs!: Table<Program, number>;
  timeline!: Table<TimelinePlan, number>;
  resources!: Table<Resource, number>;
  settings!: Table<AppSettings, number>;
  adminDetails!: Table<AdminDetails, number>;
  lectureAssignments!: Table<LectureAssignment, number>; 
  videos!: Table<VideoNote, number>; 
  customPdfs!: Table<CustomPDF, number>; 

  constructor() {
    super('SchoolSystemDB');
    this.version(6).stores({
      schoolDetails: '++id',
      employees: '++id, name, nationalId',
      programs: '++id, name',
      timeline: '++id, month, programId',
      resources: '++id, deviceName',
      settings: '++id',
      adminDetails: '++id',
      lectureAssignments: '++id, timelineId', 
      videos: '++id, title, dateAdded',
      customPdfs: '++id, name'
    });
  }
}

export const db = new SchoolDatabase();