import { useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  AlertCircle,
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  Clock,
  DoorOpen,
  ShoppingBag,
  Users,
} from 'lucide-react';

import { Toast, inferirTipoMensagem, limparMensagemBackend, type ToastData } from '../components/Toast';
import {
  listarAulasSemanais,
  type AulaSemanalApp,
} from '../services/horarioService';
import {
  listarPedidosCoaching,
  listarVagasCoaching,
  type EstadoPedidoCoachingBackend,
  type PedidoCoachingApp,
  type VagaCoachingApp,
} from '../services/coachingService';
import { listarEventos, type EventoApp } from '../services/eventosService';
import { listarInventario, type MarketplaceItemApp } from '../services/inventarioService';
import { listarEstudios, type EstudioApp } from '../services/estudiosService';
import { listarInterrupcoes, type InterrupcaoApp } from '../services/interrupcoesService';

type UserRole = 'ALUNO' | 'ENCARREGADO' | 'PROFESSOR' | 'COORDENACAO';

type Page =
  | 'dashboard'
  | 'horario'
  | 'coaching'
  | 'marketplace'
  | 'eventos'
  | 'coordenacao';

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

type QuickAction = {
  title: string;
  description: string;
  page: Page;
  icon: ReactNode;
  badge?: string;
};

const diasOrdem = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
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

const estadoPedidoLabel: Record<EstadoPedidoCoachingBackend, string> = {
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em análise',
  INTERESSE_REGISTADO: 'Interesse registado',
  ACEITE_PROFESSOR: 'Aceite pelo professor',
  AGUARDA_ALUNO: 'Aguarda aluno',
  AGENDADO: 'Agendado',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
};

const estadoPedidoStyle: Record<EstadoPedidoCoachingBackend, string> = {
  PENDENTE: 'bg-[#fff4d4] text-[#8a6d1d]',
  EM_ANALISE: 'bg-[#d4e8ff] text-[#2d5f7f]',
  INTERESSE_REGISTADO: 'bg-[#d4e8ff] text-[#2d5f7f]',
  ACEITE_PROFESSOR: 'bg-[#e8d4ff] text-[#5a3c7a]',
  AGUARDA_ALUNO: 'bg-[#ffe8cc] text-[#8a5a1d]',
  AGENDADO: 'bg-[#f0e4ff] text-[#5a3c7a]',
  APROVADO: 'bg-[#d4e8df] text-[#2d5f4f]',
  REJEITADO: 'bg-[#ffe0e0] text-[#9a3a3a]',
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocorreu um erro ao carregar a dashboard.';
}

function formatDate(date: string) {
  if (!date) return 'A definir';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
}

function getDashboardTitle(user: CurrentUser) {
  if (user.role === 'COORDENACAO') {
    return 'Dashboard da Coordenação';
  }

  return `Bem-vindo, ${user.name}`;
}

function getDashboardSubtitle(user: CurrentUser) {
  if (user.role === 'ALUNO') {
    return 'Resumo das tuas aulas, pedidos de coaching, eventos e materiais disponíveis.';
  }

  if (user.role === 'ENCARREGADO') {
    return 'Resumo do horário, eventos e pedidos de coaching associados ao educando.';
  }

  if (user.role === 'PROFESSOR') {
    return 'Resumo das tuas aulas, pedidos de coaching e eventos ativos.';
  }

  return 'Visão geral de aulas, coaching, marketplace, eventos, salas e coordenação escolar.';
}

