// src/core/api/categoryService.ts

import apiClient from './apiClient';
import { ApiCategoryWithSportName, CategoryRequest, extractId } from './types';
import { Category } from '../../types';

class CategoryService {
  private convertApiCategoryToCategory(apiCategory: ApiCategoryWithSportName): Category {
    return {
      id: extractId(apiCategory._id),
      name: apiCategory.nome,
      sportId: extractId(apiCategory.esporte_id),
      ageRange: apiCategory.faixa_etaria,
      sportName: apiCategory.esporte_nome,
    };
  }

  async getCategories(): Promise<Category[]> {
    try {
      // Usamos a rota direta que o backend fornece
      const response = await apiClient.get<ApiCategoryWithSportName[]>('/categorias');
      return response.data.map(this.convertApiCategoryToCategory);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw new Error('Não foi possível carregar as categorias.');
    }
  }

  async createCategory(categoryData: Omit<Category, 'id' | 'sportName'>): Promise<void> {
    try {
      const requestData: CategoryRequest = {
        nome: categoryData.name,
        esporte_id: categoryData.sportId,
        faixa_etaria: categoryData.ageRange,
      };
      await apiClient.post('/categorias', requestData);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw new Error('Não foi possível criar a categoria.');
    }
  }

  async updateCategory(categoryId: string, categoryData: Partial<Omit<Category, 'id' | 'sportName'>>): Promise<void> {
    try {
      const requestData: Partial<CategoryRequest> = {};
      if (categoryData.name) requestData.nome = categoryData.name;
      if (categoryData.sportId) requestData.esporte_id = categoryData.sportId;
      if (categoryData.ageRange) requestData.faixa_etaria = categoryData.ageRange;
      
      await apiClient.put(`/categorias/${categoryId}`, requestData);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw new Error('Não foi possível atualizar a categoria.');
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await apiClient.delete(`/categorias/${categoryId}`);
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw new Error('Não foi possível deletar a categoria.');
    }
  }
}

export default new CategoryService();