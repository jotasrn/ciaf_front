import axios from 'axios';

//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://orangepizero3.taild57440.ts.net/api';


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {

    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {

    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error("Erro de autenticação (401). Redirecionando para o login.");
      localStorage.removeItem('access_token');
      localStorage.removeItem('currentUser');

      window.location.href = '/'; 
    }

    return Promise.reject(error);
  }
);

export default apiClient;