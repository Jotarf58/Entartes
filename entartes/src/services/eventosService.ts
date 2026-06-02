import { api } from './api';

export type EstadoEventoBackend = 'ATIVO' | 'CANCELADO' | 'CONCLUIDO';

export type ComunicadoBackend = {
  _id?: string;
  id?: string;
  autorNome?: string;
  autorPerfil?: string;
  mensagem: string;
  data?: string;
};

export type ComunicadoApp = {
  id: string;
  autorNome: string;
  autorPerfil: string;
  mensagem: string;
  data: string;
};

export type EventoBackend = {
  _id?: string;
  id?: string;
  titulo: string;
  descricao?: string;
  data: string;
  estado: EstadoEventoBackend;
  comunicados?: ComunicadoBackend[];
  createdAt?: string;
  updatedAt?: string;
};

export type EventoApp = {
  id: string;
  titulo: string;
  data: string;
  local: string;
  sessoes: string[];
  estado: EstadoEventoBackend;
  formularioUrl: string;
  descricao: string;
  figurino: string[];
  penteado: string[];
  acessorios: string[];
  maquilhagem: string[];
  observacoes: string;
  comunicados: ComunicadoApp[];
};

export type AdicionarComunicadoInput = {
  mensagem: string;
  autorNome?: string;
  autorPerfil?: string;
};

export type ListarEventosResponse = {
  total: number;
  eventos: EventoBackend[];
};

export type EventoMutationResponse = {
  mensagem: string;
  evento: EventoBackend;
};

export type CriarEventoInput = {
  titulo: string;
  descricao: string;
  data: string;
  estado?: EstadoEventoBackend;
};

export type AtualizarEventoInput = Partial<CriarEventoInput>;

export function adaptarComunicadoBackend(comunicado: ComunicadoBackend): ComunicadoApp {
  return {
    id: comunicado._id ?? comunicado.id ?? crypto.randomUUID(),
    autorNome: comunicado.autorNome ?? 'Ent’artes',
    autorPerfil: comunicado.autorPerfil ?? '',
    mensagem: comunicado.mensagem,
    data: comunicado.data ?? '',
  };
}

export function adaptarEventoBackend(evento: EventoBackend): EventoApp {
  return {
    id: evento._id ?? evento.id ?? crypto.randomUUID(),
    titulo: evento.titulo,
    data: evento.data?.slice(0, 10) ?? '',
    local: 'Ent’artes',
    sessoes: [],
    estado: evento.estado ?? 'ATIVO',
    formularioUrl: '',
    descricao: evento.descricao ?? '',
    figurino: [],
    penteado: [],
    acessorios: [],
    maquilhagem: [],
    observacoes: '',
    comunicados: (evento.comunicados ?? []).map(adaptarComunicadoBackend),
  };
}

export async function listarEventos() {
  const response = await api.get<ListarEventosResponse>('/eventos');

  return response.eventos.map(adaptarEventoBackend);
}

export async function criarEvento(input: CriarEventoInput) {
  const response = await api.post<EventoMutationResponse>('/eventos', {
    titulo: input.titulo,
    descricao: input.descricao,
    data: input.data,
    estado: input.estado ?? 'ATIVO',
  });

  return adaptarEventoBackend(response.evento);
}

export async function atualizarEvento(id: string, input: AtualizarEventoInput) {
  const response = await api.patch<EventoMutationResponse>(`/eventos/${id}`, input);

  return adaptarEventoBackend(response.evento);
}

export async function adicionarComunicadoEvento(
  id: string,
  input: AdicionarComunicadoInput
) {
  const response = await api.post<EventoMutationResponse>(`/eventos/${id}/comunicados`, {
    mensagem: input.mensagem,
    autorNome: input.autorNome ?? '',
    autorPerfil: input.autorPerfil ?? '',
  });

  return adaptarEventoBackend(response.evento);
}

export type ParticipanteEventoBackend = {
  _id?: string;
  id?: string;
  alunoNome?: string;
  encarregadoNome?: string;
  estado?: string;
  observacoes?: string;
  dataConfirmacao?: string;
};

export type ParticipanteEventoApp = {
  id: string;
  alunoNome: string;
  encarregadoNome: string;
  estado: string;
  observacoes: string;
  dataConfirmacao: string;
};

export type ConfirmarPresencaInput = {
  alunoNome: string;
  encarregadoNome?: string;
  observacoes?: string;
};

export async function confirmarPresencaEvento(
  eventoId: string,
  input: ConfirmarPresencaInput
) {
  return api.post<{ mensagem: string }>(`/eventos/${eventoId}/autorizacoes`, {
    alunoNome: input.alunoNome,
    encarregadoNome: input.encarregadoNome ?? '',
    observacoes: input.observacoes ?? '',
    estado: 'AUTORIZADO',
  });
}

export async function listarParticipantesEvento(
  eventoId: string
): Promise<ParticipanteEventoApp[]> {
  const response = await api.get<{
    total: number;
    autorizacoes: ParticipanteEventoBackend[];
  }>(`/eventos/${eventoId}/autorizacoes`);

  return response.autorizacoes.map((item) => ({
    id: item._id ?? item.id ?? crypto.randomUUID(),
    alunoNome: item.alunoNome ?? '',
    encarregadoNome: item.encarregadoNome ?? '',
    estado: item.estado ?? '',
    observacoes: item.observacoes ?? '',
    dataConfirmacao: item.dataConfirmacao?.slice(0, 10) ?? '',
  }));
}

export async function removerEvento(id: string) {
  const response = await api.delete<EventoMutationResponse>(`/eventos/${id}`);

  return {
    mensagem: response.mensagem,
    evento: adaptarEventoBackend(response.evento),
  };
}