function getQuickActions(user: CurrentUser): QuickAction[] {
  if (user.role === 'COORDENACAO') {
    return [
      {
        title: 'Coordenação',
        description: 'Gerir pedidos, salas, vagas e interrupções.',
        page: 'coordenacao',
        icon: <DoorOpen className="w-5 h-5 text-[#2d5f4f]" />,
        badge: 'Gestão',
      },
      {
        title: 'Gerir horário',
        description: 'Criar, editar ou remover aulas.',
        page: 'horario',
        icon: <Clock className="w-5 h-5 text-[#2d5f4f]" />,
      },
      {
        title: 'Coaching',
        description: 'Gerir pedidos e disponibilidades.',
        page: 'coaching',
        icon: <Users className="w-5 h-5 text-[#2d5f4f]" />,
      },
      {
        title: 'Eventos',
        description: 'Criar e gerir eventos/comunicados.',
        page: 'eventos',
        icon: <CalendarDays className="w-5 h-5 text-[#2d5f4f]" />,
      },
    ];
  }

  return [
    {
      title: user.role === 'PROFESSOR' ? 'Meu horário' : 'Ver horário',
      description: 'Consultar a grelha semanal de aulas.',
      page: 'horario',
      icon: <Clock className="w-5 h-5 text-[#2d5f4f]" />,
    },
    {
      title: user.role === 'PROFESSOR' ? 'Disponibilidades' : 'Pedido de coaching',
      description:
        user.role === 'PROFESSOR'
          ? 'Criar vagas e gerir pedidos de coaching.'
          : 'Criar ou acompanhar pedidos de coaching.',
      page: 'coaching',
      icon:
        user.role === 'PROFESSOR' ? (
          <CalendarCheck2 className="w-5 h-5 text-[#2d5f4f]" />
        ) : (
          <Users className="w-5 h-5 text-[#2d5f4f]" />
        ),
      badge: 'Coaching',
    },
    {
      title: 'Marketplace',
      description: 'Consultar e solicitar figurinos/acessórios.',
      page: 'marketplace',
      icon: <ShoppingBag className="w-5 h-5 text-[#2d5f4f]" />,
    },
    {
      title: 'Eventos',
      description: 'Ver comunicados, formulários e apresentações.',
      page: 'eventos',
      icon: <CalendarDays className="w-5 h-5 text-[#2d5f4f]" />,
    },
  ];
}

