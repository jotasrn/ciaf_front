import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
// CORREÇÃO: Ícone 'Trophy' removido pois não era utilizado.
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import SportService from '../../core/api/sportService';
import { Sport } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Dropdown from '../../components/ui/Dropdown';

const SportForm = ({ 
  sport, 
  onSave, 
  onCancel 
}: { 
  sport: Partial<Sport>, 
  onSave: (data: { nome: string, icone: string }) => void, 
  onCancel: () => void 
}) => {
  const [name, setName] = useState(sport.name || '');
  const [icon, setIcon] = useState(sport.icon || '');
  
  const commonSportIcons = ['⚽', '🏀', '🏐', '🎾', '🏊', '🏃', '🥋', '🏓', '🏸', '🤸', '🏈', '🏒'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && icon) {
      onSave({ nome: name, icone: icon });
    } else {
      toast.error('Por favor, preencha o nome e selecione um ícone.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Esporte</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Ex: Futebol de Salão"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ícone (Emoji)</label>
        
        <div className="grid grid-cols-6 gap-2 mb-4">
          {commonSportIcons.map((iconOption) => (
            <button
              key={iconOption}
              type="button"
              onClick={() => setIcon(iconOption)}
              className={`p-3 text-2xl border-2 rounded-lg transition-colors text-center ${
                icon === iconOption 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:bg-gray-100'
              }`}
            >
              {iconOption}
            </button>
          ))}
        </div>
        
        <input
          type="text"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-2"
          placeholder="Ou cole um emoji aqui"
          required
        />
      </div>
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
};

// Componente principal da página
export default function SportsManagement() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<Partial<Sport> | null>(null);

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sportsData = await SportService.getSports();
      setSports(sportsData);
    } catch (err) {
      console.error(err); // CORREÇÃO: Usando a variável 'err'
      setError('Falha ao carregar esportes. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (sport: Partial<Sport> | null = null) => {
    setEditingSport(sport || {});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSport(null);
  };

  const handleSaveSport = async (sportData: { nome: string; icone: string }) => {
    try {
      if (editingSport?.id) {
        await SportService.updateSport(editingSport.id, sportData);
        toast.success('Esporte atualizado com sucesso!');
      } else {
        await SportService.createSport(sportData);
        toast.success('Esporte criado com sucesso!');
      }
      handleCloseModal();
      await loadSports();
    } catch (err) {
      console.error(err); // CORREÇÃO: Usando a variável 'err'
      toast.error('Erro ao salvar esporte.');
    }
  };

  const handleDelete = async (sport: Sport) => {
    if (window.confirm(`Tem certeza que deseja excluir "${sport.name}"?`)) {
      try {
        await SportService.deleteSport(sport.id);
        toast.success('Esporte excluído com sucesso!');
        await loadSports();
      } catch (err) {
        console.error(err); // CORREÇÃO: Usando a variável 'err'
        toast.error('Erro ao excluir esporte.');
      }
    }
  };

  const filteredSports = sports.filter(sport =>
    sport.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Esportes</h1>
          <p className="text-gray-600 mt-1">Adicione, edite e remova os esportes disponíveis</p>
        </div>
        <Button onClick={() => handleOpenModal()}><Plus className="w-4 h-4 mr-2" /> Novo Esporte</Button>
      </div>

      <div className="bg-white rounded-lg shadow-md mb-6 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar esportes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLoading && <p className="text-center py-8">Carregando esportes...</p>}
      {error && <p className="text-center py-8 text-red-500">{error}</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSports.map((sport) => (
            <div key={sport.id} className="bg-white rounded-lg shadow-md p-6 text-center transition-shadow hover:shadow-lg">
              <div className="text-4xl mb-3">{sport.icon}</div>
              <h3 className="font-semibold text-gray-900 capitalize mb-2">{sport.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{sport.categories.length} categoria(s)</p>
              <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
                <Dropdown
                  items={[
                    { label: 'Editar', icon: <Edit className="w-4 h-4" />, onClick: () => handleOpenModal(sport) },
                    { label: 'Excluir', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(sport), variant: 'danger' }
                  ]}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingSport?.id ? "Editar Esporte" : "Novo Esporte"}
          size="md"
        >
          <SportForm
            sport={editingSport!}
            onSave={handleSaveSport}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
}