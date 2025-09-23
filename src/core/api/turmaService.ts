// src/core/api/turmaService.ts

import apiClient from './apiClient';
import { ApiTurma, CreateTurmaRequest } from './types';
import { Class } from '../../types';

class TurmaService {
  private static instance: TurmaService;

  static getInstance(): TurmaService {
    if (!TurmaService.instance) {
      TurmaService.instance = new TurmaService();
    }
    return TurmaService.instance;
  }

  private convertDayNameToNumber(apiDay: string): number {
    const dayMap: { [key: string]: number } = {
      'domingo': 0, 'segunda': 1, 'terca': 2, 'quarta': 3,
      'quinta': 4, 'sexta': 5, 'sabado': 6
    };
    return dayMap[apiDay.toLowerCase()] ?? 0;
  }
  
  private convertApiTurmaToClass(apiTurma: ApiTurma): Class {
    return {
      id: apiTurma._id.$oid,
      name: apiTurma.nome,
      sportId: apiTurma.esporte._id.$oid,
      sportName: apiTurma.esporte.nome,
      categoryId: apiTurma.categoria, // O backend retorna o nome da categoria aqui
      professorId: apiTurma.professor._id.$oid,
      students: apiTurma.alunos.map(aluno => aluno._id.$oid),
      schedule: apiTurma.horarios.map(horario => ({
        dayOfWeek: this.convertDayNameToNumber(horario.dia_semana),
        time: horario.hora_inicio,
      })),
      maxStudents: apiTurma.total_alunos || 20, // Usar o total ou um padrão
    };
  }

  async getTurmas(): Promise<Class[]> {
    try {
      const response = await apiClient.get<ApiTurma[]>('/turmas');
      return response.data.map(this.convertApiTurmaToClass);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      throw new Error('Erro ao carregar lista de turmas');
    }
  }

  async getTurmasByProfessor(): Promise<Class[]> {
    try {
      const response = await apiClient.get<ApiTurma[]>('/turmas/professor/me');
      return response.data.map(this.convertApiTurmaToClass);
    } catch (error) {
      console.error('Erro ao buscar turmas do professor:', error);
      throw new Error('Erro ao carregar suas turmas');
    }
  }

  async createTurma(turmaData: CreateTurmaRequest): Promise<void> {
    try {
      await apiClient.post('/turmas', turmaData);
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      throw new Error('Erro ao criar turma');
    }
  }

  async updateTurma(turmaId: string, turmaData: Partial<CreateTurmaRequest>): Promise<void> {
    try {
      await apiClient.put(`/turmas/${turmaId}`, turmaData);
    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      throw new Error('Erro ao atualizar turma');
    }
  }

  async deleteTurma(turmaId: string): Promise<void> {
    try {
      await apiClient.delete(`/turmas/${turmaId}`);
    } catch (error) {
      console.error('Erro ao deletar turma:', error);
      throw new Error('Erro ao deletar turma');
    }
  }
}

// CORREÇÃO: Exportamos a instância única do serviço
export default TurmaService.getInstance();