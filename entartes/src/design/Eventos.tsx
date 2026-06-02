import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Brush,
  CalendarDays,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Megaphone,
  Paperclip,
  Search,
  ShieldCheck,
  Shirt,
  Sparkles,
  X,
} from 'lucide-react';

import {
  Toast,
  inferirTipoMensagem,
  limparMensagemBackend,
  type ToastData,
} from '../components/Toast';

import {
  adicionarComunicadoEvento,
  atualizarEvento,
  confirmarPresencaEvento,
  criarEvento,
  listarEventos,
  listarParticipantesEvento,
  removerEvento,
  type ComunicadoApp,
  type EventoApp,
  type EstadoEventoBackend,
} from '../services/eventosService';

type UserRole = 'ALUNO' | 'ENCARREGADO' | 'PROFESSOR' | 'COORDENACAO';

type CurrentUser = {
  name: string;
  role: UserRole;
  roleLabel: string;
  description: string;
  initials: string;
};

type EstadoEvento = EstadoEventoBackend;

type EventoView = {
  id: string;
  titulo: string;
  data: string;
  local: string;
  estado: EstadoEvento;
  descricao: string;
  apresentacoes: string[];
  formularioUrl: string;
  figurino: string[];
  acessorios: string[];
  penteado: string;
  maquilhagem: string;
  observacoes: string;
  comunicados: ComunicadoApp[];
};

type EventoForm = {
  titulo: string;
  data: string;
  local: string;
  estado: EstadoEvento;
  descricao: string;
  apresentacoesTexto: string;
  formularioUrl: string;
  figurinoTexto: string;
  acessoriosTexto: string;
  penteado: string;
  maquilhagem: string;
  observacoes: string;
};

const estadoEventoStyles: Record<EstadoEvento, string> = {
  ATIVO: 'bg-[#d4e8df] text-[#2d5f4f]',
  CANCELADO: 'bg-[#ffe0e0] text-[#9a3a3a]',
  CONCLUIDO: 'bg-[#f0f6f3] text-[#5a7a6c]',
};

const estadoEventoLabels: Record<EstadoEvento, string> = {
  ATIVO: 'Ativo',
  CANCELADO: 'Cancelado',
  CONCLUIDO: 'Concluído',
};

function getEstadoEvento(value: string): EstadoEvento {
  if (value === 'CANCELADO' || value === 'CONCLUIDO') {
    return value;
  }

  return 'ATIVO';
}

function criarEventoFormVazio(): EventoForm {
  return {
    titulo: '',
    data: '2026-06-01',
    local: 'Espaço Vita',
    estado: 'ATIVO',
    descricao: '',
    apresentacoesTexto: '15:00\n18:00',
    formularioUrl: '',
    figurinoTexto: '',
    acessoriosTexto: '',
    penteado: '',
    maquilhagem: '',
    observacoes: '',
  };
}

function eventoParaForm(evento: EventoView): EventoForm {
  return {
    titulo: evento.titulo,
    data: evento.data,
    local: evento.local,
    estado: evento.estado,
    descricao: evento.descricao,
    apresentacoesTexto: evento.apresentacoes.join('\n'),
    formularioUrl: evento.formularioUrl,
    figurinoTexto: evento.figurino.join('\n'),
    acessoriosTexto: evento.acessorios.join('\n'),
    penteado: evento.penteado,
    maquilhagem: evento.maquilhagem,
    observacoes: evento.observacoes,
  };
}

function splitText(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formParaEvento(
  form: EventoForm,
  id?: string,
  comunicados: ComunicadoApp[] = []
): EventoView {
  return {
    id: id ?? `evento-${Date.now()}`,
    titulo: form.titulo,
    data: form.data,
    local: form.local,
    estado: form.estado,
    descricao: form.descricao,
    apresentacoes: splitText(form.apresentacoesTexto),
    formularioUrl: form.formularioUrl,
    figurino: splitText(form.figurinoTexto),
    acessorios: splitText(form.acessoriosTexto),
    penteado: form.penteado,
    maquilhagem: form.maquilhagem,
    observacoes: form.observacoes,
    comunicados,
  };
}

function toText(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string').join('\n');
  }

  if (typeof value === 'string') {
    return value;
  }

  return '';
}

function toTextList(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string' && value.trim()) {
    return [value];
  }

  return [];
}

