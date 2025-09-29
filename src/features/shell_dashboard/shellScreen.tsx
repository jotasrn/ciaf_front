import { useState } from 'react';
import { User, Class } from '../../types';
import { AulaDetalhes } from '../../core/api/aulaService'; // Importação necessária

// Components
import Sidebar from '../../components/ui/Sidebar';
import AdminDashboard from '../admin_dashboard/adminDashboard';
import UsersManagement from '../admin_dashboard/usersManagement';
import StudentsManagement from '../admin_dashboard/studentsManagement';
import CategoriesManagement from '../admin_dashboard/categoriesManagement';
import ClassesManagement from '../admin_dashboard/classManagement';
import SportsManagement from '../admin_dashboard/sportsManagement';
import AboutPage from '../about/AboutPage';
import ProfessorClassesView from '../professor/professorClasses';
import AttendanceView from '../professor/attendanceView';

interface ShellScreenProps {
  user: User;
  onLogout: () => void;
}

export default function ShellScreen({ user, onLogout }: ShellScreenProps) {
  const [activeSection, setActiveSection] = useState(user.role === 'professor' ? 'turmas' : 'dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedAula, setSelectedAula] = useState<AulaDetalhes | null>(null);

  // --- NOVO ESTADO PARA FORÇAR A RECARGA ---
  // Este estado será usado para mudar a 'key' do componente de turmas.
  const [reloadKey, setReloadKey] = useState(0);

  const handleClassClick = (classItem: Class, aula: AulaDetalhes) => {
    setSelectedClass(classItem);
    setSelectedAula(aula);
    setActiveSection('chamadas');
  };

  const handleBackFromAttendance = () => {
    setSelectedClass(null);
    setSelectedAula(null);
    setActiveSection('turmas');
    // --- LÓGICA DE RECARGA ---
    // Incrementa a chave. Isso fará com que o React desmonte e remonte
    // o componente ProfessorClassesView, forçando uma nova busca de dados.
    setReloadKey(prevKey => prevKey + 1);
  };

  const renderContent = () => {
    // Painel do Professor
    if (user.role === 'professor') {
      switch (activeSection) {
        case 'turmas':
          // --- ADICIONADA A 'key' AQUI ---
          // Ao mudar a key, o componente é recriado do zero, buscando dados novos.
          return <ProfessorClassesView key={reloadKey} onClassClick={handleClassClick} />;
        case 'chamadas':
          return selectedClass && selectedAula ? (
            <AttendanceView 
              classItem={selectedClass} 
              aula={selectedAula}
              onBack={handleBackFromAttendance} 
            />
          ) : (
            // Fallback caso algo dê errado, retorna para a tela de turmas
            <ProfessorClassesView key={reloadKey} onClassClick={handleClassClick} />
          );
        case 'sobre':
          return <AboutPage />;
        default:
          return <ProfessorClassesView key={reloadKey} onClassClick={handleClassClick} />;
      }
    }

    // Painel do Administrador (sem alterações)
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard onNavigate={setActiveSection} />;
      case 'usuarios':
        return <UsersManagement />;
      case 'alunos':
        return <StudentsManagement />;
      case 'categorias':
        return <CategoriesManagement />;
      case 'turmas':
        return <ClassesManagement />;
      case 'esportes':
        return <SportsManagement />;
      case 'sobre':
        return <AboutPage />;
      default:
        return <AdminDashboard onNavigate={setActiveSection} />;
    }
  };

  const getSectionTitle = () => {
    if (user.role === 'professor') {
      switch (activeSection) {
        case 'turmas': return 'Minhas Turmas';
        case 'chamadas': return selectedClass ? `Chamada - ${selectedClass.name}` : 'Chamadas';
        case 'sobre': return 'Sobre';
        default: return 'Minhas Turmas';
      }
    }
    
    switch (activeSection) {
      case 'usuarios': return 'Usuários';
      case 'alunos': return 'Alunos';
      case 'categorias': return 'Categorias';
      case 'turmas': return 'Turmas';
      case 'esportes': return 'Esportes';
      case 'sobre': return 'Sobre';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentUser={user}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={onLogout}
        isMobileOpen={isMobileMenuOpen}
        onMobileToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="ml-12">
            <h1 className="text-lg font-semibold text-gray-900 capitalize">
              {getSectionTitle()}
            </h1>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}