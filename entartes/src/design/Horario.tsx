import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Filter,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import {
  Toast,
  inferirTipoMensagem,
  limparMensagemBackend,
  type ToastData,
} from '../components/Toast';

import { modalidades, type DiaSemana } from '../data/mockEntartes';
import {
  atualizarAulaSemanal,
  criarAulaSemanal,
  listarAulasSemanais,
  listarModalidadesReferencia,
  listarProfessoresReferencia,
  listarSalasReferencia,
  removerAulaSemanal,
  solicitarAlteracaoAula,
  solicitarInscricaoAula,
  type AulaSemanalApp,
  type EstadoAulaBackend,
} from '../services/horarioService';

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

type EstadoAula = EstadoAulaBackend;

type Professor = {
  id: string;
  nome: string;
};

type Sala = {
  id: string;
  nome: string;
};

type Aula = {
  id: string;
  turmaId?: string;
  salaId?: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFim: string;
  modalidade: string;
  turma: string;
  professorId: string;
  professorNome: string;
  salaNome: string;
  faixaEtaria: string;
  vagas: number;
  inscritos: number;
  estado: EstadoAula;
};

type AulaForm = {
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFim: string;
  modalidade: string;
  turma: string;
  professorId: string;
  salaNome: string;
  faixaEtaria: string;
  vagas: string;
  inscritos: string;
  estado: EstadoAula;
};

const diasSemana: DiaSemana[] = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const horasGrelha = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
];

const modalidadeColors: Record<string, string> = {
  Ballet: '#ffd4e5',
  Jazz: '#d4e8ff',
  'Dança Contemporânea': '#e8d4ff',
  Acrodance: '#d4fff4',
  'Ginástica Acrobática': '#d4fff4',
  'Hip Hop': '#fff4d4',
  'Teatro Musical': '#ffe8d4',
  'Commercial Fusion': '#fff4e8',
  'Body Balance': '#f4d4ff',
  Flexibilidade: '#f4d4ff',
  'Condicionamento Físico': '#e8f5e9',
  'Personal Training': '#e0f2fe',
};

const estadoAulaLabels: Record<EstadoAula, string> = {
  ATIVA: 'Ativa',
  RASCUNHO: 'Rascunho',
  CANCELADA: 'Cancelada',
};

function criarAulaFormVazio(
  professoresLista: Professor[],
  salasLista: Sala[],
  modalidadesLista: string[] = modalidades
): AulaForm {
  return {
    diaSemana: 'Segunda-feira',
    horaInicio: '18:00',
    horaFim: '19:00',
    modalidade: modalidadesLista[0] ?? 'Ballet',
    turma: '',
    professorId: professoresLista[0]?.id ?? '',
    salaNome: salasLista[0]?.nome ?? 'Estúdio 1',
    faixaEtaria: 'Crianças/Jovens',
    vagas: '18',
    inscritos: '0',
    estado: 'ATIVA',
  };
}

function aulaParaForm(aula: Aula): AulaForm {
  return {
    diaSemana: aula.diaSemana,
    horaInicio: aula.horaInicio,
    horaFim: aula.horaFim,
    modalidade: aula.modalidade,
    turma: aula.turma,
    professorId: aula.professorId,
    salaNome: aula.salaNome,
    faixaEtaria: aula.faixaEtaria,
    vagas: String(aula.vagas),
    inscritos: String(aula.inscritos),
    estado: aula.estado,
  };
}

function getHoraBase(hora: string) {
  const [hour] = hora.split(':');
  return `${hour.padStart(2, '0')}:00`;
}

