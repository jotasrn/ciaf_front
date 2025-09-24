import apiClient from './apiClient';
import { saveAs } from 'file-saver';
import { ApiAula, ApiPresenca, MarcarPresencaRequest, extractId, extractDate, formatDateForApi } from './types';

export interface AulaDetalhes {
  id: string;
  data: string; // CORRIGIDO: De Date para string
  status: 'Agendada' | 'Realizada';
  turmaNome: string;
  esporteNome: string;
  totalAlunosNaTurma: number;
  totalPresentes: number;
}

export interface PresencaAluno {
  idAluno: string;
  nomeAluno: string;
  status: 'presente' | 'ausente' | 'justificado' | 'pendente';
}

class AulaService {
  private convertApiAulaToAulaDetalhes(apiAula: ApiAula): AulaDetalhes {
    return {
      id: extractId(apiAula._id),
      data: extractDate(apiAula.data), 
      status: apiAula.status,
      turmaNome: apiAula.turma_nome,
      esporteNome: apiAula.esporte_nome,
      totalAlunosNaTurma: apiAula.total_alunos_na_turma,
      totalPresentes: apiAula.total_presentes
    };
  }

  private convertApiPresencaToPresencaAluno(apiPresenca: ApiPresenca): PresencaAluno {
    return {
      idAluno: extractId(apiPresenca.id_aluno),
      nomeAluno: apiPresenca.nome_aluno,
      status: apiPresenca.status
    };
  }

  async getAulasPorData(data: Date): Promise<AulaDetalhes[]> {
    try {
      const dataFormatada = formatDateForApi(data);
      const response = await apiClient.get<ApiAula[]>(`/aulas/por-data?data=${dataFormatada}`);
      return response.data.map(apiAula => this.convertApiAulaToAulaDetalhes(apiAula));
    } catch (error) {
      console.error('Erro ao buscar aulas por data:', error);
      throw new Error('Erro ao carregar aulas do dia');
    }
  }

  async getAulasPorTurma(turmaId: string): Promise<AulaDetalhes[]> {
    try {
      const response = await apiClient.get<ApiAula[]>(`/aulas/turma/${turmaId}`);
      return response.data.map(apiAula => this.convertApiAulaToAulaDetalhes(apiAula));
    } catch (error) {
      console.error('Erro ao buscar aulas da turma:', error);
      throw new Error('Erro ao carregar aulas da turma');
    }
  }

  async getPresencasAula(aulaId: string): Promise<PresencaAluno[]> {
    try {
      const response = await apiClient.get<ApiPresenca[]>(`/presencas/aula/${aulaId}`);
      return response.data.map(apiPresenca => this.convertApiPresencaToPresencaAluno(apiPresenca));
    } catch (error) {
      console.error('Erro ao buscar presenças da aula:', error);
      throw new Error('Erro ao carregar lista de chamada');
    }
  }

  async marcarPresenca(aulaId: string, alunoId: string, status: 'presente' | 'ausente' | 'justificado'): Promise<void> {
    try {
      const data: MarcarPresencaRequest = {
        aula_id: aulaId,
        aluno_id: alunoId,
        status
      };
      await apiClient.post('/presencas/marcar', data);
    } catch (error) {
      console.error('Erro ao marcar presença:', error);
      throw new Error('Erro ao marcar presença');
    }
  }

  async submeterChamadaCompleta(aulaId: string, presencas: Array<{ aluno_id: string; status: 'presente' | 'ausente' | 'justificado' }>): Promise<void> {
    try {
      await apiClient.post(`/aulas/${aulaId}/presencas`, presencas);
    } catch (error) {
      console.error('Erro ao submeter chamada:', error);
      throw new Error('Erro ao salvar chamada');
    }
  }

  async exportarChamada(aulaId: string, formato: 'pdf' | 'xlsx'): Promise<void> {
    try {
      const response = await apiClient.get(`/aulas/${aulaId}/exportar?formato=${formato}`, {
        responseType: 'blob', // Essencial para receber arquivos
      });

      const nomeArquivo = `chamada_aula_${aulaId}.${formato}`;
      saveAs(new Blob([response.data]), nomeArquivo);
    } catch (error) {
      console.error(`Erro ao exportar chamada para ${formato}:`, error);
      throw new Error(`Não foi possível gerar o arquivo ${formato}.`);
    }
  }
}


export default new AulaService();