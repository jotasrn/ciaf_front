// src/core/api/authService.ts

import { AxiosError } from 'axios';
import apiClient from './apiClient';
import { LoginRequest, LoginApiResponse, ApiUser, extractId } from './types';
import { User } from '../../types';

class AuthService {
  private static instance: AuthService;
  private _currentUser: User | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private convertApiUserToUser(apiUser: ApiUser): User {
    if (!apiUser?._id) {
      console.error("DEBUG: 'convertApiUserToUser' foi chamada com um objeto inválido:", apiUser);
      throw new Error("Dados do usuário recebidos da API estão incompletos.");
    }
    return {
      id: extractId(apiUser._id),
      name: apiUser.nome_completo,
      email: apiUser.email,
      role: apiUser.perfil === 'admin' ? 'admin' : 'professor',
      createdAt: new Date().toISOString()
    };
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const loginData: LoginRequest = { email, senha: password };

      // CORREÇÃO: Usando a interface específica 'LoginApiResponse' em vez de 'any'
      const response = await apiClient.post<LoginApiResponse>('/auth/login', loginData);
      
      const { access_token, user: userPayload } = response.data;

      if (!access_token || !userPayload) {
          throw new Error('Token de acesso ou dados do usuário não encontrados na resposta da API.');
      }
      
      let userObject: ApiUser;
      if (typeof userPayload === 'string') {
        userObject = JSON.parse(userPayload);
      } else if (typeof userPayload === 'object') {
        userObject = userPayload;
      } else {
        throw new Error('Formato de usuário inesperado na resposta da API.');
      }

      localStorage.setItem('access_token', access_token);
      
      const convertedUser = this.convertApiUserToUser(userObject);
      this._currentUser = convertedUser;
      
      localStorage.setItem('currentUser', JSON.stringify(convertedUser));
      
      return convertedUser;

    } catch (error) {
      const axiosError = error as AxiosError<{ msg?: string }>;
      if (axiosError?.response) {
        console.error('Erro de API no login:', axiosError.response.data?.msg || axiosError.message);
        if (axiosError.response.status === 401) throw new Error('Email ou senha incorretos');
        if (axiosError.response.status === 400) throw new Error('Dados de login inválidos');
      }
      
      console.error('Erro desconhecido no login:', error);
      if (error instanceof Error) {
        throw new Error(error.message || 'Erro ao conectar com o servidor.');
      }
      throw new Error('Erro ao conectar com o servidor. Tente novamente.');
    }
  }

  logout(): void {
    this._currentUser = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    if (this._currentUser) return this._currentUser;
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        this._currentUser = JSON.parse(stored);
        return this._currentUser;
      } catch (e) {
        // CORREÇÃO: A variável 'e' agora é usada no log de erro.
        console.error('Erro ao recuperar usuário do localStorage:', e);
        this.logout();
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}

export default AuthService.getInstance();