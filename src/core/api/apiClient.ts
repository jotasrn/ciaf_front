import axios from 'axios';

// 1. DEFINIÇÃO DA URL BASE
// Padronizamos a URL de fallback para 'localhost' para garantir consistência
// com a configuração do CORS no backend e evitar problemas.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://orangepizero3.taild57440.ts.net/api';

// 2. CRIAÇÃO DA INSTÂNCIA DO AXIOS
// Criamos uma instância única do Axios que será usada em toda a aplicação.
// Isso centraliza toda a configuração de comunicação em um só lugar.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. INTERCEPTOR DE REQUISIÇÃO (INJETOR DE TOKEN)
// Este trecho de código é executado ANTES de cada requisição ser enviada.
apiClient.interceptors.request.use(
  (config) => {
    // Busca o token de autenticação que salvamos no localStorage durante o login.
    const token = localStorage.getItem('access_token');
    
    // Se o token existir, ele é adicionado ao cabeçalho 'Authorization'.
    // É isso que permite o acesso às rotas protegidas do backend.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Caso ocorra um erro na preparação da requisição, ele é retornado.
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // Se a resposta for bem-sucedida (status 2xx), apenas a repassamos.
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error("Erro de autenticação (401). Redirecionando para o login.");
      // Limpa os dados do usuário do localStorage.
      localStorage.removeItem('access_token');
      localStorage.removeItem('currentUser');
      // Força o redirecionamento para a tela de login.
      window.location.href = '/'; 
    }

    return Promise.reject(error);
  }
);

export default apiClient;