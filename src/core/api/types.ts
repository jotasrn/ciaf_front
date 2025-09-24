// src/core/api/types.ts

// --- TIPOS BÁSICOS DO MONGODB ---
export interface MongoId {
  $oid: string;
}

export interface MongoDate {
  $date: string;
}

// --- INTERFACES DE DADOS DA API (DTOs de Resposta) ---

export interface ApiResponsavel {
  nome_responsavel: string;
  cpf_responsavel: string;
  telefone_responsavel: string;
  email_responsavel?: string;
}

export interface ApiUser {
  _id: MongoId;
  nome_completo: string;
  email: string;
  perfil: 'admin' | 'professor' | 'aluno';
  ativo: boolean;
  data_nascimento?: string; // Formato 'YYYY-MM-DD'
  telefone?: string;
  status_pagamento?: {
    status: 'pago' | 'pendente' | 'atrasado';
    data_vencimento: string; // Formato 'YYYY-MM-DD'
  };
  responsavel?: ApiResponsavel;
  data_criacao?: MongoDate;
}

export interface ApiTurma {
  _id: MongoId;
  nome: string;
  categoria: string;
  horarios: Array<{ dia_semana: string; hora_inicio: string; hora_fim: string; }>;
  esporte: { _id: MongoId; nome: string; };
  professor: { _id: MongoId; nome_completo: string; };
  alunos: Array<{ _id: MongoId; nome_completo: string; }>;
  total_alunos: number;
}

export interface ApiAula {
  _id: MongoId;
  data: MongoDate;
  status: 'Agendada' | 'Realizada';
  turma_nome: string;
  esporte_nome: string;
  total_alunos_na_turma: number;
  total_presentes: number;
}

export interface ApiPresenca {
  id_aluno: MongoId;
  nome_aluno: string;
  status: 'presente' | 'ausente' | 'justificado' | 'pendente';
}

export interface ApiCategory {
  id_categoria: MongoId;
  nome: string;
  faixa_etaria: string;
}

export interface ApiSport {
  _id: MongoId;
  nome: string;
  icone: string;
  categorias: ApiCategory[];
}

export interface ApiCategoryWithSportName {
  _id: MongoId;
  nome: string;
  esporte_id: MongoId;
  faixa_etaria: string;
  esporte_nome: string;
}

export interface ApiDashboardStats {
  total_alunos: number;
  total_turmas: number;
  total_inadimplentes: number;
}

// --- INTERFACES PARA PAYLOADS DE REQUISIÇÃO ---

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface CreateUserRequest {
  nome_completo: string;
  email: string;
  senha: string;
  perfil: 'aluno' | 'professor' | 'admin';
  data_nascimento?: string;
  telefone?: string;
  ativo?: boolean;
  responsavel?: ApiResponsavel;
}

export interface UpdateUserRequest {
  nome_completo?: string;
  email?: string;
  perfil?: 'admin' | 'professor';
  data_nascimento?: string;
  telefone?: string;
  ativo?: boolean;
  status_pagamento?: {
    status: 'pago' | 'pendente' | 'atrasado';
    data_vencimento: string;
  };
  responsavel?: ApiResponsavel;
}

export interface CreateTurmaRequest {
  nome: string;
  esporte_id: string;
  categoria: string;
  professor_id: string;
  alunos_ids: string[];
  horarios: Array<{
    dia_semana: string;
    hora_inicio: string;
    hora_fim: string;
  }>;
}

export interface MarcarPresencaRequest {
  aula_id: string;
  aluno_id: string;
  status: 'presente' | 'ausente' | 'justificado';
}

export interface CategoryRequest {
    nome: string;
    esporte_id: string;
    faixa_etaria: string;
}

// --- INTERFACES PARA RESPOSTAS DE REQUISIÇÃO ---

export interface LoginApiResponse {
  access_token: string;
  user: ApiUser | string; 
}
// --- FUNÇÕES UTILITÁRIAS ---

export const extractId = (mongoId: MongoId): string => mongoId.$oid;

export const extractDate = (mongoDate?: MongoDate | string | null): string => {
  // Se o valor for nulo, indefinido ou uma string vazia, retorna '' imediatamente.
  if (!mongoDate) {
    return '';
  }

  // Se já for uma string no formato YYYY-MM-DD, retorna diretamente.
  if (typeof mongoDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(mongoDate)) {
    return mongoDate;
  }

  const dateValue = typeof mongoDate === 'string' ? mongoDate : mongoDate.$date;

  const dateObj = new Date(dateValue);
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  return dateObj.toISOString().split('T')[0];
};


export const formatDateForApi = (date: Date): string =>
  date.toISOString().split('T')[0];