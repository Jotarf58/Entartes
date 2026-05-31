import { api } from './api';

export type EstadoAulaBackend = 'ATIVA' | 'RASCUNHO' | 'CANCELADA';

export type AulaSemanalBackend = {
  _id?: string;
  id?: string;
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
  modalidade: string;
  turmaId?: string | null;
  turma: string;
  professorId: string;
  professorNome: string;
  salaId?: string | null;
  salaNome: string;
  faixaEtaria?: string;
  idade?: string;
  tipo?: string;
  vagas: number;
  inscritos: number;
  estado: EstadoAulaBackend;
  createdAt?: string;
  updatedAt?: string;
};

export type AulaSemanalApp = {
  id: string;
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
  modalidade: string;
  turmaId: string;
  turma: string;
  professorId: string;
  professorNome: string;
  salaId: string;
  salaNome: string;
  faixaEtaria: string;
  tipo: string;
  vagas: number;
  inscritos: number;
  estado: EstadoAulaBackend;
};

export type SolicitacaoAulaBackend = {
  _id?: string;
  id?: string;
  aulaId: string;
  utilizadorId?: string | null;
  perfilId?: string | null;
  perfilNome?: string;
  tipo: 'INSCRICAO' | 'ALTERACAO';
  mensagem?: string;
  estado: 'PENDENTE' | 'ACEITE' | 'REJEITADA';
  createdAt?: string;
  updatedAt?: string;
};

export type ProfessorReferencia = {
  id: string;
  utilizadorId?: string;
  nome: string;
  email?: string;
};

export type SalaReferencia = {
  id: string;
  nome: string;
  tipo?: string;
  capacidade?: number;
  estado?: string;
  modalidadesPermitidas?: string[];
};

export type ListarAulasSemanaisResponse = {
  total: number;
  aulasSemanais?: AulaSemanalBackend[];
  aulas?: AulaSemanalBackend[];
};

export type AulaSemanalMutationResponse = {
  mensagem: string;
  aula: AulaSemanalBackend;
};

export type SolicitarAulaResponse = {
  mensagem: string;
  solicitacao: SolicitacaoAulaBackend;
};

export type ListarSolicitacoesAulaResponse = {
  total: number;
  solicitacoes: SolicitacaoAulaBackend[];
};

export type ListarProfessoresResponse = {
  total: number;
  professores: ProfessorReferencia[];
};

export type ListarSalasResponse = {
  total: number;
  salas: SalaReferencia[];
};

export type ListarModalidadesResponse = {
  total: number;
  modalidades: string[];
};

export type ListarAulasSemanaisFiltros = {
  diaSemana?: string;
  modalidade?: string;
  estado?: EstadoAulaBackend;
  professorId?: string;
};

export type CriarAulaSemanalInput = {
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
  modalidade: string;
  turmaId?: string | null;
  turma: string;
  professorId: string;
  professorNome: string;
  salaId?: string | null;
  salaNome: string;
  faixaEtaria?: string;
  idade?: string;
  tipo?: string;
  vagas: number;
  inscritos: number;
  estado?: EstadoAulaBackend;
};

export type AtualizarAulaSemanalInput = Partial<CriarAulaSemanalInput>;

export type SolicitarInscricaoAulaInput = {
  mensagem?: string;
  utilizadorId?: string;
  perfilId?: string;
  perfilNome?: string;
};

export type SolicitarAlteracaoAulaInput = SolicitarInscricaoAulaInput & {
  textoAlteracao?: string;
};

function getId(item: { _id?: string; id?: string }) {
  return item._id ?? item.id ?? crypto.randomUUID();
}

export function adaptarAulaSemanalBackend(
  aula: AulaSemanalBackend
): AulaSemanalApp {
  return {
    id: getId(aula),
    diaSemana: aula.diaSemana,
    horaInicio: aula.horaInicio,
    horaFim: aula.horaFim,
    modalidade: aula.modalidade,
    turmaId: aula.turmaId ?? '',
    turma: aula.turma,
    professorId: aula.professorId,
    professorNome: aula.professorNome,
    salaId: aula.salaId ?? '',
    salaNome: aula.salaNome,
    faixaEtaria: aula.faixaEtaria ?? aula.idade ?? '',
    tipo: aula.tipo ?? 'Aula regular',
    vagas: aula.vagas ?? 0,
    inscritos: aula.inscritos ?? 0,
    estado: aula.estado ?? 'ATIVA',
  };
}

function buildQueryString(filtros?: ListarAulasSemanaisFiltros) {
  const params = new URLSearchParams();

  if (filtros?.diaSemana) params.set('diaSemana', filtros.diaSemana);
  if (filtros?.modalidade) params.set('modalidade', filtros.modalidade);
  if (filtros?.estado) params.set('estado', filtros.estado);
  if (filtros?.professorId) params.set('professorId', filtros.professorId);

  const query = params.toString();

  return query ? `?${query}` : '';
}

export async function listarAulasSemanais(
  filtros?: ListarAulasSemanaisFiltros
) {
  const response = await api.get<ListarAulasSemanaisResponse>(
    `/horario/aulas-semanais${buildQueryString(filtros)}`
  );

  const aulas = response.aulasSemanais ?? response.aulas ?? [];

  return aulas.map(adaptarAulaSemanalBackend);
}

export async function criarAulaSemanal(input: CriarAulaSemanalInput) {
  const response = await api.post<AulaSemanalMutationResponse>(
    '/horario/aulas-semanais',
    input
  );

  return adaptarAulaSemanalBackend(response.aula);
}

export async function atualizarAulaSemanal(
  id: string,
  input: AtualizarAulaSemanalInput
) {
  const response = await api.patch<AulaSemanalMutationResponse>(
    `/horario/aulas-semanais/${id}`,
    input
  );

  return adaptarAulaSemanalBackend(response.aula);
}

export async function removerAulaSemanal(id: string) {
  const response = await api.delete<AulaSemanalMutationResponse>(
    `/horario/aulas-semanais/${id}`
  );

  return {
    mensagem: response.mensagem,
    aula: adaptarAulaSemanalBackend(response.aula),
  };
}

export async function solicitarInscricaoAula(
  aulaId: string,
  input: SolicitarInscricaoAulaInput = {}
) {
  return api.post<SolicitarAulaResponse>(
    `/horario/aulas-semanais/${aulaId}/solicitar-inscricao`,
    input
  );
}

export async function solicitarAlteracaoAula(
  aulaId: string,
  input: SolicitarAlteracaoAulaInput
) {
  return api.post<SolicitarAulaResponse>(
    `/horario/aulas-semanais/${aulaId}/solicitar-alteracao`,
    input
  );
}

export async function listarSolicitacoesAula() {
  return api.get<ListarSolicitacoesAulaResponse>('/horario/solicitacoes');
}

export async function listarProfessoresReferencia() {
  const response = await api.get<ListarProfessoresResponse>('/professores');

  return response.professores;
}

export async function listarSalasReferencia() {
  const response = await api.get<ListarSalasResponse>('/salas');

  return response.salas;
}

export async function listarModalidadesReferencia() {
  const response = await api.get<ListarModalidadesResponse>('/modalidades');

  return response.modalidades;
}
