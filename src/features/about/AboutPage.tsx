import React from 'react';
import { ExternalLink, Code, Users, Heart } from 'lucide-react';
import Button from '../../components/ui/Button';

const developers = [
  {
    name: 'João Pedro',
    role: 'Full Stack Developer',
    linkedin: 'https://www.linkedin.com/in/joaosrn/'
  },
  {
    name: 'Cadu',
    role: 'Backend Developer',
    linkedin: 'https://www.linkedin.com/in/carlos-eduardo-ribeiro-ferreira-5011631a6/'
  },
  {
    name: 'Pedro',
    role: 'Product owner',
    linkedin: 'https://www.linkedin.com/in/pedro-henrique-069916332'
  },
  {
    name: 'Yuri',
    role: 'Analista de bancos de dados',
    linkedin: 'https://www.linkedin.com/in/yuri-lucas-0a0746261/'
  }
];

// As props 'onBack' foram removidas da definição do componente
export default function AboutPage() {
  const handleLinkedInClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sobre o Sistema</h1>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* System Description */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Code className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sistema de Gestão CIAF</h2>
              <p className="text-gray-600">Plataforma completa para gerenciamento de escola esportiva</p>
            </div>
          </div>
          
          <div className="prose max-w-none text-gray-700">
            <p className="text-lg leading-relaxed mb-4">
              O Sistema de Gestão Educacional é uma plataforma moderna e intuitiva desenvolvida 
              especificamente para facilitar o gerenciamento do CIAF.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">Principais Funcionalidades</h3>
                <ul className="space-y-2 text-blue-800">
                  <li>• Gestão completa de alunos e professores</li>
                  <li>• Controle de turmas e horários</li>
                  <li>• Sistema de chamadas e presença</li>
                  <li>• Gerenciamento de pagamentos</li>
                  <li>• Organização por esportes e categorias</li>
                  <li>• Dashboard com métricas importantes</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">Benefícios</h3>
                <ul className="space-y-2 text-green-800">
                  <li>• Interface moderna e intuitiva</li>
                  <li>• Acesso responsivo em qualquer dispositivo</li>
                  <li>• Controle de permissões por usuário</li>
                  <li>• Relatórios e estatísticas em tempo real</li>
                  <li>• Segurança e confiabilidade</li>
                  <li>• Suporte técnico especializado</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Development Team */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Equipe de Desenvolvimento</h2>
              <p className="text-gray-600">Conheça os profissionais por trás desta solução</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {developers.map((developer, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">
                    {developer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{developer.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{developer.role}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLinkedInClick(developer.linkedin)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  LinkedIn
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Desenvolvido pela MetaTech</h2>
              <p className="text-gray-600">Startup focada em soluções tecnológicas inovadoras</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl font-bold">M</span>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">MetaTech Startup</h3>
              <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
                A MetaTech é uma startup brasileira especializada no desenvolvimento de soluções 
                tecnológicas inovadoras para diversos segmentos. Nossa missão é transformar 
                processos complexos em experiências simples e eficientes através da tecnologia.
              </p>
              
              <div className="mt-6 flex justify-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">2025</div>
                  <div className="text-sm text-gray-600">Fundação</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">3</div>
                  <div className="text-sm text-gray-600">Projetos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-sm text-gray-600">Satisfação</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-500">
            © 2024 MetaTech Startup. Todos os direitos reservados.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Sistema de Gestão Educacional - Versão 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}