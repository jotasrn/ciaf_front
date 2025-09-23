// src/core/api/sportService.ts

import apiClient from './apiClient';
import { ApiSport, ApiCategory, extractId } from './types'; // Agora a importação funcionará
import { Sport, Category } from '../../types';

class SportService {
  private convertApiSportToSport(apiSport: ApiSport): Sport {
    const sportId = extractId(apiSport._id);
    return {
      id: sportId,
      name: apiSport.nome,
      icon: apiSport.icone,
      // Corrigido: Adicionamos o tipo explícito para 'apiCategory' e 'Category',
      // o que resolve o erro de 'any' e o de 'Category' não utilizada.
      categories: apiSport.categorias.map((apiCategory: ApiCategory): Category => ({
        id: extractId(apiCategory.id_categoria),
        name: apiCategory.nome,
        sportId: sportId,
        ageRange: apiCategory.faixa_etaria,
      })),
    };
  }

  async getSports(): Promise<Sport[]> {
    try {
      const response = await apiClient.get<ApiSport[]>('/esportes');
      return response.data.map(this.convertApiSportToSport);
    } catch (error) {
      console.error('Erro ao buscar esportes:', error);
      throw new Error('Não foi possível carregar os esportes.');
    }
  }

  async createSport(sportData: { nome: string; icone: string }): Promise<void> {
    try {
      await apiClient.post('/esportes', sportData);
    } catch (error) {
      console.error('Erro ao criar esporte:', error);
      throw new Error('Não foi possível criar o esporte.');
    }
  }

  async updateSport(id: string, sportData: { nome: string; icone: string }): Promise<void> {
    try {
      await apiClient.put(`/esportes/${id}`, sportData);
    } catch (error) {
      console.error('Erro ao atualizar esporte:', error);
      throw new Error('Não foi possível atualizar o esporte.');
    }
  }

  async deleteSport(id: string): Promise<void> {
    try {
      await apiClient.delete(`/esportes/${id}`);
    } catch (error) {
      console.error('Erro ao deletar esporte:', error);
      throw new Error('Não foi possível deletar o esporte.');
    }
  }
}

export default new SportService();