import { useState, useEffect, useCallback } from 'react';
import { Check, X, Clock, FileText, FileSpreadsheet, CreditCard as Edit, CheckSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import { StudentAttendance } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import AulaService, { PresencaAluno, AulaDetalhes } from '../../core/api/aulaService';

interface AttendanceModalProps {
  aula: AulaDetalhes;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export default function AttendanceModal({ aula, isOpen, onClose, onSave }: AttendanceModalProps) {
  const [attendances, setAttendances] = useState<Map<string, StudentAttendance['status']>>(new Map());
  const [students, setStudents] = useState<PresencaAluno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchAttendanceData = useCallback(async () => {
    if (!aula) return;
    setIsLoading(true);
    try {
      const presencas = await AulaService.getPresencasAula(aula.id);
      setStudents(presencas);
      const initialAttendances = new Map<string, StudentAttendance['status']>();
      presencas.forEach(aluno => {
        // Se a chamada já foi feita, carrega o status real, incluindo 'pendente'
        if (aula.status === 'Realizada') {
          initialAttendances.set(aluno.idAluno, aluno.status);
        } else {
          // Se a chamada está sendo feita agora, 'pendente' é tratado como 'ausente' por padrão
          initialAttendances.set(aluno.idAluno, aluno.status === 'pendente' ? 'ausente' : aluno.status);
        }
      });
      setAttendances(initialAttendances);
    } catch (err) {
      toast.error('Erro ao carregar os dados da chamada.');
      console.error(err);
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [aula, onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsEditing(false);
      fetchAttendanceData();
    }
  }, [isOpen, fetchAttendanceData]);

  const updateAttendance = (studentId: string, status: 'presente' | 'ausente' | 'justificado') => {
    setAttendances(prev => new Map(prev).set(studentId, status));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // --- CORREÇÃO APLICADA AQUI ---
      // Garante que o tipo enviado para a API corresponde ao esperado, tratando 'pendente' como 'ausente'.
      const presencasParaEnviar: { aluno_id: string; status: 'presente' | 'ausente' | 'justificado' }[] 
        = Array.from(attendances.entries()).map(([aluno_id, status]) => ({
            aluno_id,
            status: status === 'pendente' ? 'ausente' : status,
        }));

      await AulaService.submeterChamadaCompleta(aula.id, presencasParaEnviar);
      toast.success('Chamada salva com sucesso!');
      if (onSave) onSave();
      onClose();
    } catch (err) {
      toast.error('Erro ao salvar a chamada.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (formato: 'pdf' | 'xlsx') => {
    try {
      await AulaService.exportarChamada(aula.id, formato);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido ao exportar');
    }
  };
  
  const presentCount = Array.from(attendances.values()).filter(s => s === 'presente').length;
  const absentCount = Array.from(attendances.values()).filter(s => s === 'ausente' || s === 'pendente').length;
  const justifiedCount = Array.from(attendances.values()).filter(s => s === 'justificado').length;

  const getStatusBadge = (status: StudentAttendance['status']) => {
    const styles = {
      presente: 'bg-green-100 text-green-800',
      ausente: 'bg-red-100 text-red-800',
      justificado: 'bg-yellow-100 text-yellow-800',
      pendente: 'bg-gray-100 text-gray-800',
    };
    const text = status.charAt(0).toUpperCase() + status.slice(1);
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{text}</span>;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Chamada - ${aula.turmaNome}`} size="xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-b">
        <div>
          <p className="font-medium text-gray-700">Data da Aula</p>
          <p>{new Date(aula.data + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="flex space-x-6">
          <div className="text-center"><div className="text-2xl font-bold text-green-600">{presentCount}</div><div className="text-sm text-gray-600">Presentes</div></div>
          <div className="text-center"><div className="text-2xl font-bold text-red-600">{absentCount}</div><div className="text-sm text-gray-600">Ausentes</div></div>
          <div className="text-center"><div className="text-2xl font-bold text-yellow-600">{justifiedCount}</div><div className="text-sm text-gray-600">Justificados</div></div>
        </div>
        <div className="flex space-x-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => handleExport('pdf')}><FileText className="w-4 h-4 mr-2" /> PDF</Button>
          <Button variant="secondary" size="sm" onClick={() => handleExport('xlsx')}><FileSpreadsheet className="w-4 h-4 mr-2" /> Excel</Button>
        </div>
      </div>

      <div className="p-4 max-h-96 overflow-y-auto">
        {isLoading ? (
          <p className="text-center py-8">Carregando chamada...</p>
        ) : (
          <div className="divide-y divide-gray-200">
            {students.map((student) => {
              const status = attendances.get(student.idAluno) || 'pendente';
              return (
                <div key={student.idAluno} className="py-3 flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="font-medium text-gray-900">{student.nomeAluno}</p>
                  
                  {isEditing ? (
                    <div className="flex space-x-2 shrink-0">
                      <Button variant={status === 'presente' ? 'primary' : 'secondary'} size="sm" onClick={() => updateAttendance(student.idAluno, 'presente')}><Check className="w-4 h-4 mr-1" /> Presente</Button>
                      <Button variant={status === 'ausente' ? 'danger' : 'secondary'} size="sm" onClick={() => updateAttendance(student.idAluno, 'ausente')}><X className="w-4 h-4 mr-1" /> Ausente</Button>
                      <Button variant={status === 'justificado' ? 'ghost' : 'secondary'} size="sm" className={status === 'justificado' ? 'bg-yellow-100 text-yellow-800' : ''} onClick={() => updateAttendance(student.idAluno, 'justificado')}><Clock className="w-4 h-4 mr-1" /> Justificado</Button>
                    </div>
                  ) : (
                    <div>{getStatusBadge(status)}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-gray-50 flex justify-end">
          {isEditing ? (
            <Button onClick={handleSave} isLoading={isSaving} size="lg">
              <CheckSquare className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="lg">
              <Edit className="w-4 h-4 mr-2" />
              Editar Chamada
            </Button>
          )}
      </div>
    </Modal>
  );
}