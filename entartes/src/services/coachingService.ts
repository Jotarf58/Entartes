import { api } from './api';

export type EstadoPedidoCoachingBackend =
  | 'PENDENTE'
  | 'EM_ANALISE'
  | 'AGENDADO'
  | 'APROVADO'
  | 'REJEITADO'
  | 'INTERESSE_REGISTADO'
  | 'ACEITE_PROFESSOR'
  | 'AGUARDA_ALUNO';

export type TipoAlunoBackend = 'CRIANCA_JOVEM' | 'ADULTO';
export type TipoCoachingBackend = 'Individual' | 'Grupo';
export type RepeticaoVagaBackend = 'NAO_REPETIR' | 'DIARIA' | 'SEMANAL' | 'MENSAL';
export type EstadoVagaBackend = 'ABERTA' | 'FECHADA' | 'CANCELADA' | 'OCUPADA';

export type EstadoSessaoCoachingBackend =
  | 'AGUARDA_VALIDACAO'
  | 'AGUARDA_DIRECAO'
  | 'FATURADA'
  | 'REAGENDADA'
  | 'CANCELADA';

export type PedidoCoachingBackend = {
  _id?: string;
  id?: string;
  alunoId: string;
  alunoNome?: string;
  tipoAluno?: TipoAlunoBackend;
  encarregadoId?: string | null;
  encarregadoNome?: string;
  modalidade: string;
  professorId?: string | null;
  professorNome?: string;
  professorPreferencialId?: string | null;
  professorPreferencialNome?: string;
  professoresInteressados?: string[];
  tipoCoaching?: TipoCoachingBackend;
  duracaoMinutos?: number;
  outrosAlunosSugeridos?: string;
  preferenciaHorario?: string;
  observacoes?: string;
  notas?: string;
  salaId?: string | null;
  salaNome?: string;
  horarioFinal?: string;
  vagaId?: string | null;
  estado: EstadoPedidoCoachingBackend;
  motivoRejeicao?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type VagaBackend = {
  _id?: string;
  id?: string;
  professorId: string;
  professorNome?: string;
  modalidade: string;
  repeticao?: RepeticaoVagaBackend;
  diaSemana?: string;
  estudioId?: string | null;
  salaId?: string | null;
  salaNome?: string;
  data?: string;
  dataInicio?: string;
  dataFim?: string;
  horaInicio: string;
  horaFim: string;
  estado: EstadoVagaBackend;
  createdAt?: string;
  updatedAt?: string;
};

export type SessaoCoachingBackend = {
  _id?: string;
  id?: string;
  professorId: string;
  alunosIds: string[];
  modalidade?: string;
  estudioId?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  duracaoMinutos: number;
  estado: EstadoSessaoCoachingBackend;
  valorFaturado?: number | null;
  motivoCancelamento?: string;
  dataCancelamento?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type EstudioBackend = {
  _id?: string;
  id?: string;
  nome: string;
  capacidade: number;
  modalidadesPermitidas: string[];
  estado: 'ATIVO' | 'INATIVO' | 'EM_CONSTRUCAO';
};

export type PedidoCoachingApp = {
  id: string;
  alunoId: string;
  alunoNome: string;
  tipoAluno: TipoAlunoBackend;
  encarregadoId: string;
  encarregadoNome: string;
  modalidade: string;
  professorId: string;
  professorNome: string;
  professorPreferencialId: string;
  professorPreferencialNome: string;
  professoresInteressados: string[];
  tipoCoaching: TipoCoachingBackend;
  duracaoMinutos: number;
  outrosAlunosSugeridos: string;
  preferenciaHorario: string;
  observacoes: string;
  notas: string;
  salaId: string;
  salaNome: string;
  horarioFinal: string;
  vagaId: string;
  estado: EstadoPedidoCoachingBackend;
  motivoRejeicao: string;
  createdAt: string;
};

export type VagaCoachingApp = {
  id: string;
  professorId: string;
  professorNome: string;
  modalidade: string;
  repeticao: RepeticaoVagaBackend;
  diaSemana: string;
  estudioId: string;
  salaId: string;
  salaNome: string;
  data: string;
  dataInicio: string;
  dataFim: string;
  horaInicio: string;
  horaFim: string;
  estado: EstadoVagaBackend;
};

export type SessaoCoachingApp = {
  id: string;
  professorId: string;
  professorNome: string;
  alunosIds: string[];
  modalidade: string;
  estudioId: string;
  salaNome: string;
  dataInicio: string;
  dataFim: string;
  duracaoMinutos: number;
  estado: EstadoSessaoCoachingBackend;
  valorFaturado: number | null;
};

export type ListarPedidosResponse = {
  total: number;
  pedidos: PedidoCoachingBackend[];
};

export type PedidoMutationResponse = {
  mensagem: string;
  pedido: PedidoCoachingBackend;
};

export type ListarVagasResponse = {
  total: number;
  vagas: VagaBackend[];
};

export type VagaMutationResponse = {
  mensagem: string;
  vaga: VagaBackend;
};

export type ListarSessoesResponse = {
  total: number;
  sessoes: SessaoCoachingBackend[];
};

export type SessaoMutationResponse = {
  mensagem: string;
  sessao: SessaoCoachingBackend;
};

export type ListarEstudiosResponse = {
  total: number;
  estudios: EstudioBackend[];
};


export type ProfessorCoachingBackend = {
  _id?: string;
  id?: string;
  nome: string;
  contaId?: string;
  email?: string;
  tipoPerfil?: 'PROFESSOR';
  ativo?: boolean;
};

export type ProfessorCoachingOption = {
  id: string;
  nome: string;
  contaId?: string;
  email?: string;
};

export type ListarProfessoresResponse = {
  total: number;
  professores: ProfessorCoachingBackend[];
};

export type ListarPedidosCoachingFiltros = {
  estado?: EstadoPedidoCoachingBackend | 'TODOS';
  modalidade?: string;
  alunoId?: string;
  encarregadoId?: string;
  professorId?: string;
};

export type ListarVagasCoachingFiltros = {
  estado?: EstadoVagaBackend;
  modalidade?: string;
  professorId?: string;
};

export type CriarPedidoCoachingInput = {
  alunoId: string;
  alunoNome?: string;
  tipoAluno?: TipoAlunoBackend;
  encarregadoId?: string | null;
  encarregadoNome?: string;
  modalidade: string;
  professorId?: string | null;
  professorNome?: string;
  professorPreferencialId?: string | null;
  professorPreferencialNome?: string;
  tipoCoaching?: TipoCoachingBackend;
  duracaoMinutos?: number;
  outrosAlunosSugeridos?: string;
  preferenciaHorario?: string;
  observacoes?: string;
  notas?: string;
  salaId?: string | null;
  salaNome?: string;
  horarioFinal?: string;
  vagaId?: string | null;
};

export type AtualizarPedidoCoachingInput = Partial<CriarPedidoCoachingInput> & {
  estado?: EstadoPedidoCoachingBackend;
  motivoRejeicao?: string;
};

export type AceitarPedidoInput = {
  professorId: string;
  professorNome?: string;
};

export type RejeitarPedidoInput = {
  motivoRejeicao?: string;
};

export type AssociarVagaPedidoInput = {
  vagaId: string;
  professorId: string;
  professorNome?: string;
  salaId?: string | null;
  salaNome?: string;
  horarioFinal?: string;
  estado?: EstadoPedidoCoachingBackend;
};

export type CriarVagaInput = {
  professorId: string;
  professorNome?: string;
  modalidade: string;
  repeticao?: RepeticaoVagaBackend;
  diaSemana?: string;
  estudioId?: string | null;
  salaId?: string | null;
  salaNome?: string;
  data?: string;
  dataInicio?: string;
  dataFim?: string;
  horaInicio: string;
  horaFim: string;
  estado?: EstadoVagaBackend;
};

export type AtualizarVagaInput = Partial<CriarVagaInput>;

export type SolicitarVagaCoachingInput = {
  vaga: VagaCoachingApp;
  alunoId: string;
  alunoNome: string;
  tipoAluno?: TipoAlunoBackend;
  encarregadoId?: string | null;
  encarregadoNome?: string;
  tipoCoaching?: TipoCoachingBackend;
  outrosAlunosSugeridos?: string;
  observacoes?: string;
};

export type CriarSessaoCoachingInput = {
  professorId: string;
  alunosIds: string[];
  modalidade: string;
  estudioId?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  duracaoMinutos: number;
};

export type CancelarSessaoInput = {
  motivoCancelamento?: string;
};

export type ReagendarSessaoInput = {
  estudioId?: string | null;
  dataInicio: string;
  dataFim: string;
};

export type ValidarSessaoInput = {
  papel: 'PROFESSOR' | 'DIRECAO';
  valorManual?: number;
};

export type AprovarPedidoECriarSessaoInput = {
  pedido: PedidoCoachingApp;
  vaga?: VagaCoachingApp | null;
  valorManual?: number;
};

function getId(item: { _id?: string; id?: string }) {
  return item._id ?? item.id ?? crypto.randomUUID();
}

function getDiaSemana(data: string) {
  if (!data) return '';

  const date = new Date(`${data}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-PT', {
    weekday: 'long',
  }).format(date);
}

function normalizarData(data?: string | null) {
  return data?.slice(0, 10) ?? '';
}

function buildQuery(params: Record<string, string | undefined | null>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : '';
}

function minutosEntreHoras(horaInicio: string, horaFim: string) {
  const [inicioHoras, inicioMinutos] = horaInicio.split(':').map(Number);
  const [fimHoras, fimMinutos] = horaFim.split(':').map(Number);

  if (
    Number.isNaN(inicioHoras) ||
    Number.isNaN(inicioMinutos) ||
    Number.isNaN(fimHoras) ||
    Number.isNaN(fimMinutos)
  ) {
    return 60;
  }

  const inicio = inicioHoras * 60 + inicioMinutos;
  const fim = fimHoras * 60 + fimMinutos;

  return Math.max(30, fim - inicio);
}

function buildDateTime(data: string, hora: string) {
  if (!data || !hora) return null;

  return `${data}T${hora}:00`;
}

export function adaptarPedidoCoachingBackend(
  pedido: PedidoCoachingBackend
): PedidoCoachingApp {
  const professorId = pedido.professorId ?? pedido.professorPreferencialId ?? '';
  const professorNome = pedido.professorNome ?? pedido.professorPreferencialNome ?? professorId;

  return {
    id: getId(pedido),
    alunoId: pedido.alunoId,
    alunoNome: pedido.alunoNome || pedido.alunoId,
    tipoAluno: pedido.tipoAluno ?? 'CRIANCA_JOVEM',
    encarregadoId: pedido.encarregadoId ?? '',
    encarregadoNome: pedido.encarregadoNome ?? '',
    modalidade: pedido.modalidade,
    professorId,
    professorNome,
    professorPreferencialId: pedido.professorPreferencialId ?? professorId,
    professorPreferencialNome: pedido.professorPreferencialNome ?? professorNome,
    professoresInteressados: pedido.professoresInteressados ?? [],
    tipoCoaching: pedido.tipoCoaching ?? 'Individual',
    duracaoMinutos: pedido.duracaoMinutos ?? 60,
    outrosAlunosSugeridos: pedido.outrosAlunosSugeridos ?? '',
    preferenciaHorario: pedido.preferenciaHorario ?? pedido.horarioFinal ?? '',
    observacoes: pedido.observacoes ?? pedido.notas ?? '',
    notas: pedido.notas ?? pedido.observacoes ?? '',
    salaId: pedido.salaId ?? '',
    salaNome: pedido.salaNome ?? '',
    horarioFinal: pedido.horarioFinal ?? pedido.preferenciaHorario ?? '',
    vagaId: pedido.vagaId ?? '',
    estado: pedido.estado,
    motivoRejeicao: pedido.motivoRejeicao ?? '',
    createdAt: pedido.createdAt ?? '',
  };
}

export function adaptarVagaBackend(vaga: VagaBackend): VagaCoachingApp {
  const dataInicio = normalizarData(vaga.dataInicio || vaga.data);
  const data = normalizarData(vaga.data || vaga.dataInicio);
  const salaId = vaga.salaId ?? vaga.estudioId ?? '';

  return {
    id: getId(vaga),
    professorId: vaga.professorId,
    professorNome: vaga.professorNome ?? vaga.professorId,
    modalidade: vaga.modalidade,
    repeticao: vaga.repeticao ?? 'NAO_REPETIR',
    diaSemana: vaga.diaSemana || getDiaSemana(data || dataInicio),
    estudioId: vaga.estudioId ?? salaId,
    salaId,
    salaNome: vaga.salaNome ?? salaId,
    data,
    dataInicio,
    dataFim: normalizarData(vaga.dataFim) || dataInicio,
    horaInicio: vaga.horaInicio,
    horaFim: vaga.horaFim,
    estado: vaga.estado,
  };
}

export function adaptarSessaoBackend(
  sessao: SessaoCoachingBackend
): SessaoCoachingApp {
  return {
    id: getId(sessao),
    professorId: sessao.professorId,
    professorNome: sessao.professorId,
    alunosIds: sessao.alunosIds ?? [],
    modalidade: sessao.modalidade ?? '',
    estudioId: sessao.estudioId ?? '',
    salaNome: sessao.estudioId ?? '',
    dataInicio: sessao.dataInicio ?? '',
    dataFim: sessao.dataFim ?? '',
    duracaoMinutos: sessao.duracaoMinutos,
    estado: sessao.estado,
    valorFaturado: sessao.valorFaturado ?? null,
  };
}

export async function listarPedidosCoaching(
  filtros: ListarPedidosCoachingFiltros = {}
) {
  const response = await api.get<ListarPedidosResponse>(
    `/pedidos-coaching${buildQuery({
      estado: filtros.estado === 'TODOS' ? undefined : filtros.estado,
      modalidade: filtros.modalidade === 'TODAS' ? undefined : filtros.modalidade,
      alunoId: filtros.alunoId,
      encarregadoId: filtros.encarregadoId,
      professorId: filtros.professorId,
    })}`
  );

  return response.pedidos.map(adaptarPedidoCoachingBackend);
}

export async function buscarPedidoCoachingPorId(pedidoId: string) {
  const response = await api.get<{ pedido: PedidoCoachingBackend }>(
    `/pedidos-coaching/${pedidoId}`
  );

  return adaptarPedidoCoachingBackend(response.pedido);
}

export async function criarPedidoCoaching(input: CriarPedidoCoachingInput) {
  const response = await api.post<PedidoMutationResponse>('/pedidos-coaching', {
    alunoId: input.alunoId,
    alunoNome: input.alunoNome,
    tipoAluno: input.tipoAluno ?? 'CRIANCA_JOVEM',
    encarregadoId: input.encarregadoId ?? null,
    encarregadoNome: input.encarregadoNome ?? '',
    modalidade: input.modalidade,
    professorId: input.professorId ?? input.professorPreferencialId ?? null,
    professorNome: input.professorNome ?? input.professorPreferencialNome ?? '',
    professorPreferencialId: input.professorPreferencialId ?? input.professorId ?? null,
    professorPreferencialNome: input.professorPreferencialNome ?? input.professorNome ?? '',
    tipoCoaching: input.tipoCoaching ?? 'Individual',
    duracaoMinutos: input.duracaoMinutos ?? 60,
    outrosAlunosSugeridos: input.outrosAlunosSugeridos ?? '',
    preferenciaHorario: input.preferenciaHorario ?? input.horarioFinal ?? '',
    observacoes: input.observacoes ?? input.notas ?? '',
    notas: input.notas ?? input.observacoes ?? '',
    salaId: input.salaId ?? null,
    salaNome: input.salaNome ?? '',
    horarioFinal: input.horarioFinal ?? input.preferenciaHorario ?? '',
    vagaId: input.vagaId ?? null,
  });

  return adaptarPedidoCoachingBackend(response.pedido);
}

export async function solicitarVagaCoaching(input: SolicitarVagaCoachingInput) {
  const vaga = input.vaga;
  const dataPedido = vaga.data || vaga.dataInicio;
  const horario = `${vaga.diaSemana || getDiaSemana(dataPedido)}, ${vaga.horaInicio}-${vaga.horaFim}`;

  return criarPedidoCoaching({
    alunoId: input.alunoId,
    alunoNome: input.alunoNome,
    tipoAluno: input.tipoAluno ?? 'CRIANCA_JOVEM',
    encarregadoId: input.encarregadoId ?? null,
    encarregadoNome: input.encarregadoNome ?? '',
    modalidade: vaga.modalidade,
    professorId: vaga.professorId,
    professorNome: vaga.professorNome,
    professorPreferencialId: vaga.professorId,
    professorPreferencialNome: vaga.professorNome,
    tipoCoaching: input.tipoCoaching ?? 'Individual',
    outrosAlunosSugeridos: input.outrosAlunosSugeridos ?? '',
    preferenciaHorario: horario,
    observacoes: input.observacoes ?? `Pedido criado a partir da disponibilidade ${vaga.id}.`,
    salaId: vaga.salaId || vaga.estudioId || null,
    salaNome: vaga.salaNome,
    horarioFinal: horario,
    vagaId: vaga.id,
  });
}

export async function atualizarPedidoCoaching(
  pedidoId: string,
  input: AtualizarPedidoCoachingInput
) {
  const response = await api.patch<PedidoMutationResponse>(
    `/pedidos-coaching/${pedidoId}`,
    input
  );

  return adaptarPedidoCoachingBackend(response.pedido);
}

export async function alterarEstadoPedidoCoaching(
  pedidoId: string,
  estado: EstadoPedidoCoachingBackend
) {
  const response = await api.patch<PedidoMutationResponse>(
    `/pedidos-coaching/${pedidoId}/estado`,
    { estado }
  );

  return adaptarPedidoCoachingBackend(response.pedido);
}

export async function associarVagaAPedido(
  pedidoId: string,
  input: AssociarVagaPedidoInput
) {
  const response = await api.patch<PedidoMutationResponse>(
    `/pedidos-coaching/${pedidoId}/associar-vaga`,
    {
      vagaId: input.vagaId,
      professorId: input.professorId,
      professorNome: input.professorNome ?? '',
      salaId: input.salaId ?? null,
      salaNome: input.salaNome ?? '',
      horarioFinal: input.horarioFinal ?? '',
      estado: input.estado ?? 'AGENDADO',
    }
  );

  return adaptarPedidoCoachingBackend(response.pedido);
}

export async function aceitarPedidoCoaching(
  pedidoId: string,
  input: AceitarPedidoInput
) {
  const response = await api.patch<PedidoMutationResponse>(
    `/pedidos-coaching/${pedidoId}/aceitar`,
    {
      professorId: input.professorId,
      professorNome: input.professorNome ?? '',
    }
  );

  return adaptarPedidoCoachingBackend(response.pedido);
}

export async function aprovarPedidoCoaching(pedidoId: string) {
  const response = await api.patch<PedidoMutationResponse>(
    `/pedidos-coaching/${pedidoId}/aprovar`
  );

  return adaptarPedidoCoachingBackend(response.pedido);
}

export async function rejeitarPedidoCoaching(
  pedidoId: string,
  input: RejeitarPedidoInput = {}
) {
  const response = await api.patch<PedidoMutationResponse>(
    `/pedidos-coaching/${pedidoId}/rejeitar`,
    {
      motivoRejeicao: input.motivoRejeicao ?? '',
    }
  );

  return adaptarPedidoCoachingBackend(response.pedido);
}

export async function listarVagasCoaching(
  filtros: ListarVagasCoachingFiltros = {}
) {
  const response = await api.get<ListarVagasResponse>(
    `/vagas${buildQuery({
      estado: filtros.estado,
      modalidade: filtros.modalidade === 'TODAS' ? undefined : filtros.modalidade,
      professorId: filtros.professorId,
    })}`
  );

  return response.vagas.map(adaptarVagaBackend);
}

export async function buscarVagaCoachingPorId(vagaId: string) {
  const response = await api.get<{ vaga: VagaBackend }>(`/vagas/${vagaId}`);

  return adaptarVagaBackend(response.vaga);
}

export async function criarVagaCoaching(input: CriarVagaInput) {
  const response = await api.post<VagaMutationResponse>('/vagas', {
    professorId: input.professorId,
    professorNome: input.professorNome ?? '',
    modalidade: input.modalidade,
    repeticao: input.repeticao ?? 'NAO_REPETIR',
    diaSemana: input.diaSemana ?? getDiaSemana(input.data ?? input.dataInicio ?? ''),
    estudioId: input.estudioId ?? input.salaId ?? null,
    salaId: input.salaId ?? input.estudioId ?? null,
    salaNome: input.salaNome ?? '',
    data: input.data ?? input.dataInicio ?? '',
    dataInicio: input.dataInicio ?? input.data ?? '',
    dataFim: input.dataFim ?? input.dataInicio ?? input.data ?? '',
    horaInicio: input.horaInicio,
    horaFim: input.horaFim,
    estado: input.estado ?? 'ABERTA',
  });

  return adaptarVagaBackend(response.vaga);
}

export async function atualizarVagaCoaching(
  vagaId: string,
  input: AtualizarVagaInput
) {
  const response = await api.patch<VagaMutationResponse>(`/vagas/${vagaId}`, input);

  return adaptarVagaBackend(response.vaga);
}

export async function fecharVagaCoaching(vagaId: string) {
  const response = await api.patch<VagaMutationResponse>(`/vagas/${vagaId}/fechar`);

  return adaptarVagaBackend(response.vaga);
}

export async function cancelarVagaCoaching(vagaId: string) {
  const response = await api.patch<VagaMutationResponse>(`/vagas/${vagaId}/cancelar`);

  return adaptarVagaBackend(response.vaga);
}

export async function ocuparVagaCoaching(vagaId: string) {
  const response = await api.patch<VagaMutationResponse>(`/vagas/${vagaId}/ocupar`);

  return adaptarVagaBackend(response.vaga);
}

export async function removerVagaCoaching(vagaId: string) {
  const response = await api.delete<VagaMutationResponse>(`/vagas/${vagaId}`);

  return adaptarVagaBackend(response.vaga);
}

export async function listarSessoesCoaching() {
  const response = await api.get<ListarSessoesResponse>('/coaching');

  return response.sessoes.map(adaptarSessaoBackend);
}

export async function listarSessoesCoachingPorProfessor(professorId: string) {
  const response = await api.get<ListarSessoesResponse>(
    `/coaching/professor/${professorId}`
  );

  return response.sessoes.map(adaptarSessaoBackend);
}

export async function listarSessoesCoachingPorAluno(alunoId: string) {
  const response = await api.get<ListarSessoesResponse>(
    `/alunos/${alunoId}/sessoes`
  );

  return response.sessoes.map(adaptarSessaoBackend);
}

export async function criarSessaoCoaching(input: CriarSessaoCoachingInput) {
  const response = await api.post<SessaoMutationResponse>('/coaching/criar', {
    professorId: input.professorId,
    alunosIds: input.alunosIds,
    modalidade: input.modalidade,
    estudioId: input.estudioId ?? null,
    dataInicio: input.dataInicio ?? null,
    dataFim: input.dataFim ?? null,
    duracaoMinutos: input.duracaoMinutos,
  });

  return adaptarSessaoBackend(response.sessao);
}

export async function criarSessaoAPartirDePedidoEVaga(
  pedido: PedidoCoachingApp,
  vaga: VagaCoachingApp
) {
  const data = vaga.data || vaga.dataInicio;
  const dataInicio = buildDateTime(data, vaga.horaInicio);
  const dataFim = buildDateTime(data, vaga.horaFim);

  return criarSessaoCoaching({
    professorId: pedido.professorId || vaga.professorId,
    alunosIds: [pedido.alunoId],
    modalidade: pedido.modalidade || vaga.modalidade,
    estudioId: vaga.estudioId || vaga.salaId || null,
    dataInicio,
    dataFim,
    duracaoMinutos: minutosEntreHoras(vaga.horaInicio, vaga.horaFim),
  });
}

export async function aprovarPedidoECriarSessao(
  input: AprovarPedidoECriarSessaoInput
) {
  const pedidoAprovado = await aprovarPedidoCoaching(input.pedido.id);

  if (!input.vaga) {
    return {
      pedido: pedidoAprovado,
      sessao: null,
      vaga: null,
    };
  }

  const sessao = await criarSessaoAPartirDePedidoEVaga(pedidoAprovado, input.vaga);
  const vaga = await ocuparVagaCoaching(input.vaga.id);

  return {
    pedido: pedidoAprovado,
    sessao,
    vaga,
  };
}

export async function validarSessaoCoaching(
  sessaoId: string,
  input: ValidarSessaoInput
) {
  const response = await api.post<SessaoMutationResponse>(
    `/coaching/${sessaoId}/validar`,
    {
      papel: input.papel,
      valorManual: input.valorManual,
    }
  );

  return adaptarSessaoBackend(response.sessao);
}

export async function validarSessaoProfessor(sessaoId: string) {
  return validarSessaoCoaching(sessaoId, {
    papel: 'PROFESSOR',
  });
}

export async function faturarSessaoDirecao(sessaoId: string, valorManual?: number) {
  return validarSessaoCoaching(sessaoId, {
    papel: 'DIRECAO',
    valorManual,
  });
}

export async function cancelarSessaoCoaching(
  sessaoId: string,
  input: CancelarSessaoInput = {}
) {
  const response = await api.patch<SessaoMutationResponse>(
    `/coaching/${sessaoId}/cancelar`,
    {
      motivoCancelamento: input.motivoCancelamento ?? '',
    }
  );

  return adaptarSessaoBackend(response.sessao);
}

export async function reagendarSessaoCoaching(
  sessaoId: string,
  input: ReagendarSessaoInput
) {
  const response = await api.patch<SessaoMutationResponse>(
    `/coaching/${sessaoId}/reagendar`,
    {
      estudioId: input.estudioId ?? null,
      dataInicio: input.dataInicio,
      dataFim: input.dataFim,
    }
  );

  return adaptarSessaoBackend(response.sessao);
}

export async function listarEstudios() {
  const response = await api.get<ListarEstudiosResponse>('/estudios');

  return response.estudios;
}


export async function listarProfessoresCoaching() {
  const response = await api.get<ListarProfessoresResponse>('/auth/professores');

  return response.professores.map((professor, index) => ({
    id: professor.id ?? professor._id ?? `professor-${index + 1}`,
    nome: professor.nome,
    contaId: professor.contaId,
    email: professor.email,
  }));
}
