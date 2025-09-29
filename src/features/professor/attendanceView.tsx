import { useState, useEffect } from 'react'; // 'useCallback' foi removido
import { 
  ArrowLeft, Users, Calendar, Save, Check, X, Clock, 
  HelpCircle, FileText, FileSpreadsheet, Lock 
} from 'lucide-react';
import { Class, StudentAttendance } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import AulaService, { PresencaAluno, AulaDetalhes } from '../../core/api/aulaService';

interface AttendanceViewProps {
  classItem: Class;
  aula: AulaDetalhes;
  onBack: () => void;
}

const StatusBadge = ({ status }: { status: StudentAttendance['status'] }) => {
    const styles = {
      presente: 'bg-green-100 text-green-800',
      ausente: 'bg-red-100 text-red-800',
      justificado: 'bg-yellow-100 text-yellow-800',
      pendente: 'bg-gray-100 text-gray-800',
    };
    const text = status.charAt(0).toUpperCase() + status.slice(1);
    return <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status]}`}>{text}</span>;
};

export default function AttendanceView({ classItem, aula, onBack }: AttendanceViewProps) {
  const [attendances, setAttendances] = useState<Map<string, StudentAttendance['status']>>(new Map());
  const [students, setStudents] = useState<PresencaAluno[]>([]);
  
  const [currentAula, setCurrentAula] = useState<AulaDetalhes>(aula);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  
  const isReadOnly = currentAula?.status === 'realizada';

  useEffect(() => {
    const fetchPresencas = async () => {
      if (!currentAula) return;

      setIsLoading(true);
      try {
        const presencas = await AulaService.getPresencasAula(currentAula.id);
        setStudents(presencas);

        const initialAttendances = new Map<string, StudentAttendance['status']>();
        presencas.forEach(aluno => {
          const statusInicial = currentAula.status === 'realizada' 
            ? aluno.status 
            : (aluno.status === 'pendente' ? 'ausente' : aluno.status);
          initialAttendances.set(aluno.idAluno, statusInicial);
        });
        setAttendances(initialAttendances);

      } catch (err) {
        alert('Erro ao carregar lista de chamada.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPresencas();
  }, [currentAula]);

  const updateAttendance = (studentId: string, status: 'presente' | 'ausente' | 'justificado') => {
    if (isReadOnly) return;
    setAttendances(prev => new Map(prev).set(studentId, status));
  };

  const handleSave = async () => {
    if (!currentAula) return;
    
    setIsSaving(true);
    try {
      const presencasParaEnviar = Array.from(attendances.entries()).map(([aluno_id, status]) => ({
        aluno_id,
        status: status === 'pendente' ? 'ausente' : status,
      }));

      await AulaService.submeterChamadaCompleta(currentAula.id, presencasParaEnviar);
      alert('Chamada salva com sucesso!');
      
      
      setCurrentAula(prev => ({ ...prev!, status: 'realizada' }));
      
    } catch (err) {
      alert('Erro ao salvar a chamada.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (formato: 'pdf' | 'xlsx') => {
    if (!currentAula) return;
    try {
      await AulaService.exportarChamada(currentAula.id, formato);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao exportar');
    }
  };
  
  const presentCount = Array.from(attendances.values()).filter(s => s === 'presente').length;
  const absentCount = Array.from(attendances.values()).filter(s => s === 'ausente' || s === 'pendente').length;
  const justifiedCount = Array.from(attendances.values()).filter(s => s === 'justificado').length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
          <div className="flex items-center">
              <Button variant="ghost" onClick={onBack} className="mr-4 self-start">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
              </Button>
              <div>
                  <h1 className="text-2xl font-bold text-gray-900">Chamada - {classItem.name}</h1>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{classItem.schedule.map(s => `${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][s.dayOfWeek]} ${s.time}`).join(', ')}</span>
                      <span className="flex items-center"><Users className="w-4 h-4 mr-1" />{students.length} alunos</span>
                  </div>
              </div>
          </div>
          <div className="flex space-x-2 shrink-0 self-start sm:self-center">
              <Button variant="secondary" size="sm" onClick={() => setIsInstructionsModalOpen(true)}><HelpCircle className="w-4 h-4 mr-2" /> Instruções</Button>
              <Button variant="secondary" size="sm" onClick={() => handleExport('pdf')} disabled={!isReadOnly}><FileText className="w-4 h-4 mr-2" /> PDF</Button>
              <Button variant="secondary" size="sm" onClick={() => handleExport('xlsx')} disabled={!isReadOnly}><FileSpreadsheet className="w-4 h-4 mr-2" /> Excel</Button>
          </div>
      </div>

      {/* Date & Counters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">Data da Aula</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(currentAula.data + 'T00:00:00').toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex space-x-6">
            <div className="text-center"><div className="text-2xl font-bold text-green-600">{presentCount}</div><div className="text-sm text-gray-600">Presentes</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-red-600">{absentCount}</div><div className="text-sm text-gray-600">Ausentes</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-yellow-600">{justifiedCount}</div><div className="text-sm text-gray-600">Justificados</div></div>
          </div>
        </div>
      </div>

      {/* Student List & Save Button */}
      <div className="bg-white rounded-lg shadow-md">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Carregando chamada...</div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Lista de Chamada</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {students.map((student) => {
                const status = attendances.get(student.idAluno) || 'pendente';
                return (
                  <div key={student.idAluno} className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <h3 className="font-medium text-gray-900">{student.nomeAluno}</h3>
                    
                    {isReadOnly ? (
                        <StatusBadge status={status} />
                    ) : (
                        <div className="flex space-x-2 shrink-0">
                            <Button variant={status === 'presente' ? 'primary' : 'secondary'} onClick={() => updateAttendance(student.idAluno, 'presente')}><Check className="w-4 h-4 mr-1" /> Presente</Button>
                            <Button variant={status === 'ausente' ? 'danger' : 'secondary'} onClick={() => updateAttendance(student.idAluno, 'ausente')}><X className="w-4 h-4 mr-1" /> Ausente</Button>
                            <Button variant={status === 'justificado' ? 'ghost' : 'secondary'} className={status === 'justificado' ? 'bg-yellow-100 text-yellow-800' : ''} onClick={() => updateAttendance(student.idAluno, 'justificado')}><Clock className="w-4 h-4 mr-1" /> Justificado</Button>
                        </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              {isReadOnly ? (
                <div className="flex justify-end items-center gap-2 text-gray-600">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Chamada já finalizada.</span>
                </div>
              ) : (
                <div className="flex justify-end">
                  <Button onClick={handleSave} isLoading={isSaving} size="lg">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Salvando...' : 'Finalizar e Salvar Chamada'}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Modal isOpen={isInstructionsModalOpen} onClose={() => setIsInstructionsModalOpen(false)} title="Como Fazer a Chamada">
        <div className="space-y-4 text-gray-700">
          <p>1. Para cada aluno, clique em "Presente", "Ausente" ou "Justificado".</p>
          <p>2. Ao finalizar, clique em "Finalizar e Salvar Chamada" para registrar as presenças no sistema.</p>
          <p>3. Uma vez salva, a chamada não poderá mais ser editada por você.</p>
        </div>
      </Modal>
    </div>
  );
}