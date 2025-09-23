import { useState, useEffect, useCallback } from 'react';
import { Users, Calendar, Trophy, ChevronRight } from 'lucide-react';
import TurmaService from '../../core/api/turmaService';
import { Class } from '../../types';
import Button from '../../components/ui/Button';

// CORREÇÃO: Propriedade 'currentUser' removida, pois não é necessária.
interface ProfessorClassesViewProps {
  onClassClick: (classItem: Class) => void;
}

export default function ProfessorClassesView({ onClassClick }: ProfessorClassesViewProps) {
  const [professorClasses, setProfessorClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfessorData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const classesData = await TurmaService.getTurmasByProfessor();
      setProfessorClasses(classesData);
    } catch (err) {
      console.error('Erro ao carregar dados do professor:', err);
      setError('Não foi possível carregar suas turmas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfessorData();
  }, [loadProfessorData]);

  const getDayName = (dayOfWeek: number) => {
    return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dayOfWeek] || '';
  };

  const formatSchedule = (schedule: { dayOfWeek: number; time: string }[]) => {
    if (!schedule || schedule.length === 0) return 'Sem horários definidos';
    return schedule.map((s) => `${getDayName(s.dayOfWeek)} ${s.time}`).join(' / ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando suas turmas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button onClick={loadProfessorData} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (professorClasses.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma turma encontrada</h3>
          <p className="text-gray-500">Você ainda não possui turmas atribuídas no sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Minhas Turmas</h1>
        <p className="text-gray-600 mt-1">Selecione uma turma para realizar a chamada.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professorClasses.map((classItem) => (
          <div
            key={classItem.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-blue-400 flex flex-col cursor-pointer"
            onClick={() => onClassClick(classItem)}
          >
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg truncate">{classItem.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{classItem.sportName || 'Esporte'}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2 text-gray-700">
                  <Trophy className="w-4 h-4 text-orange-500" />
                  <span>{classItem.categoryId}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Users className="w-4 h-4 text-green-500" />
                  <span>{classItem.students.length} aluno{classItem.students.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span>{formatSchedule(classItem.schedule)}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-100">
              <Button variant="primary" size="sm" className="w-full">Fazer Chamada</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}