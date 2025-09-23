import React, { useState, useEffect } from 'react';
import { Users, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import DashboardService from '../../core/api/dashboardService';
import SportService from '../../core/api/sportService';
import { AulaDetalhes } from '../../core/api/aulaService'; // Importação do tipo correto
import { DashboardStats, Sport, Category } from '../../types';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import SportsManagement from './sportsManagement';

// Componente KPICard (sem alterações)
interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

function KPICard({ title, value, icon, color, onClick }: KPICardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Componente SportCard (sem alterações)
interface SportCardProps {
  sport: Sport;
  onClick: () => void;
}

function SportCard({ sport, onClick }: SportCardProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-6 text-center cursor-pointer transition-all hover:shadow-lg hover:scale-105"
      onClick={onClick}
    >
      <div className="text-4xl mb-3">{sport.icon}</div>
      <h3 className="font-semibold text-gray-900 capitalize">{sport.name}</h3>
      <p className="text-sm text-gray-600 mt-1">{sport.categories.length} categorias</p>
    </div>
  );
}

interface AdminDashboardProps {
  onNavigate?: (section: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalClasses: 0,
    unpaidStudents: 0,
  });
  const [sports, setSports] = useState<Sport[]>([]);
  const [aulasHoje, setAulasHoje] = useState<AulaDetalhes[]>([]); // CORREÇÃO: Usando o tipo AulaDetalhes
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSportsModal, setShowSportsModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, sportsData, aulasData] = await Promise.all([
        DashboardService.getDashboardStats(),
        SportService.getSports(),
        DashboardService.getAulasHoje(),
      ]);
      setDashboardStats(statsData);
      setSports(sportsData);
      setAulasHoje(aulasData);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError('Falha ao carregar dados do dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSportClick = (sport: Sport) => {
    setSelectedSport(sport);
  };
  
  return (
    <div className="p-6 space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Total de Alunos"
          value={dashboardStats.totalStudents}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          onClick={() => onNavigate && onNavigate('alunos')}
        />
        <KPICard
          title="Turmas Ativas"
          value={dashboardStats.totalClasses}
          icon={<Calendar className="w-6 h-6 text-white" />}
          color="bg-orange-500"
          onClick={() => onNavigate && onNavigate('turmas')}
        />
        <KPICard
          title="Pagamentos Pendentes"
          value={dashboardStats.unpaidStudents}
          icon={<AlertCircle className="w-6 h-6 text-white" />}
          color="bg-red-500"
        />
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando dados...</p>
        </div>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Navegar por Esportes */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Navegar por Esportes</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowSportsModal(true)}>
                Gerenciar Esportes
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sports.map((sport) => (
                <SportCard
                  key={sport.id}
                  sport={sport}
                  onClick={() => handleSportClick(sport)}
                />
              ))}
            </div>
          </div>

          {/* Chamadas do Dia */}
          <div>
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Aulas do Dia</h3>
                    {/* CORREÇÃO: Botão de refresh agora funciona */}
                    <Button variant="ghost" size="sm" onClick={loadDashboardData} disabled={isLoading}>
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">{new Date().toLocaleDateString('pt-BR')}</p>
              </div>
              
              <div className="p-6">
                {aulasHoje.length > 0 ? (
                  <div className="space-y-4">
                    {aulasHoje.map(aula => (
                       <div key={aula.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-semibold text-gray-800">{aula.turmaNome}</p>
                          <p className="text-sm text-gray-500">{aula.esporteNome} - {aula.totalPresentes}/{aula.totalAlunosNaTurma} presentes</p>
                       </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma aula agendada para hoje.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modais */}
      <Modal
        isOpen={!!selectedSport}
        onClose={() => setSelectedSport(null)}
        title={`Categorias - ${selectedSport?.name || ''}`}
        size="md"
      >
        {selectedSport && (
          <div className="space-y-4">
            {selectedSport.categories.map((category: Category) => (
              <div key={category.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{category.name} ({category.ageRange})</h4>
                    <Button variant="ghost" size="sm" onClick={() => onNavigate && onNavigate('turmas')}>
                      Ver Turmas
                    </Button>
                </div>
              </div>
            ))}
             {selectedSport.categories.length === 0 && (
                <p className="text-center text-gray-500 py-4">Nenhuma categoria cadastrada para este esporte.</p>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showSportsModal}
        onClose={() => setShowSportsModal(false)}
        title="Gerenciar Esportes"
        size="xl"
      >
        <SportsManagement />
      </Modal>
    </div>
  );
}