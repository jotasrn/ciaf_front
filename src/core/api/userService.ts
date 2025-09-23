// src/core/api/userService.ts

import apiClient from './apiClient';
import { ApiUser, CreateUserRequest, UpdateUserRequest, extractId, extractDate } from './types';
import { Student, User } from '../../types';

class UserService {
  private static instance: UserService;

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private convertApiUserToStudent(apiUser: ApiUser): Student {
    return {
      id: extractId(apiUser._id),
      name: apiUser.nome_completo,
      email: apiUser.email,
      phone: apiUser.telefone,
      birthDate: extractDate(apiUser.data_nascimento),
      paymentDue: extractDate(apiUser.status_pagamento?.data_vencimento) || '--/--/----',
      isPaid: apiUser.status_pagamento?.status === 'pago',
      status: apiUser.ativo ? 'Ativo' : 'Inativo',
      createdAt: extractDate(apiUser.data_criacao) || new Date().toISOString(),
      guardian: apiUser.responsavel ? {
        name: apiUser.responsavel.nome_responsavel,
        cpf: apiUser.responsavel.cpf_responsavel,
        phone: apiUser.responsavel.telefone_responsavel,
        email: apiUser.responsavel.email_responsavel || '',
      } : undefined,
    };
  }

  private convertApiUserToProfessor(apiUser: ApiUser): User {
      return {
        id: extractId(apiUser._id),
        name: apiUser.nome_completo,
        email: apiUser.email,
        role: apiUser.perfil === 'admin' ? 'admin' : 'professor',
        createdAt: extractDate(apiUser.data_criacao) || new Date().toISOString(),
      };
  }

  async getStudents(): Promise<Student[]> {
    try {
      const response = await apiClient.get<ApiUser[]>('/usuarios?perfil=aluno');
      return response.data.map(this.convertApiUserToStudent);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      throw new Error('Erro ao carregar lista de alunos');
    }
  }

  async getAllUsers(): Promise<User[]> {
      try {
        const response = await apiClient.get<ApiUser[]>('/usuarios');
        return response.data
          .filter(apiUser => apiUser.perfil !== 'aluno')
          .map(this.convertApiUserToProfessor);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        throw new Error('Erro ao carregar lista de usuários');
      }
  }
  
  async createStudent(studentData: Partial<Student>): Promise<void> {
    try {
      const createData: CreateUserRequest = {
        nome_completo: studentData.name || '',
        email: studentData.email || '',
        senha: 'senha_padrao_123',
        perfil: 'aluno',
        data_nascimento: studentData.birthDate,
        telefone: studentData.phone,
        ativo: studentData.status === 'Ativo',
        responsavel: studentData.guardian ? {
          nome_responsavel: studentData.guardian.name,
          cpf_responsavel: studentData.guardian.cpf,
          telefone_responsavel: studentData.guardian.phone,
          email_responsavel: studentData.guardian.email,
        } : undefined,
      };
      await apiClient.post('/usuarios', createData);
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      throw new Error('Erro ao criar aluno');
    }
  }

  async createUser(userData: Partial<User>, password: string):Promise<void> {
    try {
        const createData: CreateUserRequest = {
            nome_completo: userData.name || '',
            email: userData.email || '',
            senha: password,
            perfil: userData.role || 'professor',
            ativo: true
        };
        await apiClient.post('/usuarios', createData);
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        throw new Error('Erro ao criar usuário');
    }
  }

  async updateStudent(studentId: string, studentData: Partial<Student>): Promise<void> {
    try {
      const updateData: UpdateUserRequest = {
        nome_completo: studentData.name,
        email: studentData.email,
        data_nascimento: studentData.birthDate,
        telefone: studentData.phone,
        ativo: studentData.status === 'Ativo',
        status_pagamento: {
          status: studentData.isPaid ? 'pago' : 'pendente',
          data_vencimento: studentData.paymentDue || ''
        },
        responsavel: studentData.guardian ? {
          nome_responsavel: studentData.guardian.name,
          cpf_responsavel: studentData.guardian.cpf,
          telefone_responsavel: studentData.guardian.phone,
          email_responsavel: studentData.guardian.email,
        } : undefined,
      };
      await apiClient.put(`/usuarios/${studentId}`, updateData);
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      throw new Error('Erro ao atualizar aluno');
    }
  }
  
  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
        const updateData: Partial<UpdateUserRequest> = {
            nome_completo: userData.name,
            email: userData.email,
            perfil: userData.role
        };
        await apiClient.put(`/usuarios/${userId}`, updateData);
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        throw new Error("Erro ao atualizar usuário");
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await apiClient.delete(`/usuarios/${userId}`);
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      throw new Error('Erro ao desativar usuário');
    }
  }
}

// CORREÇÃO APLICADA AQUI: Exportamos a instância, não a classe.
export default UserService.getInstance();