import { useState } from 'react';
import { User, Class } from '../../types';
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

  const handleClassClick = (classItem: Class) => {
    setSelectedClass(classItem);
    setActiveSection('chamadas');
  };

  const handleBackFromAttendance = () => {
    setSelectedClass(null);
    setActiveSection('turmas');
  };

  const renderContent = () => {
    // Painel do Professor
    if (user.role === 'professor') {
      switch (activeSection) {
        case 'turmas':
          // CORREÇÃO: A propriedade 'currentUser' foi removida.
          return <ProfessorClassesView onClassClick={handleClassClick} />;
        case 'chamadas':
          return selectedClass ? (
            <AttendanceView classItem={selectedClass} onBack={handleBackFromAttendance} />
          ) : (
            // CORREÇÃO: A propriedade 'currentUser' foi removida.
            <ProfessorClassesView onClassClick={handleClassClick} />
          );
        case 'sobre':
          return <AboutPage onBack={() => setActiveSection('turmas')} />;
        default:
          // CORREÇÃO: A propriedade 'currentUser' foi removida.
          return <ProfessorClassesView onClassClick={handleClassClick} />;
      }
    }

    // Painel do Administrador
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
        return <AboutPage onBack={() => setActiveSection('dashboard')} />;
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