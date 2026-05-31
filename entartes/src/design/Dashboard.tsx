import type { ReactNode } from 'react';

import {
  AlertCircle,
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  Clock,
  DoorOpen,
  Shirt,
  ShoppingBag,
  Users,
} from 'lucide-react';

import {
  aulasSemanais,
  eventosMock,
  feriadosEInterrupcoesMock,
  figurinosAcessoriosMock,
  pedidosCoachingMock,
  salas,
  vagasCoachingMock,
  type DiaSemana,
  type EstadoPedidoCoaching,
  type TipoFigurinoAcessorio,
} from '../data/mockEntartes';

type UserRole = 'ALUNO' | 'ENCARREGADO' | 'PROFESSOR' | 'COORDENACAO';

type Page =
  | 'dashboard'
  | 'horario'
  | 'coaching'
  | 'marketplace'
  | 'eventos'
  | 'coordenacao';

type CurrentUser = {
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

const diasOrdem: DiaSemana[] = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
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

const estadoPedidoLabel: Record<EstadoPedidoCoaching, string> = {
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em análise',
  AGENDADO: 'Agendado',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
};

const estadoPedidoStyle: Record<EstadoPedidoCoaching, string> = {
  PENDENTE: 'bg-[#fff4d4] text-[#8a6d1d]',
  EM_ANALISE: 'bg-[#d4e8ff] text-[#2d5f7f]',
  AGENDADO: 'bg-[#e8d4ff] text-[#5a3c7a]',
  APROVADO: 'bg-[#d4e8df] text-[#2d5f4f]',
  REJEITADO: 'bg-[#ffe0e0] text-[#9a3a3a]',
};

const tipoFigurinoLabel: Record<TipoFigurinoAcessorio, string> = {
  FIGURINO: 'Figurino',
  ACESSORIO: 'Acessório',
  CALCADO: 'Calçado',
  MAQUILHAGEM: 'Maquilhagem',
  OUTRO: 'Outro',
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function ordenarAulas() {
  return [...aulasSemanais].sort((a, b) => {
    const diaA = diasOrdem.indexOf(a.diaSemana);
    const diaB = diasOrdem.indexOf(b.diaSemana);

    if (diaA !== diaB) {
      return diaA - diaB;
    }

    return a.horaInicio.localeCompare(b.horaInicio);
  });
}

function getDashboardTitle(user: CurrentUser) {
  if (user.role === 'ALUNO') {
    return `Bem-vinda, ${user.name}`;
  }

  if (user.role === 'ENCARREGADO') {
    return `Bem-vindo, ${user.name}`;
  }

  if (user.role === 'PROFESSOR') {
    return `Bem-vinda, Professora ${user.name}`;
  }

  return 'Dashboard da Coordenação';
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
  if (user.role === 'ALUNO') {
    return [
      {
        title: 'Ver horário',
        description: 'Consultar aulas disponíveis e associadas.',
        page: 'horario',
        icon: <Clock className="w-5 h-5 text-[#2d5f4f]" />,
      },
      {
        title: 'Novo pedido de coaching',
        description: 'Criar ou acompanhar pedidos de coaching.',
        page: 'coaching',
        icon: <Users className="w-5 h-5 text-[#2d5f4f]" />,
        badge: 'Pedido',
      },
      {
        title: 'Marketplace',
        description: 'Solicitar aluguer de figurinos/acessórios.',
        page: 'marketplace',
        icon: <ShoppingBag className="w-5 h-5 text-[#2d5f4f]" />,
      },
      {
        title: 'Eventos',
        description: 'Ver comunicados, figurinos e apresentações.',
        page: 'eventos',
        icon: <CalendarDays className="w-5 h-5 text-[#2d5f4f]" />,
      },
    ];
  }

  if (user.role === 'ENCARREGADO') {
    return [
      {
        title: 'Horário do educando',
        description: 'Consultar aulas e opções disponíveis.',
        page: 'horario',
        icon: <Clock className="w-5 h-5 text-[#2d5f4f]" />,
      },
      {
        title: 'Pedido de coaching',
        description: 'Criar pedidos para o educando.',
        page: 'coaching',
        icon: <Users className="w-5 h-5 text-[#2d5f4f]" />,
        badge: 'Criar',
      },
      {
        title: 'Publicar figurino',
        description: 'Publicar ou solicitar figurinos/acessórios.',
        page: 'marketplace',
        icon: <ShoppingBag className="w-5 h-5 text-[#2d5f4f]" />,
      },
      {
        title: 'Autorizações',
        description: 'Ver eventos, formulários e autorizações.',
        page: 'eventos',
        icon: <CalendarDays className="w-5 h-5 text-[#2d5f4f]" />,
      },
    ];
  }

  if (user.role === 'PROFESSOR') {
    return [
      {
        title: 'Meu horário',
        description: 'Ver as minhas aulas e pedir alterações.',
        page: 'horario',
        icon: <Clock className="w-5 h-5 text-[#2d5f4f]" />,
      },
      {
        title: 'Disponibilidades',
        description: 'Criar vagas para coaching.',
        page: 'coaching',
        icon: <CalendarCheck2 className="w-5 h-5 text-[#2d5f4f]" />,
        badge: 'Coaching',
      },
      {
        title: 'Marketplace',
        description: 'Publicar ou consultar materiais.',
        page: 'marketplace',
        icon: <ShoppingBag className="w-5 h-5 text-[#2d5f4f]" />,
      },
      {
        title: 'Eventos',
        description: 'Consultar eventos e comunicados.',
        page: 'eventos',
        icon: <CalendarDays className="w-5 h-5 text-[#2d5f4f]" />,
      },
    ];
  }

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

  const quickActions = getQuickActions(currentUser);

  const aulasOrdenadas = ordenarAulas();

  const aulasVisiveis = isProfessor
    ? aulasOrdenadas.filter((aula) => aula.professorNome === currentUser.name)
    : aulasOrdenadas;

  const pedidosVisiveis = pedidosCoachingMock.filter((pedido) => {
    if (isAluno) {
      return pedido.alunoNome === currentUser.name;
    }

    if (isEncarregado) {
      return pedido.encarregadoNome === currentUser.name;
    }

    if (isProfessor) {
      return pedido.professorPreferencialNome === currentUser.name;
    }

    return true;
  });

  const eventosAtivos = eventosMock.filter((evento) => evento.estado === 'ATIVO');
  const proximoFeriado = feriadosEInterrupcoesMock[feriadosEInterrupcoesMock.length - 1];
  const figurinosDisponiveis = figurinosAcessoriosMock.slice(0, 4);

  const vagasVisiveis = isProfessor
    ? vagasCoachingMock.filter((vaga) => vaga.professorNome === currentUser.name)
    : vagasCoachingMock.filter((vaga) => vaga.estado === 'ABERTA');

  const pedidosPendentes = pedidosVisiveis.filter((pedido) => pedido.estado === 'PENDENTE');

  return (
    <div className="p-8 max-w-[1500px] mx-auto">
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
                {evento.titulo} — {formatDate(evento.data)}, {evento.local}
              </p>

              <p className="text-sm text-[#7a9a8c] mt-1">
                Apresentações: {evento.sessoes.join(' / ')}
              </p>
            </div>

            <ArrowRight className="w-4 h-4 text-[#7a9a8c] mt-1" />
          </button>
        ))}

        {proximoFeriado && (
          <div className="p-4 rounded-xl border flex items-start gap-3 bg-[#fff9f0] border-[#ffe4b8]">
            <AlertCircle className="w-5 h-5 mt-0.5 text-[#f39c12]" />

            <div className="flex-1">
              <p className="text-[#2d5f4f]">
                {proximoFeriado.nome} — {formatDate(proximoFeriado.data)}
              </p>

              <p className="text-sm text-[#7a9a8c] mt-1">
                {proximoFeriado.tipo}
                {proximoFeriado.escolaEncerrada ? ' · Escola encerrada' : ''}
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
          value={figurinosAcessoriosMock.length}
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
                      {aula.idade ? ` · ${aula.idade}` : ''}
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
              {pedidosVisiveis.map((pedido) => (
                <button
                  key={pedido.id}
                  onClick={() => onNavigate('coaching')}
                  className="w-full text-left p-4 rounded-xl border border-[#e8f0ed] hover:bg-[#f8faf9] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2 gap-3">
                    <div>
                      <p className="text-[#2d5f4f] mb-1">{pedido.alunoNome}</p>
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
                    Professor preferencial: {pedido.professorPreferencialNome}
                  </p>

                  <p className="text-xs text-[#7a9a8c] mt-1">
                    Preferência: {pedido.preferenciaHorario}
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
                  <span>•</span>
                  <span>{evento.local}</span>
                  <span>•</span>
                  <span>{evento.sessoes.join(' / ')}</span>
                </div>

                {evento.figurino.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-[#5a7a6c]">
                    <Shirt className="w-4 h-4 text-[#2d5f4f]" />
                    <span>Inclui indicações de figurino</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-6">
          <SectionHeader
            icon={<ShoppingBag className="w-5 h-5 text-[#2d5f4f]" />}
            title="Marketplace"
            onClick={() => onNavigate('marketplace')}
          />

          <div className="space-y-3">
            {figurinosDisponiveis.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate('marketplace')}
                className="w-full text-left p-4 rounded-xl border border-[#e8f0ed] hover:bg-[#f8faf9] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[#2d5f4f] mb-1">{item.nome}</p>
                    <p className="text-sm text-[#7a9a8c]">
                      {tipoFigurinoLabel[item.tipo]} · {item.modalidade}
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-lg text-sm bg-[#d4e8df] text-[#2d5f4f] whitespace-nowrap">
                    Disponível
                  </span>
                </div>

                <p className="text-xs text-[#7a9a8c] mt-2">
                  {formatDate(item.dataInicioDisponibilidade)} a{' '}
                  {formatDate(item.dataFimDisponibilidade)}
                </p>
              </button>
            ))}
          </div>
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
              {vagasVisiveis.map((vaga) => (
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
                      {vaga.repeticao}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {salas.map((sala) => {
              const totalAulas = aulasSemanais.filter((aula) => aula.salaId === sala.id).length;

              return (
                <button
                  key={sala.id}
                  onClick={() => onNavigate(isCoordenacao ? 'coordenacao' : 'horario')}
                  className="text-left p-4 rounded-xl border border-[#e8f0ed] bg-[#f8faf9] hover:bg-[#f0f6f3] transition-colors"
                >
                  <p className="text-[#2d5f4f] mb-1">{sala.nome}</p>
                  <p className="text-sm text-[#7a9a8c]">{sala.tipo}</p>
                  <p className="text-xs text-[#7a9a8c] mt-2">
                    {totalAulas} aulas semanais associadas
                  </p>
                </button>
              );
            })}
          </div>
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