export default function Dashboard({
  currentUser,
  onNavigate,
}: {
  currentUser: CurrentUser;
  onNavigate: (page: Page) => void;
}) {
  const isAluno = currentUser.role === 'ALUNO';
  const isEncarregado = currentUser.role === 'ENCARREGADO';
  const isProfessor = currentUser.role === 'PROFESSOR';
  const isCoordenacao = currentUser.role === 'COORDENACAO';

  const perfilId = currentUser.perfilId ?? currentUser.contaId ?? '';

  const [aulas, setAulas] = useState<AulaSemanalApp[]>([]);
  const [pedidos, setPedidos] = useState<PedidoCoachingApp[]>([]);
  const [vagas, setVagas] = useState<VagaCoachingApp[]>([]);
  const [eventos, setEventos] = useState<EventoApp[]>([]);
  const [itens, setItens] = useState<MarketplaceItemApp[]>([]);
  const [estudios, setEstudios] = useState<EstudioApp[]>([]);
  const [interrupcoes, setInterrupcoes] = useState<InterrupcaoApp[]>([]);
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const [
        aulasResult,
        pedidosResult,
        vagasResult,
        eventosResult,
        itensResult,
        estudiosResult,
        interrupcoesResult,
      ] = await Promise.allSettled([
        listarAulasSemanais(),
        listarPedidosCoaching(),
        listarVagasCoaching(),
        listarEventos(),
        listarInventario(),
        listarEstudios(),
        listarInterrupcoes(),
      ]);

      if (!ativo) return;

      if (aulasResult.status === 'fulfilled') setAulas(aulasResult.value);
      if (pedidosResult.status === 'fulfilled') setPedidos(pedidosResult.value);
      if (vagasResult.status === 'fulfilled') setVagas(vagasResult.value);
      if (eventosResult.status === 'fulfilled') setEventos(eventosResult.value);
      if (itensResult.status === 'fulfilled') setItens(itensResult.value);
      if (estudiosResult.status === 'fulfilled') setEstudios(estudiosResult.value);
      if (interrupcoesResult.status === 'fulfilled') setInterrupcoes(interrupcoesResult.value);

      const falhou = [
        aulasResult,
        pedidosResult,
        vagasResult,
        eventosResult,
        itensResult,
        estudiosResult,
      ].find((resultado) => resultado.status === 'rejected');

      if (falhou && falhou.status === 'rejected') {
        const mensagem = limparMensagemBackend(
          `Não foi possível carregar parte da dashboard. ${getErrorMessage(falhou.reason)}`
        );
        setToast({ mensagem, tipo: inferirTipoMensagem(mensagem) });
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, []);

  const quickActions = getQuickActions(currentUser);

  const aulasOrdenadas = useMemo(() => {
    return [...aulas].sort((a, b) => {
      const diaA = diasOrdem.indexOf(a.diaSemana);
      const diaB = diasOrdem.indexOf(b.diaSemana);

      if (diaA !== diaB) {
        return diaA - diaB;
      }

      return a.horaInicio.localeCompare(b.horaInicio);
    });
  }, [aulas]);

  const aulasVisiveis = useMemo(() => {
    if (!isProfessor) return aulasOrdenadas;

    return aulasOrdenadas.filter(
      (aula) => aula.professorId === perfilId || aula.professorNome === currentUser.name
    );
  }, [aulasOrdenadas, isProfessor, perfilId, currentUser.name]);

  const pedidosVisiveis = useMemo(() => {
    return pedidos.filter((pedido) => {
      if (isAluno) {
        return pedido.alunoId === perfilId || pedido.alunoNome === currentUser.name;
      }

      if (isEncarregado) {
        return pedido.encarregadoId === perfilId || pedido.encarregadoNome === currentUser.name;
      }

      if (isProfessor) {
        return (
          !pedido.professorId ||
          pedido.professorId === perfilId ||
          pedido.professorNome === currentUser.name
        );
      }

      return true;
    });
  }, [pedidos, isAluno, isEncarregado, isProfessor, perfilId, currentUser.name]);

  const vagasVisiveis = useMemo(() => {
    if (isProfessor) {
      return vagas.filter(
        (vaga) => vaga.professorId === perfilId || vaga.professorNome === currentUser.name
      );
    }

    return vagas.filter((vaga) => vaga.estado === 'ABERTA');
  }, [vagas, isProfessor, perfilId, currentUser.name]);

  const eventosAtivos = useMemo(
    () => eventos.filter((evento) => evento.estado === 'ATIVO'),
    [eventos]
  );

  const proximaInterrupcao = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return [...interrupcoes]
      .filter((item) => {
        const data = new Date(`${item.data}T00:00:00`);
        return !Number.isNaN(data.getTime()) && data.getTime() >= hoje.getTime();
      })
      .sort((a, b) => a.data.localeCompare(b.data))[0];
  }, [interrupcoes]);

  const pedidosPendentes = pedidosVisiveis.filter((pedido) => pedido.estado === 'PENDENTE');

  return (
    <div className="p-8 max-w-[1500px] mx-auto">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="px-3 py-1 rounded-full bg-[#d4e8df] text-[#2d5f4f] text-sm">
            {currentUser.roleLabel}
          </span>

          {isCoordenacao && (
            <span className="px-3 py-1 rounded-full bg-[#fff4d4] text-[#8a6d1d] text-sm">
              Acesso total
            </span>
          )}
        </div>

        <h1 className="text-[#2d5f4f] mb-2">{getDashboardTitle(currentUser)}</h1>

        <p className="text-[#7a9a8c]">{getDashboardSubtitle(currentUser)}</p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {quickActions.map((action) => (
          <button
            key={action.title}
            onClick={() => onNavigate(action.page)}
            className="group text-left bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#d4e8df] flex items-center justify-center">
                {action.icon}
              </div>

              <div className="flex items-center gap-2">
                {action.badge && (
                  <span className="px-2 py-1 rounded-full bg-[#fff4d4] text-[#8a6d1d] text-xs">
                    {action.badge}
                  </span>
                )}

                <ArrowRight className="w-4 h-4 text-[#7a9a8c] group-hover:text-[#2d5f4f] transition-colors" />
              </div>
            </div>

            <h3 className="text-[#2d5f4f] mb-1">{action.title}</h3>
            <p className="text-sm text-[#7a9a8c]">{action.description}</p>
          </button>
        ))}
      </section>

      <div className="mb-8 space-y-3">
        {eventosAtivos.slice(0, 1).map((evento) => (
          <button
            key={evento.id}
            onClick={() => onNavigate('eventos')}
            className="w-full text-left p-4 rounded-xl border flex items-start gap-3 bg-[#f0f6ff] border-[#d4e4ff] hover:bg-[#eaf3ff] transition-colors"
          >
            <CalendarDays className="w-5 h-5 mt-0.5 text-[#3498db]" />

            <div className="flex-1">
              <p className="text-[#2d5f4f]">
                {evento.titulo} — {formatDate(evento.data)}
                {evento.local ? `, ${evento.local}` : ''}
              </p>
            </div>

            <ArrowRight className="w-4 h-4 text-[#7a9a8c] mt-1" />
          </button>
        ))}

        {proximaInterrupcao && (
          <div className="p-4 rounded-xl border flex items-start gap-3 bg-[#fff9f0] border-[#ffe4b8]">
            <AlertCircle className="w-5 h-5 mt-0.5 text-[#f39c12]" />

            <div className="flex-1">
              <p className="text-[#2d5f4f]">
                {proximaInterrupcao.nome} — {formatDate(proximaInterrupcao.data)}
              </p>

              <p className="text-sm text-[#7a9a8c] mt-1">
                {proximaInterrupcao.tipo}
                {proximaInterrupcao.escolaEncerrada ? ' · Escola encerrada' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <SummaryCard
          icon={<Clock className="w-5 h-5 text-[#2d5f4f]" />}
          label={isProfessor ? 'As minhas aulas' : 'Aulas semanais'}
          value={aulasVisiveis.length}
          color="bg-[#d4e8df]"
          onClick={() => onNavigate('horario')}
        />

        <SummaryCard
          icon={<Users className="w-5 h-5 text-[#2d5f4f]" />}
          label={isCoordenacao ? 'Pedidos de coaching' : 'Pedidos associados'}
          value={pedidosVisiveis.length}
          color="bg-[#d4e8ff]"
          onClick={() => onNavigate('coaching')}
        />

        <SummaryCard
          icon={<ShoppingBag className="w-5 h-5 text-[#2d5f4f]" />}
          label="Marketplace"
          value={itens.length}
          color="bg-[#fff4d4]"
          onClick={() => onNavigate('marketplace')}
        />

        <SummaryCard
          icon={<CalendarDays className="w-5 h-5 text-[#2d5f4f]" />}
          label="Eventos ativos"
          value={eventosAtivos.length}
          color="bg-[#e8d4ff]"
          onClick={() => onNavigate('eventos')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <section className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-6">
          <SectionHeader
            icon={<Clock className="w-5 h-5 text-[#2d5f4f]" />}
            title={isProfessor ? 'As minhas próximas aulas' : 'Próximas aulas'}
            onClick={() => onNavigate('horario')}
          />

          {aulasVisiveis.length === 0 ? (
            <p className="text-[#7a9a8c]">Não existem aulas para mostrar.</p>
          ) : (
            <div className="space-y-3">
              {aulasVisiveis.slice(0, 4).map((aula) => (
                <button
                  key={aula.id}
                  onClick={() => onNavigate('horario')}
                  className="w-full text-left p-4 rounded-xl border border-[#e8f0ed] hover:shadow-sm transition-shadow"
                  style={{
                    backgroundColor: `${modalidadeColors[aula.modalidade] ?? '#d4e8df'}33`,
                  }}
                >
                  <div className="flex items-start justify-between mb-2 gap-3">
                    <div>
                      <p className="text-[#2d5f4f] mb-1">{aula.modalidade}</p>
                      <p className="text-sm text-[#7a9a8c]">
                        {aula.turma}
                        {aula.faixaEtaria ? ` · ${aula.faixaEtaria}` : ''}
                      </p>
                    </div>

                    <span className="px-3 py-1 bg-white rounded-lg text-sm text-[#2d5f4f] border border-[#e8f0ed] whitespace-nowrap">
                      {aula.horaInicio}
                    </span>
                  </div>

                  <p className="text-sm text-[#7a9a8c]">
                    {aula.diaSemana} · {aula.salaNome}
                  </p>

                  {!isProfessor && (
                    <p className="text-xs text-[#7a9a8c] mt-1">{aula.professorNome}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-6">
          <SectionHeader
            icon={<Users className="w-5 h-5 text-[#2d5f4f]" />}
            title={isCoordenacao ? 'Pedidos de coaching' : 'Pedidos de coaching associados'}
            onClick={() => onNavigate('coaching')}
          />

          {pedidosVisiveis.length === 0 ? (
            <p className="text-[#7a9a8c]">Não existem pedidos associados a este perfil.</p>
          ) : (
            <div className="space-y-3">
              {pedidosVisiveis.slice(0, 5).map((pedido) => (
                <button
                  key={pedido.id}
                  onClick={() => onNavigate('coaching')}
                  className="w-full text-left p-4 rounded-xl border border-[#e8f0ed] hover:bg-[#f8faf9] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2 gap-3">
                    <div>
                      <p className="text-[#2d5f4f] mb-1">{pedido.alunoNome || pedido.alunoId}</p>
                      <p className="text-sm text-[#7a9a8c]">
                        {pedido.modalidade} · {pedido.tipoCoaching}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${
                        estadoPedidoStyle[pedido.estado]
                      }`}
                    >
                      {estadoPedidoLabel[pedido.estado]}
                    </span>
                  </div>

                  <p className="text-sm text-[#7a9a8c]">
                    Professor:{' '}
                    {pedido.professorNome || pedido.professorPreferencialNome || 'Sem preferência'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <section className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-6">
          <SectionHeader
            icon={<CalendarDays className="w-5 h-5 text-[#2d5f4f]" />}
            title="Eventos ativos"
            onClick={() => onNavigate('eventos')}
          />

          {eventosAtivos.length === 0 ? (
            <p className="text-[#7a9a8c]">Não existem eventos ativos.</p>
          ) : (
            <div className="space-y-3">
              {eventosAtivos.map((evento) => (
                <button
                  key={evento.id}
                  onClick={() => onNavigate('eventos')}
                  className="w-full text-left p-4 rounded-xl border border-[#e8f0ed] bg-[#f8faf9] hover:bg-[#f0f6f3] transition-colors"
                >
                  <p className="text-[#2d5f4f] mb-2">{evento.titulo}</p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-[#7a9a8c]">
                    <span>{formatDate(evento.data)}</span>
                    {evento.local && (
                      <>
                        <span>•</span>
                        <span>{evento.local}</span>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-6">
          <SectionHeader
            icon={<ShoppingBag className="w-5 h-5 text-[#2d5f4f]" />}
            title="Marketplace"
            onClick={() => onNavigate('marketplace')}
          />

          {itens.length === 0 ? (
            <p className="text-[#7a9a8c]">Ainda não existem materiais no marketplace.</p>
          ) : (
            <div className="space-y-3">
              {itens.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate('marketplace')}
                  className="w-full text-left p-4 rounded-xl border border-[#e8f0ed] hover:bg-[#f8faf9] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[#2d5f4f] mb-1">{item.nome}</p>
                      <p className="text-sm text-[#7a9a8c]">{item.modalidade}</p>
                    </div>

                    <span className="px-3 py-1 rounded-lg text-sm bg-[#d4e8df] text-[#2d5f4f] whitespace-nowrap">
                      {item.estadoAnuncio === 'RESERVADO' ? 'Alugado' : 'Disponível'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-6">
          <SectionHeader
            icon={<CalendarCheck2 className="w-5 h-5 text-[#2d5f4f]" />}
            title="Vagas de coaching"
            onClick={() => onNavigate('coaching')}
          />

          {vagasVisiveis.length === 0 ? (
            <p className="text-[#7a9a8c]">Não existem vagas associadas a este perfil.</p>
          ) : (
            <div className="space-y-3">
              {vagasVisiveis.slice(0, 5).map((vaga) => (
                <button
                  key={vaga.id}
                  onClick={() => onNavigate('coaching')}
                  className="w-full text-left p-4 rounded-xl border border-[#e8f0ed] bg-[#f8faf9] hover:bg-[#f0f6f3] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-[#2d5f4f] mb-1">{vaga.modalidade}</p>
                      <p className="text-sm text-[#7a9a8c]">{vaga.professorNome}</p>
                    </div>

                    <span className="px-3 py-1 rounded-lg text-sm bg-[#d4e8ff] text-[#2d5f4f]">
                      {vaga.estado === 'ABERTA' ? 'Aberta' : 'Fechada'}
                    </span>
                  </div>

                  <p className="text-sm text-[#7a9a8c]">
                    {vaga.diaSemana}, {vaga.horaInicio}-{vaga.horaFim} · {vaga.salaNome}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-6">
          <SectionHeader
            icon={<DoorOpen className="w-5 h-5 text-[#2d5f4f]" />}
            title="Salas e estúdios"
            onClick={() => onNavigate(isCoordenacao ? 'coordenacao' : 'horario')}
          />

          {estudios.length === 0 ? (
            <p className="text-[#7a9a8c]">Ainda não existem salas registadas.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {estudios.map((estudio) => {
                const totalAulas = aulas.filter(
                  (aula) => aula.salaId === estudio.id || aula.salaNome === estudio.nome
                ).length;

                return (
                  <button
                    key={estudio.id}
                    onClick={() => onNavigate(isCoordenacao ? 'coordenacao' : 'horario')}
                    className="text-left p-4 rounded-xl border border-[#e8f0ed] bg-[#f8faf9] hover:bg-[#f0f6f3] transition-colors"
                  >
                    <p className="text-[#2d5f4f] mb-1">{estudio.nome}</p>
                    <p className="text-sm text-[#7a9a8c]">Capacidade: {estudio.capacidade}</p>
                    <p className="text-xs text-[#7a9a8c] mt-2">
                      {totalAulas} aulas semanais associadas
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {pedidosPendentes.length > 0 && (
        <button
          onClick={() => onNavigate('coaching')}
          className="mt-8 w-full text-left p-4 rounded-xl border flex items-start gap-3 bg-[#fff9f0] border-[#ffe4b8] hover:bg-[#fff4df] transition-colors"
        >
          <AlertCircle className="w-5 h-5 mt-0.5 text-[#f39c12]" />

          <p className="text-[#2d5f4f] flex-1">
            Existem {pedidosPendentes.length} pedido(s) de coaching pendente(s) associados a este perfil.
          </p>

          <ArrowRight className="w-4 h-4 text-[#7a9a8c] mt-1" />
        </button>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-[#2d5f4f]">{title}</h2>
      </div>

      <button
        onClick={onClick}
        className="flex items-center gap-1 text-sm text-[#2d5f4f] hover:underline"
      >
        Abrir
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>

        <div className="flex-1">
          <p className="text-sm text-[#7a9a8c]">{label}</p>
          <p className="text-2xl text-[#2d5f4f]">{value}</p>
        </div>

        <ArrowRight className="w-4 h-4 text-[#7a9a8c]" />
      </div>
    </button>
  );
}
