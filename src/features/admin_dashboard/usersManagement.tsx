import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import UserService from '../../core/api/userService';
import { User } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Dropdown from '../../components/ui/Dropdown';

type UserFormData = Partial<User> & { password?: string };

const UserForm = ({
  user,
  onSave,
  onCancel,
}: {
  user: UserFormData;
  onSave: (data: UserFormData) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState(user);

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
          <input type="text" value={formData.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input type="email" value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Perfil</label>
          <select value={formData.role || 'professor'} onChange={(e) => handleInputChange('role', e.target.value as 'admin' | 'professor')} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="professor">Professor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
          {/* Este campo agora é válido graças à alteração no tipo User */}
          <input type="date" value={formData.birthDate || ''} onChange={(e) => handleInputChange('birthDate', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{user.id ? 'Nova Senha (opcional)' : 'Senha Temporária *'}</label>
        <input type="password" value={formData.password || ''} onChange={(e) => handleInputChange('password', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="••••••••" required={!user.id} />
        {user.id && <p className="text-xs text-gray-500 mt-1">Deixe em branco para não alterar.</p>}
      </div>
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
};

export default function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'professor'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserFormData | null>(null);
  
    useEffect(() => {
      loadUsers();
    }, []);
  
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const usersData = await UserService.getAllUsers();
        setUsers(usersData);
      } catch (err) {
        setError('Falha ao carregar usuários. Tente novamente.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleOpenModal = (user: Partial<User> | null = null) => {
        const userToEdit: UserFormData = user || {};
        setEditingUser(userToEdit);
        setIsModalOpen(true);
    };
  
    const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingUser(null);
    };
  
    const handleSaveUser = async (formData: UserFormData) => {
        const { id, name, email, role, password = '', birthDate } = formData;
        
        try {
            if (id && name && email && role && birthDate) {
                await UserService.updateUser(id, { name, email, role, birthDate });
                alert('Usuário atualizado com sucesso!');
            } else if (name && email && role && password && birthDate) {
                await UserService.createUser({ name, email, role, birthDate }, password);
                alert('Usuário criado com sucesso!');
            } else {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            handleCloseModal();
            await loadUsers();
        } catch (err) {
            alert('Erro ao salvar usuário.');
            console.error(err);
        }
    };
  
    const handleDelete = async (user: User) => {
      if (window.confirm(`Tem certeza que deseja desativar o usuário ${user.name}?`)) {
        try {
          await UserService.deleteUser(user.id);
          alert('Usuário desativado com sucesso!');
          await loadUsers();
        } catch (err) {
          alert('Erro ao desativar usuário.');
          console.error(err);
        }
      }
    };
  
    const filteredUsers = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  
    const getRoleBadgeColor = (role: 'admin' | 'professor') => {
      return role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
    };
  
    if (isLoading) return <div className="p-6 text-center">Carregando...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
            <div><h1 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h1><p className="text-gray-600 mt-1">Adicione, edite e gerencie admins e professores</p></div>
            <Button onClick={() => handleOpenModal()}><Plus className="w-4 h-4 mr-2" /> Novo Usuário</Button>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Buscar por nome ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div className="relative">
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)} className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8">
                        <option value="all">Todos os Perfis</option>
                        <option value="admin">Administradores</option>
                        <option value="professor">Professores</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
            </div>
        </div>
  
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perfil</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th></tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(user.role)}`}>{user.role}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap"><Dropdown items={[{ label: 'Editar', icon: <Edit className="w-4 h-4" />, onClick: () => handleOpenModal(user) }, { label: 'Desativar', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(user), variant: 'danger' }]} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
  
        {isModalOpen && (
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser?.id ? 'Editar Usuário' : 'Novo Usuário'} size="md">
                <UserForm user={editingUser!} onSave={handleSaveUser} onCancel={handleCloseModal} />
            </Modal>
        )}
      </div>
    );
}