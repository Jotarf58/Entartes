import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  DoorOpen,
  Download,
  Edit3,
  Filter,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Users,
  WalletCards,
  X,
} from 'lucide-react';


import { ApiError } from '../services/api';
import {
  aceitarPedidoCoaching,
  aprovarPedidoCoaching,
  atualizarPedidoCoaching,
  fecharVagaCoaching,
  listarPedidosCoaching,
  listarProfessoresCoaching,
  listarVagasCoaching,
  rejeitarPedidoCoaching,
  type EstadoPedidoCoachingBackend,
  type EstadoVagaBackend,
  type PedidoCoachingApp,
  type ProfessorCoachingOption,
  type VagaCoachingApp,
} from '../services/coachingService';
import { listarEventos, type EventoApp } from '../services/eventosService';
import {
  criarEstudio,
  listarEstudios,
  type EstudioApp,
} from '../services/estudiosService';
import {
  criarRegistoFinanceiro,
  exportarFinanceiroCsv,
  listarFinanceiro,
  type EstadoFinanceiroBackend,
  type OrigemFinanceiraBackend,
  type RegistoFinanceiroApp,
} from '../services/financeiroService';
import {
  atualizarInterrupcao,
  criarInterrupcao,
  listarInterrupcoes,
  removerInterrupcao,
  type InterrupcaoApp,
  type TipoInterrupcaoBackend,
} from '../services/interrupcoesService';
import {
  Toast,
  inferirTipoMensagem,
  limparMensagemBackend,
  type ToastData,
} from '../components/Toast';

type EstadoPedidoCoaching = EstadoPedidoCoachingBackend;
type EstadoVaga = EstadoVagaBackend;

type Professor = {
  id: string;
  nome: string;
};

type Sala = {
  id: string;
  nome: string;
  tipo: string;
  capacidade: number;
  ativa: boolean;
  modalidadesPermitidas: string[];
};

type PedidoCoaching = {
  id: string;
  alunoNome: string;
  tipoAluno: string;
  encarregadoNome: string;
  modalidade: string;
  professorPreferencialId: string;
  professorPreferencialNome: string;
  tipoCoaching: string;
  duracaoMinutos: number;
  outrosAlunosSugeridos: string;
  preferenciaHorario: string;
  observacoes: string;
  estado: EstadoPedidoCoaching;
  salaNome: string;
  motivoRejeicao: string;
};

type VagaCoaching = {
  id: string;
  professorId: string;
  professorNome: string;
  modalidade: string;
  repeticao: string;
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
  salaNome: string;
  estudioId: string;
  dataInicio: string;
  dataFim: string;
  estado: EstadoVaga;
};

type Interrupcao = {
  id: string;
  nome: string;
  data: string;
  dataFim: string;
  tipo: TipoInterrupcaoBackend;
  escolaEncerrada: boolean;
  observacoes: string;
};

type EventoResumo = {
  id: string;
  titulo: string;
  data: string;
  local: string;
  estado: string;
};

type PedidoForm = {
  alunoNome: string;
  modalidade: string;
  professorPreferencialId: string;
  salaNome: string;
  preferenciaHorario: string;
  duracaoMinutos: number;
  estado: EstadoPedidoCoaching;
  observacoes: string;
  motivoRejeicao: string;
};

type SalaForm = {
  nome: string;
  tipo: string;
  capacidade: string;
  ativa: boolean;
  modalidadesTexto: string;
};

type InterrupcaoForm = {
  nome: string;
  data: string;
  dataFim: string;
  tipo: TipoInterrupcaoBackend;
  escolaEncerrada: boolean;
  observacoes: string;
};

type VagaForm = {
  professorId: string;
  modalidade: string;
  repeticao: string;
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
  salaNome: string;
  dataInicio: string;
  dataFim: string;
  estado: EstadoVaga;
};

type FinanceiroForm = {
  tipo: string;
  descricao: string;
  valor: string;
  data: string;
  origem: OrigemFinanceiraBackend;
  estado: EstadoFinanceiroBackend;
};

const estadoPedidoLabels: Record<EstadoPedidoCoaching, string> = {
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em análise',
  INTERESSE_REGISTADO: 'Interesse registado',
  ACEITE_PROFESSOR: 'Aceite pelo professor',
  AGUARDA_ALUNO: 'Aguarda aluno',
  AGENDADO: 'Agendado',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
};

const estadoPedidoStyles: Record<EstadoPedidoCoaching, string> = {
  PENDENTE: 'bg-[#fff4d4] text-[#8a6d1d]',
  EM_ANALISE: 'bg-[#d4e8ff] text-[#2d5f7f]',
  INTERESSE_REGISTADO: 'bg-[#d4e8ff] text-[#2d5f7f]',
  ACEITE_PROFESSOR: 'bg-[#e8d4ff] text-[#5a3c7a]',
  AGUARDA_ALUNO: 'bg-[#ffe8cc] text-[#8a5a1d]',
  AGENDADO: 'bg-[#f0e4ff] text-[#5a3c7a]',
  APROVADO: 'bg-[#d4e8df] text-[#2d5f4f]',
  REJEITADO: 'bg-[#ffe0e0] text-[#9a3a3a]',
};

const estadoVagaStyles: Record<EstadoVaga, string> = {
  ABERTA: 'bg-[#d4e8df] text-[#2d5f4f]',
  FECHADA: 'bg-[#f0f6f3] text-[#5a7a6c]',
  OCUPADA: 'bg-[#e8d4ff] text-[#5a3c7a]',
  CANCELADA: 'bg-[#ffe0e0] text-[#9a3a3a]',
};

const estadoFinanceiroStyles: Record<EstadoFinanceiroBackend, string> = {
  PENDENTE: 'bg-[#fff4d4] text-[#8a6d1d]',
  FATURADO: 'bg-[#d4e8df] text-[#2d5f4f]',
  CANCELADO: 'bg-[#ffe0e0] text-[#9a3a3a]',
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado.';
}

function normalizarProfessoresBackend(
  professoresBackend: ProfessorCoachingOption[]
): Professor[] {
  return professoresBackend.map((professor, index) => ({
    id: professor.id || `professor-${index + 1}`,
    nome: professor.nome || `Professor ${index + 1}`,
  }));
}

function getProfessorNomeDaLista(
  professorId: string,
  professoresLista: Professor[],
  fallback = 'Sem preferência'
) {
  if (!professorId) return fallback;

  const professor = professoresLista.find((item) => item.id === professorId);

  if (professor) return professor.nome;

  return fallback && fallback !== professorId ? fallback : professorId;
}

function mapInterrupcaoBackendParaCoordenacao(
  interrupcao: InterrupcaoApp
): Interrupcao {
  return {
    id: interrupcao.id,
    nome: interrupcao.nome,
    data: interrupcao.data,
    dataFim: interrupcao.dataFim,
    tipo: interrupcao.tipo,
    escolaEncerrada: interrupcao.escolaEncerrada,
    observacoes: interrupcao.observacoes,
  };
}

function mapEstudioParaSala(estudio: EstudioApp): Sala {
  return {
    id: estudio.id,
    nome: estudio.nome,
    tipo: 'Estúdio',
    capacidade: estudio.capacidade,
    ativa: estudio.estado === 'ATIVO',
    modalidadesPermitidas: estudio.modalidadesPermitidas,
  };
}

