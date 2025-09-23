// src/core/api/dashboardService.ts

import apiClient from './apiClient';
import AulaService, { AulaDetalhes } from './aulaService';
import { DashboardStats } from '../../types';
import { ApiDashboardStats } from './types'; // Supondo que você adicionou esta interface em types.ts

class DashboardService {
  private static instance: DashboardService;

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  /**
   * Busca as estatísticas diretamente do endpoint otimizado do backend.
   * Esta é a forma correta e mais performática.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<ApiDashboardStats>('/dashboard/stats');
      const stats = response.data;
      
      // Mapeia os nomes dos campos do backend para os do frontend
      return {
        totalStudents: stats.total_alunos,
        totalClasses: stats.total_turmas,
        unpaidStudents: stats.total_inadimplentes,
      };
    } catch (error) {
      console.error('Erro ao carregar estatísticas do dashboard:', error);
      // Retorna valores zerados em caso de erro para não quebrar a UI
      return { totalStudents: 0, totalClasses: 0, unpaidStudents: 0 };
    }
  }

  /**
   * Busca as aulas do dia com a tipagem correta.
   */
  async getAulasHoje(): Promise<AulaDetalhes[]> {
    try {
      const hoje = new Date();
      return await AulaService.getAulasPorData(hoje);
    } catch (error) {
      console.error('Erro ao carregar aulas de hoje:', error);
      return []; // Retorna um array vazio em caso de erro
    }
  }
}

export default DashboardService.getInstance();