import { useEffect } from 'react';
import AuthService from '../../core/api/authService';

interface SplashScreenProps {
  onAuthCheck: (isAuthenticated: boolean) => void;
}

export default function SplashScreen({ onAuthCheck }: SplashScreenProps) {
  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = AuthService.isAuthenticated();
      
      setTimeout(() => {
        onAuthCheck(isAuthenticated);
      }, 1500);
    };

    checkAuth();
  }, [onAuthCheck]);

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
          <span className="text-blue-900 text-4xl font-bold">C</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">CIAF</h1>
        <p className="text-xl text-blue-200 mb-8">Carregando plataforma...</p>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    </div>
  );
}