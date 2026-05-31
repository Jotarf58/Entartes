import { api } from './api';

export type TipoInterrupcaoBackend =
  | 'FERIADO'
  | 'INTERRUPCAO'
  | 'EVENTO'
  | 'OUTRO';

export type InterrupcaoBackend = {
  _id?: string;
  id?: string;
  data: string;
  dataFim?: string | null;
  nome: string;
  tipo: TipoInterrupcaoBackend;
  escolaEncerrada: boolean;
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type InterrupcaoApp = {
  id: string;
  nome: string;
  data: string;
  dataFim: string;
  tipo: TipoInterrupcaoBackend;
  escolaEncerrada: boolean;
  observacoes: string;
};

export type ListarInterrupcoesResponse = {
  total: number;
  interrupcoes: InterrupcaoBackend[];
};

export type InterrupcaoMutationResponse = {
  mensagem: string;
  interrupcao: InterrupcaoBackend;
};

export type CriarInterrupcaoInput = {
  nome: string;
  data: string;
  dataFim?: string | null;
  tipo: TipoInterrupcaoBackend;
  escolaEncerrada: boolean;
  observacoes?: string;
};

export type AtualizarInterrupcaoInput = Partial<CriarInterrupcaoInput>;

function getId(interrupcao: InterrupcaoBackend) {
  return interrupcao._id ?? interrupcao.id ?? crypto.randomUUID();
}

export function adaptarInterrupcaoBackend(
  interrupcao: InterrupcaoBackend
): InterrupcaoApp {
  return {
    id: getId(interrupcao),
    nome: interrupcao.nome,
    data: interrupcao.data?.slice(0, 10) ?? '',
    dataFim: interrupcao.dataFim?.slice(0, 10) ?? '',
    tipo: interrupcao.tipo,
    escolaEncerrada: interrupcao.escolaEncerrada,
    observacoes: interrupcao.observacoes ?? '',
  };
}

export async function listarInterrupcoes() {
  const response = await api.get<ListarInterrupcoesResponse>('/interrupcoes');

  return response.interrupcoes.map(adaptarInterrupcaoBackend);
}

export async function criarInterrupcao(input: CriarInterrupcaoInput) {
  const response = await api.post<InterrupcaoMutationResponse>('/interrupcoes', {
    nome: input.nome,
    data: input.data,
    dataFim: input.dataFim || null,
    tipo: input.tipo,
    escolaEncerrada: input.escolaEncerrada,
    observacoes: input.observacoes ?? '',
  });

  return adaptarInterrupcaoBackend(response.interrupcao);
}

export async function atualizarInterrupcao(
  id: string,
  input: AtualizarInterrupcaoInput
) {
  const response = await api.patch<InterrupcaoMutationResponse>(
    `/interrupcoes/${id}`,
    {
      ...input,
      dataFim: input.dataFim || null,
    }
  );

  return adaptarInterrupcaoBackend(response.interrupcao);
}

export async function removerInterrupcao(id: string) {
  const response = await api.delete<InterrupcaoMutationResponse>(
    `/interrupcoes/${id}`
  );

  return {
    mensagem: response.mensagem,
    interrupcao: adaptarInterrupcaoBackend(response.interrupcao),
  };
}