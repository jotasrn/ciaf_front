// src/core/api/sportService.ts

import apiClient from './apiClient';
import { ApiSport, ApiCategory, extractId } from './types';
import { Sport, Category } from '../../types';

class SportService {
  private static instance: SportService;

  static getInstance(): SportService {
    if (!SportService.instance) {
      SportService.instance = new SportService();
    }
    return SportService.instance;
  }
  
  private convertApiSportToSport(apiSport: ApiSport): Sport {
    const sportId = extractId(apiSport._id);

    // CORREÇÃO: Criamos uma variável 'categories' com o tipo explícito Category[].
    // Isso torna o uso do tipo 'Category' inconfundível para o linter.
    const categories: Category[] = (apiSport.categorias || []).map((apiCategory: ApiCategory) => ({
      id: extractId(apiCategory.id_categoria),
      name: apiCategory.nome,
      sportId: sportId,
      ageRange: apiCategory.faixa_etaria,
    }));

    return {
      id: sportId,
      name: apiSport.nome,
      icon: apiSport.icone,
      categories: categories, // Usamos a variável aqui.
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

export default SportService.getInstance();