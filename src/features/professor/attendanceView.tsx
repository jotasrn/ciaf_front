import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Users, Calendar, Save, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { Class, StudentAttendance } from '../../types';
import Button from '../../components/ui/Button';
import AulaService, { PresencaAluno, AulaDetalhes } from '../../core/api/aulaService'; // Corrigido para aulService -> aulaService

interface AttendanceViewProps {
  classItem: Class;
  onBack: () => void;
}

export default function AttendanceView({ classItem, onBack }: AttendanceViewProps) {
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendances, setAttendances] = useState<Map<string, StudentAttendance['status']>>(new Map());
  const [students, setStudents] = useState<PresencaAluno[]>([]);
  
  const [currentAula, setCurrentAula] = useState<AulaDetalhes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar a aula e a lista de chamada para a data selecionada
  const fetchAttendanceData = useCallback(async (date: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentAula(null);
    setStudents([]);
    setAttendances(new Map());

    try {
      // 1. Buscar todas as aulas agendadas para esta turma
      const todasAsAulas = await AulaService.getAulasPorTurma(classItem.id);

      // 2. Encontrar a aula específica para a data selecionada
      const aulaDoDia = todasAsAulas.find(aula => 
        new Date(aula.data).toISOString().split('T')[0] === date
      );

      if (aulaDoDia) {
        setCurrentAula(aulaDoDia);
        // 3. Se a aula existe, buscar a lista de presença dela
        const presencas = await AulaService.getPresencasAula(aulaDoDia.id);
        setStudents(presencas);

        // 4. Preencher o estado de presenças
        const initialAttendances = new Map<string, StudentAttendance['status']>();
        presencas.forEach(aluno => {
          initialAttendances.set(aluno.idAluno, aluno.status === 'pendente' ? 'ausente' : aluno.status);
        });
        setAttendances(initialAttendances);
      }
      // Se não encontrar aulaDoDia, os estados continuarão vazios, indicando que não há aula.

    } catch (err) {
      setError('Erro ao carregar os dados da chamada. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [classItem.id]);

  // Efeito inicial para carregar os dados do dia atual
  useEffect(() => {
    fetchAttendanceData(attendanceDate);
  }, [fetchAttendanceData, attendanceDate]);

  const updateAttendance = (studentId: string, status: StudentAttendance['status']) => {
    setAttendances(prev => new Map(prev).set(studentId, status));
  };

  const handleSave = async () => {
    if (!currentAula) {
      alert("Não há uma aula selecionada para salvar a chamada.");
      return;
    }
    
    setIsSaving(true);
    try {
      const presencasParaEnviar = Array.from(attendances.entries()).map(([aluno_id, status]) => ({
        aluno_id,
        status,
      }));

      await AulaService.submeterChamadaCompleta(currentAula.id, presencasParaEnviar);
      alert('Chamada salva com sucesso!');
      onBack(); // Volta para a tela anterior após salvar
    } catch (err) {
      alert('Erro ao salvar a chamada.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Contadores para o resumo
  const presentCount = Array.from(attendances.values()).filter(s => s === 'presente').length;
  const absentCount = Array.from(attendances.values()).filter(s => s === 'ausente').length;
  const justifiedCount = Array.from(attendances.values()).filter(s => s === 'justificado').length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Chamada - {classItem.name}</h1>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {classItem.schedule.map(s => `${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][s.dayOfWeek]} ${s.time}`).join(', ')}
            </span>
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {classItem.students.length} alunos
            </span>
          </div>
        </div>
      </div>

      {/* Date Selection & Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data da Aula
            </label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-6">
              {/* Contadores */}
              <div className="text-center"><div className="text-2xl font-bold text-green-600">{presentCount}</div><div className="text-sm text-gray-600">Presentes</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-red-600">{absentCount}</div><div className="text-sm text-gray-600">Ausentes</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-yellow-600">{justifiedCount}</div><div className="text-sm text-gray-600">Justificados</div></div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-md">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Carregando chamada...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : !currentAula ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="font-semibold text-lg">Nenhuma aula encontrada</h3>
            <p>Não há aula agendada para esta turma no dia selecionado.</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Lista de Chamada</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {students.map((student) => {
                const status = attendances.get(student.idAluno) || 'ausente';
                return (
                  <div key={student.idAluno} className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 text-lg">
                          {student.nomeAluno.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{student.nomeAluno}</h3>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 shrink-0">
                      <Button variant={status === 'presente' ? 'primary' : 'secondary'} onClick={() => updateAttendance(student.idAluno, 'presente')}><Check className="w-4 h-4 mr-1" /> Presente</Button>
                      <Button variant={status === 'ausente' ? 'danger' : 'secondary'} onClick={() => updateAttendance(student.idAluno, 'ausente')}><X className="w-4 h-4 mr-1" /> Ausente</Button>
                      <Button variant={status === 'justificado' ? 'ghost' : 'secondary'} className={status === 'justificado' ? 'bg-yellow-100 text-yellow-800' : ''} onClick={() => updateAttendance(student.idAluno, 'justificado')}><Clock className="w-4 h-4 mr-1" /> Justificado</Button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <Button onClick={handleSave} isLoading={isSaving} size="lg">
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Salvando...' : 'Salvar Chamada'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}