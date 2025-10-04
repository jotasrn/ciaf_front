// src/features/admin_dashboard/categoriesManagement.tsx

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Search, FolderOpen, Edit, Trash2 } from 'lucide-react';
import CategoryService from '../../core/api/categoryService';
import SportService from '../../core/api/sportService';
import { Category, Sport } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Dropdown from '../../components/ui/Dropdown';

export default function CategoriesManagement() {
  // --- ESTADOS ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para o modal de criação/edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // --- EFEITOS ---
  useEffect(() => {
    loadData();
  }, []);

  // --- FUNÇÕES DE DADOS ---
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Busca categorias e esportes em paralelo para popular a lista e os formulários
      const [categoriesData, sportsData] = await Promise.all([
        CategoryService.getCategories(),
        SportService.getSports(), // CORREÇÃO: Chamada do método correto
      ]);
      setCategories(categoriesData);
      setSports(sportsData);
    } catch (err) {
      console.error(err);
      setError('Falha ao carregar dados. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleOpenModal = (category: Partial<Category> | null = null) => {
    setEditingCategory(category || {});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name || !editingCategory.sportId || !editingCategory.ageRange) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const { id, ...categoryData } = editingCategory;
      if (id) {
        await CategoryService.updateCategory(id, categoryData);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await CategoryService.createCategory(categoryData as Omit<Category, 'id'>);
        toast.success('Categoria criada com sucesso!');
      }
      handleCloseModal();
      await loadData(); // Recarrega os dados
    } catch (err) {
      console.error('Erro ao salvar categoria:', err);
      toast.error('Não foi possível salvar a categoria.');
    }
  };

  const handleDelete = async (category: Category) => {
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      try {
        await CategoryService.deleteCategory(category.id);
        toast.success('Categoria excluída com sucesso!');
        await loadData();
      } catch (err) { // CORREÇÃO: A variável 'err' agora é usada
        console.error('Erro ao excluir categoria:', err);
        toast.error('Erro ao excluir a categoria.');
      }
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.sportName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- RENDERIZAÇÃO ---
  if (isLoading) return <div className="p-6 text-center">Carregando categorias...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Categorias</h1>
          <p className="text-gray-600 mt-1">Organize as categorias por esporte e faixa etária</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md mb-6 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome da categoria ou esporte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 space-y-4">
          {filteredCategories.length > 0 ? filteredCategories.map((category) => (
            <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.sportName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{category.ageRange}</span>
                <Dropdown
                  items={[
                    { label: 'Editar', icon: <Edit className="w-4 h-4" />, onClick: () => handleOpenModal(category) },
                    { label: 'Excluir', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(category), variant: 'danger' }
                  ]}
                />
              </div>
            </div>
          )) : (
            <p className="text-center text-gray-500 py-8">Nenhuma categoria encontrada.</p>
          )}
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingCategory?.id ? "Editar Categoria" : "Nova Categoria"}
          size="md"
        >
          <form onSubmit={handleSaveCategory} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Categoria</label>
              <input
                type="text"
                value={editingCategory?.name || ''}
                onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Ex: SUB-15, Iniciante"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Esporte</label>
              <select
                value={editingCategory?.sportId || ''}
                onChange={(e) => setEditingCategory(prev => ({ ...prev, sportId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Selecione o esporte</option>
                {sports.map(sport => (
                  <option key={sport.id} value={sport.id}>
                    {sport.icon} {sport.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Faixa Etária</label>
              <input
                type="text"
                value={editingCategory?.ageRange || ''}
                onChange={(e) => setEditingCategory(prev => ({ ...prev, ageRange: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Ex: 10-12 anos"
                required
              />
            </div>
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}