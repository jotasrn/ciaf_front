import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

// Serviços da API
import TurmaService from '../../core/api/turmaService';
import UserService from '../../core/api/userService';
import SportService from '../../core/api/sportService';
import CategoryService from '../../core/api/categoryService';

// Tipos, incluindo o tipo da requisição que estava faltando
import { Class, User, Sport, Category } from '../../types';
import { CreateTurmaRequest } from '../../core/api/types';

// Componentes de UI
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Dropdown from '../../components/ui/Dropdown';
import ClassDetailsModal from './classDetailsModal';

export default function ClassesManagement() {
  // --- ESTADOS ---
  const [classes, setClasses] = useState<Class[]>([]);
  const [professors, setProfessors] = useState<User[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados dos modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Partial<Class> | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  // --- EFEITOS ---
  useEffect(() => {
    loadData();
  }, []);

  // --- FUNÇÕES DE DADOS ---
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // CORREÇÃO: Chamadas de serviço diretas, sem .getInstance()
      const [classesData, usersData, sportsData, categoriesData] = await Promise.all([
        TurmaService.getTurmas(),
        UserService.getAllUsers(),
        SportService.getSports(),
        CategoryService.getCategories(),
      ]);
      setClasses(classesData);
      setProfessors(usersData.filter((p: User) => p.role === 'professor'));
      setSports(sportsData);
      setCategories(categoriesData);
    } catch (err) {
      setError('Falha ao carregar dados. Tente atualizar a página.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleOpenFormModal = (classItem: Partial<Class> | null = null) => {
    setEditingClass(classItem || {});
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingClass(null);
  };
  
  const handleSaveClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingClass) return;

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as { [key: string]: string };
    
    // O backend espera o *NOME* da categoria, não o ID.
    const categoryName = categories.find(c => c.id === data.categoryId)?.name || '';

    const classPayload = {
      nome: data.name,
      esporte_id: data.sportId,
      categoria: categoryName,
      professor_id: data.professorId,
      alunos_ids: editingClass.students || [],
      // Mapeia de volta para o formato esperado pela API
      horarios: editingClass.schedule?.map(s => ({
        dia_semana: ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][s.dayOfWeek],
        hora_inicio: s.time,
        hora_fim: s.time, // Assumindo que a hora de fim é a mesma
      })) || [],
    };

    try {
      if (editingClass.id) {
        await TurmaService.updateTurma(editingClass.id, classPayload);
        alert('Turma atualizada com sucesso!');
      } else {
        await TurmaService.createTurma(classPayload as CreateTurmaRequest);
        alert('Turma criada com sucesso!');
      }
      handleCloseFormModal();
      await loadData();
    } catch (err) {
      alert('Erro ao salvar turma.');
      console.error(err);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta turma?')) {
      try {
        await TurmaService.deleteTurma(classId);
        alert('Turma excluída com sucesso!');
        await loadData();
      } catch (err) {
        alert('Erro ao excluir turma.');
        console.error(err);
      }
    }
  };

  const getEntityNameById = (id: string, list: { id: string; name: string }[]) => {
    return list.find(item => item.id === id)?.name || 'N/A';
  };

  const filteredClasses = classes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- RENDERIZAÇÃO ---
  if (isLoading) return <div className="p-6 text-center">Carregando...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-gray-900">Gerenciar Turmas</h1><p className="text-gray-600 mt-1">Organize e gerencie todas as turmas do sistema</p></div>
        <Button onClick={() => handleOpenFormModal()}><Plus className="w-4 h-4 mr-2" /> Nova Turma</Button>
      </div>

      <div className="bg-white rounded-lg shadow-md mb-6 p-6">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Buscar turmas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" /></div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Esporte</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Professor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alunos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClasses.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedClass(classItem)}>
                  <td className="px-6 py-4 font-medium text-gray-900">{classItem.name}</td>
                  <td className="px-6 py-4 text-gray-700">{getEntityNameById(classItem.sportId, sports)}</td>
                  <td className="px-6 py-4 text-gray-700">{classItem.categoryId}</td>
                  <td className="px-6 py-4 text-gray-700">{getEntityNameById(classItem.professorId, professors)}</td>
                  <td className="px-6 py-4 text-gray-700">{classItem.students.length} / {classItem.maxStudents}</td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <Dropdown items={[{ label: 'Editar', icon: <Edit className="w-4 h-4" />, onClick: () => handleOpenFormModal(classItem) }, { label: 'Excluir', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDeleteClass(classItem.id), variant: 'danger' }]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedClass && (
        <ClassDetailsModal classItem={selectedClass} isOpen={!!selectedClass} onClose={() => setSelectedClass(null)} professors={professors} sports={sports} />
      )}

      {isFormModalOpen && (
        <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={editingClass?.id ? 'Editar Turma' : 'Nova Turma'} size="lg">
          <form className="space-y-6" onSubmit={handleSaveClass}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Nome da Turma</label><input name="name" defaultValue={editingClass?.name} required className="w-full px-4 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Professor</label><select name="professorId" defaultValue={editingClass?.professorId} required className="w-full px-4 py-2 border rounded-lg"><option value="">Selecione</option>{professors.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Esporte</label><select name="sportId" defaultValue={editingClass?.sportId} required className="w-full px-4 py-2 border rounded-lg"><option value="">Selecione</option>{sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label><select name="categoryId" defaultValue={editingClass?.categoryId} required className="w-full px-4 py-2 border rounded-lg"><option value="">Selecione</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.sportName})</option>)}</select></div>
            </div>
            <div className="flex justify-end space-x-4 pt-6 border-t"><Button type="button" variant="secondary" onClick={handleCloseFormModal}>Cancelar</Button><Button type="submit">Salvar</Button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}