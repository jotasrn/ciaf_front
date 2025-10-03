import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  FolderOpen, 
  Calendar,
  Trophy,
  LogOut,
  Info
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  currentUser: User;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const menuItems = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'alunos', label: 'Alunos', icon: GraduationCap },
    { id: 'categorias', label: 'Categorias', icon: FolderOpen },
    { id: 'turmas', label: 'Turmas', icon: Calendar },
    { id: 'esportes', label: 'Esportes', icon: Trophy },
    { id: 'sobre', label: 'Sobre', icon: Info },
  ],
  professor: [
    { id: 'turmas', label: 'Minhas Turmas', icon: Calendar },
    { id: 'sobre', label: 'Sobre', icon: Info },
  ]
};

export default function Sidebar({ 
  currentUser, 
  activeSection, 
  onSectionChange, 
  onLogout,
  isMobileOpen,
  onMobileToggle 
}: SidebarProps) {
  const items = menuItems[currentUser.role];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-blue-900 text-white">
      {/* User Info */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-900 font-bold">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{currentUser.name}</h3>
            <p className="text-blue-200 text-sm truncate">{currentUser.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                if (window.innerWidth < 768) { // md breakpoint
                  onMobileToggle();
                }
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-100 hover:bg-blue-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-blue-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-blue-100 hover:bg-blue-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onMobileToggle} />
          <div className="fixed left-0 top-0 h-full w-64">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}