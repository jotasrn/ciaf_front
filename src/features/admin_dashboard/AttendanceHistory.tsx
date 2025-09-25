import { useState, useEffect } from 'react';
import { Calendar, Search, Users } from 'lucide-react';
import AulaService, { AulaDetalhes } from '../../core/api/aulaService';
import AttendanceModal from '../shared/AttendanceModal';

export default function AttendanceHistory() {
  const [historico, setHistorico] = useState<AulaDetalhes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroData, setFiltroData] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');
  const [selectedAula, setSelectedAula] = useState<AulaDetalhes | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const data = await AulaService.getHistoricoAulas({
          data: filtroData,
          turma: filtroTurma,
        });
        setHistorico(data);
      } catch (error) {
        console.error(error);
        alert('Não foi possível carregar o histórico.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Um timer para evitar buscas a cada tecla digitada no campo de texto
    const handler = setTimeout(() => {
      fetchHistory();
    }, 500); // Aguarda 500ms após o usuário parar de digitar

    return () => clearTimeout(handler);
  }, [filtroData, filtroTurma]);

  return (
    <div className="bg-white rounded-lg shadow-md mt-8">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Histórico de Chamadas</h2>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          {/* Filtro de Data */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="w-full md:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          {/* Filtro de Turma */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome da turma..."
              value={filtroTurma}
              onChange={(e) => setFiltroTurma(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <p className="text-center p-8 text-gray-500">Carregando histórico...</p>
        ) : historico.length > 0 ? (
          historico.map(aula => (
            <div 
              key={aula.id}
              className="flex justify-between items-center p-4 border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedAula(aula)}
            >
              <div>
                <p className="font-semibold">{aula.turmaNome}</p>
                <p className="text-sm text-gray-600">{new Date(aula.data + 'T00:00:00').toLocaleDateString('pt-BR')} - {aula.esporteNome}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Users className="w-4 h-4" />
                <span>{aula.totalPresentes} / {aula.totalAlunosNaTurma}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center p-8 text-gray-500">Nenhum registro encontrado para os filtros selecionados.</p>
        )}
      </div>

      {selectedAula && (
        <AttendanceModal 
          isOpen={!!selectedAula}
          onClose={() => setSelectedAula(null)}
          aula={selectedAula}
          onSave={() => { /* Recarrega os dados se necessário */ }}
        />
      )}
    </div>
  );
}