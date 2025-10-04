import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import UserService from '../../core/api/userService';
import { Student, Guardian } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Dropdown from '../../components/ui/Dropdown';
import ToggleSwitch from '../../components/ui/ToggleSwitch'; // Supondo que você criou este componente

export default function StudentsManagement() {
  // --- ESTADOS ---
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);
  // A variável de estado 'error' foi removida, pois não era utilizada.

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const studentsData = await UserService.getStudents();
      setStudents(studentsData);
    } catch (err) {
      toast.error('Falha ao carregar alunos. Tente novamente.'); // Usa alert() diretamente
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 0;
    const ageDiffMs = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(ageDiffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const isMinor = editingStudent?.birthDate ? calculateAge(editingStudent.birthDate) < 18 : false;

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
        toast.success('Aluno atualizado com sucesso!');
      } else {
        await UserService.createStudent({ ...editingStudent, status: 'Ativo' });
        toast.success('Aluno criado com sucesso!');
      }
      handleCloseModal();
      await loadStudents();
    } catch (err) {
      toast.error('Erro ao salvar aluno.');
      console.error(err);
    }
  };

  const handleDelete = async (student: Student) => {
    if (window.confirm(`Tem certeza que deseja desativar o aluno ${student.name}?`)) {
      try {
        await UserService.deleteUser(student.id);
        toast.success('Aluno desativado com sucesso!');
        await loadStudents();
      } catch (err) {
        toast.error('Erro ao desativar aluno.');
        console.error(err);
      }
    }
  };
  
  const handlePaymentStatusChange = async (studentToUpdate: Student, newIsPaidStatus: boolean) => {
    setStudents(currentStudents =>
      currentStudents.map(s =>
        s.id === studentToUpdate.id ? { ...s, isPaid: newIsPaidStatus } : s
      )
    );

    try {
      await UserService.updateStudentPaymentStatus(studentToUpdate.id, newIsPaidStatus);
    } catch (err) {
      toast.error('Falha ao atualizar o status de pagamento. A alteração foi desfeita.');
      console.error(err);
      setStudents(currentStudents =>
        currentStudents.map(s =>
          s.id === studentToUpdate.id ? { ...s, isPaid: !newIsPaidStatus } : s
        )
      );
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString.includes('--')) return dateString;
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // --- RENDERIZAÇÃO ---
  if (isLoading) return <div className="p-6 text-center">Carregando alunos...</div>;
  
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Buscar por nome ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatDate(student.paymentDue)}</td>
                  <td className="px-6 py-4">
                    <ToggleSwitch 
                      enabled={student.isPaid} 
                      onChange={(newStatus) => handlePaymentStatusChange(student, newStatus)} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{student.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Dropdown 
                      items={[
                        { label: 'Editar', icon: <Edit className="w-4 h-4" />, onClick: () => handleOpenModal(student) }, 
                        { label: 'Desativar', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(student), variant: 'danger' }
                      ]} 
                    />
                  </td>
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
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}