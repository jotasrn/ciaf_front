import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import SplashScreen from './features/auth/splashScreen';
import LoginScreen from './features/auth/loginScreen';
import ShellScreen from './features/shell_dashboard/shellScreen';
import AuthService from './core/api/authService';
import { User } from './types';

type AppState = 'loading' | 'login' | 'authenticated';

function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (appState === 'authenticated') {
      const user = AuthService.getCurrentUser();
      setCurrentUser(user);
    }
  }, [appState]);

  const handleAuthCheck = (isAuthenticated: boolean) => {
    setAppState(isAuthenticated ? 'authenticated' : 'login');
  };

  const handleLogin = () => {
    setAppState('authenticated');
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setAppState('login');
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {appState === 'loading' && <SplashScreen onAuthCheck={handleAuthCheck} />}
      {appState === 'login' && <LoginScreen onLogin={handleLogin} />}
      {appState === 'authenticated' && currentUser && (
        <ShellScreen user={currentUser} onLogout={handleLogout} />
      )}
      {appState === 'authenticated' && !currentUser && (
         <div className="min-h-screen bg-gray-100 flex items-center justify-center">Carregando sessão...</div>
      )}
    </>
  );
}

export default App;