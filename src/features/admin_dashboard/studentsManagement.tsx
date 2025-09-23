// src/features/admin_dashboard/studentsManagement.tsx

import { useState, useEffect } from 'react';
// CORREÇÃO: Ícone 'Download' removido da importação
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import UserService from '../../core/api/userService';
import { Student, Guardian } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Dropdown from '../../components/ui/Dropdown';

// Componente ToggleSwitch (sem alterações)
interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}
function ToggleSwitch({ enabled, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!enabled);
      }}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// Componente principal
export default function StudentsManagement() {
  // --- ESTADOS ---
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const studentsData = await UserService.getStudents();
      setStudents(studentsData);
    } catch (err) {
      setError('Falha ao carregar alunos. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 0;
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    return age > 0 ? age : 0;
  };

  const isMinor = calculateAge(editingStudent?.birthDate) < 18;

  // --- HANDLERS ---
  const handleOpenModal = (student: Partial<Student> | null = null) => {
    setEditingStudent(student || {});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleInputChange = (field: keyof Omit<Student, 'guardian'>, value: string) => {
    setEditingStudent((prev) => ({ ...prev, [field]: value }));
  };

  // CORREÇÃO: Lógica de atualização do responsável mais segura
  const handleGuardianInputChange = (field: keyof Guardian, value: string) => {
    setEditingStudent((prev) => ({
      ...prev,
      guardian: {
        name: prev?.guardian?.name || '',
        cpf: prev?.guardian?.cpf || '',
        phone: prev?.guardian?.phone || '',
        email: prev?.guardian?.email || '',
        [field]: value,
      },
    }));
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      if (editingStudent.id) {
        await UserService.updateStudent(editingStudent.id, editingStudent);
        alert('Aluno atualizado com sucesso!');
      } else {
        await UserService.createStudent({ ...editingStudent, status: 'Ativo' });
        alert('Aluno criado com sucesso!');
      }
      handleCloseModal();
      await loadStudents();
    } catch (err) {
      alert('Erro ao salvar aluno.');
      console.error(err);
    }
  };

  const handleDelete = async (student: Student) => {
    if (window.confirm(`Tem certeza que deseja desativar o aluno ${student.name}?`)) {
      try {
        await UserService.deleteUser(student.id);
        alert('Aluno desativado com sucesso!');
        await loadStudents();
      } catch (err) {
        alert('Erro ao desativar aluno.');
        console.error(err);
      }
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString.includes('--')) return dateString;
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  // --- RENDERIZAÇÃO ---
  if (isLoading) return <div className="p-6 text-center">Carregando alunos...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Alunos</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os alunos cadastrados</p>
        </div>
        <Button onClick={() => handleOpenModal()}><Plus className="w-4 h-4 mr-2" /> Novo Aluno</Button>
      </div>

      <div className="bg-white rounded-lg shadow-md mb-6 p-6">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Buscar por nome ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" /></div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">{student.name}</div><div className="text-sm text-gray-500">{student.email}</div></td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatDate(student.paymentDue)}</td>
                  <td className="px-6 py-4"><ToggleSwitch enabled={student.isPaid} onChange={() => { /* Lógica de pagamento aqui */ }} /></td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{student.status}</span></td>
                  <td className="px-6 py-4"><Dropdown items={[{label: 'Editar', icon: <Edit className="w-4 h-4" />, onClick: () => handleOpenModal(student)}, {label: 'Desativar', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(student), variant: 'danger'}]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingStudent?.id ? 'Editar Aluno' : 'Novo Aluno'} size="lg">
          <form onSubmit={handleSaveStudent} className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Dados do Aluno</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Nome Completo *" value={editingStudent?.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
              <input type="email" placeholder="Email" value={editingStudent?.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              <input type="tel" placeholder="Telefone" value={editingStudent?.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              <input type="date" value={editingStudent?.birthDate || ''} onChange={(e) => handleInputChange('birthDate', e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            {isMinor && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dados do Responsável (Obrigatório)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nome do Responsável *" value={editingStudent?.guardian?.name || ''} onChange={(e) => handleGuardianInputChange('name', e.target.value)} required={isMinor} className="w-full px-4 py-2 border rounded-lg" />
                  <input type="text" placeholder="CPF do Responsável *" value={editingStudent?.guardian?.cpf || ''} onChange={(e) => handleGuardianInputChange('cpf', e.target.value)} required={isMinor} className="w-full px-4 py-2 border rounded-lg" />
                  <input type="tel" placeholder="Telefone do Responsável *" value={editingStudent?.guardian?.phone || ''} onChange={(e) => handleGuardianInputChange('phone', e.target.value)} required={isMinor} className="w-full px-4 py-2 border rounded-lg" />
                  <input type="email" placeholder="Email do Responsável" value={editingStudent?.guardian?.email || ''} onChange={(e) => handleGuardianInputChange('email', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-4 pt-6 border-t"><Button type="button" variant="secondary" onClick={handleCloseModal}>Cancelar</Button><Button type="submit">Salvar</Button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}