function eventoAppParaView(evento: EventoApp): EventoView {
  const item = evento as unknown as Record<string, unknown>;

  return {
    id: evento.id,
    titulo: evento.titulo,
    data: evento.data?.slice(0, 10) ?? '',
    local: typeof item.local === 'string' && item.local.trim() ? item.local : 'Ent’artes',
    estado: getEstadoEvento(evento.estado),
    descricao: evento.descricao ?? '',
    apresentacoes: toTextList(item.apresentacoes ?? item.sessoes),
    formularioUrl: typeof item.formularioUrl === 'string' ? item.formularioUrl : '',
    figurino: toTextList(item.figurino),
    acessorios: toTextList(item.acessorios),
    penteado: toText(item.penteado),
    maquilhagem: toText(item.maquilhagem),
    observacoes: typeof item.observacoes === 'string' ? item.observacoes : '',
    comunicados: evento.comunicados ?? [],
  };
}

function completarEventoComDadosDoForm(
  eventoBackend: EventoApp,
  form: EventoForm
): EventoView {
  const eventoBase = eventoAppParaView(eventoBackend);
  const eventoDoForm = formParaEvento(form, eventoBase.id);

  return {
    ...eventoDoForm,
    id: eventoBase.id,
    titulo: eventoBase.titulo,
    data: eventoBase.data,
    estado: eventoBase.estado,
    descricao: eventoBase.descricao,
    comunicados: eventoBase.comunicados,
  };
}

function isEventoPersistido(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado.';
}

