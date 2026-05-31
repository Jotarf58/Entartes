import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Calendar,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  DoorOpen,
  Filter,
  LinkIcon,
  Plus,
  RefreshCw,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

import {
  modalidades,
  pedidosCoachingMock,
  professores,
  salas,
  vagasCoachingMock,
  type TipoAluno,
} from '../data/mockEntartes';

import {
  aceitarPedidoCoaching,
  aprovarPedidoCoaching,
  associarVagaAPedido as associarVagaPedidoBackend,
  criarPedidoCoaching,
  criarSessaoCoaching,
  criarVagaCoaching,
  fecharVagaCoaching,
  listarEstudios,
  listarPedidosCoaching,
  listarProfessoresCoaching,
  listarVagasCoaching,
  rejeitarPedidoCoaching,
  solicitarVagaCoaching,
  type EstadoPedidoCoachingBackend,
  type EstadoVagaBackend,
  type EstudioBackend,
  type PedidoCoachingApp,
  type ProfessorCoachingOption,
  type VagaCoachingApp,
} from '../services/coachingService';

import {
  criarAulaSemanal,
  listarAulasSemanais,
  type AulaSemanalApp,
} from '../services/horarioService';
import { verificarDisponibilidadeEstudio } from '../services/estudiosService';

import { ApiError } from '../services/api';

type UserRole = 'ALUNO' | 'ENCARREGADO' | 'PROFESSOR' | 'COORDENACAO';

type CurrentUser = {
  contaId?: string;
  perfilId?: string;
  email?: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  description: string;
  initials: string;
};

type TipoCoaching = 'Individual' | 'Grupo';
type RepeticaoVaga = 'PONTUAL' | 'DIARIA' | 'SEMANAL' | 'MENSAL';

type EstadoPedido = EstadoPedidoCoachingBackend;
type EstadoVaga = EstadoVagaBackend;

type PedidoCoaching = {
  id: string;
  alunoId: string;
  alunoNome: string;
  tipoAluno: TipoAluno;
  encarregadoId: string;
  encarregadoNome: string;
  modalidade: string;
  professorPreferencialId: string;
  professorPreferencialNome: string;
  tipoCoaching: TipoCoaching;
  outrosAlunosSugeridos: string;
  preferenciaHorario: string;
  observacoes: string;
  estado: EstadoPedido;
  motivoRejeicao: string;
  vagaId: string;
  isMock?: boolean;
};

type VagaCoaching = {
  id: string;
  professorId: string;
  professorNome: string;
  modalidade: string;
  repeticao: RepeticaoVaga;
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
  salaNome: string;
  estudioId: string;
  dataInicio: string;
  dataFim: string;
  estado: EstadoVaga;
  isMock?: boolean;
};

type EstudioOption = {
  id: string;
  nome: string;
};

type PedidoForm = {
  alunoNome: string;
  tipoAluno: TipoAluno;
  encarregadoNome: string;
  modalidade: string;
  professorPreferencialId: string;
  tipoCoaching: TipoCoaching;
  outrosAlunosSugeridos: string;
  preferenciaHorario: string;
  observacoes: string;
};

type VagaForm = {
  professorId: string;
  modalidade: string;
  repeticao: RepeticaoVaga;
  dataInicio: string;
  dataFim: string;
  horaInicio: string;
  horaFim: string;
  estudioId: string;
};

const estadoLabels: Record<EstadoPedido, string> = {
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em análise',
  INTERESSE_REGISTADO: 'Interesse registado',
  ACEITE_PROFESSOR: 'Aceite pelo professor',
  AGENDADO: 'Agendado',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
};

const estadoStyles: Record<EstadoPedido, string> = {
  PENDENTE: 'bg-[#fff4d4] text-[#8a6d1d]',
  EM_ANALISE: 'bg-[#d4e8ff] text-[#2d5f7f]',
  INTERESSE_REGISTADO: 'bg-[#d4e8ff] text-[#2d5f7f]',
  ACEITE_PROFESSOR: 'bg-[#e8d4ff] text-[#5a3c7a]',
  AGENDADO: 'bg-[#f0e4ff] text-[#5a3c7a]',
  APROVADO: 'bg-[#d4e8df] text-[#2d5f4f]',
  REJEITADO: 'bg-[#ffe0e0] text-[#9a3a3a]',
};

const estadoVagaLabels: Record<EstadoVaga, string> = {
  ABERTA: 'Aberta',
  FECHADA: 'Fechada',
  OCUPADA: 'Ocupada',
  CANCELADA: 'Cancelada',
};

const estadoVagaStyles: Record<EstadoVaga, string> = {
  ABERTA: 'bg-[#d4e8df] text-[#2d5f4f]',
  FECHADA: 'bg-[#f0f6f3] text-[#5a7a6c]',
  OCUPADA: 'bg-[#e8d4ff] text-[#5a3c7a]',
  CANCELADA: 'bg-[#ffe0e0] text-[#9a3a3a]',
};

function slugId(value: string, prefix = 'id') {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized ? `${prefix}-${normalized}` : `${prefix}-${Date.now()}`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Ocorreu um erro inesperado.';
}

const professoresExtraPorId: Record<string, string> = {};

function isMongoObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}

function getProfessorNome(professorId: string, fallback = 'Sem preferência') {
  if (!professorId) return fallback;

  const professorMock = professores.find((professor) => professor.id === professorId);

  if (professorMock) return professorMock.nome;

  if (professoresExtraPorId[professorId]) {
    return professoresExtraPorId[professorId];
  }

  if (isMongoObjectId(professorId)) {
    return fallback && !isMongoObjectId(fallback) ? fallback : 'Professor associado';
  }

  return professorId;
}

function getProfessorNomeComLista(
  professorId: string,
  professoresDisponiveis: ProfessorCoachingOption[],
  fallback = 'Sem preferência'
) {
  if (!professorId) return fallback;

  const professorBd = professoresDisponiveis.find((professor) => professor.id === professorId);

  if (professorBd) return professorBd.nome;

  return getProfessorNome(professorId, fallback);
}

function getProfessorIdByName(nome: string) {
  return professores.find((professor) => professor.nome === nome)?.id ?? '';
}

function getProfessorIdForUser(currentUser: CurrentUser) {
  return getProfessorIdByName(currentUser.name) || currentUser.perfilId || slugId(currentUser.name, 'professor');
}

function getPerfilId(currentUser: CurrentUser, prefix: string) {
  return currentUser.perfilId || currentUser.contaId || slugId(currentUser.name, prefix);
}

function getString(item: Record<string, unknown>, key: string, fallback: string) {
  const value = item[key];

  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  return fallback;
}

function normalizarEstadoMock(value: string): EstadoPedido {
  if (value === 'REJEITADO') return 'REJEITADO';
  if (value === 'APROVADO' || value === 'AGENDADO') return 'APROVADO';
  if (value === 'EM_ANALISE') return 'INTERESSE_REGISTADO';
  return 'PENDENTE';
}

function normalizarEstadoVagaMock(value: string): EstadoVaga {
  return value === 'ABERTA' ? 'ABERTA' : 'FECHADA';
}