function mapEventoParaResumo(evento: EventoApp): EventoResumo {
  return {
    id: evento.id,
    titulo: evento.titulo,
    data: evento.data,
    local: evento.local || 'Ent’artes',
    estado: evento.estado,
  };
}

function mapPedidoBackendParaCoordenacao(
  pedido: PedidoCoachingApp,
  professoresLista: Professor[]
): PedidoCoaching {
  const professorId = pedido.professorId || pedido.professorPreferencialId || '';
  const professorNomeGuardado =
    pedido.professorNome || pedido.professorPreferencialNome || professorId || 'Sem preferência';

  return {
    id: pedido.id,
    alunoNome: pedido.alunoNome || pedido.alunoId || 'Aluno',
    tipoAluno: pedido.tipoAluno || 'CRIANCA_JOVEM',
    encarregadoNome: pedido.encarregadoNome || pedido.encarregadoId || '',
    modalidade: pedido.modalidade || 'Ballet',
    professorPreferencialId: professorId,
    professorPreferencialNome: getProfessorNomeDaLista(
      professorId,
      professoresLista,
      professorNomeGuardado
    ),
    tipoCoaching: pedido.tipoCoaching || 'Individual',
    duracaoMinutos: pedido.duracaoMinutos ?? 60,
    outrosAlunosSugeridos: pedido.outrosAlunosSugeridos || '',
    preferenciaHorario:
      pedido.preferenciaHorario ||
      pedido.horarioFinal ||
      (pedido.createdAt ? `Criado em ${formatDate(pedido.createdAt)}` : 'A definir'),
    observacoes: pedido.observacoes || pedido.notas || '',
    estado: pedido.estado,
    salaNome: pedido.salaNome || 'A definir',
    motivoRejeicao: pedido.motivoRejeicao || '',
  };
}

function mapVagaBackendParaCoordenacao(
  vaga: VagaCoachingApp,
  salasLista: Sala[],
  professoresLista: Professor[]
): VagaCoaching {
  const sala = salasLista.find((item) => item.id === vaga.estudioId || item.id === vaga.salaId);

  return {
    id: vaga.id,
    professorId: vaga.professorId,
    professorNome: getProfessorNomeDaLista(
      vaga.professorId,
      professoresLista,
      vaga.professorNome || 'Professor'
    ),
    modalidade: vaga.modalidade || 'Ballet',
    repeticao: vaga.repeticao === 'NAO_REPETIR' ? 'PONTUAL' : vaga.repeticao || 'PONTUAL',
    diaSemana: vaga.diaSemana || vaga.data,
    horaInicio: vaga.horaInicio,
    horaFim: vaga.horaFim,
    salaNome: sala?.nome ?? vaga.salaNome ?? vaga.estudioId ?? 'A definir',
    estudioId: vaga.estudioId || vaga.salaId,
    dataInicio: vaga.dataInicio || vaga.data,
    dataFim: vaga.dataFim || vaga.dataInicio || vaga.data,
    estado: vaga.estado,
  };
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date || 'Data a definir';
  }

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
}

function calcularHoras(horaInicio: string, horaFim: string) {
  const [inicioHoras, inicioMinutos] = horaInicio.split(':').map(Number);
  const [fimHoras, fimMinutos] = horaFim.split(':').map(Number);

  if (
    Number.isNaN(inicioHoras) ||
    Number.isNaN(inicioMinutos) ||
    Number.isNaN(fimHoras) ||
    Number.isNaN(fimMinutos)
  ) {
    return 0;
  }

  const inicio = inicioHoras * 60 + inicioMinutos;
  const fim = fimHoras * 60 + fimMinutos;

  return Math.max(0, (fim - inicio) / 60);
}

function criarSalaFormVazio(): SalaForm {
  return {
    nome: '',
    tipo: 'Estúdio',
    capacidade: '20',
    ativa: true,
    modalidadesTexto: '',
  };
}

function criarInterrupcaoFormVazio(): InterrupcaoForm {
  return {
    nome: '',
    data: new Date().toISOString().slice(0, 10),
    dataFim: '',
    tipo: 'FERIADO',
    escolaEncerrada: true,
    observacoes: '',
  };
}

function criarFinanceiroFormVazio(): FinanceiroForm {
  return {
    tipo: 'COACHING',
    descricao: 'Registo manual de coaching',
    valor: '25',
    data: new Date().toISOString().slice(0, 10),
    origem: 'MANUAL',
    estado: 'FATURADO',
  };
}

function salaParaForm(sala: Sala): SalaForm {
  return {
    nome: sala.nome,
    tipo: sala.tipo,
    capacidade: String(sala.capacidade),
    ativa: sala.ativa,
    modalidadesTexto: sala.modalidadesPermitidas.join(', '),
  };
}

function interrupcaoParaForm(interrupcao: Interrupcao): InterrupcaoForm {
  return {
    nome: interrupcao.nome,
    data: interrupcao.data,
    dataFim: interrupcao.dataFim,
    tipo: interrupcao.tipo,
    escolaEncerrada: interrupcao.escolaEncerrada,
    observacoes: interrupcao.observacoes,
  };
}

function pedidoParaForm(pedido: PedidoCoaching): PedidoForm {
  return {
    alunoNome: pedido.alunoNome,
    modalidade: pedido.modalidade,
    professorPreferencialId: pedido.professorPreferencialId,
    salaNome: pedido.salaNome,
    preferenciaHorario: pedido.preferenciaHorario,
    duracaoMinutos: pedido.duracaoMinutos,
    estado: pedido.estado,
    observacoes: pedido.observacoes,
    motivoRejeicao: pedido.motivoRejeicao,
  };
}

function vagaParaForm(vaga: VagaCoaching): VagaForm {
  return {
    professorId: vaga.professorId,
    modalidade: vaga.modalidade,
    repeticao: vaga.repeticao,
    diaSemana: vaga.diaSemana,
    horaInicio: vaga.horaInicio,
    horaFim: vaga.horaFim,
    salaNome: vaga.salaNome,
    dataInicio: vaga.dataInicio,
    dataFim: vaga.dataFim,
    estado: vaga.estado,
  };
}

