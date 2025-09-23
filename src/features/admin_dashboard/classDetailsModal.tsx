import { useState, useEffect } from 'react';
// CORREÇÃO: 'ChevronRight' foi removido da importação pois não está sendo usado.
import { X, Info, Users, Calendar } from 'lucide-react'; 
import { Class, Student, User, Sport } from '../../types';
import { AulaDetalhes } from '../../core/api/aulaService';

// CORREÇÃO: 'SportService' foi removido pois não é usado diretamente neste componente.
import UserService from '../../core/api/userService';
import AulaService from '../../core/api/aulaService';

interface ClassDetailsModalProps {
  classItem: Class;
  isOpen: boolean;
  onClose: () => void;
  // Os dados de professores e esportes são passados pelo componente pai para maior eficiência.
  professors: User[];
  sports: Sport[];
}

type TabType = 'overview' | 'students' | 'schedule';

export default function ClassDetailsModal({ classItem, isOpen, onClose, professors, sports }: ClassDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [aulas, setAulas] = useState<AulaDetalhes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loadClassDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const [allStudents, classAulas] = await Promise.all([
            UserService.getStudents(),
            AulaService.getAulasPorTurma(classItem.id),
          ]);

          const studentsInClass = allStudents.filter(s => classItem.students.includes(s.id));
          setStudents(studentsInClass);
          setAulas(classAulas);

        } catch (err) {
          console.error("Erro ao carregar detalhes da turma:", err);
          setError("Não foi possível carregar os detalhes da turma.");
        } finally {
          setIsLoading(false);
        }
      };
      loadClassDetails();
    }
  }, [isOpen, classItem]);

  if (!isOpen) return null;

  const sport = sports.find(s => s.id === classItem.sportId);
  const category = sport?.categories.find(cat => cat.id === classItem.categoryId);
  const professor = professors.find(p => p.id === classItem.professorId);

  const getDayName = (dayOfWeek: number) => {
    return ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayOfWeek];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };
  
  const renderContent = () => {
    if (isLoading) return <div className="p-8 text-center">Carregando detalhes...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3"><div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">{sport?.icon}</div><div><p className="text-sm text-gray-600">Esporte</p><p className="font-medium text-gray-900">{sport?.name}</p></div></div>
                <div className="flex items-center space-x-3"><div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-green-600" /></div><div><p className="text-sm text-gray-600">Categoria</p><p className="font-medium text-gray-900">{category?.name}</p></div></div>
                <div className="flex items-center space-x-3"><div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-purple-600" /></div><div><p className="text-sm text-gray-600">Professor</p><p className="font-medium text-gray-900">{professor?.name}</p></div></div>
                <div className="flex items-center space-x-3"><div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-orange-600" /></div><div><p className="text-sm text-gray-600">Alunos</p><p className="font-medium text-gray-900">{students.length} / {classItem.maxStudents}</p></div></div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Horários Fixos</h3>
              <div className="space-y-2">
                {classItem.schedule.map((sch, i) => <div key={i} className="flex items-center space-x-2 text-sm text-gray-600"><Calendar className="w-4 h-4" /><span>Toda {getDayName(sch.dayOfWeek)} às {sch.time}</span></div>)}
              </div>
            </div>
          </div>
        );
      case 'students':
        return (
            <div className="space-y-4">
                {students.length > 0 ? students.map((student) => (
                    <div key={student.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0"><span className="font-medium text-blue-600">{student.name.charAt(0).toUpperCase()}</span></div>
                        <div className="flex-1"><h4 className="font-medium text-gray-900">{student.name}</h4><p className="text-sm text-gray-600">{student.email}</p></div>
                    </div>
                )) : <div className="text-center py-8"><Users className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Nenhum aluno matriculado.</p></div>}
            </div>
        );
      case 'schedule':
        return (
            <div className="space-y-3">
                {aulas.length > 0 ? aulas.map((aula) => (
                    <div key={aula.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3"><Calendar className="w-5 h-5 text-gray-400" /><div><p className="font-medium text-gray-900">Aula de {formatDate(aula.data)}</p><p className="text-sm text-gray-600">Status: {aula.status} | Presença: {aula.totalPresentes}/{aula.totalAlunosNaTurma}</p></div></div>
                    </div>
                )) : <div className="text-center py-8"><Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Nenhum histórico de aulas.</p></div>}
            </div>
        );
      default: return null;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Info },
    { id: 'students', label: 'Alunos', icon: Users },
    { id: 'schedule', label: 'Aulas', icon: Calendar }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Detalhes da Turma: {classItem.name}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="p-6 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}