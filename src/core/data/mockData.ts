import { Student, Sport, Class, DashboardStats, User } from '../../types';

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Pedro Henrique Silva',
    email: 'pedro.silva@email.com',
    phone: '(11) 99999-9999',
    birthDate: '2012-05-15',
    paymentDue: '2024-12-15',
    isPaid: true,
    status: 'Ativo',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Ana Carolina Santos',
    email: 'ana.santos@email.com',
    phone: '(11) 88888-8888',
    birthDate: '2013-03-10',
    paymentDue: '2024-12-10',
    isPaid: false,
    status: 'Ativo',
    createdAt: '2024-02-01'
  },
  {
    id: '3',
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@email.com',
    phone: '(11) 77777-7777',
    birthDate: '2011-08-22',
    paymentDue: '2024-12-20',
    isPaid: false,
    status: 'Ativo',
    createdAt: '2024-01-20'
  },
  {
    id: '4',
    name: 'Mariana Costa',
    email: 'mariana.costa@email.com',
    phone: '(11) 66666-6666',
    birthDate: '2012-12-05',
    paymentDue: '2024-12-25',
    isPaid: true,
    status: 'Ativo',
    createdAt: '2024-03-10'
  },
  {
    id: '5',
    name: 'Gabriel Rodrigues',
    email: 'gabriel.rodrigues@email.com',
    phone: '(11) 55555-5555',
    birthDate: '2014-01-30',
    paymentDue: '2024-12-18',
    isPaid: true,
    status: 'Ativo',
    createdAt: '2024-02-15'
  },
  {
    id: '6',
    name: 'Sofia Almeida',
    email: 'sofia.almeida@email.com',
    phone: '(11) 44444-4444',
    birthDate: '2013-06-18',
    paymentDue: '2024-12-12',
    isPaid: false,
    status: 'Ativo',
    createdAt: '2024-01-05'
  },
  {
    id: '7',
    name: 'Rafael Martins',
    email: 'rafael.martins@email.com',
    phone: '(11) 33333-3333',
    birthDate: '2012-09-12',
    paymentDue: '2024-12-08',
    isPaid: false,
    status: 'Ativo',
    createdAt: '2024-04-01'
  },
  {
    id: '8',
    name: 'Isabela Lima',
    email: 'isabela.lima@email.com',
    phone: '(11) 22222-2222',
    birthDate: '2013-11-25',
    paymentDue: '2024-12-30',
    isPaid: true,
    status: 'Ativo',
    createdAt: '2024-03-15'
  },
  {
    id: '9',
    name: 'Thiago Pereira',
    email: 'thiago.pereira@email.com',
    phone: '(11) 11111-1111',
    birthDate: '2011-04-08',
    paymentDue: '2024-12-05',
    isPaid: false,
    status: 'Ativo',
    createdAt: '2024-02-20'
  },
  {
    id: '10',
    name: 'Camila Souza',
    email: 'camila.souza@email.com',
    phone: '(11) 99988-7766',
    birthDate: '2014-07-14',
    paymentDue: '2024-12-22',
    isPaid: true,
    status: 'Ativo',
    createdAt: '2024-01-10'
  }
];

export const mockProfessors: User[] = [
  {
    id: '1',
    name: 'Administrador do Sistema',
    email: 'admin@escolinha.com',
    role: 'admin',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'teste',
    email: 'teste1@gmail.com',
    role: 'admin',
    createdAt: '2024-02-01'
  },
  {
    id: '3',
    name: 'Professor Carlos Silva',
    email: 'aa@gmail.com',
    role: 'professor',
    createdAt: '2024-03-01'
  },
  {
    id: '4',
    name: 'Professora Maria Santos',
    email: 'aaa@gmail.com',
    role: 'professor',
    createdAt: '2024-04-01'
  },
  {
    id: '5',
    name: 'Professor João Oliveira',
    email: 'joao.prof@gmail.com',
    role: 'professor',
    createdAt: '2024-05-01'
  }
];

export const mockSports: Sport[] = [
  {
    id: '1',
    name: 'futebol',
    icon: '⚽',
    categories: [
      { id: '1', name: 'SUB-11', sportId: '1', ageRange: '6-11 anos' },
      { id: '2', name: 'SUB-12', sportId: '1', ageRange: '11-12 anos' },
      { id: '6', name: 'SUB-13', sportId: '1', ageRange: '12-13 anos' },
      { id: '7', name: 'teste', sportId: '1', ageRange: '10-14 anos' }
    ]
  },
  {
    id: '2',
    name: 'natação',
    icon: '🏊',
    categories: [
      { id: '3', name: 'Iniciante', sportId: '2', ageRange: '5-8 anos' },
      { id: '4', name: 'Intermediário', sportId: '2', ageRange: '9-12 anos' }
    ]
  },
  {
    id: '3',
    name: 'vôleibol',
    icon: '🏐',
    categories: [
      { id: '5', name: 'Iniciante', sportId: '3', ageRange: '10-14 anos' },
      { id: '8', name: 'Avançado', sportId: '3', ageRange: '15-18 anos' }
    ]
  }
];

export const mockClasses: Class[] = [
  {
    id: '1',
    name: 'Futebol Infantil A',
    sportId: '1',
    categoryId: '1',
    professorId: '3',
    students: ['1', '2', '3', '8'],
    schedule: [
      { dayOfWeek: 2, time: '10:00' }, // Terça
      { dayOfWeek: 4, time: '10:00' }  // Quinta
    ],
    maxStudents: 20
  },
  {
    id: '2',
    name: 'Futebol Juvenil B',
    sportId: '1',
    categoryId: '2',
    professorId: '3',
    students: ['4', '5', '9'],
    schedule: [
      { dayOfWeek: 1, time: '14:00' }, // Segunda
      { dayOfWeek: 3, time: '14:00' }  // Quarta
    ],
    maxStudents: 15
  },
  {
    id: '3',
    name: 'Natação Iniciante',
    sportId: '2',
    categoryId: '3',
    professorId: '4',
    students: ['6', '7', '10'],
    schedule: [
      { dayOfWeek: 2, time: '16:00' }, // Terça
      { dayOfWeek: 5, time: '16:00' }  // Sexta
    ],
    maxStudents: 18
  },
  {
    id: '4',
    name: 'Natação Intermediário',
    sportId: '2',
    categoryId: '4',
    professorId: '4',
    students: ['1', '4', '8', '9'],
    schedule: [
      { dayOfWeek: 3, time: '17:00' }, // Quarta
      { dayOfWeek: 6, time: '09:00' }  // Sábado
    ],
    maxStudents: 16
  },
  {
    id: '5',
    name: 'Vôlei Iniciante',
    sportId: '3',
    categoryId: '5',
    professorId: '5',
    students: ['2', '3', '5', '7'],
    schedule: [
      { dayOfWeek: 1, time: '15:00' }, // Segunda
      { dayOfWeek: 4, time: '15:00' }  // Quinta
    ],
    maxStudents: 20
  },
  {
    id: '6',
    name: 'Futebol SUB-13',
    sportId: '1',
    categoryId: '6',
    professorId: '5',
    students: ['1', '3', '6', '10'],
    schedule: [
      { dayOfWeek: 2, time: '11:00' }, // Terça
      { dayOfWeek: 5, time: '11:00' }  // Sexta
    ],
    maxStudents: 18
  }
];

export const mockDashboardStats: DashboardStats = {
  totalStudents: 10,
  totalClasses: 10,
  unpaidStudents: 5
};