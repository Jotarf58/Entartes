import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Calendar,
  CalendarCheck2,
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
  professores,
  salas,
  type TipoAluno,
} from '../data/mockEntartes';

import {
  aceitarPedidoCoaching,
  aprovarPedidoCoaching,
  associarVagaAPedido as associarVagaPedidoBackend,
  atualizarPedidoCoaching,
  atualizarVagaCoaching,
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
import { listarAlunosDaConta, type AlunoAssociado } from '../services/authService';
import { Toast, type ToastData } from '../components/Toast';
import { SeletorData, SeletorHora, formatarDataPt } from '../components/Calendario';

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
  educandos?: AlunoAssociado[];
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
  duracaoMinutos: number;
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
  alunoId: string;
  alunoNome: string;
  modalidade: string;
  professorPreferencialId: string;
  tipoCoaching: TipoCoaching;
  duracaoMinutos: number;
  alunosConvidados: string;
  dataPreferida: string;
  horaPreferida: string;
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
  AGUARDA_ALUNO: 'Aguarda confirmação do aluno',
  AGENDADO: 'Agendado',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
};

const estadoStyles: Record<EstadoPedido, string> = {
  PENDENTE: 'bg-[#fff4d4] text-[#8a6d1d]',
  EM_ANALISE: 'bg-[#d4e8ff] text-[#2d5f7f]',
  INTERESSE_REGISTADO: 'bg-[#d4e8ff] text-[#2d5f7f]',
  ACEITE_PROFESSOR: 'bg-[#e8d4ff] text-[#5a3c7a]',
  AGUARDA_ALUNO: 'bg-[#ffe8cc] text-[#8a5a1d]',
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

const PALAVRAS_ERRO = [
  'preenche',
  'indica',
  'seleciona',
  'escolhe',
  'já existe',
  'não foi possível',
  'não encontrado',
  'não está',
  'já não está',
  'já tem',
  'obrigat',
  'inválid',
  'erro',
  'demasiado',
];

function limparMensagem(texto: string) {
  return texto
    .replace(/\s+(no|do|ao|pelo|para o)\s+backend/gi, '')
    .replace(/\s+backend/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
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

function adicionarUmaHora(hora: string) {
  if (!hora) return '';

  const [horas, minutos] = hora.split(':').map(Number);

  if (Number.isNaN(horas) || Number.isNaN(minutos)) {
    return hora;
  }

  const total = (horas + 1) * 60 + minutos;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;

  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
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

function pedidoBackendParaUi(
  pedido: PedidoCoachingApp,
  professoresDisponiveis: ProfessorCoachingOption[] = []
): PedidoCoaching {
  const professorId = pedido.professorId || pedido.professorPreferencialId || '';
  const professorNomeGuardado = pedido.professorNome || pedido.professorPreferencialNome || '';
  const professorNome = professorId
    ? professoresDisponiveis.find((professor) => professor.id === professorId)?.nome ??
      getProfessorNome(professorId, professorNomeGuardado)
    : '';

  return {
    id: pedido.id,
    alunoId: pedido.alunoId,
    alunoNome: pedido.alunoNome || pedido.alunoId,
    tipoAluno: pedido.tipoAluno || (pedido.encarregadoId ? 'CRIANCA_JOVEM' : 'ADULTO'),
    encarregadoId: pedido.encarregadoId,
    encarregadoNome: pedido.encarregadoNome || '',
    modalidade: pedido.modalidade,
    professorPreferencialId: professorId,
    professorPreferencialNome: professorNome,
    tipoCoaching: pedido.tipoCoaching || 'Individual',
    duracaoMinutos: pedido.duracaoMinutos ?? 60,
    outrosAlunosSugeridos: pedido.outrosAlunosSugeridos || '',
    preferenciaHorario: pedido.preferenciaHorario || pedido.horarioFinal || '',
    observacoes: pedido.observacoes || '',
    estado: pedido.estado,
    motivoRejeicao: pedido.motivoRejeicao,
    vagaId: pedido.vagaId ?? '',
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

function criarPedidoForm(currentUser: CurrentUser, alunos: AlunoAssociado[]): PedidoForm {
  const primeiro = alunos[0];

  return {
    alunoId: currentUser.role === 'ALUNO' ? currentUser.perfilId ?? '' : primeiro?.id ?? '',
    alunoNome: currentUser.role === 'ALUNO' ? currentUser.name : primeiro?.nome ?? '',
    modalidade: modalidades[0] ?? 'Ballet',
    professorPreferencialId: '',
    tipoCoaching: 'Individual',
    duracaoMinutos: 60,
    alunosConvidados: '',
    dataPreferida: '',
    horaPreferida: '',
    observacoes: '',
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

const repeticaoLabels: Record<RepeticaoVaga, string> = {
  PONTUAL: 'Pontual',
  DIARIA: 'Diária',
  SEMANAL: 'Semanal',
  MENSAL: 'Mensal',
};

function dataNoPassado(data: string) {
  if (!data) return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const alvo = new Date(`${data}T00:00:00`);

  return !Number.isNaN(alvo.getTime()) && alvo.getTime() < hoje.getTime();
}

const DURACOES_COACHING = [30, 45, 60, 90, 120];

function formatarDuracao(minutos: number) {
  if (!minutos) return '60 min';
  if (minutos < 60) return `${minutos} min`;

  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;

  return resto ? `${horas}h${String(resto).padStart(2, '0')}` : `${horas}h`;
}

function formatarHorarioPreferido(data: string, hora: string) {
  if (!data && !hora) return '';

  const dataFormatada = formatarDataPt(data);

  if (dataFormatada && hora) return `${dataFormatada} às ${hora}`;

  return dataFormatada || hora;
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
  const [pedidos, setPedidos] = useState<PedidoCoaching[]>([]);
  const [vagas, setVagas] = useState<VagaCoaching[]>([]);
  const [aulasHorario, setAulasHorario] = useState<AulaSemanalApp[]>([]);
  const [alunosAssociados, setAlunosAssociados] = useState<AlunoAssociado[]>([]);

  const [estadoFiltro, setEstadoFiltro] = useState<'TODOS' | EstadoPedido>('TODOS');
  const [modalidadeFiltro, setModalidadeFiltro] = useState('TODAS');

  const [modalPedidoAberta, setModalPedidoAberta] = useState(false);
  const [modalVagaAberta, setModalVagaAberta] = useState(false);
  const [modalAssociarAberta, setModalAssociarAberta] = useState(false);
  const [pedidoEditandoId, setPedidoEditandoId] = useState<string | null>(null);
  const [vagaEditandoId, setVagaEditandoId] = useState<string | null>(null);
  const [pedidoConfirmacao, setPedidoConfirmacao] = useState<PedidoCoaching | null>(null);
  const [confirmandoAlteracoes, setConfirmandoAlteracoes] = useState(false);
  const [confirmacaoForm, setConfirmacaoForm] = useState({
    professorPreferencialId: '',
    duracaoMinutos: 60,
    dataPreferida: '',
    horaPreferida: '',
  });

  const [pedidoForm, setPedidoForm] = useState<PedidoForm>(() => criarPedidoForm(currentUser, []));
  const [vagaForm, setVagaForm] = useState<VagaForm>(criarVagaForm(currentUser, estudios));

  const [vagaSelecionada, setVagaSelecionada] = useState<VagaCoaching | null>(null);
  const [pedidoSelecionadoId, setPedidoSelecionadoId] = useState('');

  const [toast, setToast] = useState<ToastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function notificar(mensagem: string, tipo: ToastData['tipo'] = 'sucesso') {
    setToast({ mensagem: limparMensagem(mensagem), tipo });
  }

  function setMensagem(texto: string) {
    if (!texto) {
      setToast(null);
      return;
    }

    const baixo = texto.toLowerCase();
    const tipo = PALAVRAS_ERRO.some((palavra) => baixo.includes(palavra)) ? 'erro' : 'sucesso';

    notificar(texto, tipo);
  }

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

      const educandosSessao = currentUser.educandos ?? [];

      const [estudiosBackend, professoresBackend, alunosBackend] = await Promise.all([
        listarEstudios().catch(() => []),
        listarProfessoresCoaching().catch(() => []),
        isEncarregado && educandosSessao.length === 0
          ? listarAlunosDaConta().catch(() => [])
          : Promise.resolve(educandosSessao),
      ]);

      const estudiosNormalizados = normalizarEstudiosBackend(estudiosBackend);
      const estudiosFinais = estudiosNormalizados.length > 0 ? estudiosNormalizados : normalizarEstudiosMock();
      const professoresFinais = professoresBackend;

      setEstudios(estudiosFinais);
      setProfessoresBd(professoresFinais);
      setAlunosAssociados(alunosBackend);

      const [pedidosBackend, vagasBackend, aulasBackend] = await Promise.all([
        listarPedidosCoaching().catch(() => []),
        listarVagasCoaching().catch(() => []),
        listarAulasSemanais().catch(() => []),
      ]);

      setAulasHorario(aulasBackend);
      setPedidos(pedidosBackend.map((pedido) => pedidoBackendParaUi(pedido, professoresFinais)));
      setVagas(vagasBackend.map((vaga) => vagaBackendParaUi(vaga, estudiosFinais, professoresFinais)));
    } catch (error) {
      notificar(getErrorMessage(error), 'erro');
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
          pedido.encarregadoNome === currentUser.name
        );
      }

      if (isProfessor) {
        return (
          !pedido.professorPreferencialId ||
          pedido.professorPreferencialId === professorIdAtual ||
          pedido.professorPreferencialNome === currentUser.name
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
    const vagaPontualNoPassado = (vaga: VagaCoaching) =>
      vaga.estado === 'ABERTA' && dataNoPassado(vaga.dataInicio);

    const ativas = vagas.filter((vaga) => !vagaPontualNoPassado(vaga));

    if (isProfessor) {
      return ativas.filter(
        (vaga) => vaga.professorId === professorIdAtual || vaga.professorNome === currentUser.name
      );
    }

    if (isCoordenacao) {
      return ativas;
    }

    return ativas.filter((vaga) => vaga.estado === 'ABERTA');
  }, [vagas, currentUser.name, isCoordenacao, isProfessor, professorIdAtual]);

  const pedidosAssociaveis = pedidos.filter(
    (pedido) => pedido.estado !== 'REJEITADO' && pedido.estado !== 'APROVADO'
  );

  const totalPendentes = pedidosDoPerfil.filter((pedido) => pedido.estado === 'PENDENTE').length;
  const totalAprovados = pedidosDoPerfil.filter((pedido) => pedido.estado === 'APROVADO').length;
  const totalGrupo = pedidosDoPerfil.filter((pedido) => pedido.tipoCoaching === 'Grupo').length;

  const horaFimPreferida = adicionarUmaHora(pedidoForm.horaPreferida);
  const diaPreferido = pedidoForm.dataPreferida
    ? capitalizarDiaSemana(getDiaSemana(pedidoForm.dataPreferida))
    : '';
  const professorPreferencialOcupado = Boolean(
    pedidoForm.professorPreferencialId &&
      pedidoForm.dataPreferida &&
      pedidoForm.horaPreferida &&
      professorEstaOcupado(
        pedidoForm.professorPreferencialId,
        diaPreferido,
        pedidoForm.horaPreferida,
        horaFimPreferida
      )
  );
  const sugestoesAlunosConvidados = Array.from(
    new Set(
      [...alunosAssociados.map((aluno) => aluno.nome), ...pedidos.map((pedido) => pedido.alunoNome)].filter(
        Boolean
      )
    )
  );
  const podeEditarPedido = (pedido: PedidoCoaching) => {
    if (isCoordenacao) {
      return pedido.estado !== 'APROVADO' && pedido.estado !== 'REJEITADO';
    }

    return (
      (isEncarregado || isAluno) &&
      (pedido.estado === 'PENDENTE' || pedido.estado === 'INTERESSE_REGISTADO')
    );
  };

  function abrirPedido() {
    setPedidoEditandoId(null);
    setPedidoForm(criarPedidoForm(currentUser, alunosAssociados));
    setModalPedidoAberta(true);
    setToast(null);
  }

  function abrirEdicaoPedido(pedido: PedidoCoaching) {
    setPedidoEditandoId(pedido.id);

    setPedidoForm({
      alunoId: pedido.alunoId,
      alunoNome: pedido.alunoNome,
      modalidade: pedido.modalidade,
      professorPreferencialId: pedido.professorPreferencialId,
      tipoCoaching: pedido.tipoCoaching,
      duracaoMinutos: pedido.duracaoMinutos,
      alunosConvidados: pedido.outrosAlunosSugeridos,
      dataPreferida: '',
      horaPreferida: '',
      observacoes: pedido.observacoes,
    });
    setModalPedidoAberta(true);
    setToast(null);
  }

  function abrirVaga() {
    setVagaEditandoId(null);
    setVagaForm(criarVagaForm(currentUser, estudios));
    setModalVagaAberta(true);
    setToast(null);
  }

  function abrirEdicaoVaga(vaga: VagaCoaching) {
    setVagaEditandoId(vaga.id);
    setVagaForm({
      professorId: vaga.professorId,
      modalidade: vaga.modalidade,
      repeticao: vaga.repeticao,
      dataInicio: vaga.dataInicio,
      dataFim: vaga.dataFim || vaga.dataInicio,
      horaInicio: vaga.horaInicio,
      horaFim: vaga.horaFim,
      estudioId: vaga.estudioId,
    });
    setModalVagaAberta(true);
    setToast(null);
  }

  function fecharVaga() {
    setModalVagaAberta(false);
    setVagaEditandoId(null);
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

    const aluno = alunosAssociados[0];

    return {
      alunoId: aluno?.id ?? '',
      alunoNome: aluno?.nome ?? '',
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
    const observacoesVaga = [
      'Pedido criado a partir de uma disponibilidade:',
      `Sala: ${vaga.salaNome}`,
      `Repetição: ${repeticaoLabels[vaga.repeticao] ?? 'Pontual'}`,
      `Horário: ${horario}`,
    ].join('\n');

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
        observacoes: observacoesVaga,
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
        observacoes: observacoesVaga,
        vagaId: vaga.id,
      };

      setPedidos((atuais) => [novoPedido, ...atuais]);
      setMensagem('Pedido de inscrição enviado ao professor.');
    } catch (error) {
      notificar(getErrorMessage(error), 'erro');
    } finally {
      setIsSaving(false);
    }
  }

  async function criarPedido() {
    if (!pedidoForm.alunoId && !pedidoForm.alunoNome.trim()) {
      setMensagem('Escolhe o aluno do pedido.');
      return;
    }

    if (pedidoForm.tipoCoaching === 'Grupo' && !pedidoForm.alunosConvidados.trim()) {
      setMensagem('Indica os alunos convidados para um coaching de grupo.');
      return;
    }

    if (pedidoForm.dataPreferida && dataNoPassado(pedidoForm.dataPreferida)) {
      setMensagem('Não é possível pedir coaching numa data passada.');
      return;
    }

    const professorNome = pedidoForm.professorPreferencialId
      ? getProfessorNomeComLista(pedidoForm.professorPreferencialId, professoresOpcoes)
      : '';
    const alunoId = isAluno ? getPerfilId(currentUser, 'aluno') : pedidoForm.alunoId;
    const encarregadoId = isEncarregado ? getPerfilId(currentUser, 'encarregado') : '';
    const alunosConvidados =
      pedidoForm.tipoCoaching === 'Grupo' ? pedidoForm.alunosConvidados.trim() : '';

    const editando = Boolean(pedidoEditandoId);
    const pedidoOriginal = pedidos.find((pedido) => pedido.id === pedidoEditandoId);
    const preferenciaHorario =
      formatarHorarioPreferido(pedidoForm.dataPreferida, pedidoForm.horaPreferida) ||
      (editando ? pedidoOriginal?.preferenciaHorario ?? '' : '');

    const payload = {
      alunoId,
      alunoNome: pedidoForm.alunoNome,
      tipoAluno: 'CRIANCA_JOVEM' as TipoAluno,
      encarregadoId: encarregadoId || null,
      encarregadoNome: isEncarregado ? currentUser.name : '',
      modalidade: pedidoForm.modalidade,
      professorId: pedidoForm.professorPreferencialId || null,
      professorNome,
      tipoCoaching: pedidoForm.tipoCoaching,
      duracaoMinutos: pedidoForm.duracaoMinutos,
      outrosAlunosSugeridos: alunosConvidados,
      preferenciaHorario,
      observacoes: pedidoForm.observacoes.trim(),
    };

    try {
      setIsSaving(true);

      if (editando && pedidoEditandoId) {
        const pedidoAtualizado = await atualizarPedidoCoaching(pedidoEditandoId, payload);

        atualizarPedidoLocal({
          ...pedidoBackendParaUi(pedidoAtualizado, professoresOpcoes),
          alunoNome: pedidoForm.alunoNome,
          professorPreferencialNome: professorNome,
        });

        setModalPedidoAberta(false);
        setPedidoEditandoId(null);
        setMensagem('Pedido de coaching atualizado com sucesso.');
        return;
      }

      const pedidoCriado = await criarPedidoCoaching(payload);

      const novoPedido: PedidoCoaching = {
        ...pedidoBackendParaUi(pedidoCriado, professoresOpcoes),
        alunoNome: pedidoForm.alunoNome,
        professorPreferencialNome: professorNome,
      };

      setPedidos((atuais) => [novoPedido, ...atuais]);
      setModalPedidoAberta(false);
      setMensagem('Pedido de coaching criado com sucesso.');
    } catch (error) {
      notificar(getErrorMessage(error), 'erro');
    } finally {
      setIsSaving(false);
    }
  }

  async function criarVaga() {
    if (
      !vagaForm.professorId ||
      !vagaForm.dataInicio ||
      !vagaForm.horaInicio ||
      !vagaForm.horaFim ||
      !vagaForm.estudioId
    ) {
      setMensagem('Preenche professor, estúdio, data e horário da disponibilidade.');
      return;
    }

    if (dataNoPassado(vagaForm.dataInicio)) {
      setMensagem('Não é possível criar disponibilidades numa data passada.');
      return;
    }

    if (vagaForm.horaInicio >= vagaForm.horaFim) {
      setMensagem('A hora de início tem de ser anterior à hora de fim.');
      return;
    }

    const professorNome = getProfessorNomeComLista(vagaForm.professorId, professoresOpcoes, currentUser.name);
    const estudio = estudios.find((item) => item.id === vagaForm.estudioId);

    try {
      setIsSaving(true);

      if (vagaEditandoId) {
        const vagaAtualizada = await atualizarVagaCoaching(vagaEditandoId, {
          professorId: vagaForm.professorId,
          professorNome,
          modalidade: vagaForm.modalidade,
          estudioId: vagaForm.estudioId,
          salaId: vagaForm.estudioId,
          data: vagaForm.dataInicio,
          dataInicio: vagaForm.dataInicio,
          dataFim: vagaForm.dataInicio,
          horaInicio: vagaForm.horaInicio,
          horaFim: vagaForm.horaFim,
        });

        setVagas((atuais) =>
          atuais.map((vaga) =>
            vaga.id === vagaEditandoId
              ? {
                  ...vagaBackendParaUi(vagaAtualizada, estudios),
                  professorNome,
                  repeticao: vagaForm.repeticao,
                  salaNome: estudio?.nome ?? vagaAtualizada.salaNome,
                  dataFim: vagaForm.dataInicio,
                }
              : vaga
          )
        );

        fecharVaga();
        setMensagem('Disponibilidade atualizada com sucesso.');
        return;
      }

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
        dataFim: vagaForm.dataInicio,
      };

      setVagas((atuais) => [novaVaga, ...atuais]);
      fecharVaga();
      setMensagem('Disponibilidade de coaching criada com sucesso.');
    } catch (error) {
      notificar(getErrorMessage(error), 'erro');
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
      notificar(getErrorMessage(error), 'erro');
    } finally {
      setIsSaving(false);
    }
  }

  function abrirConfirmacao(pedido: PedidoCoaching) {
    setPedidoConfirmacao(pedido);
    setConfirmandoAlteracoes(false);
    setConfirmacaoForm({
      professorPreferencialId: pedido.professorPreferencialId || professorIdAtual,
      duracaoMinutos: pedido.duracaoMinutos,
      dataPreferida: '',
      horaPreferida: '',
    });
    setToast(null);
  }

  function fecharConfirmacao() {
    setPedidoConfirmacao(null);
    setConfirmandoAlteracoes(false);
  }

  async function confirmarAceitacao() {
    if (!pedidoConfirmacao) return;

    const pedido = pedidoConfirmacao;
    fecharConfirmacao();
    await aceitarPedido(pedido);
  }

  async function confirmarComAlteracoes() {
    if (!pedidoConfirmacao) return;

    const pedido = pedidoConfirmacao;
    const professorNome = getProfessorNomeComLista(
      confirmacaoForm.professorPreferencialId,
      professoresOpcoes,
      currentUser.name
    );
    const novoHorario =
      formatarHorarioPreferido(confirmacaoForm.dataPreferida, confirmacaoForm.horaPreferida) ||
      pedido.preferenciaHorario;

    try {
      setIsSaving(true);

      const pedidoAtualizado = await atualizarPedidoCoaching(pedido.id, {
        professorId: confirmacaoForm.professorPreferencialId || null,
        professorNome,
        duracaoMinutos: confirmacaoForm.duracaoMinutos,
        preferenciaHorario: novoHorario,
        estado: 'AGUARDA_ALUNO',
      });

      atualizarPedidoLocal({
        ...pedido,
        ...pedidoBackendParaUi(pedidoAtualizado, professoresOpcoes),
        alunoNome: pedido.alunoNome,
        encarregadoNome: pedido.encarregadoNome,
        professorPreferencialId: confirmacaoForm.professorPreferencialId,
        professorPreferencialNome: professorNome,
        duracaoMinutos: confirmacaoForm.duracaoMinutos,
        preferenciaHorario: novoHorario,
        estado: 'AGUARDA_ALUNO',
      });

      fecharConfirmacao();
      setMensagem('Alterações enviadas. O pedido aguarda nova confirmação do aluno.');
    } catch (error) {
      notificar(getErrorMessage(error), 'erro');
    } finally {
      setIsSaving(false);
    }
  }

  async function responderAlteracoes(pedido: PedidoCoaching, aceitar: boolean) {
    try {
      setIsSaving(true);

      if (aceitar) {
        const pedidoAtualizado = await atualizarPedidoCoaching(pedido.id, {
          estado: 'ACEITE_PROFESSOR',
        });

        atualizarPedidoLocal({
          ...pedido,
          ...pedidoBackendParaUi(pedidoAtualizado, professoresOpcoes),
          alunoNome: pedido.alunoNome,
          encarregadoNome: pedido.encarregadoNome,
          estado: 'ACEITE_PROFESSOR',
        });

        setMensagem('Aceitaste as alterações propostas pelo professor.');
      } else {
        await rejeitarPedido(pedido);
      }
    } catch (error) {
      notificar(getErrorMessage(error), 'erro');
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
      notificar(getErrorMessage(error), 'erro');
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
      notificar(getErrorMessage(error), 'erro');
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

  function professorEstaOcupado(
    professorId: string,
    diaSemana: string,
    horaInicio: string,
    horaFim: string
  ) {
    const diaAlvo = normalizarDiaSemanaComparacao(diaSemana);

    return aulasHorario.some((aula) => {
      if (aula.estado === 'CANCELADA') return false;
      if (aula.professorId !== professorId) return false;
      if (normalizarDiaSemanaComparacao(aula.diaSemana) !== diaAlvo) return false;

      return horariosSobrepoem(horaInicio, horaFim, aula.horaInicio, aula.horaFim);
    });
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
      notificar(getErrorMessage(error), 'erro');
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
              {isLoading ? 'A carregar...' : 'Atualizado'}
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

      <Toast toast={toast} onClose={() => setToast(null)} />

      {pedidoConfirmacao && (
        <Modal onClose={fecharConfirmacao}>
          <ModalHeader
            title="Confirmar dados do coaching"
            subtitle={
              confirmandoAlteracoes
                ? 'Altera os dados. O aluno terá de confirmar as alterações.'
                : 'Revê os dados antes de aceitar o pedido.'
            }
            onClose={fecharConfirmacao}
          />

          {confirmandoAlteracoes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField label="Professor">
                <select
                  value={confirmacaoForm.professorPreferencialId}
                  onChange={(event) =>
                    setConfirmacaoForm((atual) => ({
                      ...atual,
                      professorPreferencialId: event.target.value,
                    }))
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

              <FormField label="Duração">
                <select
                  value={confirmacaoForm.duracaoMinutos}
                  onChange={(event) =>
                    setConfirmacaoForm((atual) => ({
                      ...atual,
                      duracaoMinutos: Number(event.target.value),
                    }))
                  }
                  className="inputEntartes"
                >
                  {DURACOES_COACHING.map((minutos) => (
                    <option value={minutos} key={minutos}>
                      {formatarDuracao(minutos)}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Nova data (opcional)">
                <SeletorData
                  value={confirmacaoForm.dataPreferida}
                  onChange={(valor) =>
                    setConfirmacaoForm((atual) => ({ ...atual, dataPreferida: valor }))
                  }
                />
              </FormField>

              <FormField label="Nova hora (opcional)">
                <SeletorHora
                  value={confirmacaoForm.horaPreferida}
                  onChange={(valor) =>
                    setConfirmacaoForm((atual) => ({ ...atual, horaPreferida: valor }))
                  }
                />
              </FormField>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Info label="Aluno" value={pedidoConfirmacao.alunoNome} />
                <Info label="Modalidade" value={pedidoConfirmacao.modalidade} />
                <Info label="Tipo de coaching" value={pedidoConfirmacao.tipoCoaching} />
                <Info label="Duração" value={formatarDuracao(pedidoConfirmacao.duracaoMinutos)} />
                <Info
                  label="Horário preferido"
                  value={pedidoConfirmacao.preferenciaHorario || 'A combinar'}
                />
              </div>

              {pedidoConfirmacao.tipoCoaching === 'Grupo' &&
                pedidoConfirmacao.outrosAlunosSugeridos && (
                  <div className="mb-4">
                    <Info
                      label="Alunos convidados"
                      value={pedidoConfirmacao.outrosAlunosSugeridos}
                    />
                  </div>
                )}

              {pedidoConfirmacao.observacoes && (
                <div className="mb-4 rounded-xl bg-[#f8faf9] border border-[#e8f0ed] p-4">
                  <p className="text-xs text-[#7a9a8c] mb-1">Observações</p>
                  <p className="text-sm text-[#5a7a6c] whitespace-pre-line">
                    {pedidoConfirmacao.observacoes}
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3 mt-6">
            <button
              onClick={() => setConfirmandoAlteracoes((atual) => !atual)}
              className="px-5 py-3 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors"
            >
              {confirmandoAlteracoes ? 'Voltar' : 'Alterar dados'}
            </button>

            <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-3">
              <button
                onClick={fecharConfirmacao}
                className="px-5 py-3 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors"
              >
                Cancelar
              </button>

              {confirmandoAlteracoes ? (
                <button
                  onClick={() => void confirmarComAlteracoes()}
                  disabled={isSaving}
                  className="px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors disabled:opacity-70"
                >
                  {isSaving ? 'A guardar...' : 'Enviar alterações ao aluno'}
                </button>
              ) : (
                <button
                  onClick={() => void confirmarAceitacao()}
                  disabled={isSaving}
                  className="px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors disabled:opacity-70"
                >
                  {isSaving ? 'A aceitar...' : 'Confirmar e aceitar'}
                </button>
              )}
            </div>
          </div>
        </Modal>
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
                <option value="AGUARDA_ALUNO">Aguarda aluno</option>
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
                    <span className={`px-3 py-1 rounded-full text-xs ${estadoStyles[pedido.estado]}`}>
                      {estadoLabels[pedido.estado]}
                    </span>

                    <span className="px-3 py-1 rounded-full bg-[#d4e8df] text-[#2d5f4f] text-xs">
                      {pedido.tipoCoaching}
                    </span>

                    <span className="px-3 py-1 rounded-full bg-[#f0f6f3] text-[#5a7a6c] text-xs">
                      {pedido.modalidade}
                    </span>
                  </div>

                  <h3 className="text-[#2d5f4f] mb-1">{pedido.alunoNome || 'Aluno'}</h3>

                  <p className="text-sm text-[#7a9a8c]">Aluno</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {podeEditarPedido(pedido) && (
                    <button
                      onClick={() => abrirEdicaoPedido(pedido)}
                      className="px-3 py-2 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] disabled:opacity-60"
                    >
                      Editar pedido
                    </button>
                  )}

                  {(isAluno || isEncarregado) && pedido.estado === 'AGUARDA_ALUNO' && (
                    <>
                      <button
                        onClick={() => void responderAlteracoes(pedido, true)}
                        disabled={isSaving}
                        className="px-3 py-2 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] disabled:opacity-60"
                      >
                        Aceitar alterações
                      </button>

                      <button
                        onClick={() => void responderAlteracoes(pedido, false)}
                        disabled={isSaving}
                        className="px-3 py-2 rounded-xl border border-[#ffd2d2] text-[#9a3a3a] hover:bg-[#fff5f5] disabled:opacity-60"
                      >
                        Recusar
                      </button>
                    </>
                  )}

                  {podeAlterarEstado && (
                    <>
                      {isProfessor &&
                        (pedido.estado === 'PENDENTE' || pedido.estado === 'INTERESSE_REGISTADO') && (
                          <button
                            onClick={() => abrirConfirmacao(pedido)}
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
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
                <Info
                  label="Professor preferencial"
                  value={pedido.professorPreferencialNome || 'Sem preferência'}
                />
                <Info label="Horário preferido" value={pedido.preferenciaHorario || 'A combinar'} />
                <Info label="Tipo de coaching" value={pedido.tipoCoaching} />
                <Info label="Duração" value={formatarDuracao(pedido.duracaoMinutos)} />
              </div>

              {!isEncarregado && !isAluno && pedido.encarregadoNome && (
                <div className="mt-4">
                  <Info label="Encarregado de educação" value={pedido.encarregadoNome} />
                </div>
              )}

              {pedido.tipoCoaching === 'Grupo' && pedido.outrosAlunosSugeridos && (
                <div className="mt-4 rounded-xl bg-[#f8faf9] border border-[#e8f0ed] p-4">
                  <p className="text-xs text-[#7a9a8c] mb-1">Alunos convidados</p>
                  <p className="text-sm text-[#5a7a6c]">{pedido.outrosAlunosSugeridos}</p>
                </div>
              )}

              {pedido.observacoes && (
                <div className="mt-4 rounded-xl bg-[#f8faf9] border border-[#e8f0ed] p-4">
                  <p className="text-xs text-[#7a9a8c] mb-1">Observações</p>
                  <p className="text-sm text-[#5a7a6c] whitespace-pre-line">{pedido.observacoes}</p>
                </div>
              )}

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
                    <strong>Repetição:</strong> {repeticaoLabels[vaga.repeticao] ?? vaga.repeticao}
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

                {(isProfessor || isCoordenacao) && vaga.estado === 'ABERTA' && (
                  <button
                    onClick={() => abrirEdicaoVaga(vaga)}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-white transition-colors"
                  >
                    Editar disponibilidade
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
            title={pedidoEditandoId ? 'Editar pedido de coaching' : 'Novo pedido de coaching'}
            subtitle="Escolhe o aluno, o professor e a preferência de horário."
            onClose={() => setModalPedidoAberta(false)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Aluno">
              {isAluno ? (
                <input
                  value={pedidoForm.alunoNome}
                  disabled
                  className="inputEntartes disabled:opacity-70"
                />
              ) : alunosAssociados.length > 0 ? (
                <select
                  value={pedidoForm.alunoId}
                  onChange={(event) => {
                    const aluno = alunosAssociados.find((item) => item.id === event.target.value);
                    setPedidoForm((atual) => ({
                      ...atual,
                      alunoId: event.target.value,
                      alunoNome: aluno?.nome ?? '',
                    }));
                  }}
                  className="inputEntartes"
                >
                  {alunosAssociados.map((aluno) => (
                    <option value={aluno.id} key={aluno.id}>
                      {aluno.nome}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={pedidoForm.alunoNome}
                  onChange={(event) =>
                    setPedidoForm((atual) => ({
                      ...atual,
                      alunoId: '',
                      alunoNome: event.target.value,
                    }))
                  }
                  placeholder="Nome do aluno"
                  className="inputEntartes"
                />
              )}
            </FormField>

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
                className={`inputEntartes ${
                  professorPreferencialOcupado ? 'border-[#e0a3a3] text-[#9a3a3a]' : ''
                }`}
              >
                <option value="">Sem preferência</option>

                {professoresOpcoes.map((professor) => (
                  <option value={professor.id} key={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>

              {professorPreferencialOcupado && (
                <span className="text-xs text-[#9a3a3a]">
                  Este professor já tem uma aula/sessão no horário escolhido.
                </span>
              )}
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

            <FormField label="Duração">
              <select
                value={pedidoForm.duracaoMinutos}
                onChange={(event) =>
                  atualizarPedidoForm('duracaoMinutos', Number(event.target.value))
                }
                className="inputEntartes"
              >
                {DURACOES_COACHING.map((minutos) => (
                  <option value={minutos} key={minutos}>
                    {formatarDuracao(minutos)}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Data preferida">
              <SeletorData
                value={pedidoForm.dataPreferida}
                onChange={(valor) => atualizarPedidoForm('dataPreferida', valor)}
              />
            </FormField>

            <FormField label="Hora preferida">
              <SeletorHora
                value={pedidoForm.horaPreferida}
                onChange={(valor) => atualizarPedidoForm('horaPreferida', valor)}
              />
            </FormField>

            {pedidoForm.tipoCoaching === 'Grupo' && (
              <div className="md:col-span-2">
                <FormField label="Alunos convidados">
                  <input
                    value={pedidoForm.alunosConvidados}
                    onChange={(event) =>
                      atualizarPedidoForm('alunosConvidados', event.target.value)
                    }
                    list="sugestoes-alunos-convidados"
                    placeholder="Começa a escrever o nome de um aluno..."
                    className="inputEntartes"
                  />

                  <datalist id="sugestoes-alunos-convidados">
                    {sugestoesAlunosConvidados.map((nome) => (
                      <option value={nome} key={nome} />
                    ))}
                  </datalist>
                </FormField>
              </div>
            )}

            <div className="md:col-span-2">
              <FormField label="Observações">
                <textarea
                  value={pedidoForm.observacoes}
                  onChange={(event) => atualizarPedidoForm('observacoes', event.target.value)}
                  placeholder="Notas adicionais (opcional)"
                  className="inputEntartes min-h-24 resize-none"
                />
              </FormField>
            </div>
          </div>

          <ModalActions
            cancelLabel="Cancelar"
            confirmLabel={
              isSaving
                ? 'A guardar...'
                : pedidoEditandoId
                  ? 'Guardar alterações'
                  : 'Submeter pedido'
            }
            onCancel={() => setModalPedidoAberta(false)}
            onConfirm={() => void criarPedido()}
          />
        </Modal>
      )}

      {modalVagaAberta && (
        <Modal onClose={fecharVaga}>
          <ModalHeader
            title={vagaEditandoId ? 'Editar disponibilidade' : 'Nova disponibilidade de coaching'}
            subtitle="Define o professor, a sala, a data e o horário da disponibilidade."
            onClose={fecharVaga}
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
              <SeletorData
                value={vagaForm.dataInicio}
                onChange={(valor) => atualizarVagaForm('dataInicio', valor)}
              />
            </FormField>

            <FormField label="Hora início">
              <SeletorHora
                value={vagaForm.horaInicio}
                onChange={(valor) => atualizarVagaForm('horaInicio', valor)}
              />
            </FormField>

            <FormField label="Hora fim">
              <SeletorHora
                value={vagaForm.horaFim}
                onChange={(valor) => atualizarVagaForm('horaFim', valor)}
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
            confirmLabel={
              isSaving
                ? 'A guardar...'
                : vagaEditandoId
                  ? 'Guardar alterações'
                  : 'Criar disponibilidade'
            }
            onCancel={fecharVaga}
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
                  {pedido.alunoNome} · {pedido.modalidade}
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