function getDiaSemana(data: string) {
  if (!data) return 'A definir';

  const date = new Date(`${data}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return 'A definir';
  }

  return new Intl.DateTimeFormat('pt-PT', { weekday: 'long' }).format(date);
}

function formatDate(date: string) {
  if (!date) return 'A definir';

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('pt-PT').format(parsedDate);
}

function getDetalheDasNotas(texto: string, etiqueta: string) {
  const linhas = texto.split('\n');
  const prefixo = `${etiqueta}:`.toLowerCase();

  const linha = linhas.find((item) => item.trim().toLowerCase().startsWith(prefixo));

  return linha?.slice(linha.indexOf(':') + 1).trim() ?? '';
}

function limparObservacoesPedido(texto: string) {
  return texto
    .split('\n')
    .map((linha) => linha.trim())
    .filter(Boolean)
    .filter((linha) => {
      const normalizada = linha.toLowerCase();

      return (
        !normalizada.startsWith('pedido criado a partir da disponibilidade') &&
        !normalizada.startsWith('professor:') &&
        !normalizada.startsWith('sala:') &&
        !normalizada.startsWith('horário:') &&
        !normalizada.startsWith('horario:')
      );
    })
    .join('\n');
}

function getHorarioPedido(texto: string, horarioGuardado: string) {
  const horarioNotas = getDetalheDasNotas(texto, 'Horário') || getDetalheDasNotas(texto, 'Horario');
  const salaNotas = getDetalheDasNotas(texto, 'Sala');
  const horarioBase = horarioGuardado && horarioGuardado !== 'A definir' ? horarioGuardado : horarioNotas;

  if (horarioBase && salaNotas && !horarioBase.includes(salaNotas)) {
    return `${horarioBase} · ${salaNotas}`;
  }

  return horarioBase || 'A definir';
}

function getProfessorPedido(
  texto: string,
  professorId: string,
  professorNomeGuardado: string
) {
  const professorNotas = getDetalheDasNotas(texto, 'Professor');
  const professorReferencia = professorNotas || professorNomeGuardado;

  return getProfessorNome(professorId || professorReferencia, professorReferencia || 'Professor associado');
}

function calcularDuracaoMinutos(horaInicio: string, horaFim: string) {
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

  return Math.min(120, Math.max(30, fim - inicio));
}

function horaParaMinutos(hora: string) {
  const [horas, minutos] = hora.split(':').map(Number);

  if (Number.isNaN(horas) || Number.isNaN(minutos)) {
    return 0;
  }

  return horas * 60 + minutos;
}

function normalizarDiaSemanaComparacao(dia: string) {
  return dia
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace('-feira', '')
    .trim();
}

function capitalizarDiaSemana(dia: string) {
  const mapa: Record<string, string> = {
    segunda: 'Segunda-feira',
    terca: 'Terça-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado',
    domingo: 'Domingo',
  };

  return mapa[normalizarDiaSemanaComparacao(dia)] ?? dia;
}

function horariosSobrepoem(
  inicioA: string,
  fimA: string,
  inicioB: string,
  fimB: string
) {
  const startA = horaParaMinutos(inicioA);
  const endA = horaParaMinutos(fimA);
  const startB = horaParaMinutos(inicioB);
  const endB = horaParaMinutos(fimB);

  return startA < endB && startB < endA;
}

function normalizarEstudiosMock(): EstudioOption[] {
  return salas.map((sala, index) => ({
    id: sala.id ?? `estudio-${index}`,
    nome: sala.nome ?? `Estúdio ${index + 1}`,
  }));
}

function normalizarEstudiosBackend(estudiosBackend: EstudioBackend[]): EstudioOption[] {
  return estudiosBackend.map((estudio, index) => ({
    id: estudio._id ?? estudio.id ?? `estudio-${index}`,
    nome: estudio.nome,
  }));
}

function normalizarPedidosMock(): PedidoCoaching[] {
  return pedidosCoachingMock.map((pedido, index) => {
    const item = pedido as Record<string, unknown>;
    const professorId = getString(item, 'professorPreferencialId', '');
    const professorNome = getString(
      item,
      'professorPreferencialNome',
      getProfessorNome(professorId)
    );

    return {
      id: getString(item, 'id', `PED-MOCK-${index + 1}`),
      alunoId: getString(item, 'alunoId', `aluno-mock-${index + 1}`),
      alunoNome: getString(item, 'alunoNome', 'Aluno'),
      tipoAluno: getString(item, 'tipoAluno', 'CRIANCA_JOVEM') as TipoAluno,
      encarregadoId: getString(item, 'encarregadoId', ''),
      encarregadoNome: getString(item, 'encarregadoNome', 'Encarregado'),
      modalidade: getString(item, 'modalidade', modalidades[0] ?? 'Ballet'),
      professorPreferencialId: professorId,
      professorPreferencialNome: professorNome,
      tipoCoaching: getString(item, 'tipoCoaching', 'Individual') as TipoCoaching,
      outrosAlunosSugeridos: getString(item, 'outrosAlunosSugeridos', ''),
      preferenciaHorario: getString(item, 'preferenciaHorario', 'A definir'),
      observacoes: getString(item, 'observacoes', ''),
      estado: normalizarEstadoMock(getString(item, 'estado', 'PENDENTE')),
      motivoRejeicao: '',
      vagaId: '',
      isMock: true,
    };
  });
}

function normalizarVagasMock(): VagaCoaching[] {
  return vagasCoachingMock.map((vaga, index) => {
    const item = vaga as Record<string, unknown>;
    const professorNome = getString(item, 'professorNome', 'Professor');
    const professorId = getString(item, 'professorId', getProfessorIdByName(professorNome));
    const salaNome = getString(item, 'salaNome', salas[0]?.nome ?? 'Estúdio 1');
    const estudio = salas.find((sala) => sala.nome === salaNome);

    return {
      id: getString(item, 'id', `VAGA-MOCK-${index + 1}`),
      professorId,
      professorNome,
      modalidade: getString(item, 'modalidade', modalidades[0] ?? 'Ballet'),
      repeticao: getString(item, 'repeticao', 'SEMANAL') as RepeticaoVaga,
      diaSemana: getString(item, 'diaSemana', 'Sábado'),
      horaInicio: getString(item, 'horaInicio', '10:00'),
      horaFim: getString(item, 'horaFim', '11:00'),
      salaNome,
      estudioId: estudio?.id ?? slugId(salaNome, 'estudio'),
      dataInicio: getString(item, 'dataInicio', '2026-01-01'),
      dataFim: getString(item, 'dataFim', '2026-12-31'),
      estado: normalizarEstadoVagaMock(getString(item, 'estado', 'ABERTA')),
      isMock: true,
    };
  });
}

function pedidoBackendParaUi(
  pedido: PedidoCoachingApp,
  professoresDisponiveis: ProfessorCoachingOption[] = []
): PedidoCoaching {
  const textoDetalhes = [pedido.observacoes, pedido.notas].filter(Boolean).join('\n');
  const professorId = pedido.professorId || pedido.professorPreferencialId;
  const professorNomeGuardado = pedido.professorNome || pedido.professorPreferencialNome || '';
  const professorNome =
    professoresDisponiveis.find((professor) => professor.id === professorId)?.nome ??
    getProfessorPedido(textoDetalhes, professorId, professorNomeGuardado);
  const horarioGuardado = pedido.preferenciaHorario || pedido.horarioFinal || '';

  return {
    id: pedido.id,
    alunoId: pedido.alunoId,
    alunoNome: pedido.alunoNome || pedido.alunoId,
    tipoAluno: pedido.encarregadoId ? 'CRIANCA_JOVEM' : 'ADULTO',
    encarregadoId: pedido.encarregadoId,
    encarregadoNome: pedido.encarregadoId || '',
    modalidade: pedido.modalidade,
    professorPreferencialId: professorId,
    professorPreferencialNome: professorNome,
    tipoCoaching: pedido.tipoCoaching || 'Individual',
    outrosAlunosSugeridos: pedido.outrosAlunosSugeridos || '',
    preferenciaHorario: getHorarioPedido(textoDetalhes, horarioGuardado),
    observacoes: limparObservacoesPedido(textoDetalhes),
    estado: pedido.estado,
    motivoRejeicao: pedido.motivoRejeicao,
    vagaId: pedido.vagaId ?? getDetalheDasNotas(textoDetalhes, 'Disponibilidade'),
  };
}

function repeticaoUiParaBackend(repeticao: RepeticaoVaga): VagaCoachingApp['repeticao'] {
  if (repeticao === 'PONTUAL') return 'NAO_REPETIR';

  return repeticao;
}

function vagaUiParaService(vaga: VagaCoaching): VagaCoachingApp {
  return {
    id: vaga.id,
    professorId: vaga.professorId,
    professorNome: vaga.professorNome,
    modalidade: vaga.modalidade,
    repeticao: repeticaoUiParaBackend(vaga.repeticao),
    diaSemana: vaga.diaSemana,
    estudioId: vaga.estudioId,
    salaId: vaga.estudioId,
    salaNome: vaga.salaNome,
    data: vaga.dataInicio,
    dataInicio: vaga.dataInicio,
    dataFim: vaga.dataFim,
    horaInicio: vaga.horaInicio,
    horaFim: vaga.horaFim,
    estado: vaga.estado,
  };
}

function vagaBackendParaUi(
  vaga: VagaCoachingApp,
  estudios: EstudioOption[],
  professoresDisponiveis: ProfessorCoachingOption[] = []
): VagaCoaching {
  const estudio = estudios.find((item) => item.id === vaga.estudioId);

  return {
    id: vaga.id,
    professorId: vaga.professorId,
    professorNome: getProfessorNomeComLista(vaga.professorId, professoresDisponiveis, vaga.professorNome || 'Professor'),
    modalidade: vaga.modalidade,
    repeticao: 'PONTUAL',
    diaSemana: vaga.diaSemana || getDiaSemana(vaga.data),
    horaInicio: vaga.horaInicio,
    horaFim: vaga.horaFim,
    salaNome: estudio?.nome ?? vaga.salaNome ?? vaga.estudioId,
    estudioId: vaga.estudioId,
    dataInicio: vaga.data,
    dataFim: vaga.data,
    estado: vaga.estado,
  };
}

function criarPedidoForm(currentUser: CurrentUser): PedidoForm {
  return {
    alunoNome: currentUser.role === 'ALUNO' ? currentUser.name : 'Marta Silva',
    tipoAluno: 'CRIANCA_JOVEM',
    encarregadoNome: currentUser.role === 'ENCARREGADO' ? currentUser.name : 'João Silva',
    modalidade: modalidades[0] ?? 'Ballet',
    professorPreferencialId: '',
    tipoCoaching: 'Individual',
    outrosAlunosSugeridos: '',
    preferenciaHorario: 'Sábado de manhã',
    observacoes: 'Preparação técnica para apresentação.',
  };
}

function criarVagaForm(currentUser: CurrentUser, estudios: EstudioOption[]): VagaForm {
  const professorId =
    currentUser.role === 'PROFESSOR'
      ? getProfessorIdForUser(currentUser)
      : professores[0]?.id ?? '';

  return {
    professorId,
    modalidade: modalidades[0] ?? 'Ballet',
    repeticao: 'PONTUAL',
    dataInicio: '2026-01-01',
    dataFim: '2026-01-01',
    horaInicio: '10:00',
    horaFim: '11:00',
    estudioId: estudios[0]?.id ?? salas[0]?.id ?? 'estudio-1',
  };
}

function comporNotasPedido(form: PedidoForm) {
  const partes = [
    `Tipo de coaching: ${form.tipoCoaching}`,
    `Preferência de horário: ${form.preferenciaHorario}`,
  ];

  if (form.outrosAlunosSugeridos.trim()) {
    partes.push(`Outros alunos sugeridos: ${form.outrosAlunosSugeridos.trim()}`);
  }

  if (form.observacoes.trim()) {
    partes.push(`Observações: ${form.observacoes.trim()}`);
  }

  return partes.join('\n');
}

function getPageSubtitle(role: UserRole) {
  if (role === 'ALUNO') {
    return 'Cria pedidos de coaching e acompanha o estado dos teus pedidos.';
  }

  if (role === 'ENCARREGADO') {
    return 'Cria e acompanha pedidos de coaching associados ao educando.';
  }

  if (role === 'PROFESSOR') {
    return 'Consulta pedidos associados a ti e cria as tuas vagas de coaching.';
  }

  return 'Gestão global dos pedidos de coaching, professores, alunos, vagas e estados.';
}

export default function Coaching({ currentUser }: { currentUser: CurrentUser }) {
  const isAluno = currentUser.role === 'ALUNO';
  const isEncarregado = currentUser.role === 'ENCARREGADO';
  const isProfessor = currentUser.role === 'PROFESSOR';
  const isCoordenacao = currentUser.role === 'COORDENACAO';

  const podeCriarPedido = isEncarregado;
  const podeCriarVaga = isProfessor || isCoordenacao;
  const podeAlterarEstado = isProfessor || isCoordenacao;

  const [estudios, setEstudios] = useState<EstudioOption[]>(normalizarEstudiosMock());
  const [professoresBd, setProfessoresBd] = useState<ProfessorCoachingOption[]>([]);
  const [pedidos, setPedidos] = useState<PedidoCoaching[]>(normalizarPedidosMock());
  const [vagas, setVagas] = useState<VagaCoaching[]>(normalizarVagasMock());
  const [aulasHorario, setAulasHorario] = useState<AulaSemanalApp[]>([]);

  const [estadoFiltro, setEstadoFiltro] = useState<'TODOS' | EstadoPedido>('TODOS');
  const [modalidadeFiltro, setModalidadeFiltro] = useState('TODAS');

  const [modalPedidoAberta, setModalPedidoAberta] = useState(false);
  const [modalVagaAberta, setModalVagaAberta] = useState(false);
  const [modalAssociarAberta, setModalAssociarAberta] = useState(false);

  const [pedidoForm, setPedidoForm] = useState<PedidoForm>(criarPedidoForm(currentUser));
  const [vagaForm, setVagaForm] = useState<VagaForm>(criarVagaForm(currentUser, estudios));

  const [vagaSelecionada, setVagaSelecionada] = useState<VagaCoaching | null>(null);
  const [pedidoSelecionadoId, setPedidoSelecionadoId] = useState('');

  const [mensagem, setMensagem] = useState('');
  const [erroCarregamento, setErroCarregamento] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const professorIdAtual = useMemo(
    () => (isProfessor ? getProfessorIdForUser(currentUser) : ''),
    [currentUser, isProfessor]
  );

  const professoresOpcoes = useMemo<ProfessorCoachingOption[]>(() => {
    const base = professoresBd;

    if (!isProfessor || !professorIdAtual) {
      return base;
    }

    const existe = base.some((professor) => professor.id === professorIdAtual);

    if (existe) {
      return base;
    }

    return [{ id: professorIdAtual, nome: currentUser.name }, ...base];
  }, [currentUser.name, isProfessor, professorIdAtual, professoresBd]);

  useEffect(() => {
    void carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarDados() {
    try {
      setIsLoading(true);
      setErroCarregamento('');

      const [estudiosBackend, professoresBackend] = await Promise.all([
        listarEstudios().catch(() => []),
        listarProfessoresCoaching().catch(() => []),
      ]);

      const estudiosNormalizados = normalizarEstudiosBackend(estudiosBackend);
      const estudiosFinais = estudiosNormalizados.length > 0 ? estudiosNormalizados : normalizarEstudiosMock();
      const professoresFinais = professoresBackend;

      setEstudios(estudiosFinais);
      setProfessoresBd(professoresFinais);

      const [pedidosBackend, vagasBackend, aulasBackend] = await Promise.all([
        listarPedidosCoaching().catch(() => []),
        listarVagasCoaching().catch(() => []),
        listarAulasSemanais().catch(() => []),
      ]);

      setAulasHorario(aulasBackend);

      setPedidos(
        pedidosBackend.length > 0
          ? pedidosBackend.map((pedido) => pedidoBackendParaUi(pedido, professoresFinais))
          : normalizarPedidosMock()
      );

      setVagas(
        vagasBackend.length > 0
          ? vagasBackend.map((vaga) => vagaBackendParaUi(vaga, estudiosFinais, professoresFinais))
          : normalizarVagasMock()
      );
    } catch (error) {
      setErroCarregamento(getErrorMessage(error));
      setPedidos(normalizarPedidosMock());
      setVagas(normalizarVagasMock());
    } finally {
      setIsLoading(false);
    }
  }

  const pedidosDoPerfil = useMemo(() => {
    return pedidos.filter((pedido) => {
      if (isAluno) {
        const alunoIdAtual = getPerfilId(currentUser, 'aluno');
        return pedido.alunoId === alunoIdAtual || pedido.alunoNome === currentUser.name;
      }

      if (isEncarregado) {
        const encarregadoIdAtual = getPerfilId(currentUser, 'encarregado');
        return (
          pedido.encarregadoId === encarregadoIdAtual ||
          pedido.encarregadoNome === currentUser.name ||
          pedido.isMock
        );
      }

      if (isProfessor) {
        return (
          pedido.professorPreferencialId === professorIdAtual ||
          pedido.professorPreferencialNome === currentUser.name ||
          !pedido.professorPreferencialId
        );
      }

      return true;
    });
  }, [pedidos, currentUser, isAluno, isEncarregado, isProfessor, professorIdAtual]);

  const pedidosFiltrados = useMemo(() => {
    return pedidosDoPerfil.filter((pedido) => {
      const correspondeEstado = estadoFiltro === 'TODOS' || pedido.estado === estadoFiltro;
      const correspondeModalidade =
        modalidadeFiltro === 'TODAS' || pedido.modalidade === modalidadeFiltro;

      return correspondeEstado && correspondeModalidade;
    });
  }, [pedidosDoPerfil, estadoFiltro, modalidadeFiltro]);

  const vagasVisiveis = useMemo(() => {
    if (isProfessor) {
      return vagas.filter(
        (vaga) => vaga.professorId === professorIdAtual || vaga.professorNome === currentUser.name
      );
    }

    if (isCoordenacao) {
      return vagas;
    }

    return vagas.filter((vaga) => vaga.estado === 'ABERTA');
  }, [vagas, currentUser.name, isCoordenacao, isProfessor, professorIdAtual]);

  const pedidosAssociaveis = pedidos.filter(
    (pedido) => pedido.estado !== 'REJEITADO' && pedido.estado !== 'APROVADO'
  );

  const totalPendentes = pedidosDoPerfil.filter((pedido) => pedido.estado === 'PENDENTE').length;
  const totalAprovados = pedidosDoPerfil.filter((pedido) => pedido.estado === 'APROVADO').length;
  const totalGrupo = pedidosDoPerfil.filter((pedido) => pedido.tipoCoaching === 'Grupo').length;

  function abrirPedido() {
    const formBase = criarPedidoForm(currentUser);

    setPedidoForm({
      ...formBase,
      professorPreferencialId: '',
    });
    setModalPedidoAberta(true);
    setMensagem('');
  }

  function abrirVaga() {
    setVagaForm(criarVagaForm(currentUser, estudios));
    setModalVagaAberta(true);
    setMensagem('');
  }


  function getAlunoDadosParaPedido() {
    if (isAluno) {
      return {
        alunoId: getPerfilId(currentUser, 'aluno'),
        alunoNome: currentUser.name,
        tipoAluno: 'CRIANCA_JOVEM' as TipoAluno,
        encarregadoId: '',
        encarregadoNome: '',
      };
    }

    return {
      alunoId: slugId('Marta Silva', 'aluno'),
      alunoNome: 'Marta Silva',
      tipoAluno: 'CRIANCA_JOVEM' as TipoAluno,
      encarregadoId: getPerfilId(currentUser, 'encarregado'),
      encarregadoNome: currentUser.name,
    };
  }

  function jaSolicitouVaga(vaga: VagaCoaching) {
    const dadosAluno = getAlunoDadosParaPedido();

    return pedidos.some((pedido) => {
      const mesmoAluno =
        pedido.alunoId === dadosAluno.alunoId ||
        pedido.alunoNome === dadosAluno.alunoNome ||
        pedido.encarregadoId === dadosAluno.encarregadoId;

      const mesmaVaga =
        pedido.vagaId === vaga.id ||
        pedido.observacoes.includes(vaga.id) ||
        pedido.preferenciaHorario.includes(vaga.id);

      return mesmoAluno && mesmaVaga && pedido.estado !== 'REJEITADO';
    });
  }

  function atualizarPedidoForm<K extends keyof PedidoForm>(campo: K, valor: PedidoForm[K]) {
    setPedidoForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function atualizarVagaForm<K extends keyof VagaForm>(campo: K, valor: VagaForm[K]) {
    setVagaForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function atualizarPedidoLocal(pedidoAtualizado: PedidoCoaching) {
    setPedidos((atuais) =>
      atuais.map((pedido) => (pedido.id === pedidoAtualizado.id ? pedidoAtualizado : pedido))
    );
  }


  async function solicitarInscricaoVaga(vaga: VagaCoaching) {
    if (vaga.estado !== 'ABERTA') {
      setMensagem('Esta disponibilidade já não está aberta.');
      return;
    }

    if (jaSolicitouVaga(vaga)) {
      setMensagem('Já existe um pedido teu para esta disponibilidade.');
      return;
    }

    const dadosAluno = getAlunoDadosParaPedido();
    const horario = `${formatDate(vaga.dataInicio)}, ${vaga.horaInicio}-${vaga.horaFim}`;

    try {
      setIsSaving(true);

      const pedidoCriado = await solicitarVagaCoaching({
        vaga: vagaUiParaService(vaga),
        alunoId: dadosAluno.alunoId,
        alunoNome: dadosAluno.alunoNome,
        tipoAluno: dadosAluno.tipoAluno,
        encarregadoId: dadosAluno.encarregadoId || null,
        encarregadoNome: dadosAluno.encarregadoNome,
        tipoCoaching: 'Individual',
        observacoes: [
          `Pedido criado a partir da disponibilidade ${vaga.id}.`,
          `Professor: ${vaga.professorNome}`,
          `Sala: ${vaga.salaNome}`,
          `Horário: ${horario}`,
        ].join('\n'),
      });

      const novoPedido: PedidoCoaching = {
        ...pedidoBackendParaUi(pedidoCriado),
        alunoNome: dadosAluno.alunoNome,
        alunoId: dadosAluno.alunoId,
        tipoAluno: dadosAluno.tipoAluno,
        encarregadoId: dadosAluno.encarregadoId,
        encarregadoNome: dadosAluno.encarregadoNome,
        modalidade: vaga.modalidade,
        professorPreferencialId: vaga.professorId,
        professorPreferencialNome: vaga.professorNome,
        tipoCoaching: 'Individual',
        outrosAlunosSugeridos: '',
        preferenciaHorario: horario,
        observacoes: [
          `Pedido criado a partir da disponibilidade ${vaga.id}.`,
          `Professor: ${vaga.professorNome}`,
          `Sala: ${vaga.salaNome}`,
          `Horário: ${horario}`,
        ].join('\n'),
        vagaId: vaga.id,
      };

      setPedidos((atuais) => [novoPedido, ...atuais]);
      setMensagem('Pedido de inscrição enviado ao professor.');
    } catch (error) {
      setMensagem(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function criarPedido() {
    if (!pedidoForm.alunoNome.trim()) {
      setMensagem('Preenche o nome do aluno.');
      return;
    }

    if (!pedidoForm.preferenciaHorario.trim()) {
      setMensagem('Indica uma preferência de horário.');
      return;
    }

    const professorNome = getProfessorNomeComLista(pedidoForm.professorPreferencialId, professoresOpcoes);
    const alunoId = isAluno ? getPerfilId(currentUser, 'aluno') : slugId(pedidoForm.alunoNome, 'aluno');
    const encarregadoId =
      pedidoForm.tipoAluno === 'ADULTO'
        ? ''
        : isEncarregado
          ? getPerfilId(currentUser, 'encarregado')
          : slugId(pedidoForm.encarregadoNome, 'encarregado');

    try {
      setIsSaving(true);

      const pedidoCriado = await criarPedidoCoaching({
        alunoId,
        encarregadoId: encarregadoId || null,
        modalidade: pedidoForm.modalidade,
        notas: comporNotasPedido(pedidoForm),
        professorId: pedidoForm.professorPreferencialId || null,
      });

      const novoPedido: PedidoCoaching = {
        ...pedidoBackendParaUi(pedidoCriado),
        alunoNome: pedidoForm.alunoNome,
        tipoAluno: pedidoForm.tipoAluno,
        encarregadoId,
        encarregadoNome: pedidoForm.tipoAluno === 'ADULTO' ? '' : pedidoForm.encarregadoNome,
        professorPreferencialId: pedidoForm.professorPreferencialId,
        professorPreferencialNome: professorNome,
        tipoCoaching: pedidoForm.tipoCoaching,
        outrosAlunosSugeridos: pedidoForm.outrosAlunosSugeridos,
        preferenciaHorario: pedidoForm.preferenciaHorario,
        observacoes: pedidoForm.observacoes,
        vagaId: '',
      };

      setPedidos((atuais) => [novoPedido, ...atuais]);
      setModalPedidoAberta(false);
      setMensagem('Pedido de coaching criado no backend com sucesso.');
    } catch (error) {
      setMensagem(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function criarVaga() {
    if (!vagaForm.professorId || !vagaForm.horaInicio || !vagaForm.horaFim || !vagaForm.estudioId) {
      setMensagem('Preenche professor, estúdio e horário da disponibilidade.');
      return;
    }

    const professorNome = getProfessorNomeComLista(vagaForm.professorId, professoresOpcoes, currentUser.name);
    const estudio = estudios.find((item) => item.id === vagaForm.estudioId);

    try {
      setIsSaving(true);

      const vagaCriada = await criarVagaCoaching({
        professorId: vagaForm.professorId,
        professorNome,
        modalidade: vagaForm.modalidade,
        estudioId: vagaForm.estudioId,
        data: vagaForm.dataInicio,
        horaInicio: vagaForm.horaInicio,
        horaFim: vagaForm.horaFim,
        estado: 'ABERTA',
      });

      const novaVaga: VagaCoaching = {
        ...vagaBackendParaUi(vagaCriada, estudios),
        professorNome,
        repeticao: vagaForm.repeticao,
        salaNome: estudio?.nome ?? vagaCriada.salaNome,
        dataFim: vagaForm.dataFim,
      };

      setVagas((atuais) => [novaVaga, ...atuais]);
      setModalVagaAberta(false);
      setMensagem('Disponibilidade de coaching criada no backend com sucesso.');
    } catch (error) {
      setMensagem(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function aceitarPedido(pedido: PedidoCoaching) {
    const professorId = professorIdAtual || pedido.professorPreferencialId || professoresOpcoes[0]?.id || '';

    if (!professorId) {
      setMensagem('Não foi possível identificar o professor.');
      return;
    }

    if (pedido.isMock) {
      atualizarPedidoLocal({
        ...pedido,
        estado: 'ACEITE_PROFESSOR',
        professorPreferencialId: professorId,
        professorPreferencialNome: getProfessorNome(professorId, currentUser.name),
      });
      setMensagem('Pedido mock aceite pelo professor.');
      return;
    }

    try {
      setIsSaving(true);
      const pedidoAtualizado = await aceitarPedidoCoaching(pedido.id, { professorId });

      atualizarPedidoLocal({
        ...pedido,
        ...pedidoBackendParaUi(pedidoAtualizado),
        alunoNome: pedido.alunoNome,
        encarregadoNome: pedido.encarregadoNome,
        tipoAluno: pedido.tipoAluno,
        tipoCoaching: pedido.tipoCoaching,
        outrosAlunosSugeridos: pedido.outrosAlunosSugeridos,
        preferenciaHorario: pedido.preferenciaHorario,
        observacoes: pedido.observacoes,
        professorPreferencialNome: getProfessorNome(professorId, currentUser.name),
      });

      setMensagem('Pedido aceite pelo professor.');
    } catch (error) {
      setMensagem(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function aprovarPedido(pedido: PedidoCoaching) {
    if (pedido.isMock) {
      atualizarPedidoLocal({ ...pedido, estado: 'APROVADO' });
      setMensagem('Pedido mock aprovado.');
      return;
    }

    try {
      setIsSaving(true);
      const pedidoAtualizado = await aprovarPedidoCoaching(pedido.id);

      atualizarPedidoLocal({
        ...pedido,
        ...pedidoBackendParaUi(pedidoAtualizado),
        alunoNome: pedido.alunoNome,
        encarregadoNome: pedido.encarregadoNome,
        tipoAluno: pedido.tipoAluno,
        tipoCoaching: pedido.tipoCoaching,
        outrosAlunosSugeridos: pedido.outrosAlunosSugeridos,
        preferenciaHorario: pedido.preferenciaHorario,
        observacoes: pedido.observacoes,
      });

      setMensagem('Pedido aprovado pela coordenação.');
    } catch (error) {
      setMensagem(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function rejeitarPedido(pedido: PedidoCoaching) {
    const origem = isProfessor ? 'professor' : 'coordenação';
    const motivoRejeicao = `Rejeitado pelo ${origem}.`;

    if (pedido.isMock) {
      atualizarPedidoLocal({ ...pedido, estado: 'REJEITADO', motivoRejeicao });
      setMensagem(`Pedido mock rejeitado pelo ${origem}.`);
      return;
    }

    try {
      setIsSaving(true);
      const pedidoAtualizado = await rejeitarPedidoCoaching(pedido.id, {
        motivoRejeicao,
      });

      atualizarPedidoLocal({
        ...pedido,
        ...pedidoBackendParaUi(pedidoAtualizado),
        alunoNome: pedido.alunoNome,
        encarregadoNome: pedido.encarregadoNome,
        tipoAluno: pedido.tipoAluno,
        tipoCoaching: pedido.tipoCoaching,
        outrosAlunosSugeridos: pedido.outrosAlunosSugeridos,
        preferenciaHorario: pedido.preferenciaHorario,
        observacoes: pedido.observacoes,
        motivoRejeicao,
      });

      setMensagem(`Pedido rejeitado pelo ${origem}.`);
    } catch (error) {
      setMensagem(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  function verificarConflitoHorario(
    diaSemana: string,
    horaInicio: string,
    horaFim: string,
    salaNome: string
  ) {
    const diaAlvo = normalizarDiaSemanaComparacao(diaSemana);
    const salaAlvo = salaNome.trim().toLowerCase();

    return (
      aulasHorario.find((aula) => {
        if (aula.estado === 'CANCELADA') return false;

        const mesmoDia = normalizarDiaSemanaComparacao(aula.diaSemana) === diaAlvo;
        const mesmaSala = (aula.salaNome || '').trim().toLowerCase() === salaAlvo;

        if (!mesmoDia || !mesmaSala) return false;

        return horariosSobrepoem(horaInicio, horaFim, aula.horaInicio, aula.horaFim);
      }) ?? null
    );
  }

  function abrirAssociacao(vaga: VagaCoaching) {
    setVagaSelecionada(vaga);
    setPedidoSelecionadoId(pedidosAssociaveis[0]?.id ?? '');
    setModalAssociarAberta(true);
    setMensagem('');
  }

  async function associarVagaAPedido() {
    if (!vagaSelecionada || !pedidoSelecionadoId) {
      setMensagem('Seleciona uma vaga e um pedido.');
      return;
    }

    const pedidoSelecionado = pedidos.find((pedido) => pedido.id === pedidoSelecionadoId);

    if (!pedidoSelecionado) {
      setMensagem('Pedido não encontrado.');
      return;
    }

    const diaSemana = capitalizarDiaSemana(
      vagaSelecionada.diaSemana || getDiaSemana(vagaSelecionada.dataInicio)
    );
    const horarioFinal = `${diaSemana}, ${formatDate(vagaSelecionada.dataInicio)}, ${vagaSelecionada.horaInicio}-${vagaSelecionada.horaFim}`;

    const conflitoHorario = verificarConflitoHorario(
      diaSemana,
      vagaSelecionada.horaInicio,
      vagaSelecionada.horaFim,
      vagaSelecionada.salaNome
    );

    if (conflitoHorario) {
      setMensagem(
        `A sala ${vagaSelecionada.salaNome} já está ocupada (${conflitoHorario.turma}) ${diaSemana}, ${conflitoHorario.horaInicio}-${conflitoHorario.horaFim}. Escolhe outra disponibilidade.`
      );
      return;
    }

    if (vagaSelecionada.isMock || pedidoSelecionado.isMock) {
      const aulaCoachingLocal: AulaSemanalApp = {
        id: slugId(`${vagaSelecionada.id}-${pedidoSelecionado.id}`, 'coaching'),
        diaSemana,
        horaInicio: vagaSelecionada.horaInicio,
        horaFim: vagaSelecionada.horaFim,
        modalidade: vagaSelecionada.modalidade,
        turmaId: '',
        turma: `Coaching — ${pedidoSelecionado.alunoNome}`,
        professorId: vagaSelecionada.professorId,
        professorNome: vagaSelecionada.professorNome,
        salaId: vagaSelecionada.estudioId,
        salaNome: vagaSelecionada.salaNome,
        faixaEtaria: pedidoSelecionado.tipoAluno === 'ADULTO' ? 'Adultos' : 'Crianças/Jovens',
        tipo: 'Coaching',
        vagas: pedidoSelecionado.tipoCoaching === 'Grupo' ? 6 : 1,
        inscritos: 1,
        estado: 'ATIVA',
      };

      setAulasHorario((atuais) => [aulaCoachingLocal, ...atuais]);

      setPedidos((atuais) =>
        atuais.map((pedido) =>
          pedido.id === pedidoSelecionadoId
            ? {
                ...pedido,
                estado: 'AGENDADO',
                professorPreferencialId: vagaSelecionada.professorId,
                professorPreferencialNome: vagaSelecionada.professorNome,
                modalidade: vagaSelecionada.modalidade,
                preferenciaHorario: horarioFinal,
              }
            : pedido
        )
      );

      setVagas((atuais) =>
        atuais.map((vaga) =>
          vaga.id === vagaSelecionada.id ? { ...vaga, estado: 'FECHADA' } : vaga
        )
      );

      setModalAssociarAberta(false);
      setMensagem('Coaching agendado e adicionado ao horário semanal.');
      return;
    }

    const dataInicioISO = `${vagaSelecionada.dataInicio}T${vagaSelecionada.horaInicio}:00`;
    const dataFimISO = `${vagaSelecionada.dataInicio}T${vagaSelecionada.horaFim}:00`;

    try {
      setIsSaving(true);

      if (vagaSelecionada.estudioId) {
        try {
          const disponibilidade = await verificarDisponibilidadeEstudio(
            vagaSelecionada.estudioId,
            dataInicioISO,
            dataFimISO
          );

          if (!disponibilidade.disponivel) {
            setMensagem('O estúdio já tem uma sessão de coaching neste horário. Escolhe outra disponibilidade.');
            setIsSaving(false);
            return;
          }
        } catch {
          setMensagem('');
        }
      }

      await criarSessaoCoaching({
        professorId: vagaSelecionada.professorId,
        alunosIds: [pedidoSelecionado.alunoId],
        modalidade: vagaSelecionada.modalidade,
        estudioId: vagaSelecionada.estudioId || null,
        dataInicio: dataInicioISO,
        dataFim: dataFimISO,
        duracaoMinutos: calcularDuracaoMinutos(vagaSelecionada.horaInicio, vagaSelecionada.horaFim),
      });

      await fecharVagaCoaching(vagaSelecionada.id);

      try {
        await associarVagaPedidoBackend(pedidoSelecionado.id, {
          vagaId: vagaSelecionada.id,
          professorId: vagaSelecionada.professorId,
          professorNome: vagaSelecionada.professorNome,
          salaId: vagaSelecionada.estudioId || null,
          salaNome: vagaSelecionada.salaNome,
          horarioFinal,
          estado: 'AGENDADO',
        });
      } catch {
        setMensagem('');
      }

      let mensagemHorario = '';

      try {
        const aulaCoaching = await criarAulaSemanal({
          diaSemana,
          horaInicio: vagaSelecionada.horaInicio,
          horaFim: vagaSelecionada.horaFim,
          modalidade: vagaSelecionada.modalidade,
          turma: `Coaching — ${pedidoSelecionado.alunoNome}`,
          professorId: vagaSelecionada.professorId,
          professorNome: vagaSelecionada.professorNome,
          salaId: vagaSelecionada.estudioId || null,
          salaNome: vagaSelecionada.salaNome,
          faixaEtaria: pedidoSelecionado.tipoAluno === 'ADULTO' ? 'Adultos' : 'Crianças/Jovens',
          tipo: 'Coaching',
          vagas: pedidoSelecionado.tipoCoaching === 'Grupo' ? 6 : 1,
          inscritos: 1,
          estado: 'ATIVA',
        });

        setAulasHorario((atuais) => [aulaCoaching, ...atuais]);
        mensagemHorario = ' A sessão foi adicionada ao horário semanal.';
      } catch {
        mensagemHorario = ' (não foi possível adicionar automaticamente ao horário)';
      }

      setVagas((atuais) =>
        atuais.map((vaga) =>
          vaga.id === vagaSelecionada.id ? { ...vaga, estado: 'FECHADA' } : vaga
        )
      );

      setPedidos((atuais) =>
        atuais.map((pedido) =>
          pedido.id === pedidoSelecionadoId
            ? {
                ...pedido,
                estado: 'AGENDADO',
                professorPreferencialId: vagaSelecionada.professorId,
                professorPreferencialNome: vagaSelecionada.professorNome,
                modalidade: vagaSelecionada.modalidade,
                preferenciaHorario: horarioFinal,
              }
            : pedido
        )
      );

      setModalAssociarAberta(false);
      setMensagem(`Sessão de coaching criada e vaga fechada no backend.${mensagemHorario}`);
    } catch (error) {
      setMensagem(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-[1500px] mx-auto">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full bg-[#d4e8df] text-[#2d5f4f] text-sm">
              {currentUser.roleLabel}
            </span>

            {isCoordenacao && (
              <span className="px-3 py-1 rounded-full bg-[#fff4d4] text-[#8a6d1d] text-sm">
                Acesso global
              </span>
            )}

            <span className="px-3 py-1 rounded-full bg-[#f0f6f3] text-[#5a7a6c] text-sm">
              {isLoading ? 'A carregar...' : 'Ligado ao backend'}
            </span>
          </div>

          <h1 className="text-[#2d5f4f] mb-2">Coaching</h1>

          <p className="text-[#7a9a8c]">{getPageSubtitle(currentUser.role)}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => void carregarDados()}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>

          {podeCriarPedido && (
            <button
              onClick={abrirPedido}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo pedido
            </button>
          )}

          {podeCriarVaga && (
            <button
              onClick={abrirVaga}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors"
            >
              <CalendarCheck2 className="w-4 h-4" />
              Nova disponibilidade
            </button>
          )}
        </div>
      </div>

      {(mensagem || erroCarregamento) && (
        <div className="mb-6 rounded-xl border border-[#d4e8df] bg-[#f0f6f3] p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#2d5f4f]" />
          <p className="text-[#2d5f4f]">{mensagem || erroCarregamento}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <SummaryCard
          icon={<Users className="w-5 h-5 text-[#2d5f4f]" />}
          label={isCoordenacao ? 'Pedidos totais' : 'Pedidos associados'}
          value={pedidosDoPerfil.length}
          color="bg-[#d4e8df]"
        />

        <SummaryCard
          icon={<Clock className="w-5 h-5 text-[#2d5f4f]" />}
          label="Pendentes"
          value={totalPendentes}
          color="bg-[#fff4d4]"
        />

        <SummaryCard
          icon={<Calendar className="w-5 h-5 text-[#2d5f4f]" />}
          label="Aprovados"
          value={totalAprovados}
          color="bg-[#e8d4ff]"
        />

        <SummaryCard
          icon={<UserCheck className="w-5 h-5 text-[#2d5f4f]" />}
          label="Coachings em grupo"
          value={totalGrupo}
          color="bg-[#d4e8ff]"
        />
      </div>

      <section className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#2d5f4f]" />
            <h2 className="text-[#2d5f4f]">
              {isCoordenacao ? 'Todos os pedidos de coaching' : 'Pedidos de coaching'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Estado">
              <select
                value={estadoFiltro}
                onChange={(event) =>
                  setEstadoFiltro(event.target.value as 'TODOS' | EstadoPedido)
                }
                className="inputEntartes"
              >
                <option value="TODOS">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="INTERESSE_REGISTADO">Interesse registado</option>
                <option value="ACEITE_PROFESSOR">Aceite pelo professor</option>
                <option value="APROVADO">Aprovado</option>
                <option value="REJEITADO">Rejeitado</option>
              </select>
            </FormField>

            <FormField label="Modalidade">
              <select
                value={modalidadeFiltro}
                onChange={(event) => setModalidadeFiltro(event.target.value)}
                className="inputEntartes"
              >
                <option value="TODAS">Todas</option>

                {modalidades.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-8 text-center">
            <Users className="w-10 h-10 text-[#7a9a8c] mx-auto mb-3" />
            <h3 className="text-[#2d5f4f] mb-2">Sem pedidos associados</h3>
            <p className="text-[#7a9a8c]">
              Não existem pedidos de coaching para este perfil com os filtros selecionados.
            </p>
          </div>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <article
              key={pedido.id}
              className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-[#f8faf9] border border-[#e8f0ed] text-[#5a7a6c] text-xs">
                      {pedido.id}
                    </span>

                    {pedido.isMock && (
                      <span className="px-3 py-1 rounded-full bg-[#f0f6f3] text-[#5a7a6c] text-xs">
                        Mock
                      </span>
                    )}

                    <span className={`px-3 py-1 rounded-full text-xs ${estadoStyles[pedido.estado]}`}>
                      {estadoLabels[pedido.estado]}
                    </span>

                    <span className="px-3 py-1 rounded-full bg-[#d4e8df] text-[#2d5f4f] text-xs">
                      {pedido.tipoCoaching}
                    </span>
                  </div>

                  <h3 className="text-[#2d5f4f] mb-1">{pedido.alunoNome}</h3>

                  <p className="text-sm text-[#7a9a8c]">
                    {pedido.tipoAluno === 'ADULTO'
                      ? 'Aluno adulto'
                      : pedido.encarregadoNome
                        ? `Encarregado: ${pedido.encarregadoNome}`
                        : 'Criança/jovem com encarregado'}
                  </p>
                </div>

                {podeAlterarEstado && (
                  <div className="flex flex-wrap gap-2">
                    {isProfessor &&
                      (pedido.estado === 'PENDENTE' || pedido.estado === 'INTERESSE_REGISTADO') && (
                        <button
                          onClick={() => void aceitarPedido(pedido)}
                          disabled={isSaving}
                          className="px-3 py-2 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] disabled:opacity-60"
                        >
                          Aceitar pedido
                        </button>
                      )}

                    {isCoordenacao && pedido.estado === 'ACEITE_PROFESSOR' && (
                      <button
                        onClick={() => void aprovarPedido(pedido)}
                        disabled={isSaving}
                        className="px-3 py-2 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] disabled:opacity-60"
                      >
                        Aprovar
                      </button>
                    )}

                    {((isProfessor &&
                      (pedido.estado === 'PENDENTE' || pedido.estado === 'INTERESSE_REGISTADO')) ||
                      (isCoordenacao && pedido.estado !== 'REJEITADO' && pedido.estado !== 'APROVADO')) && (
                      <button
                        onClick={() => void rejeitarPedido(pedido)}
                        disabled={isSaving}
                        className="px-3 py-2 rounded-xl border border-[#ffd2d2] text-[#9a3a3a] hover:bg-[#fff5f5] disabled:opacity-60"
                      >
                        Recusar pedido
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                <Info label="Modalidade" value={pedido.modalidade} />
                <Info label="Professor" value={pedido.professorPreferencialNome} />
                <Info label="Horário / agendamento" value={pedido.preferenciaHorario} />
              </div>

              {pedido.outrosAlunosSugeridos && (
                <div className="mt-4 rounded-xl bg-[#f8faf9] border border-[#e8f0ed] p-4">
                  <p className="text-xs text-[#7a9a8c] mb-1">Outros alunos sugeridos</p>
                  <p className="text-sm text-[#5a7a6c]">{pedido.outrosAlunosSugeridos}</p>
                </div>
              )}

              <div className="mt-4 rounded-xl bg-[#f8faf9] border border-[#e8f0ed] p-4">
                <p className="text-xs text-[#7a9a8c] mb-1">Observações</p>
                <p className="text-sm text-[#5a7a6c] whitespace-pre-line">{pedido.observacoes || 'Sem observações adicionais.'}</p>
              </div>

              {pedido.motivoRejeicao && (
                <div className="mt-4 rounded-xl bg-[#fff5f5] border border-[#ffd2d2] p-4">
                  <p className="text-xs text-[#9a3a3a] mb-1">Motivo da rejeição</p>
                  <p className="text-sm text-[#9a3a3a]">{pedido.motivoRejeicao}</p>
                </div>
              )}
            </article>
          ))
        )}
      </section>

      <section className="mt-8 bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#d4e8ff] flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#2d5f4f]" />
          </div>

          <div>
            <h2 className="text-[#2d5f4f]">
              {isProfessor ? 'As minhas vagas de coaching' : 'Vagas de coaching disponíveis'}
            </h2>

            <p className="text-sm text-[#7a9a8c]">
              {isProfessor
                ? 'Disponibilidades associadas ao professor.'
                : 'Disponibilidades criadas pelos professores.'}
            </p>
          </div>
        </div>

        {vagasVisiveis.length === 0 ? (
          <p className="text-[#7a9a8c]">Não existem vagas associadas a este perfil.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {vagasVisiveis.map((vaga) => (
              <article
                key={vaga.id}
                className="rounded-2xl border border-[#e8f0ed] bg-[#f8faf9] p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-[#2d5f4f] mb-1">{vaga.modalidade}</h3>
                    <p className="text-sm text-[#7a9a8c]">{vaga.professorNome}</p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs ${estadoVagaStyles[vaga.estado]}`}>
                    {estadoVagaLabels[vaga.estado]}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-[#5a7a6c]">
                  <p>
                    <strong>Repetição:</strong> {vaga.repeticao}
                  </p>
                  <p>
                    <strong>Data:</strong> {formatDate(vaga.dataInicio)}
                  </p>
                  <p>
                    <strong>Dia:</strong> {vaga.diaSemana}
                  </p>
                  <p>
                    <strong>Horário:</strong> {vaga.horaInicio} - {vaga.horaFim}
                  </p>
                  <p>
                    <strong>Sala:</strong> {vaga.salaNome}
                  </p>
                </div>

                {(isAluno || isEncarregado) && vaga.estado === 'ABERTA' && (
                  <button
                    onClick={() => void solicitarInscricaoVaga(vaga)}
                    disabled={isSaving || jaSolicitouVaga(vaga)}
                    className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors disabled:opacity-60"
                  >
                    <UserCheck className="w-4 h-4" />
                    {jaSolicitouVaga(vaga) ? 'Pedido enviado' : 'Inscrever nesta disponibilidade'}
                  </button>
                )}

                {isCoordenacao && vaga.estado === 'ABERTA' && (
                  <button
                    onClick={() => abrirAssociacao(vaga)}
                    className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-white transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Criar sessão com pedido
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {modalPedidoAberta && (
        <Modal onClose={() => setModalPedidoAberta(false)}>
          <ModalHeader
            title="Novo pedido de coaching"
            subtitle="Cria um pedido associado ao perfil ativo."
            onClose={() => setModalPedidoAberta(false)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Aluno">
              <input
                value={pedidoForm.alunoNome}
                onChange={(event) => atualizarPedidoForm('alunoNome', event.target.value)}
                disabled={isAluno}
                className="inputEntartes disabled:opacity-70"
              />
            </FormField>

            <FormField label="Tipo de aluno">
              <select
                value={pedidoForm.tipoAluno}
                onChange={(event) =>
                  atualizarPedidoForm('tipoAluno', event.target.value as TipoAluno)
                }
                className="inputEntartes"
              >
                <option value="CRIANCA_JOVEM">Criança/jovem com encarregado</option>
                <option value="ADULTO">Adulto</option>
              </select>
            </FormField>

            {pedidoForm.tipoAluno !== 'ADULTO' && (
              <FormField label="Encarregado de educação">
                <input
                  value={pedidoForm.encarregadoNome}
                  onChange={(event) =>
                    atualizarPedidoForm('encarregadoNome', event.target.value)
                  }
                  disabled={isEncarregado}
                  className="inputEntartes disabled:opacity-70"
                />
              </FormField>
            )}

            <FormField label="Modalidade">
              <select
                value={pedidoForm.modalidade}
                onChange={(event) => atualizarPedidoForm('modalidade', event.target.value)}
                className="inputEntartes"
              >
                {modalidades.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Professor preferencial">
              <select
                value={pedidoForm.professorPreferencialId}
                onChange={(event) =>
                  atualizarPedidoForm('professorPreferencialId', event.target.value)
                }
                className="inputEntartes"
              >
                <option value="">Sem preferência</option>

                {professoresOpcoes.map((professor) => (
                  <option value={professor.id} key={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Tipo de coaching">
              <select
                value={pedidoForm.tipoCoaching}
                onChange={(event) =>
                  atualizarPedidoForm('tipoCoaching', event.target.value as TipoCoaching)
                }
                className="inputEntartes"
              >
                <option value="Individual">Individual</option>
                <option value="Grupo">Grupo</option>
              </select>
            </FormField>

            <FormField label="Preferência de horário">
              <input
                value={pedidoForm.preferenciaHorario}
                onChange={(event) =>
                  atualizarPedidoForm('preferenciaHorario', event.target.value)
                }
                placeholder="Ex.: sexta à noite"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Outros alunos sugeridos">
              <input
                value={pedidoForm.outrosAlunosSugeridos}
                onChange={(event) =>
                  atualizarPedidoForm('outrosAlunosSugeridos', event.target.value)
                }
                placeholder="Ex.: Marta Silva, Inês Costa"
                className="inputEntartes"
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Observações">
                <textarea
                  value={pedidoForm.observacoes}
                  onChange={(event) => atualizarPedidoForm('observacoes', event.target.value)}
                  className="inputEntartes min-h-24 resize-none"
                />
              </FormField>
            </div>
          </div>

          <ModalActions
            cancelLabel="Cancelar"
            confirmLabel={isSaving ? 'A submeter...' : 'Submeter pedido'}
            onCancel={() => setModalPedidoAberta(false)}
            onConfirm={() => void criarPedido()}
          />
        </Modal>
      )}

      {modalVagaAberta && (
        <Modal onClose={() => setModalVagaAberta(false)}>
          <ModalHeader
            title="Nova disponibilidade de coaching"
            subtitle="Cria uma vaga de coaching no backend."
            onClose={() => setModalVagaAberta(false)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Professor">
              <select
                value={vagaForm.professorId}
                onChange={(event) => atualizarVagaForm('professorId', event.target.value)}
                disabled={isProfessor}
                className="inputEntartes disabled:opacity-70"
              >
                {professoresOpcoes.map((professor) => (
                  <option value={professor.id} key={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Modalidade">
              <select
                value={vagaForm.modalidade}
                onChange={(event) => atualizarVagaForm('modalidade', event.target.value)}
                className="inputEntartes"
              >
                {modalidades.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Repetição">
              <select
                value={vagaForm.repeticao}
                onChange={(event) =>
                  atualizarVagaForm('repeticao', event.target.value as RepeticaoVaga)
                }
                className="inputEntartes"
              >
                <option value="PONTUAL">Pontual</option>
                <option value="DIARIA">Diária</option>
                <option value="SEMANAL">Semanal</option>
                <option value="MENSAL">Mensal</option>
              </select>
            </FormField>

            <FormField label="Data">
              <input
                value={vagaForm.dataInicio}
                onChange={(event) => atualizarVagaForm('dataInicio', event.target.value)}
                type="date"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Hora início">
              <input
                value={vagaForm.horaInicio}
                onChange={(event) => atualizarVagaForm('horaInicio', event.target.value)}
                type="time"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Hora fim">
              <input
                value={vagaForm.horaFim}
                onChange={(event) => atualizarVagaForm('horaFim', event.target.value)}
                type="time"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Sala / estúdio">
              <select
                value={vagaForm.estudioId}
                onChange={(event) => atualizarVagaForm('estudioId', event.target.value)}
                className="inputEntartes"
              >
                {estudios.map((estudio) => (
                  <option value={estudio.id} key={estudio.id}>
                    {estudio.nome}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <ModalActions
            cancelLabel="Cancelar"
            confirmLabel={isSaving ? 'A criar...' : 'Criar disponibilidade'}
            onCancel={() => setModalVagaAberta(false)}
            onConfirm={() => void criarVaga()}
          />
        </Modal>
      )}

      {modalAssociarAberta && vagaSelecionada && (
        <Modal onClose={() => setModalAssociarAberta(false)}>
          <ModalHeader
            title="Criar sessão com vaga"
            subtitle={`${vagaSelecionada.professorNome} · ${formatDate(vagaSelecionada.dataInicio)}, ${vagaSelecionada.horaInicio}-${vagaSelecionada.horaFim}`}
            onClose={() => setModalAssociarAberta(false)}
          />

          <div className="rounded-xl bg-[#f8faf9] border border-[#e8f0ed] p-4 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <DoorOpen className="w-4 h-4 text-[#2d5f4f]" />
              <p className="text-[#2d5f4f]">{vagaSelecionada.salaNome}</p>
            </div>

            <p className="text-sm text-[#7a9a8c]">
              {vagaSelecionada.modalidade} · {vagaSelecionada.repeticao}
            </p>
          </div>

          <FormField label="Pedido de coaching">
            <select
              value={pedidoSelecionadoId}
              onChange={(event) => setPedidoSelecionadoId(event.target.value)}
              className="inputEntartes"
            >
              {pedidosAssociaveis.length === 0 && (
                <option value="">Não existem pedidos associáveis</option>
              )}

              {pedidosAssociaveis.map((pedido) => (
                <option value={pedido.id} key={pedido.id}>
                  {pedido.id} · {pedido.alunoNome} · {pedido.modalidade}
                </option>
              ))}
            </select>
          </FormField>

          <ModalActions
            cancelLabel="Cancelar"
            confirmLabel={isSaving ? 'A criar sessão...' : 'Criar sessão e fechar vaga'}
            onCancel={() => setModalAssociarAberta(false)}
            onConfirm={() => void associarVagaAPedido()}
          />
        </Modal>
      )}
    </div>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-label="Fechar"
      />

      <div className="relative bg-white rounded-2xl shadow-xl border border-[#e8f0ed] p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-[#2d5f4f] mb-1">{title}</h2>
        <p className="text-sm text-[#7a9a8c]">{subtitle}</p>
      </div>

      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-[#f0f6f3]"
        aria-label="Fechar modal"
      >
        <X className="w-5 h-5 text-[#2d5f4f]" />
      </button>
    </div>
  );
}

function ModalActions({
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-3 mt-6">
      <button
        onClick={onCancel}
        className="px-5 py-3 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors"
      >
        {cancelLabel}
      </button>

      <button
        onClick={onConfirm}
        className="px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors"
      >
        {confirmLabel}
      </button>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-5">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>

        <div>
          <p className="text-sm text-[#7a9a8c]">{label}</p>
          <p className="text-2xl text-[#2d5f4f]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-[#5a7a6c]">{label}</span>
      {children}
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f8faf9] border border-[#e8f0ed] p-4">
      <p className="text-xs text-[#7a9a8c] mb-1">{label}</p>
      <p className="text-sm text-[#2d5f4f]">{value || '-'}</p>
    </div>
  );
}