function calcularDuracao(horaInicio: string, horaFim: string) {
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



function normalizarTextoComparacao(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function inicioDaSemana(data: Date) {
  const resultado = new Date(data);
  resultado.setHours(0, 0, 0, 0);
  const offset = (resultado.getDay() + 6) % 7;
  resultado.setDate(resultado.getDate() - offset);
  return resultado;
}

function adicionarDias(data: Date, dias: number) {
  const resultado = new Date(data);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

function formatarDiaMes(data: Date) {
  return `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}`;
}

function formatarDiaMesAno(data: Date) {
  return `${formatarDiaMes(data)}/${data.getFullYear()}`;
}

function mesmoDia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function aulaPertenceAoProfessor(aula: Aula, currentUser: CurrentUser) {
  const professorAtualId = currentUser.perfilId || currentUser.contaId || '';
  const nomeProfessorAtual = normalizarTextoComparacao(currentUser.name);
  const nomeProfessorAula = normalizarTextoComparacao(aula.professorNome || '');

  const correspondeId = Boolean(professorAtualId && aula.professorId === professorAtualId);
  const correspondeNome = Boolean(nomeProfessorAtual && nomeProfessorAula === nomeProfessorAtual);

  return correspondeId || correspondeNome;
}

function normalizarDiaSemana(value: string): DiaSemana {
  const mapa: Record<string, DiaSemana> = {
    Segunda: 'Segunda-feira',
    'Segunda-feira': 'Segunda-feira',
    Terça: 'Terça-feira',
    'Terça-feira': 'Terça-feira',
    Terca: 'Terça-feira',
    'Terca-feira': 'Terça-feira',
    Quarta: 'Quarta-feira',
    'Quarta-feira': 'Quarta-feira',
    Quinta: 'Quinta-feira',
    'Quinta-feira': 'Quinta-feira',
    Sexta: 'Sexta-feira',
    'Sexta-feira': 'Sexta-feira',
    Sábado: 'Sábado',
    Sabado: 'Sábado',
  };

  return mapa[value] ?? 'Segunda-feira';
}

function aulaBackendParaAula(aula: AulaSemanalApp): Aula {
  return {
    id: aula.id,
    turmaId: aula.turmaId,
    salaId: aula.salaId,
    diaSemana: normalizarDiaSemana(aula.diaSemana),
    horaInicio: aula.horaInicio,
    horaFim: aula.horaFim,
    modalidade: aula.modalidade,
    turma: aula.turma,
    professorId: aula.professorId,
    professorNome: aula.professorNome,
    salaNome: aula.salaNome,
    faixaEtaria: aula.faixaEtaria || 'Nível aberto',
    vagas: aula.vagas,
    inscritos: aula.inscritos,
    estado: aula.estado,
  };
}

function isAulaPersistida(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocorreu um erro ao comunicar com o backend.';
}

function getSubtitle(role: UserRole) {
  if (role === 'PROFESSOR') {
    return 'Grelha semanal das tuas aulas e pedidos de alteração.';
  }

  if (role === 'COORDENACAO') {
    return 'Grelha semanal para gestão de aulas, professores e salas.';
  }

  return 'Consulta o horário semanal da escola e solicita inscrição quando necessário.';
}

export default function Horario({ currentUser }: { currentUser: CurrentUser }) {
  const isAluno = currentUser.role === 'ALUNO';
  const isEncarregado = currentUser.role === 'ENCARREGADO';
  const isProfessor = currentUser.role === 'PROFESSOR';
  const isCoordenacao = currentUser.role === 'COORDENACAO';

  const [professoresLista, setProfessoresLista] = useState<Professor[]>([]);
  const [salasLista, setSalasLista] = useState<Sala[]>([]);
  const [modalidadesLista, setModalidadesLista] = useState<string[]>(() => [
    ...modalidades,
  ]);

  const [aulas, setAulas] = useState<Aula[]>([]);

  const [pesquisa, setPesquisa] = useState('');
  const [modalidadeFiltro, setModalidadeFiltro] = useState('TODAS');
  const [carregandoHorario, setCarregandoHorario] = useState(true);
  const [operacaoEmCurso, setOperacaoEmCurso] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  function setMensagem(texto: string) {
    if (!texto) {
      setToast(null);
      return;
    }

    setToast({ mensagem: limparMensagemBackend(texto), tipo: inferirTipoMensagem(texto) });
  }

  const [modalAulaAberta, setModalAulaAberta] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [aulaEditandoId, setAulaEditandoId] = useState<string | null>(null);
  const [aulaForm, setAulaForm] = useState<AulaForm>(() =>
    criarAulaFormVazio(professoresLista, salasLista, modalidadesLista)
  );

  const [aulaDetalhe, setAulaDetalhe] = useState<Aula | null>(null);
  const [inscricoesSolicitadas, setInscricoesSolicitadas] = useState<string[]>([]);
  const [alteracoesSolicitadas, setAlteracoesSolicitadas] = useState<string[]>([]);
  const [semanaBase, setSemanaBase] = useState(() => inicioDaSemana(new Date()));

  const hojeData = useMemo(() => {
    const data = new Date();
    data.setHours(0, 0, 0, 0);
    return data;
  }, []);

  const datasSemana = useMemo(
    () => diasSemana.map((_, indice) => adicionarDias(semanaBase, indice)),
    [semanaBase]
  );
  const [textoAlteracao, setTextoAlteracao] = useState('');

  useEffect(() => {
    let mounted = true;

    async function carregarHorario() {
      try {
        setCarregandoHorario(true);

        const [aulasBackend, professoresBackend, salasBackend, modalidadesBackend] =
          await Promise.all([
            listarAulasSemanais(),
            listarProfessoresReferencia().catch(() => []),
            listarSalasReferencia().catch(() => []),
            listarModalidadesReferencia().catch(() => []),
          ]);

        if (!mounted) return;

        const professoresAdaptados = professoresBackend.map((professor, index) => ({
          id: professor.id || `professor-${index}`,
          nome: professor.nome || `Professor ${index + 1}`,
        }));

        const salasAdaptadas = salasBackend.map((sala, index) => ({
          id: sala.id || `sala-${index}`,
          nome: sala.nome || `Sala ${index + 1}`,
        }));

        if (professoresAdaptados.length > 0) {
          setProfessoresLista(professoresAdaptados);
        }

        if (salasAdaptadas.length > 0) {
          setSalasLista(salasAdaptadas);
        }

        if (modalidadesBackend.length > 0) {
          setModalidadesLista(modalidadesBackend);
        }

        setAulas(aulasBackend.map(aulaBackendParaAula));
      } catch (error) {
        if (!mounted) return;

        setMensagem(`Não foi possível carregar o horário. ${getErrorMessage(error)}`);
      } finally {
        if (mounted) {
          setCarregandoHorario(false);
        }
      }
    }

    void carregarHorario();

    return () => {
      mounted = false;
    };
  }, []);

  const aulasDoPerfil = useMemo(() => {
    if (isProfessor) {
      return aulas.filter((aula) => aulaPertenceAoProfessor(aula, currentUser));
    }

    return aulas;
  }, [aulas, currentUser, isProfessor]);

  const aulasFiltradas = useMemo(() => {
    return aulasDoPerfil.filter((aula) => {
      const pesquisaNormalizada = pesquisa.trim().toLowerCase();

      const correspondePesquisa =
        !pesquisaNormalizada ||
        aula.modalidade.toLowerCase().includes(pesquisaNormalizada) ||
        aula.turma.toLowerCase().includes(pesquisaNormalizada) ||
        aula.professorNome.toLowerCase().includes(pesquisaNormalizada) ||
        aula.salaNome.toLowerCase().includes(pesquisaNormalizada);

      const correspondeModalidade =
        modalidadeFiltro === 'TODAS' || aula.modalidade === modalidadeFiltro;

      return correspondePesquisa && correspondeModalidade;
    });
  }, [aulasDoPerfil, pesquisa, modalidadeFiltro]);

  const totalHoras = aulasFiltradas.reduce(
    (total, aula) => total + calcularDuracao(aula.horaInicio, aula.horaFim),
    0
  );

  const totalSalas = new Set(aulasFiltradas.map((aula) => aula.salaNome)).size;
  const totalModalidades = new Set(aulasFiltradas.map((aula) => aula.modalidade)).size;

  function getProfessorNome(professorId: string) {
    return (
      professoresLista.find((professor) => professor.id === professorId)?.nome ??
      'Professor'
    );
  }

  function atualizarForm<K extends keyof AulaForm>(campo: K, valor: AulaForm[K]) {
    setAulaForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function abrirCriarAula() {
    setModoEdicao(false);
    setAulaEditandoId(null);
    setAulaForm(criarAulaFormVazio(professoresLista, salasLista, modalidadesLista));
    setModalAulaAberta(true);
    setMensagem('');
  }

  function abrirEditarAula(aula: Aula) {
    setModoEdicao(true);
    setAulaEditandoId(aula.id);
    setAulaForm(aulaParaForm(aula));
    setModalAulaAberta(true);
    setMensagem('');
  }

  function fecharModalAula() {
    setModalAulaAberta(false);
    setModoEdicao(false);
    setAulaEditandoId(null);
  }

  async function guardarAula() {
    if (!aulaForm.turma.trim()) {
      setMensagem('Preenche o nome da turma/aula.');
      return;
    }

    const vagas = Number(aulaForm.vagas);
    const inscritos = Number(aulaForm.inscritos);

    if (Number.isNaN(vagas) || vagas < 0 || Number.isNaN(inscritos) || inscritos < 0) {
      setMensagem('Vagas e inscritos têm de ser números válidos.');
      return;
    }

    const salaSelecionada = salasLista.find((sala) => sala.nome === aulaForm.salaNome);
    const professorNome = getProfessorNome(aulaForm.professorId);

    const payload = {
      diaSemana: aulaForm.diaSemana,
      horaInicio: aulaForm.horaInicio,
      horaFim: aulaForm.horaFim,
      modalidade: aulaForm.modalidade,
      turma: aulaForm.turma,
      professorId: aulaForm.professorId,
      professorNome,
      salaId: salaSelecionada?.id ?? null,
      salaNome: aulaForm.salaNome,
      faixaEtaria: aulaForm.faixaEtaria,
      idade: aulaForm.faixaEtaria,
      tipo: 'Aula regular',
      vagas,
      inscritos,
      estado: aulaForm.estado,
    };

    try {
      setOperacaoEmCurso(true);

      if (modoEdicao && aulaEditandoId) {
        if (isAulaPersistida(aulaEditandoId)) {
          const aulaAtualizada = await atualizarAulaSemanal(aulaEditandoId, payload);

          setAulas((atuais) =>
            atuais.map((aula) =>
              aula.id === aulaEditandoId ? aulaBackendParaAula(aulaAtualizada) : aula
            )
          );
        } else {
          const aulaGuardada: Aula = {
            id: aulaEditandoId,
            turmaId: '',
            salaId: salaSelecionada?.id ?? '',
            diaSemana: aulaForm.diaSemana,
            horaInicio: aulaForm.horaInicio,
            horaFim: aulaForm.horaFim,
            modalidade: aulaForm.modalidade,
            turma: aulaForm.turma,
            professorId: aulaForm.professorId,
            professorNome,
            salaNome: aulaForm.salaNome,
            faixaEtaria: aulaForm.faixaEtaria,
            vagas,
            inscritos,
            estado: aulaForm.estado,
          };

          setAulas((atuais) =>
            atuais.map((aula) => (aula.id === aulaEditandoId ? aulaGuardada : aula))
          );
        }

        setMensagem('Aula atualizada com sucesso.');
        fecharModalAula();
        return;
      }

      const aulaCriada = await criarAulaSemanal(payload);
      setAulas((atuais) => [aulaBackendParaAula(aulaCriada), ...atuais]);
      setMensagem('Aula criada com sucesso.');
      fecharModalAula();
    } catch (error) {
      setMensagem(`Não foi possível guardar a aula. ${getErrorMessage(error)}`);
    } finally {
      setOperacaoEmCurso(false);
    }
  }

  async function eliminarAula(aulaId: string) {
    const deveEliminar = window.confirm('Queres mesmo eliminar esta aula do horário?');

    if (!deveEliminar) {
      return;
    }

    try {
      setOperacaoEmCurso(true);

      if (isAulaPersistida(aulaId)) {
        await removerAulaSemanal(aulaId);
      }

      setAulas((atuais) => atuais.filter((aula) => aula.id !== aulaId));
      setMensagem('Aula removida do horário.');
    } catch (error) {
      setMensagem(`Não foi possível eliminar a aula. ${getErrorMessage(error)}`);
    } finally {
      setOperacaoEmCurso(false);
    }
  }

  async function solicitarInscricao(aula: Aula) {
    try {
      setOperacaoEmCurso(true);

      if (isAulaPersistida(aula.id)) {
        await solicitarInscricaoAula(aula.id, {
          perfilNome: currentUser.name,
          mensagem: `Pedido de inscrição em ${aula.turma}`,
        });
      }

      setInscricoesSolicitadas((atuais) =>
        atuais.includes(aula.id) ? atuais : [...atuais, aula.id]
      );

      setAulaDetalhe(null);
      setMensagem(`Pedido de inscrição enviado para "${aula.turma}".`);
    } catch (error) {
      setMensagem(`Não foi possível enviar o pedido de inscrição. ${getErrorMessage(error)}`);
    } finally {
      setOperacaoEmCurso(false);
    }
  }

  async function solicitarAlteracao(aula: Aula) {
    if (!textoAlteracao.trim()) {
      setMensagem('Escreve uma pequena justificação para a alteração.');
      return;
    }

    try {
      setOperacaoEmCurso(true);

      if (isAulaPersistida(aula.id)) {
        await solicitarAlteracaoAula(aula.id, {
          perfilNome: currentUser.name,
          mensagem: textoAlteracao,
          textoAlteracao,
        });
      }

      setAlteracoesSolicitadas((atuais) =>
        atuais.includes(aula.id) ? atuais : [...atuais, aula.id]
      );

      setTextoAlteracao('');
      setAulaDetalhe(null);
      setMensagem(`Pedido de alteração enviado para "${aula.turma}".`);
    } catch (error) {
      setMensagem(`Não foi possível enviar o pedido de alteração. ${getErrorMessage(error)}`);
    } finally {
      setOperacaoEmCurso(false);
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

            <span className="px-3 py-1 rounded-full bg-[#f0f6f3] text-[#5a7a6c] text-sm">
              Grelha semanal
            </span>
          </div>

          <h1 className="text-[#2d5f4f] mb-2">Horário Semanal</h1>
          <p className="text-[#7a9a8c]">{getSubtitle(currentUser.role)}</p>
        </div>

        {isCoordenacao && (
          <button
            onClick={abrirCriarAula}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova aula
          </button>
        )}
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />

      {carregandoHorario && (
        <div className="mb-6 rounded-xl border border-[#d9e8e1] bg-white p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-[#2d5f4f]" />
          <p className="text-[#2d5f4f]">A carregar horário...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <SummaryCard
          icon={<CalendarDays className="w-5 h-5 text-[#2d5f4f]" />}
          label="Aulas visíveis"
          value={aulasFiltradas.length}
          color="bg-[#d4e8df]"
        />

        <SummaryCard
          icon={<Clock className="w-5 h-5 text-[#2d5f4f]" />}
          label="Horas semanais"
          value={Number(totalHoras.toFixed(1))}
          suffix="h"
          color="bg-[#d4e8ff]"
        />

        <SummaryCard
          icon={<Filter className="w-5 h-5 text-[#2d5f4f]" />}
          label="Modalidades"
          value={totalModalidades}
          color="bg-[#e8d4ff]"
        />

        <SummaryCard
          icon={<CalendarDays className="w-5 h-5 text-[#2d5f4f]" />}
          label="Salas"
          value={totalSalas}
          color="bg-[#fff4d4]"
        />
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-[#2d5f4f]" />
          <h2 className="text-[#2d5f4f]">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Pesquisar">
            <div className="relative">
              <Search className="w-4 h-4 text-[#7a9a8c] absolute left-3 top-1/2 -translate-y-1/2" />

              <input
                value={pesquisa}
                onChange={(event) => setPesquisa(event.target.value)}
                placeholder="Ex.: Ballet, Ana, Estúdio..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#d9e8e1] bg-[#f8faf9] text-[#2d5f4f] outline-none focus:border-[#2d5f4f]"
              />
            </div>
          </FormField>

          <FormField label="Modalidade">
            <select
              value={modalidadeFiltro}
              onChange={(event) => setModalidadeFiltro(event.target.value)}
              className="inputEntartes"
            >
              <option value="TODAS">Todas</option>

              {modalidadesLista.map((modalidade) => (
                <option value={modalidade} key={modalidade}>
                  {modalidade}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-b border-[#e8f0ed] bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSemanaBase((atual) => adicionarDias(atual, -7))}
              className="p-2 rounded-lg border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3]"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSemanaBase(inicioDaSemana(new Date()))}
              className="px-4 py-2 rounded-lg border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] text-sm"
            >
              Hoje
            </button>

            <button
              onClick={() => setSemanaBase((atual) => adicionarDias(atual, 7))}
              className="p-2 rounded-lg border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3]"
              aria-label="Semana seguinte"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[#2d5f4f]">
            {formatarDiaMes(datasSemana[0])} – {formatarDiaMesAno(datasSemana[datasSemana.length - 1])}
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1100px]">
            <div className="grid grid-cols-[80px_repeat(6,minmax(160px,1fr))] border-b border-[#e8f0ed] bg-[#f8faf9]">
              <div className="p-4 border-r border-[#e8f0ed]" />

              {diasSemana.map((dia, indice) => {
                const dataDia = datasSemana[indice];
                const ehHoje = mesmoDia(dataDia, hojeData);

                return (
                  <div
                    key={dia}
                    className={`p-4 text-center border-r last:border-r-0 border-[#e8f0ed] ${
                      ehHoje ? 'bg-[#d4e8df]' : ''
                    }`}
                  >
                    <p className="text-[#2d5f4f]">{dia.replace('-feira', '')}</p>
                    <p className="text-xs text-[#7a9a8c] mt-1">{formatarDiaMes(dataDia)}</p>
                  </div>
                );
              })}
            </div>

            {horasGrelha.map((hora) => (
              <div
                key={hora}
                className="grid grid-cols-[80px_repeat(6,minmax(160px,1fr))] min-h-[86px] border-b last:border-b-0 border-[#e8f0ed]"
              >
                <div className="p-4 border-r border-[#e8f0ed] text-sm text-[#7a9a8c]">
                  {hora}
                </div>

                {diasSemana.map((dia, indice) => {
                  const aulasCelula = aulasFiltradas.filter(
                    (aula) =>
                      aula.diaSemana === dia && getHoraBase(aula.horaInicio) === hora
                  );

                  const ehColunaHoje = mesmoDia(datasSemana[indice], hojeData);

                  return (
                    <div
                      key={`${dia}-${hora}`}
                      className={`p-2 border-r last:border-r-0 border-[#e8f0ed] ${
                        ehColunaHoje ? 'bg-[#f0f6f3]' : 'bg-white'
                      }`}
                    >
                      <div className="space-y-2">
                        {aulasCelula.map((aula) => {
                          const inscricaoSolicitada = inscricoesSolicitadas.includes(aula.id);
                          const alteracaoSolicitada = alteracoesSolicitadas.includes(aula.id);

                          return (
                            <button
                              key={aula.id}
                              onClick={() => setAulaDetalhe(aula)}
                              className="w-full text-left rounded-xl p-3 border border-[#e8f0ed] hover:shadow-sm transition-shadow"
                              style={{
                                backgroundColor:
                                  modalidadeColors[aula.modalidade] ?? '#d4e8df',
                              }}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="text-sm text-[#2d5f4f]">{aula.horaInicio}</p>

                                {aula.estado !== 'ATIVA' && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 text-[#2d5f4f]">
                                    {estadoAulaLabels[aula.estado]}
                                  </span>
                                )}
                              </div>

                              <p className="text-[#2d5f4f] mb-1">{aula.turma}</p>
                              <p className="text-xs text-[#5a7a6c] mb-1">
                                {aula.modalidade}
                              </p>

                              {aula.faixaEtaria && (
                                <p className="text-xs text-[#5a7a6c]">
                                  {aula.faixaEtaria}
                                </p>
                              )}

                              <p className="text-xs text-[#5a7a6c] mt-2">
                                {aula.salaNome}
                              </p>

                              {(inscricaoSolicitada || alteracaoSolicitada) && (
                                <p className="text-[10px] text-[#2d5f4f] mt-2">
                                  {inscricaoSolicitada
                                    ? 'Inscrição solicitada'
                                    : 'Alteração solicitada'}
                                </p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {aulaDetalhe && (
        <Modal onClose={() => setAulaDetalhe(null)}>
          <ModalHeader
            title={aulaDetalhe.turma}
            subtitle={`${aulaDetalhe.diaSemana}, ${aulaDetalhe.horaInicio}-${aulaDetalhe.horaFim}`}
            onClose={() => setAulaDetalhe(null)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            <InfoBox label="Modalidade" value={aulaDetalhe.modalidade} />
            <InfoBox label="Professor" value={aulaDetalhe.professorNome} />
            <InfoBox label="Sala" value={aulaDetalhe.salaNome} />
            <InfoBox label="Faixa etária" value={aulaDetalhe.faixaEtaria} />
            <InfoBox label="Vagas" value={`${aulaDetalhe.inscritos}/${aulaDetalhe.vagas}`} />
            <InfoBox label="Estado" value={estadoAulaLabels[aulaDetalhe.estado]} />
          </div>

          <div className="flex flex-wrap gap-3">
            {(isAluno || isEncarregado) && (
              <button
                onClick={() => void solicitarInscricao(aulaDetalhe)}
                disabled={operacaoEmCurso || inscricoesSolicitadas.includes(aulaDetalhe.id)}
                className="flex-1 px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors disabled:bg-[#d4e8df] disabled:text-[#2d5f4f]"
              >
                {inscricoesSolicitadas.includes(aulaDetalhe.id)
                  ? 'Inscrição já solicitada'
                  : 'Solicitar inscrição'}
              </button>
            )}

            {isCoordenacao && (
              <>
                <button
                  onClick={() => {
                    abrirEditarAula(aulaDetalhe);
                    setAulaDetalhe(null);
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar aula
                </button>

                <button
                  onClick={() => {
                    void eliminarAula(aulaDetalhe.id);
                    setAulaDetalhe(null);
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#ffd2d2] text-[#9a3a3a] hover:bg-[#fff5f5] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </>
            )}
          </div>

          {isProfessor && (
            <div className="space-y-3 mt-5">
              <FormField label="Pedido de alteração">
                <textarea
                  value={textoAlteracao}
                  onChange={(event) => setTextoAlteracao(event.target.value)}
                  className="inputEntartes min-h-28 resize-none"
                  placeholder="Ex.: preciso de alterar esta aula para outra sala ou horário..."
                />
              </FormField>

              <button
                onClick={() => void solicitarAlteracao(aulaDetalhe)}
                disabled={operacaoEmCurso}
                className="w-full px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors"
              >
                Enviar pedido de alteração
              </button>
            </div>
          )}
        </Modal>
      )}

      {modalAulaAberta && (
        <Modal onClose={fecharModalAula}>
          <ModalHeader
            title={modoEdicao ? 'Editar aula' : 'Nova aula'}
            subtitle="Os dados ficam guardados na escola."
            onClose={fecharModalAula}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Dia da semana">
              <select
                value={aulaForm.diaSemana}
                onChange={(event) => atualizarForm('diaSemana', event.target.value as DiaSemana)}
                className="inputEntartes"
              >
                {diasSemana.map((dia) => (
                  <option value={dia} key={dia}>
                    {dia}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Modalidade">
              <select
                value={aulaForm.modalidade}
                onChange={(event) => atualizarForm('modalidade', event.target.value)}
                className="inputEntartes"
              >
                {modalidadesLista.map((modalidade) => (
                  <option value={modalidade} key={modalidade}>
                    {modalidade}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Hora início">
              <input
                value={aulaForm.horaInicio}
                onChange={(event) => atualizarForm('horaInicio', event.target.value)}
                type="time"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Hora fim">
              <input
                value={aulaForm.horaFim}
                onChange={(event) => atualizarForm('horaFim', event.target.value)}
                type="time"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Nome da turma/aula">
              <input
                value={aulaForm.turma}
                onChange={(event) => atualizarForm('turma', event.target.value)}
                className="inputEntartes"
                placeholder="Ex.: Ballet Preparatório 1"
              />
            </FormField>

            <FormField label="Professor">
              <select
                value={aulaForm.professorId}
                onChange={(event) => atualizarForm('professorId', event.target.value)}
                className="inputEntartes"
              >
                {professoresLista.map((professor) => (
                  <option value={professor.id} key={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Sala">
              <select
                value={aulaForm.salaNome}
                onChange={(event) => atualizarForm('salaNome', event.target.value)}
                className="inputEntartes"
              >
                {salasLista.map((sala) => (
                  <option value={sala.nome} key={sala.id}>
                    {sala.nome}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Faixa etária">
              <input
                value={aulaForm.faixaEtaria}
                onChange={(event) => atualizarForm('faixaEtaria', event.target.value)}
                className="inputEntartes"
                placeholder="Ex.: Crianças/Jovens, Adultos..."
              />
            </FormField>

            <FormField label="Vagas">
              <input
                value={aulaForm.vagas}
                onChange={(event) => atualizarForm('vagas', event.target.value)}
                type="number"
                min="0"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Inscritos">
              <input
                value={aulaForm.inscritos}
                onChange={(event) => atualizarForm('inscritos', event.target.value)}
                type="number"
                min="0"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Estado">
              <select
                value={aulaForm.estado}
                onChange={(event) => atualizarForm('estado', event.target.value as EstadoAula)}
                className="inputEntartes"
              >
                <option value="ATIVA">Ativa</option>
                <option value="RASCUNHO">Rascunho</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </FormField>
          </div>

          <ModalActions
            cancelLabel="Cancelar"
            confirmLabel={modoEdicao ? 'Guardar alterações' : 'Criar aula'}
            onCancel={fecharModalAula}
            onConfirm={guardarAula}
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
  suffix = '',
  color,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  suffix?: string;
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
          <p className="text-2xl text-[#2d5f4f]">
            {value}
            {suffix}
          </p>
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
      <p className="text-sm text-[#2d5f4f]">{value || '-'}</p>
    </div>
  );
}