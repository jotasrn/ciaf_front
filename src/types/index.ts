export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'professor';
  createdAt: string;
}

export interface Guardian {
  name: string;
  cpf: string;
  phone: string;
  email?: string;
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate: string; // Formato 'YYYY-MM-DD'
  paymentDue: string; // Formato 'YYYY-MM-DD' ou '--/--/----'
  isPaid: boolean;
  status: 'Ativo' | 'Inativo';
  createdAt: string;
  guardian?: Guardian;
}

export interface Sport {
  id: string;
  name: string;
  icon: string;
  categories: Category[];
}

export interface Category {
  id: string;
  name: string;
  sportId: string;
  sportName?: string; // Nome do esporte para facilitar a exibição
  ageRange: string;
}

export interface ClassSchedule {
  dayOfWeek: number; // 0 para Domingo, 1 para Segunda, etc.
  time: string; // Formato 'HH:MM'
}

export interface Class {
  id: string;
  name: string;
  sportId: string;
  sportName?: string;
  categoryId: string;
  professorId: string;
  students: string[]; // Array de IDs dos alunos
  schedule: ClassSchedule[];
  maxStudents: number;
}

export interface Attendance {
  id: string;
  classId: string;
  date: string; // Formato 'YYYY-MM-DD'
  studentAttendances: StudentAttendance[];
  professorId: string;
  isCompleted: boolean;
}

export interface StudentAttendance {
  studentId: string;
  status: 'presente' | 'ausente' | 'justificado';
}

export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  unpaidStudents: number;
}