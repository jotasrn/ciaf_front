import { useState } from 'react';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import AuthService from '../../core/api/authService';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await AuthService.login(email, password);
      toast.success('Login realizado com sucesso!');
      onLogin();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro inesperado.';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 bg-blue-900 items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-blue-900 text-3xl font-bold">C</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">CIAF</h1>
          <p className="text-xl text-blue-200">Plataforma de Gestão de Chamadas</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Entrar na Plataforma</h2>
            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg" 
                  placeholder="seu@email.com" 
                  required 
                  disabled={isLoading}
                  autoComplete="email" 
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <input 
                  type="password" 
                  id="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg" 
                  placeholder="••••••••" 
                  required 
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}