function splitModalidades(texto: string) {
  return texto
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const VALOR_HORA_COACHING_NORMAL = 36;
const VALOR_HORA_COACHING_ESPECIAL = 43.5;

function parseDataHoraCoaching(texto: string) {
  let dataISO = '';
  let hora = '';

  const dataMatch = texto.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (dataMatch) dataISO = `${dataMatch[3]}-${dataMatch[2]}-${dataMatch[1]}`;

  const horaMatch = texto.match(/(\d{2}):(\d{2})/);
  if (horaMatch) hora = `${horaMatch[1]}:${horaMatch[2]}`;

  return { dataISO, hora };
}

function ehDomingoOuFeriado(dataISO: string, interrupcoes: Interrupcao[]) {
  if (!dataISO) return false;

  const data = new Date(`${dataISO}T00:00:00`);
  if (Number.isNaN(data.getTime())) return false;
  if (data.getDay() === 0) return true;

  return interrupcoes.some((interrupcao) => {
    if (!interrupcao.escolaEncerrada) return false;
    const fim = interrupcao.dataFim || interrupcao.data;
    return dataISO >= interrupcao.data && dataISO <= fim;
  });
}

function valorHoraCoaching(dataISO: string, interrupcoes: Interrupcao[]) {
  return ehDomingoOuFeriado(dataISO, interrupcoes)
    ? VALOR_HORA_COACHING_ESPECIAL
    : VALOR_HORA_COACHING_NORMAL;
}

function calcularValorCoaching(
  dataISO: string,
  duracaoMinutos: number,
  interrupcoes: Interrupcao[]
) {
  return (duracaoMinutos / 60) * valorHoraCoaching(dataISO, interrupcoes);
}

function coachingJaPassou(dataISO: string, hora: string, duracaoMinutos: number) {
  if (!dataISO) return false;

  const inicio = new Date(`${dataISO}T${hora || '00:00'}:00`);
  if (Number.isNaN(inicio.getTime())) return false;

  const fim = new Date(inicio.getTime() + duracaoMinutos * 60000);
  return fim.getTime() < Date.now();
}

export default function Coordenacao() {
  const [salasLocais, setSalasLocais] = useState<Sala[]>([]);
  const [eventosResumo, setEventosResumo] = useState<EventoResumo[]>([]);
  const [professoresLista, setProfessoresLista] = useState<Professor[]>([]);

  const [pedidos, setPedidos] = useState<PedidoCoaching[]>([]);

  const [vagas, setVagas] = useState<VagaCoaching[]>([]);

  const [interrupcoes, setInterrupcoes] = useState<Interrupcao[]>([]);

  const [registosFinanceiros, setRegistosFinanceiros] = useState<RegistoFinanceiroApp[]>([]);
  const [totalFinanceiro, setTotalFinanceiro] = useState(0);
  const [totalRegistosFinanceiros, setTotalRegistosFinanceiros] = useState(0);
  const [exportandoFinanceiro, setExportandoFinanceiro] = useState(false);

  const [estadoFiltro, setEstadoFiltro] = useState<'TODOS' | EstadoPedidoCoaching>(
    'TODOS'
  );

  const [toast, setToast] = useState<ToastData | null>(null);
  const [loading, setLoading] = useState(false);

  function setMensagem(texto: string) {
    if (!texto) {
      setToast(null);
      return;
    }

    setToast({ mensagem: limparMensagemBackend(texto), tipo: inferirTipoMensagem(texto) });
  }

  function setErro(texto: string) {
    if (!texto) {
      setToast(null);
      return;
    }

    setToast({ mensagem: limparMensagemBackend(texto), tipo: 'erro' });
  }

  const [pedidoEditandoId, setPedidoEditandoId] = useState<string | null>(null);
  const [pedidoForm, setPedidoForm] = useState<PedidoForm | null>(null);

  const [salaEditandoId, setSalaEditandoId] = useState<string | null>(null);
  const [salaForm, setSalaForm] = useState<SalaForm>(criarSalaFormVazio());
  const [modalSalaAberta, setModalSalaAberta] = useState(false);

  const [interrupcaoEditandoId, setInterrupcaoEditandoId] = useState<string | null>(
    null
  );
  const [interrupcaoForm, setInterrupcaoForm] = useState<InterrupcaoForm>(
    criarInterrupcaoFormVazio()
  );
  const [modalInterrupcaoAberta, setModalInterrupcaoAberta] = useState(false);

  const [vagaEditandoId, setVagaEditandoId] = useState<string | null>(null);
  const [vagaForm, setVagaForm] = useState<VagaForm | null>(null);

  const [modalFinanceiroAberta, setModalFinanceiroAberta] = useState(false);
  const [financeiroForm, setFinanceiroForm] = useState<FinanceiroForm>(
    criarFinanceiroFormVazio()
  );

  async function carregarDados() {
    try {
      setLoading(true);
      setErro('');

      const [
        professoresResult,
        estudiosResult,
        pedidosResult,
        vagasResult,
        eventosResult,
        financeiroResult,
        interrupcoesResult,
      ] = await Promise.allSettled([
        listarProfessoresCoaching(),
        listarEstudios(),
        listarPedidosCoaching(),
        listarVagasCoaching(),
        listarEventos(),
        listarFinanceiro(),
        listarInterrupcoes(),
      ]);

      let professoresBase: Professor[] = [];
      let salasBase: Sala[] = [];

      if (professoresResult.status === 'fulfilled') {
        professoresBase = normalizarProfessoresBackend(professoresResult.value);
        setProfessoresLista(professoresBase);
      }

      if (estudiosResult.status === 'fulfilled' && estudiosResult.value.length > 0) {
        salasBase = estudiosResult.value.map(mapEstudioParaSala);
        setSalasLocais(salasBase);
      }

      if (pedidosResult.status === 'fulfilled' && pedidosResult.value.length > 0) {
        setPedidos(
          pedidosResult.value.map((pedido) =>
            mapPedidoBackendParaCoordenacao(pedido, professoresBase)
          )
        );
      }

      if (vagasResult.status === 'fulfilled' && vagasResult.value.length > 0) {
        setVagas(
          vagasResult.value.map((vaga) =>
            mapVagaBackendParaCoordenacao(vaga, salasBase, professoresBase)
          )
        );
      }

      if (eventosResult.status === 'fulfilled' && eventosResult.value.length > 0) {
        setEventosResumo(eventosResult.value.map(mapEventoParaResumo));
      }

      if (financeiroResult.status === 'fulfilled') {
        setRegistosFinanceiros(financeiroResult.value.registos);
        setTotalFinanceiro(financeiroResult.value.totalValor);
        setTotalRegistosFinanceiros(financeiroResult.value.totalRegistos);
      }

      if (interrupcoesResult.status === 'fulfilled' && interrupcoesResult.value.length > 0) {
        setInterrupcoes(
          interrupcoesResult.value.map(mapInterrupcaoBackendParaCoordenacao)
        );
      }
    } catch (error) {
      setErro(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  const pedidosFiltrados = pedidos.filter((pedido) => {
    return estadoFiltro === 'TODOS' || pedido.estado === estadoFiltro;
  });

  const pedidosPendentes = pedidos.filter((pedido) => pedido.estado === 'PENDENTE').length;
  const pedidosAceitesProfessor = pedidos.filter(
    (pedido) => pedido.estado === 'ACEITE_PROFESSOR'
  ).length;
  const pedidosAprovados = pedidos.filter((pedido) => pedido.estado === 'APROVADO').length;
  const vagasAbertas = vagas.filter((vaga) => vaga.estado === 'ABERTA').length;

  const totalHorasCoaching = vagas
    .filter((vaga) => vaga.estado !== 'FECHADA')
    .reduce((total, vaga) => total + calcularHoras(vaga.horaInicio, vaga.horaFim), 0);

  const coachingsFaturaveis = useMemo(() => {
    const jaFaturados = new Set(
      registosFinanceiros
        .filter((registo) => registo.origem === 'COACHING')
        .map((registo) => registo.origemId)
    );

    return pedidos
      .filter((pedido) => pedido.estado === 'AGENDADO' || pedido.estado === 'APROVADO')
      .map((pedido) => {
        const { dataISO, hora } = parseDataHoraCoaching(pedido.preferenciaHorario);
        return { pedido, dataISO, hora };
      })
      .filter(
        ({ pedido, dataISO, hora }) =>
          dataISO &&
          coachingJaPassou(dataISO, hora, pedido.duracaoMinutos) &&
          !jaFaturados.has(pedido.id)
      );
  }, [pedidos, registosFinanceiros]);

  async function faturarCoachings() {
    if (coachingsFaturaveis.length === 0) return;

    try {
      setErro('');

      const novos: RegistoFinanceiroApp[] = [];

      for (const { pedido, dataISO } of coachingsFaturaveis) {
        const valor = Number(
          calcularValorCoaching(dataISO, pedido.duracaoMinutos, interrupcoes).toFixed(2)
        );

        const registo = await criarRegistoFinanceiro({
          tipo: 'COACHING',
          descricao: `Coaching de ${pedido.alunoNome} (${formatDate(dataISO)} · ${pedido.duracaoMinutos} min · ${valorHoraCoaching(dataISO, interrupcoes)}€/h)`,
          valor,
          data: dataISO,
          origem: 'COACHING',
          origemId: pedido.id,
          estado: 'FATURADO',
        });

        novos.push(registo);
      }

      setRegistosFinanceiros((atuais) => [...novos, ...atuais]);
      setTotalFinanceiro((atual) => atual + novos.reduce((soma, registo) => soma + registo.valor, 0));
      setTotalRegistosFinanceiros((atual) => atual + novos.length);
      setMensagem(`${novos.length} coaching(s) realizado(s) faturado(s) com sucesso.`);
    } catch (error) {
      setErro(getErrorMessage(error));
    }
  }

  const calendario = useMemo(() => {
    const itens = [
      ...eventosResumo.map((evento) => ({
        id: evento.id,
        data: evento.data,
        titulo: evento.titulo,
        tipo: 'Evento',
        detalhe: `${evento.local} · ${evento.estado}`,
      })),
      ...interrupcoes.map((interrupcao) => ({
        id: interrupcao.id,
        data: interrupcao.data,
        titulo: interrupcao.nome,
        tipo: interrupcao.tipo,
        detalhe: [
          interrupcao.dataFim ? `até ${formatDate(interrupcao.dataFim)}` : '',
          interrupcao.escolaEncerrada ? 'Escola encerrada' : 'Escola aberta',
        ]
          .filter(Boolean)
          .join(' · '),
      })),
      ...pedidos
        .filter((pedido) => pedido.estado === 'APROVADO')
        .map((pedido) => ({
          id: pedido.id,
          data: 'A definir',
          titulo: `Coaching — ${pedido.alunoNome}`,
          tipo: 'Coaching',
          detalhe: `${pedido.professorPreferencialNome} · ${pedido.preferenciaHorario}`,
        })),
    ];

    return itens.sort((a, b) => a.data.localeCompare(b.data));
  }, [eventosResumo, interrupcoes, pedidos]);

  function getProfessorNome(professorId: string, fallback = 'Sem preferência') {
    return getProfessorNomeDaLista(professorId, professoresLista, fallback);
  }

  function getSalaIdByNome(nome: string) {
    return salasLocais.find((sala) => sala.nome === nome)?.id ?? salasLocais[0]?.id ?? '';
  }

  function abrirEditarPedido(pedido: PedidoCoaching) {
    setPedidoEditandoId(pedido.id);
    setPedidoForm(pedidoParaForm(pedido));
    setMensagem('');
    setErro('');
  }

  async function guardarPedido() {
    if (!pedidoEditandoId || !pedidoForm) {
      return;
    }

    const pedidoOriginal = pedidos.find((pedido) => pedido.id === pedidoEditandoId);

    try {
      setErro('');

      if (pedidoOriginal && pedidoOriginal.estado !== pedidoForm.estado) {
        if (pedidoForm.estado === 'ACEITE_PROFESSOR') {
          await aceitarPedidoCoaching(pedidoEditandoId, {
            professorId: pedidoForm.professorPreferencialId || '',
          });
        }

        if (pedidoForm.estado === 'APROVADO') {
          await aprovarPedidoCoaching(pedidoEditandoId);
        }

        if (pedidoForm.estado === 'REJEITADO') {
          await rejeitarPedidoCoaching(pedidoEditandoId, {
            motivoRejeicao: pedidoForm.motivoRejeicao || pedidoForm.observacoes,
          });
        }
      }

      await atualizarPedidoCoaching(pedidoEditandoId, {
        modalidade: pedidoForm.modalidade,
        professorId: pedidoForm.professorPreferencialId || null,
        professorNome: getProfessorNome(pedidoForm.professorPreferencialId),
        salaNome: pedidoForm.salaNome,
        preferenciaHorario: pedidoForm.preferenciaHorario,
        duracaoMinutos: pedidoForm.duracaoMinutos,
        observacoes: pedidoForm.observacoes,
      });

      setPedidos((atuais) =>
        atuais.map((pedido) =>
          pedido.id === pedidoEditandoId
            ? {
                ...pedido,
                alunoNome: pedidoForm.alunoNome,
                modalidade: pedidoForm.modalidade,
                professorPreferencialId: pedidoForm.professorPreferencialId,
                professorPreferencialNome: getProfessorNome(
                  pedidoForm.professorPreferencialId
                ),
                salaNome: pedidoForm.salaNome,
                preferenciaHorario: pedidoForm.preferenciaHorario,
                duracaoMinutos: pedidoForm.duracaoMinutos,
                estado: pedidoForm.estado,
                observacoes: pedidoForm.observacoes,
                motivoRejeicao: pedidoForm.motivoRejeicao,
              }
            : pedido
        )
      );

      setPedidoEditandoId(null);
      setPedidoForm(null);
      setMensagem('Pedido de coaching atualizado com sucesso.');
    } catch (error) {
      setErro(getErrorMessage(error));
    }
  }

  function atualizarPedidoForm<K extends keyof PedidoForm>(
    campo: K,
    valor: PedidoForm[K]
  ) {
    setPedidoForm((atual) => {
      if (!atual) return atual;

      return {
        ...atual,
        [campo]: valor,
      };
    });
  }

  function abrirCriarSala() {
    setSalaEditandoId(null);
    setSalaForm(criarSalaFormVazio());
    setModalSalaAberta(true);
    setMensagem('');
    setErro('');
  }

  function abrirEditarSala(sala: Sala) {
    setSalaEditandoId(sala.id);
    setSalaForm(salaParaForm(sala));
    setModalSalaAberta(true);
    setMensagem('');
    setErro('');
  }

  async function guardarSala() {
    if (!salaForm.nome.trim()) {
      setMensagem('Preenche o nome da sala.');
      return;
    }

    const capacidade = Number(salaForm.capacidade);

    if (Number.isNaN(capacidade) || capacidade < 0) {
      setMensagem('A capacidade tem de ser um número válido.');
      return;
    }

    const salaAtualizada: Sala = {
      id: salaEditandoId ?? `sala-${Date.now()}`,
      nome: salaForm.nome,
      tipo: salaForm.tipo,
      capacidade,
      ativa: salaForm.ativa,
      modalidadesPermitidas: splitModalidades(salaForm.modalidadesTexto),
    };

    try {
      setErro('');

      if (salaEditandoId) {
        setSalasLocais((atuais) =>
          atuais.map((sala) => (sala.id === salaEditandoId ? salaAtualizada : sala))
        );

        setMensagem('Sala atualizada.');
        setModalSalaAberta(false);
        return;
      }

      const estudioCriado = await criarEstudio({
        nome: salaForm.nome,
        capacidade,
        modalidadesPermitidas: splitModalidades(salaForm.modalidadesTexto),
        estado: salaForm.ativa ? 'ATIVO' : 'INATIVO',
      });

      setSalasLocais((atuais) => [mapEstudioParaSala(estudioCriado), ...atuais]);
      setMensagem('Sala/estúdio criado com sucesso.');
      setModalSalaAberta(false);
    } catch (error) {
      setErro(getErrorMessage(error));
    }
  }

  function apagarSala(salaId: string) {
    setSalasLocais((atuais) => atuais.filter((sala) => sala.id !== salaId));
    setMensagem('Sala removida apenas da vista local.');
  }

  function atualizarSalaForm<K extends keyof SalaForm>(campo: K, valor: SalaForm[K]) {
    setSalaForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function abrirCriarInterrupcao() {
    setInterrupcaoEditandoId(null);
    setInterrupcaoForm(criarInterrupcaoFormVazio());
    setModalInterrupcaoAberta(true);
    setMensagem('');
    setErro('');
  }

  function abrirEditarInterrupcao(interrupcao: Interrupcao) {
    setInterrupcaoEditandoId(interrupcao.id);
    setInterrupcaoForm(interrupcaoParaForm(interrupcao));
    setModalInterrupcaoAberta(true);
    setMensagem('');
    setErro('');
  }

  async function guardarInterrupcao() {
    if (!interrupcaoForm.nome.trim() || !interrupcaoForm.data.trim()) {
      setMensagem('Preenche o nome e a data da interrupção.');
      return;
    }

    try {
      setErro('');

      if (interrupcaoEditandoId) {
        const interrupcaoAtualizada = await atualizarInterrupcao(
          interrupcaoEditandoId,
          {
            nome: interrupcaoForm.nome,
            data: interrupcaoForm.data,
            dataFim: interrupcaoForm.dataFim || null,
            tipo: interrupcaoForm.tipo,
            escolaEncerrada: interrupcaoForm.escolaEncerrada,
            observacoes: interrupcaoForm.observacoes,
          }
        );

        setInterrupcoes((atuais) =>
          atuais.map((interrupcao) =>
            interrupcao.id === interrupcaoEditandoId
              ? mapInterrupcaoBackendParaCoordenacao(interrupcaoAtualizada)
              : interrupcao
          )
        );

        setMensagem('Interrupção atualizada com sucesso.');
        setModalInterrupcaoAberta(false);
        return;
      }

      const novaInterrupcao = await criarInterrupcao({
        nome: interrupcaoForm.nome,
        data: interrupcaoForm.data,
        dataFim: interrupcaoForm.dataFim || null,
        tipo: interrupcaoForm.tipo,
        escolaEncerrada: interrupcaoForm.escolaEncerrada,
        observacoes: interrupcaoForm.observacoes,
      });

      setInterrupcoes((atuais) => [
        mapInterrupcaoBackendParaCoordenacao(novaInterrupcao),
        ...atuais,
      ]);
      setMensagem('Interrupção criada com sucesso.');
      setModalInterrupcaoAberta(false);
    } catch (error) {
      setErro(getErrorMessage(error));
    }
  }

  async function apagarInterrupcao(interrupcaoId: string) {
    try {
      setErro('');
      await removerInterrupcao(interrupcaoId);
      setInterrupcoes((atuais) => atuais.filter((item) => item.id !== interrupcaoId));
      setMensagem('Interrupção removida com sucesso.');
    } catch (error) {
      setErro(getErrorMessage(error));
    }
  }

  function atualizarInterrupcaoForm<K extends keyof InterrupcaoForm>(
    campo: K,
    valor: InterrupcaoForm[K]
  ) {
    setInterrupcaoForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function abrirEditarVaga(vaga: VagaCoaching) {
    setVagaEditandoId(vaga.id);
    setVagaForm(vagaParaForm(vaga));
    setMensagem('');
    setErro('');
  }

  async function guardarVaga() {
    if (!vagaEditandoId || !vagaForm) {
      return;
    }

    const vagaOriginal = vagas.find((vaga) => vaga.id === vagaEditandoId);

    try {
      setErro('');

      if (vagaOriginal?.estado !== 'FECHADA' && vagaForm.estado === 'FECHADA') {
        await fecharVagaCoaching(vagaEditandoId);
      }

      setVagas((atuais) =>
        atuais.map((vaga) =>
          vaga.id === vagaEditandoId
            ? {
                ...vaga,
                professorId: vagaForm.professorId,
                professorNome: getProfessorNome(vagaForm.professorId),
                modalidade: vagaForm.modalidade,
                repeticao: vagaForm.repeticao,
                diaSemana: vagaForm.diaSemana,
                horaInicio: vagaForm.horaInicio,
                horaFim: vagaForm.horaFim,
                salaNome: vagaForm.salaNome,
                estudioId: getSalaIdByNome(vagaForm.salaNome),
                dataInicio: vagaForm.dataInicio,
                dataFim: vagaForm.dataFim,
                estado: vagaForm.estado,
              }
            : vaga
        )
      );

      setVagaEditandoId(null);
      setVagaForm(null);
      setMensagem(
        vagaForm.estado === 'FECHADA'
          ? 'Vaga fechada.'
          : 'Vaga atualizada.'
      );
    } catch (error) {
      setErro(getErrorMessage(error));
    }
  }

  function atualizarVagaForm<K extends keyof VagaForm>(campo: K, valor: VagaForm[K]) {
    setVagaForm((atual) => {
      if (!atual) return atual;

      return {
        ...atual,
        [campo]: valor,
      };
    });
  }

  async function exportarFinanceiro() {
  try {
    setExportandoFinanceiro(true);
    setErro('');

    const csv = await exportarFinanceiroCsv();

    const blob = new Blob(['\ufeff', csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const dataHoje = new Date().toISOString().slice(0, 10);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `registos_financeiros_entartes_${dataHoje}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);

    setMensagem('Registos financeiros exportados com sucesso.');
  } catch (error) {
    setErro(getErrorMessage(error));
  } finally {
    setExportandoFinanceiro(false);
  }
}
  
  function abrirCriarFinanceiro() {
    setFinanceiroForm(criarFinanceiroFormVazio());
    setModalFinanceiroAberta(true);
    setMensagem('');
    setErro('');
  }

  async function guardarFinanceiro() {
    if (!financeiroForm.descricao.trim()) {
      setMensagem('Preenche a descrição do registo financeiro.');
      return;
    }

    const valor = Number(financeiroForm.valor);

    if (Number.isNaN(valor) || valor < 0) {
      setMensagem('O valor tem de ser um número válido.');
      return;
    }

    try {
      setErro('');

      const novoRegisto = await criarRegistoFinanceiro({
        tipo: financeiroForm.tipo,
        descricao: financeiroForm.descricao,
        valor,
        data: financeiroForm.data,
        origem: financeiroForm.origem,
        estado: financeiroForm.estado,
      });

      setRegistosFinanceiros((atuais) => [novoRegisto, ...atuais]);
      setTotalFinanceiro((atual) => atual + novoRegisto.valor);
      setTotalRegistosFinanceiros((atual) => atual + 1);
      setModalFinanceiroAberta(false);
      setMensagem('Registo financeiro criado com sucesso.');
    } catch (error) {
      setErro(getErrorMessage(error));
    }
  }

  function atualizarFinanceiroForm<K extends keyof FinanceiroForm>(
    campo: K,
    valor: FinanceiroForm[K]
  ) {
    setFinanceiroForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  return (
    <div className="p-8 max-w-[1500px] mx-auto">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full bg-[#fff4d4] text-[#8a6d1d] text-sm">
              Coordenação/Administração
            </span>

            <span className="px-3 py-1 rounded-full bg-[#d4e8df] text-[#2d5f4f] text-sm">
              Dados atualizados
            </span>
          </div>

          <h1 className="text-[#2d5f4f] mb-2">Coordenação</h1>

          <p className="text-[#7a9a8c]">
            Gestão de pedidos, salas, interrupções, vagas, calendário e financeiro.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => void carregarDados()}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar dados
          </button>

          <button
            onClick={abrirCriarSala}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors"
          >
            <DoorOpen className="w-4 h-4" />
            Nova sala
          </button>

          <button
            onClick={abrirCriarFinanceiro}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo registo
          </button>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <SummaryCard
          icon={<Users className="w-5 h-5 text-[#2d5f4f]" />}
          label="Pedidos pendentes"
          value={pedidosPendentes}
          color="bg-[#fff4d4]"
        />

        <SummaryCard
          icon={<Calendar className="w-5 h-5 text-[#2d5f4f]" />}
          label="Aceites professor"
          value={pedidosAceitesProfessor}
          color="bg-[#e8d4ff]"
        />

        <SummaryCard
          icon={<CheckCircle2 className="w-5 h-5 text-[#2d5f4f]" />}
          label="Aprovados"
          value={pedidosAprovados}
          color="bg-[#d4e8df]"
        />

        <SummaryCard
          icon={<Clock className="w-5 h-5 text-[#2d5f4f]" />}
          label="Vagas abertas"
          value={vagasAbertas}
          color="bg-[#d4e8ff]"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8 mb-10">
        <section className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#2d5f4f]" />
              <h2 className="text-[#2d5f4f]">Gerir pedidos de coaching</h2>
            </div>

            <select
              value={estadoFiltro}
              onChange={(event) =>
                setEstadoFiltro(event.target.value as 'TODOS' | EstadoPedidoCoaching)
              }
              className="inputEntartes md:max-w-xs"
            >
              <option value="TODOS">Todos os estados</option>
              <option value="PENDENTE">Pendente</option>
              <option value="INTERESSE_REGISTADO">Interesse registado</option>
              <option value="ACEITE_PROFESSOR">Aceite pelo professor</option>
              <option value="APROVADO">Aprovado</option>
              <option value="REJEITADO">Rejeitado</option>
            </select>
          </div>

          <div className="space-y-3">
            {pedidosFiltrados.length === 0 ? (
              <p className="text-[#7a9a8c]">Não existem pedidos com este filtro.</p>
            ) : (
              pedidosFiltrados.map((pedido) => (
                <article
                  key={pedido.id}
                  className="rounded-xl border border-[#e8f0ed] bg-[#f8faf9] p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-white border border-[#e8f0ed] text-[#7a9a8c]">
                          {pedido.id}
                        </span>

                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            estadoPedidoStyles[pedido.estado]
                          }`}
                        >
                          {estadoPedidoLabels[pedido.estado]}
                        </span>
                      </div>

                      <h3 className="text-[#2d5f4f] mb-1">{pedido.alunoNome}</h3>

                      <p className="text-sm text-[#7a9a8c]">
                        {pedido.modalidade} · {pedido.professorPreferencialNome}
                      </p>

                      <p className="text-xs text-[#7a9a8c] mt-1">
                        {pedido.preferenciaHorario || 'Sem data definida'} · {pedido.duracaoMinutos} min · {pedido.salaNome}
                      </p>
                    </div>

                    <button
                      onClick={() => abrirEditarPedido(pedido)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Gerir
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <WalletCards className="w-5 h-5 text-[#2d5f4f]" />
              <h2 className="text-[#2d5f4f]">Financeiro</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => void exportarFinanceiro()}
                disabled={exportandoFinanceiro}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                {exportandoFinanceiro ? 'A exportar...' : 'Exportar Excel'}
              </button>

              <button
                onClick={abrirCriarFinanceiro}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3]"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <InfoBox label="Total de registos" value={String(totalRegistosFinanceiros)} />
            <InfoBox label="Valor total" value={`${totalFinanceiro.toFixed(2)}€`} />
            <InfoBox label="Total de vagas" value={String(vagas.length)} />
            <InfoBox label="Horas de coaching" value={`${totalHorasCoaching.toFixed(1)}h`} />
          </div>

          <div className="rounded-xl bg-[#f0f6f3] border border-[#d9e8e1] p-4 mb-5">
            <p className="text-sm text-[#2d5f4f]">
              Tarifa de coaching: <strong>{VALOR_HORA_COACHING_NORMAL}€/h</strong> · domingos e
              feriados <strong>{VALOR_HORA_COACHING_ESPECIAL}€/h</strong>
            </p>

            {coachingsFaturaveis.length > 0 ? (
              <button
                onClick={() => void faturarCoachings()}
                className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors"
              >
                <WalletCards className="w-4 h-4" />
                Faturar {coachingsFaturaveis.length} coaching(s) realizado(s)
              </button>
            ) : (
              <p className="text-xs text-[#7a9a8c] mt-2">
                Não há coachings realizados por faturar.
              </p>
            )}
          </div>

          <div className="space-y-3">
            {registosFinanceiros.length === 0 ? (
              <p className="text-sm text-[#7a9a8c]">
                Ainda não existem registos financeiros.
              </p>
            ) : (
              registosFinanceiros.slice(0, 5).map((registo) => (
                <article
                  key={registo.id}
                  className="rounded-xl border border-[#e8f0ed] bg-[#f8faf9] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[#2d5f4f]">{registo.descricao}</p>
                      <p className="text-sm text-[#7a9a8c]">
                        {formatDate(registo.data)} · {registo.origem}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[#2d5f4f]">{registo.valor.toFixed(2)}€</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          estadoFinanceiroStyles[registo.estado]
                        }`}
                      >
                        {registo.estado}
                      </span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="space-y-8 mb-10">
        <section className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-[#2d5f4f]" />
              <h2 className="text-[#2d5f4f]">Salas e estúdios</h2>
            </div>

            <button
              onClick={abrirCriarSala}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3]"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {salasLocais.map((sala) => {
              return (
                <article
                  key={sala.id}
                  className="rounded-xl border border-[#e8f0ed] bg-[#f8faf9] p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-[#2d5f4f]">{sala.nome}</h3>
                      <p className="text-sm text-[#7a9a8c]">{sala.tipo}</p>
                    </div>

                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        sala.ativa
                          ? 'bg-[#d4e8df] text-[#2d5f4f]'
                          : 'bg-[#ffe0e0] text-[#9a3a3a]'
                      }`}
                    >
                      {sala.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  <p className="text-sm text-[#5a7a6c] mb-3">
                    Capacidade: {sala.capacidade}
                  </p>

                  {sala.modalidadesPermitidas.length > 0 && (
                    <p className="text-xs text-[#7a9a8c] mb-3">
                      {sala.modalidadesPermitidas.join(', ')}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirEditarSala(sala)}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-white"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => apagarSala(sala.id)}
                      className="px-3 py-2 rounded-xl border border-[#ffd2d2] text-[#9a3a3a] hover:bg-[#fff5f5]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#2d5f4f]" />
              <h2 className="text-[#2d5f4f]">Feriados e interrupções</h2>
            </div>

            <button
              onClick={abrirCriarInterrupcao}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3]"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          <div className="space-y-3">
            {interrupcoes.map((interrupcao) => (
              <article
                key={interrupcao.id}
                className="rounded-xl border border-[#e8f0ed] bg-[#f8faf9] p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-[#2d5f4f] mb-1">{interrupcao.nome}</h3>

                    <p className="text-sm text-[#7a9a8c]">
                      {formatDate(interrupcao.data)}
                      {interrupcao.dataFim ? ` a ${formatDate(interrupcao.dataFim)}` : ''} ·{' '}
                      {interrupcao.tipo}
                    </p>

                    <p className="text-xs text-[#7a9a8c] mt-1">
                      {interrupcao.escolaEncerrada ? 'Escola encerrada' : 'Escola aberta'}
                      {interrupcao.observacoes ? ` · ${interrupcao.observacoes}` : ''}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirEditarInterrupcao(interrupcao)}
                      className="px-3 py-2 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-white"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => apagarInterrupcao(interrupcao.id)}
                      className="px-3 py-2 rounded-xl border border-[#ffd2d2] text-[#9a3a3a] hover:bg-[#fff5f5]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-8 mb-10">
        <section className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5 text-[#2d5f4f]" />
            <h2 className="text-[#2d5f4f]">Vagas de coaching</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vagas.map((vaga) => (
              <article
                key={vaga.id}
                className="rounded-xl border border-[#e8f0ed] bg-[#f8faf9] p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          estadoVagaStyles[vaga.estado]
                        }`}
                      >
                        {vaga.estado === 'ABERTA' ? 'Aberta' : 'Fechada'}
                      </span>

                      <span className="text-xs px-2 py-1 rounded-full bg-white border border-[#e8f0ed] text-[#7a9a8c]">
                        {vaga.repeticao}
                      </span>
                    </div>

                    <h3 className="text-[#2d5f4f] mb-1">{vaga.modalidade}</h3>

                    <p className="text-sm text-[#7a9a8c]">
                      {vaga.professorNome} · {vaga.diaSemana}, {vaga.horaInicio}-
                      {vaga.horaFim}
                    </p>

                    <p className="text-xs text-[#7a9a8c] mt-1">{vaga.salaNome}</p>
                  </div>

                  <button
                    onClick={() => abrirEditarVaga(vaga)}
                    className="px-4 py-2 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-white"
                  >
                    Gerir vaga
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-6">
          <div className="flex items-center gap-2 mb-5">
            <CalendarDays className="w-5 h-5 text-[#2d5f4f]" />
            <h2 className="text-[#2d5f4f]">Calendário geral</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calendario.map((item) => (
              <article
                key={`${item.tipo}-${item.id}`}
                className="rounded-xl border border-[#e8f0ed] bg-[#f8faf9] p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[#2d5f4f] mb-1">{item.titulo}</p>
                    <p className="text-sm text-[#7a9a8c]">{item.detalhe}</p>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-xs px-2 py-1 rounded-full bg-[#d4e8df] text-[#2d5f4f]">
                      {item.tipo}
                    </span>

                    <p className="text-xs text-[#7a9a8c] mt-2">
                      {formatDate(item.data)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {pedidoForm && (
        <Modal onClose={() => setPedidoForm(null)}>
          <ModalHeader
            title="Gerir pedido de coaching"
            subtitle="Altera professor, sala, estado e notas de coordenação."
            onClose={() => setPedidoForm(null)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Aluno">
              <input
                value={pedidoForm.alunoNome}
                onChange={(event) => atualizarPedidoForm('alunoNome', event.target.value)}
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Modalidade">
              <input
                value={pedidoForm.modalidade}
                onChange={(event) => atualizarPedidoForm('modalidade', event.target.value)}
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Professor">
              <select
                value={pedidoForm.professorPreferencialId}
                onChange={(event) =>
                  atualizarPedidoForm('professorPreferencialId', event.target.value)
                }
                className="inputEntartes"
              >
                <option value="">Sem preferência</option>

                {professoresLista.map((professor) => (
                  <option value={professor.id} key={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Sala">
              <select
                value={pedidoForm.salaNome}
                onChange={(event) => atualizarPedidoForm('salaNome', event.target.value)}
                className="inputEntartes"
              >
                {salasLocais.map((sala) => (
                  <option value={sala.nome} key={sala.id}>
                    {sala.nome}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Estado">
              <select
                value={pedidoForm.estado}
                onChange={(event) =>
                  atualizarPedidoForm('estado', event.target.value as EstadoPedidoCoaching)
                }
                className="inputEntartes"
              >
                <option value="PENDENTE">Pendente</option>
                <option value="INTERESSE_REGISTADO">Interesse registado</option>
                <option value="ACEITE_PROFESSOR">Aceite pelo professor</option>
                <option value="APROVADO">Aprovado</option>
                <option value="REJEITADO">Rejeitado</option>
              </select>
            </FormField>

            <FormField label="Horário / agendamento">
              <input
                value={pedidoForm.preferenciaHorario}
                onChange={(event) =>
                  atualizarPedidoForm('preferenciaHorario', event.target.value)
                }
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Duração">
              <select
                value={pedidoForm.duracaoMinutos}
                onChange={(event) =>
                  atualizarPedidoForm('duracaoMinutos', Number(event.target.value))
                }
                className="inputEntartes"
              >
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1h</option>
                <option value={90}>1h30</option>
                <option value={120}>2h</option>
              </select>
            </FormField>

            {pedidoForm.estado === 'REJEITADO' && (
              <div className="md:col-span-2">
                <FormField label="Motivo de rejeição">
                  <input
                    value={pedidoForm.motivoRejeicao}
                    onChange={(event) =>
                      atualizarPedidoForm('motivoRejeicao', event.target.value)
                    }
                    className="inputEntartes"
                  />
                </FormField>
              </div>
            )}

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
            confirmLabel="Guardar alterações"
            onCancel={() => setPedidoForm(null)}
            onConfirm={guardarPedido}
          />
        </Modal>
      )}

      {modalSalaAberta && (
        <Modal onClose={() => setModalSalaAberta(false)}>
          <ModalHeader
            title={salaEditandoId ? 'Editar sala' : 'Nova sala'}
            subtitle="Cria ou altera salas/estúdios disponíveis para aulas e coaching."
            onClose={() => setModalSalaAberta(false)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nome">
              <input
                value={salaForm.nome}
                onChange={(event) => atualizarSalaForm('nome', event.target.value)}
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Tipo">
              <input
                value={salaForm.tipo}
                onChange={(event) => atualizarSalaForm('tipo', event.target.value)}
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Capacidade">
              <input
                value={salaForm.capacidade}
                onChange={(event) => atualizarSalaForm('capacidade', event.target.value)}
                type="number"
                min="0"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Estado">
              <select
                value={salaForm.ativa ? 'ATIVA' : 'INATIVA'}
                onChange={(event) => atualizarSalaForm('ativa', event.target.value === 'ATIVA')}
                className="inputEntartes"
              >
                <option value="ATIVA">Ativa</option>
                <option value="INATIVA">Inativa</option>
              </select>
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Modalidades permitidas">
                <input
                  value={salaForm.modalidadesTexto}
                  onChange={(event) =>
                    atualizarSalaForm('modalidadesTexto', event.target.value)
                  }
                  className="inputEntartes"
                  placeholder="Ex.: Ballet, Jazz, Hip Hop"
                />
              </FormField>
            </div>
          </div>

          <ModalActions
            cancelLabel="Cancelar"
            confirmLabel="Guardar sala"
            onCancel={() => setModalSalaAberta(false)}
            onConfirm={guardarSala}
          />
        </Modal>
      )}

      {modalInterrupcaoAberta && (
        <Modal onClose={() => setModalInterrupcaoAberta(false)}>
          <ModalHeader
            title={interrupcaoEditandoId ? 'Editar interrupção' : 'Nova interrupção'}
            subtitle="Inclui feriados nacionais, municipais, Carnaval e segunda após Páscoa."
            onClose={() => setModalInterrupcaoAberta(false)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nome">
              <input
                value={interrupcaoForm.nome}
                onChange={(event) => atualizarInterrupcaoForm('nome', event.target.value)}
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Data início">
              <input
                value={interrupcaoForm.data}
                onChange={(event) => atualizarInterrupcaoForm('data', event.target.value)}
                type="date"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Data fim">
              <input
                value={interrupcaoForm.dataFim}
                onChange={(event) => atualizarInterrupcaoForm('dataFim', event.target.value)}
                type="date"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Tipo">
              <select
                value={interrupcaoForm.tipo}
                onChange={(event) =>
                  atualizarInterrupcaoForm(
                    'tipo',
                    event.target.value as TipoInterrupcaoBackend
                  )
                }
                className="inputEntartes"
              >
                <option value="FERIADO">Feriado</option>
                <option value="INTERRUPCAO">Interrupção letiva</option>
                <option value="EVENTO">Evento</option>
                <option value="OUTRO">Outro</option>
              </select>
            </FormField>

            <FormField label="Escola">
              <select
                value={interrupcaoForm.escolaEncerrada ? 'ENCERRADA' : 'ABERTA'}
                onChange={(event) =>
                  atualizarInterrupcaoForm(
                    'escolaEncerrada',
                    event.target.value === 'ENCERRADA'
                  )
                }
                className="inputEntartes"
              >
                <option value="ENCERRADA">Escola encerrada</option>
                <option value="ABERTA">Escola aberta</option>
              </select>
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Observações">
                <textarea
                  value={interrupcaoForm.observacoes}
                  onChange={(event) =>
                    atualizarInterrupcaoForm('observacoes', event.target.value)
                  }
                  className="inputEntartes min-h-24 resize-none"
                  placeholder="Ex.: Feriado municipal, Carnaval, segunda-feira após Páscoa..."
                />
              </FormField>
            </div>
          </div>

          <ModalActions
            cancelLabel="Cancelar"
            confirmLabel="Guardar interrupção"
            onCancel={() => setModalInterrupcaoAberta(false)}
            onConfirm={guardarInterrupcao}
          />
        </Modal>
      )}

      {vagaForm && (
        <Modal onClose={() => setVagaForm(null)}>
          <ModalHeader
            title="Gerir vaga de coaching"
            subtitle="Altera horário, sala, estado e professor da disponibilidade."
            onClose={() => setVagaForm(null)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Professor">
              <select
                value={vagaForm.professorId}
                onChange={(event) => atualizarVagaForm('professorId', event.target.value)}
                className="inputEntartes"
              >
                {professoresLista.map((professor) => (
                  <option value={professor.id} key={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Modalidade">
              <input
                value={vagaForm.modalidade}
                onChange={(event) => atualizarVagaForm('modalidade', event.target.value)}
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Repetição">
              <select
                value={vagaForm.repeticao}
                onChange={(event) => atualizarVagaForm('repeticao', event.target.value)}
                className="inputEntartes"
              >
                <option value="PONTUAL">Pontual</option>
                <option value="DIARIA">Diária</option>
                <option value="SEMANAL">Semanal</option>
                <option value="MENSAL">Mensal</option>
              </select>
            </FormField>

            <FormField label="Dia da semana">
              <input
                value={vagaForm.diaSemana}
                onChange={(event) => atualizarVagaForm('diaSemana', event.target.value)}
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

            <FormField label="Sala">
              <select
                value={vagaForm.salaNome}
                onChange={(event) => atualizarVagaForm('salaNome', event.target.value)}
                className="inputEntartes"
              >
                {salasLocais.map((sala) => (
                  <option value={sala.nome} key={sala.id}>
                    {sala.nome}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Estado">
              <select
                value={vagaForm.estado}
                onChange={(event) => atualizarVagaForm('estado', event.target.value as EstadoVaga)}
                className="inputEntartes"
              >
                <option value="ABERTA">Aberta</option>
                <option value="FECHADA">Fechada</option>
              </select>
            </FormField>

            <FormField label="Data início">
              <input
                value={vagaForm.dataInicio}
                onChange={(event) => atualizarVagaForm('dataInicio', event.target.value)}
                type="date"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Data fim">
              <input
                value={vagaForm.dataFim}
                onChange={(event) => atualizarVagaForm('dataFim', event.target.value)}
                type="date"
                className="inputEntartes"
              />
            </FormField>
          </div>

          <ModalActions
            cancelLabel="Cancelar"
            confirmLabel="Guardar vaga"
            onCancel={() => setVagaForm(null)}
            onConfirm={guardarVaga}
          />
        </Modal>
      )}

      {modalFinanceiroAberta && (
        <Modal onClose={() => setModalFinanceiroAberta(false)}>
          <ModalHeader
            title="Novo registo financeiro"
            subtitle="Cria um registo manual de valor/faturação."
            onClose={() => setModalFinanceiroAberta(false)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Tipo">
              <input
                value={financeiroForm.tipo}
                onChange={(event) => atualizarFinanceiroForm('tipo', event.target.value)}
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Valor (€)">
              <input
                value={financeiroForm.valor}
                onChange={(event) => atualizarFinanceiroForm('valor', event.target.value)}
                type="number"
                min="0"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Data">
              <input
                value={financeiroForm.data}
                onChange={(event) => atualizarFinanceiroForm('data', event.target.value)}
                type="date"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Origem">
              <select
                value={financeiroForm.origem}
                onChange={(event) =>
                  atualizarFinanceiroForm(
                    'origem',
                    event.target.value as OrigemFinanceiraBackend
                  )
                }
                className="inputEntartes"
              >
                <option value="MANUAL">Manual</option>
                <option value="COACHING">Coaching</option>
                <option value="INVENTARIO">Inventário</option>
              </select>
            </FormField>

            <FormField label="Estado">
              <select
                value={financeiroForm.estado}
                onChange={(event) =>
                  atualizarFinanceiroForm(
                    'estado',
                    event.target.value as EstadoFinanceiroBackend
                  )
                }
                className="inputEntartes"
              >
                <option value="PENDENTE">Pendente</option>
                <option value="FATURADO">Faturado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Descrição">
                <textarea
                  value={financeiroForm.descricao}
                  onChange={(event) =>
                    atualizarFinanceiroForm('descricao', event.target.value)
                  }
                  className="inputEntartes min-h-24 resize-none"
                />
              </FormField>
            </div>
          </div>

          <ModalActions
            cancelLabel="Cancelar"
            confirmLabel="Guardar registo"
            onCancel={() => setModalFinanceiroAberta(false)}
            onConfirm={guardarFinanceiro}
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
  onConfirm: () => void | Promise<void>;
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
        onClick={() => void onConfirm()}
        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors"
      >
        <Save className="w-4 h-4" />
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

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f8faf9] border border-[#e8f0ed] p-4">
      <p className="text-xs text-[#7a9a8c] mb-1">{label}</p>
      <p className="text-sm text-[#2d5f4f]">{value}</p>
    </div>
  );
}