function formatDate(date: string) {
  if (!date) {
    return 'Data a definir';
  }

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

function getSubtitle(role: UserRole) {
  if (role === 'ALUNO') {
    return 'Consulta os eventos, comunicados e indicações importantes.';
  }

  if (role === 'ENCARREGADO') {
    return 'Consulta eventos, comunicados, formulários e autorizações associadas ao educando.';
  }

  if (role === 'PROFESSOR') {
    return 'Consulta eventos e acompanha indicações de aulas, figurinos e comunicados.';
  }

  return 'Gestão global de eventos, comunicados, formulários, figurinos e indicações logísticas.';
}

export default function Eventos({ currentUser }: { currentUser: CurrentUser }) {
  const isAluno = currentUser.role === 'ALUNO';
  const isEncarregado = currentUser.role === 'ENCARREGADO';
  const isProfessor = currentUser.role === 'PROFESSOR';
  const isCoordenacao = currentUser.role === 'COORDENACAO';

  const podeCriarEvento = isCoordenacao;

  const [eventos, setEventos] = useState<EventoView[]>([]);
  const [carregandoEventos, setCarregandoEventos] = useState(true);
  const [operacaoEmCurso, setOperacaoEmCurso] = useState(false);
  const [pesquisa, setPesquisa] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<'TODOS' | EstadoEvento>('TODOS');

  const [toast, setToast] = useState<ToastData | null>(null);

  function setMensagem(texto: string) {
    if (!texto) {
      setToast(null);
      return;
    }

    setToast({ mensagem: limparMensagemBackend(texto), tipo: inferirTipoMensagem(texto) });
  }

  const [modalEventoAberta, setModalEventoAberta] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [eventoEditandoId, setEventoEditandoId] = useState<string | null>(null);
  const [eventoForm, setEventoForm] = useState<EventoForm>(criarEventoFormVazio());

  const [eventoComunicado, setEventoComunicado] = useState<EventoView | null>(null);

  const [eventoThreadId, setEventoThreadId] = useState<string | null>(null);
  const [novoComunicado, setNovoComunicado] = useState('');
  const [enviandoComunicado, setEnviandoComunicado] = useState(false);

  const podePublicarComunicado = isProfessor || isCoordenacao;
  const podeConfirmarPresenca = isAluno || isEncarregado;
  const eventoThread = eventos.find((evento) => evento.id === eventoThreadId) ?? null;

  const [presencasConfirmadas, setPresencasConfirmadas] = useState<string[]>([]);
  const [exportandoParticipantes, setExportandoParticipantes] = useState(false);

  async function confirmarPresenca(evento: EventoView) {
    try {
      setOperacaoEmCurso(true);

      await confirmarPresencaEvento(evento.id, {
        alunoNome: currentUser.name,
        encarregadoNome: isEncarregado ? currentUser.name : '',
      });

      setPresencasConfirmadas((atuais) => [...atuais, evento.id]);
      setMensagem('Presença confirmada para este evento.');
    } catch (error) {
      setMensagem(getErrorMessage(error));
    } finally {
      setOperacaoEmCurso(false);
    }
  }

  async function exportarParticipantes(evento: EventoView) {
    try {
      setExportandoParticipantes(true);

      const participantes = await listarParticipantesEvento(evento.id);

      if (participantes.length === 0) {
        setMensagem('Ainda não há participantes confirmados neste evento.');
        return;
      }

      const cabecalho = ['Aluno', 'Encarregado', 'Estado', 'Data', 'Observações'];
      const linhas = participantes.map((participante) =>
        [
          participante.alunoNome,
          participante.encarregadoNome,
          participante.estado,
          participante.dataConfirmacao,
          participante.observacoes,
        ]
          .map((campo) => `"${String(campo).replace(/"/g, '""')}"`)
          .join(',')
      );

      const csv = [cabecalho.join(','), ...linhas].join('\n');
      const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `participantes-${evento.titulo.replace(/\s+/g, '-').toLowerCase()}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      setMensagem(`Exportados ${participantes.length} participante(s).`);
    } catch (error) {
      setMensagem(getErrorMessage(error));
    } finally {
      setExportandoParticipantes(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function carregarEventos() {
      try {
        setCarregandoEventos(true);

        const eventosBackend = await listarEventos();

        if (!mounted) {
          return;
        }

        setEventos(eventosBackend.map(eventoAppParaView));
      } catch (error) {
        if (!mounted) {
          return;
        }

        setMensagem(`Não foi possível carregar eventos. ${getErrorMessage(error)}`);
      } finally {
        if (mounted) {
          setCarregandoEventos(false);
        }
      }
    }

    void carregarEventos();

    return () => {
      mounted = false;
    };
  }, []);

  const eventosFiltrados = useMemo(() => {
    return eventos.filter((evento) => {
      const pesquisaNormalizada = pesquisa.trim().toLowerCase();

      const correspondePesquisa =
        !pesquisaNormalizada ||
        evento.titulo.toLowerCase().includes(pesquisaNormalizada) ||
        evento.local.toLowerCase().includes(pesquisaNormalizada) ||
        evento.descricao.toLowerCase().includes(pesquisaNormalizada);

      const correspondeEstado =
        estadoFiltro === 'TODOS' || evento.estado === estadoFiltro;

      return correspondePesquisa && correspondeEstado;
    });
  }, [eventos, pesquisa, estadoFiltro]);

  const eventosAtivos = eventos.filter((evento) => evento.estado === 'ATIVO').length;

  const eventosComFormulario = eventos.filter(
    (evento) => evento.formularioUrl
  ).length;

  const eventosComFigurino = eventos.filter(
    (evento) => evento.figurino.length > 0
  ).length;

  function abrirCriacaoEvento() {
    setModoEdicao(false);
    setEventoEditandoId(null);
    setEventoForm(criarEventoFormVazio());
    setModalEventoAberta(true);
    setMensagem('');
  }

  function abrirEdicaoEvento(evento: EventoView) {
    setModoEdicao(true);
    setEventoEditandoId(evento.id);
    setEventoForm(eventoParaForm(evento));
    setModalEventoAberta(true);
    setMensagem('');
  }

  function fecharModalEvento() {
    setModalEventoAberta(false);
    setModoEdicao(false);
    setEventoEditandoId(null);
  }

  function atualizarForm<K extends keyof EventoForm>(campo: K, valor: EventoForm[K]) {
    setEventoForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  async function guardarEvento() {
    if (!eventoForm.titulo.trim()) {
      setMensagem('Preenche o título do evento.');
      return;
    }

    if (!eventoForm.data.trim()) {
      setMensagem('Indica a data do evento.');
      return;
    }

    if (!eventoForm.local.trim()) {
      setMensagem('Indica o local do evento.');
      return;
    }

    try {
      setOperacaoEmCurso(true);

      if (modoEdicao && eventoEditandoId) {
        if (isEventoPersistido(eventoEditandoId)) {
          const eventoAtualizadoBackend = await atualizarEvento(eventoEditandoId, {
            titulo: eventoForm.titulo,
            descricao: eventoForm.descricao,
            data: eventoForm.data,
            estado: eventoForm.estado,
          });

          const eventoAtualizado = completarEventoComDadosDoForm(
            eventoAtualizadoBackend,
            eventoForm
          );

          setEventos((atuais) =>
            atuais.map((evento) =>
              evento.id === eventoEditandoId ? eventoAtualizado : evento
            )
          );
        } else {
          const eventoExistente = eventos.find((evento) => evento.id === eventoEditandoId);
          const eventoAtualizado = formParaEvento(
            eventoForm,
            eventoEditandoId,
            eventoExistente?.comunicados ?? []
          );

          setEventos((atuais) =>
            atuais.map((evento) =>
              evento.id === eventoEditandoId ? eventoAtualizado : evento
            )
          );
        }

        fecharModalEvento();
        setMensagem('Evento/comunicado atualizado com sucesso.');
        return;
      }

      const novoEventoBackend = await criarEvento({
        titulo: eventoForm.titulo,
        descricao: eventoForm.descricao,
        data: eventoForm.data,
        estado: eventoForm.estado,
      });

      const novoEvento = completarEventoComDadosDoForm(novoEventoBackend, eventoForm);

      setEventos((atuais) => [novoEvento, ...atuais]);
      fecharModalEvento();
      setMensagem('Evento/comunicado criado com sucesso.');
    } catch (error) {
      setMensagem(`Não foi possível guardar o evento. ${getErrorMessage(error)}`);
    } finally {
      setOperacaoEmCurso(false);
    }
  }

  function abrirThread(evento: EventoView) {
    setEventoThreadId(evento.id);
    setNovoComunicado('');
    setMensagem('');
  }

  function fecharThread() {
    setEventoThreadId(null);
    setNovoComunicado('');
  }

  async function publicarComunicado() {
    if (!eventoThread) {
      return;
    }

    if (!novoComunicado.trim()) {
      setMensagem('Escreve uma mensagem para publicar no comunicado.');
      return;
    }

    try {
      setEnviandoComunicado(true);

      if (isEventoPersistido(eventoThread.id)) {
        const eventoAtualizado = await adicionarComunicadoEvento(eventoThread.id, {
          mensagem: novoComunicado.trim(),
          autorNome: currentUser.name,
          autorPerfil: currentUser.roleLabel,
        });

        setEventos((atuais) =>
          atuais.map((evento) =>
            evento.id === eventoThread.id
              ? { ...evento, comunicados: eventoAtualizado.comunicados }
              : evento
          )
        );
      } else {
        const comunicadoLocal: ComunicadoApp = {
          id: `comunicado-${Date.now()}`,
          autorNome: currentUser.name,
          autorPerfil: currentUser.roleLabel,
          mensagem: novoComunicado.trim(),
          data: new Date().toISOString(),
        };

        setEventos((atuais) =>
          atuais.map((evento) =>
            evento.id === eventoThread.id
              ? { ...evento, comunicados: [...evento.comunicados, comunicadoLocal] }
              : evento
          )
        );
      }

      setNovoComunicado('');
      setMensagem('Comunicado publicado na thread do evento.');
    } catch (error) {
      setMensagem(`Não foi possível publicar o comunicado. ${getErrorMessage(error)}`);
    } finally {
      setEnviandoComunicado(false);
    }
  }

  function abrirFormulario(evento: EventoView) {
    if (!evento.formularioUrl) {
      setMensagem('Este evento não tem formulário associado.');
      return;
    }

    window.open(evento.formularioUrl, '_blank', 'noopener,noreferrer');
    setMensagem(`Formulário aberto para "${evento.titulo}".`);
  }

  async function alterarEstadoEvento(eventoId: string, estado: EstadoEvento) {
    try {
      setOperacaoEmCurso(true);

      if (isEventoPersistido(eventoId)) {
        const eventoAtual = eventos.find((evento) => evento.id === eventoId);

        const eventoAtualizadoBackend = await atualizarEvento(eventoId, {
          titulo: eventoAtual?.titulo,
          descricao: eventoAtual?.descricao,
          data: eventoAtual?.data,
          estado,
        });

        const eventoAtualizado = eventoAppParaView(eventoAtualizadoBackend);

        setEventos((atuais) =>
          atuais.map((evento) =>
            evento.id === eventoId
              ? {
                  ...evento,
                  titulo: eventoAtualizado.titulo,
                  data: eventoAtualizado.data,
                  descricao: eventoAtualizado.descricao,
                  estado: eventoAtualizado.estado,
                }
              : evento
          )
        );
      } else {
        setEventos((atuais) =>
          atuais.map((evento) =>
            evento.id === eventoId ? { ...evento, estado } : evento
          )
        );
      }

      setMensagem(`Estado do evento atualizado para ${estadoEventoLabels[estado]}.`);
    } catch (error) {
      setMensagem(`Não foi possível atualizar o estado. ${getErrorMessage(error)}`);
    } finally {
      setOperacaoEmCurso(false);
    }
  }

  async function eliminarEvento(evento: EventoView) {
    const confirmou = window.confirm(`Eliminar o evento "${evento.titulo}"?`);

    if (!confirmou) {
      return;
    }

    try {
      setOperacaoEmCurso(true);

      if (isEventoPersistido(evento.id)) {
        await removerEvento(evento.id);
      }

      setEventos((atuais) => atuais.filter((item) => item.id !== evento.id));
      setMensagem('Evento removido com sucesso.');
    } catch (error) {
      setMensagem(`Não foi possível remover o evento. ${getErrorMessage(error)}`);
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

            {isAluno && (
              <span className="px-3 py-1 rounded-full bg-[#f0f6f3] text-[#5a7a6c] text-sm">
                Consulta
              </span>
            )}

            {isEncarregado && (
              <span className="px-3 py-1 rounded-full bg-[#d4e8ff] text-[#2d5f4f] text-sm">
                Formulários e autorizações
              </span>
            )}

            {isProfessor && (
              <span className="px-3 py-1 rounded-full bg-[#e8d4ff] text-[#5a3c7a] text-sm">
                Apoio a comunicados
              </span>
            )}

            {isCoordenacao && (
              <span className="px-3 py-1 rounded-full bg-[#fff4d4] text-[#8a6d1d] text-sm">
                Gestão global
              </span>
            )}
          </div>

          <h1 className="text-[#2d5f4f] mb-2">Eventos e Comunicados</h1>

          <p className="text-[#7a9a8c]">{getSubtitle(currentUser.role)}</p>
        </div>

        {podeCriarEvento && (
          <button
            onClick={abrirCriacaoEvento}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors"
          >
            <Megaphone className="w-4 h-4" />
            Criar comunicado/evento
          </button>
        )}
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />

      {carregandoEventos && (
        <div className="mb-6 rounded-xl border border-[#d9e8e1] bg-white p-4 text-[#5a7a6c]">
          A carregar eventos...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <SummaryCard
          icon={<CalendarDays className="w-5 h-5 text-[#2d5f4f]" />}
          label="Eventos visíveis"
          value={eventosFiltrados.length}
          color="bg-[#d4e8df]"
        />

        <SummaryCard
          icon={<ShieldCheck className="w-5 h-5 text-[#2d5f4f]" />}
          label="Ativos"
          value={eventosAtivos}
          color="bg-[#d4e8ff]"
        />

        <SummaryCard
          icon={<FileText className="w-5 h-5 text-[#2d5f4f]" />}
          label="Com formulário"
          value={eventosComFormulario}
          color="bg-[#fff4d4]"
        />

        <SummaryCard
          icon={<Shirt className="w-5 h-5 text-[#2d5f4f]" />}
          label="Com figurino"
          value={eventosComFigurino}
          color="bg-[#e8d4ff]"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Pesquisar">
            <div className="relative">
              <Search className="w-4 h-4 text-[#7a9a8c] absolute left-3 top-1/2 -translate-y-1/2" />

              <input
                value={pesquisa}
                onChange={(event) => setPesquisa(event.target.value)}
                placeholder="Ex.: Gala, ensaio, Vita..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#d9e8e1] bg-[#f8faf9] text-[#2d5f4f] outline-none focus:border-[#2d5f4f]"
              />
            </div>
          </FormField>

          <FormField label="Estado">
            <select
              value={estadoFiltro}
              onChange={(event) => setEstadoFiltro(event.target.value as 'TODOS' | EstadoEvento)}
              className="inputEntartes"
            >
              <option value="TODOS">Todos</option>
              <option value="ATIVO">Ativos</option>
              <option value="CANCELADO">Cancelados</option>
              <option value="CONCLUIDO">Concluídos</option>
            </select>
          </FormField>
        </div>
      </div>

      {eventosFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-10 text-center">
          <CalendarDays className="w-10 h-10 text-[#7a9a8c] mx-auto mb-3" />
          <h3 className="text-[#2d5f4f] mb-2">Sem eventos</h3>
          <p className="text-[#7a9a8c]">
            Não foram encontrados eventos ou comunicados com os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {eventosFiltrados.map((evento) => {
            return (
              <article
                key={evento.id}
                className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${estadoEventoStyles[evento.estado]}`}
                      >
                        {estadoEventoLabels[evento.estado]}
                      </span>

                      {evento.formularioUrl && (
                        <span className="px-3 py-1 rounded-full bg-[#fff4d4] text-[#8a6d1d] text-xs">
                          Formulário
                        </span>
                      )}

                      {evento.figurino.length > 0 && (
                        <span className="px-3 py-1 rounded-full bg-[#e8d4ff] text-[#5a3c7a] text-xs">
                          Figurino
                        </span>
                      )}
                    </div>

                    <h2 className="text-[#2d5f4f] mb-2">{evento.titulo}</h2>

                    {evento.descricao && (
                      <p className="text-[#5a7a6c] max-w-3xl">{evento.descricao}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => abrirThread(evento)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors"
                    >
                      <Megaphone className="w-4 h-4" />
                      Comunicados
                      {evento.comunicados.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#d4e8df] text-[#2d5f4f] text-xs">
                          {evento.comunicados.length}
                        </span>
                      )}
                    </button>

                    {(isAluno || isProfessor) && (
                      <button
                        onClick={() => setEventoComunicado(evento)}
                        className="px-4 py-2 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors"
                      >
                        Ver comunicado
                      </button>
                    )}

                    {podeConfirmarPresenca && evento.estado !== 'CONCLUIDO' && (
                      <button
                        onClick={() => void confirmarPresenca(evento)}
                        disabled={
                          operacaoEmCurso || presencasConfirmadas.includes(evento.id)
                        }
                        className="px-4 py-2 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors disabled:bg-[#d4e8df] disabled:text-[#2d5f4f]"
                      >
                        {presencasConfirmadas.includes(evento.id)
                          ? 'Presença confirmada'
                          : 'Confirmar presença'}
                      </button>
                    )}

                    {isCoordenacao && (
                      <>
                        <button
                          onClick={() => void exportarParticipantes(evento)}
                          disabled={exportandoParticipantes}
                          className="px-4 py-2 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors disabled:opacity-60"
                        >
                          {exportandoParticipantes ? 'A exportar...' : 'Exportar participantes'}
                        </button>

                        <button
                          onClick={() => abrirEdicaoEvento(evento)}
                          className="px-4 py-2 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors"
                        >
                          Gerir evento
                        </button>

                        {evento.estado !== 'CONCLUIDO' && (
                          <button
                            onClick={() => alterarEstadoEvento(evento.id, 'CONCLUIDO')}
                            disabled={operacaoEmCurso}
                            className="px-4 py-2 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors disabled:opacity-60"
                          >
                            Concluir
                          </button>
                        )}

                        <button
                          onClick={() => void eliminarEvento(evento)}
                          disabled={operacaoEmCurso}
                          className="px-4 py-2 rounded-xl border border-[#ffd2d2] text-[#9a3a3a] hover:bg-[#fff5f5] transition-colors disabled:opacity-60"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <InfoBlock
                    icon={<CalendarDays className="w-4 h-4 text-[#2d5f4f]" />}
                    label="Data"
                    value={formatDate(evento.data)}
                  />

                  <InfoBlock
                    icon={<MapPin className="w-4 h-4 text-[#2d5f4f]" />}
                    label="Local"
                    value={evento.local}
                  />

                  <InfoBlock
                    icon={<Clock className="w-4 h-4 text-[#2d5f4f]" />}
                    label="Apresentações"
                    value={
                      evento.apresentacoes.length > 0
                        ? evento.apresentacoes.join(' / ')
                        : 'A definir'
                    }
                  />
                </div>

                {evento.formularioUrl && (
                  <div className="mb-5 rounded-xl bg-[#f0f6ff] border border-[#d4e4ff] p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <Paperclip className="w-5 h-5 text-[#2d5f4f] mt-0.5" />

                      <div>
                        <p className="text-[#2d5f4f]">Formulário associado</p>
                        <p className="text-sm text-[#7a9a8c]">
                          Usado para inscrições, confirmações ou autorizações.
                        </p>
                      </div>
                    </div>

                    {(isEncarregado || isCoordenacao) && (
                      <button
                        onClick={() => abrirFormulario(evento)}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f8faf9] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Abrir formulário
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <DetailCard
                    icon={<Shirt className="w-5 h-5 text-[#2d5f4f]" />}
                    title="Figurino"
                    items={evento.figurino}
                    emptyText="Sem indicações de figurino."
                  />

                  <DetailCard
                    icon={<Sparkles className="w-5 h-5 text-[#2d5f4f]" />}
                    title="Acessórios"
                    items={evento.acessorios}
                    emptyText="Sem acessórios indicados."
                  />

                  <DetailCard
                    icon={<Brush className="w-5 h-5 text-[#2d5f4f]" />}
                    title="Penteado e maquilhagem"
                    items={[
                      evento.penteado ? `Penteado: ${evento.penteado}` : '',
                      evento.maquilhagem ? `Maquilhagem: ${evento.maquilhagem}` : '',
                    ].filter(Boolean)}
                    emptyText="Sem indicações de penteado ou maquilhagem."
                  />

                  <DetailCard
                    icon={<Megaphone className="w-5 h-5 text-[#2d5f4f]" />}
                    title="Observações"
                    items={evento.observacoes ? [evento.observacoes] : []}
                    emptyText="Sem observações adicionais."
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      {modalEventoAberta && (
        <Modal onClose={fecharModalEvento}>
          <ModalHeader
            title={modoEdicao ? 'Gerir evento/comunicado' : 'Criar evento/comunicado'}
            subtitle="Título, descrição, data e estado ficam guardados. Os detalhes extra ficam visíveis nesta sessão."
            onClose={fecharModalEvento}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Título">
              <input
                value={eventoForm.titulo}
                onChange={(event) => atualizarForm('titulo', event.target.value)}
                className="inputEntartes"
                placeholder="Ex.: VII Gala Primavera"
              />
            </FormField>

            <FormField label="Data">
              <input
                value={eventoForm.data}
                onChange={(event) => atualizarForm('data', event.target.value)}
                type="date"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Local">
              <input
                value={eventoForm.local}
                onChange={(event) => atualizarForm('local', event.target.value)}
                className="inputEntartes"
                placeholder="Ex.: Espaço Vita"
              />
            </FormField>

            <FormField label="Estado">
              <select
                value={eventoForm.estado}
                onChange={(event) => atualizarForm('estado', event.target.value as EstadoEvento)}
                className="inputEntartes"
              >
                <option value="ATIVO">Ativo</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Descrição / comunicado">
                <textarea
                  value={eventoForm.descricao}
                  onChange={(event) => atualizarForm('descricao', event.target.value)}
                  className="inputEntartes min-h-24 resize-none"
                  placeholder="Texto do comunicado..."
                />
              </FormField>
            </div>

            <FormField label="Apresentações / sessões">
              <textarea
                value={eventoForm.apresentacoesTexto}
                onChange={(event) => atualizarForm('apresentacoesTexto', event.target.value)}
                className="inputEntartes min-h-24 resize-none"
                placeholder="Uma sessão por linha"
              />
            </FormField>

            <FormField label="URL do formulário">
              <input
                value={eventoForm.formularioUrl}
                onChange={(event) => atualizarForm('formularioUrl', event.target.value)}
                className="inputEntartes"
                placeholder="https://..."
              />
            </FormField>

            <FormField label="Figurino">
              <textarea
                value={eventoForm.figurinoTexto}
                onChange={(event) => atualizarForm('figurinoTexto', event.target.value)}
                className="inputEntartes min-h-24 resize-none"
                placeholder="Uma indicação por linha"
              />
            </FormField>

            <FormField label="Acessórios">
              <textarea
                value={eventoForm.acessoriosTexto}
                onChange={(event) => atualizarForm('acessoriosTexto', event.target.value)}
                className="inputEntartes min-h-24 resize-none"
                placeholder="Um acessório por linha"
              />
            </FormField>

            <FormField label="Penteado">
              <input
                value={eventoForm.penteado}
                onChange={(event) => atualizarForm('penteado', event.target.value)}
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Maquilhagem">
              <input
                value={eventoForm.maquilhagem}
                onChange={(event) => atualizarForm('maquilhagem', event.target.value)}
                className="inputEntartes"
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Observações">
                <textarea
                  value={eventoForm.observacoes}
                  onChange={(event) => atualizarForm('observacoes', event.target.value)}
                  className="inputEntartes min-h-24 resize-none"
                />
              </FormField>
            </div>
          </div>

          <ModalActions
            cancelLabel="Cancelar"
            confirmLabel={modoEdicao ? 'Guardar alterações' : 'Criar evento'}
            onCancel={fecharModalEvento}
            onConfirm={() => void guardarEvento()}
          />
        </Modal>
      )}

      {eventoComunicado && (
        <Modal onClose={() => setEventoComunicado(null)}>
          <ModalHeader
            title={eventoComunicado.titulo}
            subtitle="Comunicado do evento"
            onClose={() => setEventoComunicado(null)}
          />

          <div className="space-y-5">
            <InfoBlock
              icon={<CalendarDays className="w-4 h-4 text-[#2d5f4f]" />}
              label="Data e local"
              value={`${formatDate(eventoComunicado.data)} · ${eventoComunicado.local}`}
            />

            <div className="rounded-xl bg-[#f8faf9] border border-[#e8f0ed] p-4">
              <p className="text-sm text-[#5a7a6c] whitespace-pre-line">
                {eventoComunicado.descricao || 'Sem comunicado detalhado.'}
              </p>
            </div>

            <DetailCard
              icon={<Shirt className="w-5 h-5 text-[#2d5f4f]" />}
              title="Indicações de figurino"
              items={eventoComunicado.figurino}
              emptyText="Sem indicações de figurino."
            />
          </div>
        </Modal>
      )}

      {eventoThread && (
        <Modal onClose={fecharThread}>
          <ModalHeader
            title={`Comunicados · ${eventoThread.titulo}`}
            subtitle="Mural de comunicados do evento partilhado com alunos e encarregados."
            onClose={fecharThread}
          />

          <div className="space-y-3 mb-5 max-h-[40vh] overflow-y-auto pr-1">
            {eventoThread.comunicados.length === 0 ? (
              <div className="rounded-xl bg-[#f8faf9] border border-[#e8f0ed] p-6 text-center">
                <Megaphone className="w-8 h-8 text-[#7a9a8c] mx-auto mb-2" />
                <p className="text-sm text-[#7a9a8c]">
                  Ainda não há comunicados para este evento.
                </p>
              </div>
            ) : (
              eventoThread.comunicados.map((comunicado) => (
                <div
                  key={comunicado.id}
                  className="rounded-xl bg-[#f8faf9] border border-[#e8f0ed] p-4"
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="text-sm text-[#2d5f4f]">
                      {comunicado.autorNome}
                      {comunicado.autorPerfil ? ` · ${comunicado.autorPerfil}` : ''}
                    </p>

                    {comunicado.data && (
                      <p className="text-xs text-[#7a9a8c]">{formatDate(comunicado.data)}</p>
                    )}
                  </div>

                  <p className="text-sm text-[#5a7a6c] whitespace-pre-line">
                    {comunicado.mensagem}
                  </p>
                </div>
              ))
            )}
          </div>

          {podePublicarComunicado ? (
            <div className="rounded-xl border border-[#d9e8e1] p-4">
              <FormField label="Novo comunicado">
                <textarea
                  value={novoComunicado}
                  onChange={(event) => setNovoComunicado(event.target.value)}
                  className="inputEntartes min-h-24 resize-none"
                  placeholder="Escreve um comunicado para o evento..."
                />
              </FormField>

              <div className="flex justify-end mt-3">
                <button
                  onClick={() => void publicarComunicado()}
                  disabled={enviandoComunicado}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors disabled:opacity-70"
                >
                  <Megaphone className="w-4 h-4" />
                  {enviandoComunicado ? 'A publicar...' : 'Publicar comunicado'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#7a9a8c]">
              Os comunicados são publicados pela coordenação e pelos professores.
            </p>
          )}
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

function InfoBlock({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#f8faf9] border border-[#e8f0ed] p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs text-[#7a9a8c]">{label}</p>
      </div>

      <p className="text-sm text-[#2d5f4f]">{value}</p>
    </div>
  );
}

function DetailCard({
  icon,
  title,
  items,
  emptyText,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <div className="rounded-xl bg-[#f8faf9] border border-[#e8f0ed] p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-[#2d5f4f]">{title}</h3>
      </div>

      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="text-sm text-[#5a7a6c]">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#7a9a8c]">{emptyText}</p>
      )}
    </div>
  );
}
