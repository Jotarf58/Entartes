import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Calendar,
  Image as ImageIcon,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Tag,
  Upload,
  X,
} from 'lucide-react';

import { modalidades, type TipoFigurinoAcessorio } from '../data/mockEntartes';
import {
  Toast,
  inferirTipoMensagem,
  limparMensagemBackend,
  type ToastData,
} from '../components/Toast';

import {
  aceitarRequisicaoInventario,
  criarItemInventario,
  editarItemInventario,
  encerrarItemInventario,
  listarInventario,
  rejeitarRequisicaoInventario,
  requisitarItemInventario,
  sugerirDataRequisicaoInventario,
  type MarketplaceItemApp,
  type OrigemInventarioBackend,
  type RequisicaoBackend,
} from '../services/inventarioService';

const META_REGEX = /\n?\[ENTARTES_META ([^\]]+)\]\s*$/;

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

type TipoFiltro = 'TODOS' | TipoFigurinoAcessorio;

type MarketplaceItem = Omit<MarketplaceItemApp, 'tipo' | 'origem'> & {
  tipo: TipoFigurinoAcessorio;
  origem: string;
  origemNome: string;
  contactoEmail: string;
  contactoTelefone: string;
};

type FormItem = {
  nome: string;
  descricao: string;
  tipo: TipoFigurinoAcessorio;
  modalidade: string;
  tamanho: string;
  estadoConservacao: string;
  origem: string;
  dataInicioDisponibilidade: string;
  dataFimDisponibilidade: string;
  preco: string;
  imagemUrl: string;
  origemNome: string;
  contactoEmail: string;
  contactoTelefone: string;
};

const tipoLabels: Record<TipoFigurinoAcessorio, string> = {
  FIGURINO: 'Figurino',
  ACESSORIO: 'Acessório',
  CALCADO: 'Calçado',
  MAQUILHAGEM: 'Maquilhagem',
  OUTRO: 'Outro',
};

const estadoAnuncioLabels: Record<string, string> = {
  PUBLICADO: 'Publicado',
  ATIVO: 'Ativo',
  RESERVADO: 'Reservado',
  CONCLUIDO: 'Concluído',
  INATIVO: 'Inativo',
  ENCERRADO: 'Encerrado',
};

const estadoRequisicaoLabels: Record<string, string> = {
  PENDENTE: 'Pendente',
  ACEITE: 'Aceite',
  REJEITADA: 'Rejeitada',
};

function criarFormularioVazio(): FormItem {
  return {
    nome: '',
    descricao: '',
    tipo: 'FIGURINO',
    modalidade: modalidades[0] ?? 'Ballet',
    tamanho: '',
    estadoConservacao: 'Bom',
    origem: 'Família',
    dataInicioDisponibilidade: '2026-01-01',
    dataFimDisponibilidade: '2026-12-31',
    preco: '10',
    imagemUrl: '',
    origemNome: '',
    contactoEmail: '',
    contactoTelefone: '',
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocorreu um erro ao comunicar com o backend.';
}

function formatDate(date: string) {
  if (!date) {
    return 'sem data definida';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'sem data definida';
  }

  return new Intl.DateTimeFormat('pt-PT').format(parsedDate);
}

function normalizarTipo(value: string): TipoFigurinoAcessorio {
  const texto = value.toUpperCase();

  if (texto.includes('ACESS')) return 'ACESSORIO';
  if (texto.includes('CAL')) return 'CALCADO';
  if (texto.includes('MAQ')) return 'MAQUILHAGEM';
  if (texto.includes('OUTRO')) return 'OUTRO';

  return 'FIGURINO';
}

function getOrigemBackend(role: UserRole): OrigemInventarioBackend {
  if (role === 'COORDENACAO' || role === 'PROFESSOR') {
    return 'ESCOLA';
  }

  if (role === 'ALUNO') {
    return 'ALUNO';
  }

  return 'ENCARREGADO';
}

function getOrigemLabel(value: string) {
  if (value === 'ESCOLA') return 'Escola';
  if (value === 'ALUNO') return 'Aluno';
  if (value === 'ENCARREGADO') return 'Encarregado';

  return value || 'Família';
}

function getCurrentUserId(currentUser: CurrentUser) {
  return currentUser.perfilId ?? currentUser.contaId ?? currentUser.email ?? currentUser.name;
}

function parseMeta(descricao: string) {
  const match = descricao.match(META_REGEX);

  if (!match) {
    return {} as Partial<FormItem>;
  }

  const meta: Partial<FormItem> = {};
  const parts = match[1].split(';').map((part) => part.trim());

  for (const part of parts) {
    const [key, ...valueParts] = part.split('=');
    const value = valueParts.join('=').trim();

    if (!key || !value) continue;

    if (key === 'tipo') meta.tipo = normalizarTipo(value);
    if (key === 'modalidade') meta.modalidade = value;
    if (key === 'tamanho') meta.tamanho = value;
    if (key === 'imagemUrl') meta.imagemUrl = value;
    if (key === 'inicio') meta.dataInicioDisponibilidade = value;
    if (key === 'fim') meta.dataFimDisponibilidade = value;
    if (key === 'origemNome') meta.origemNome = value;
    if (key === 'contactoEmail') meta.contactoEmail = value;
    if (key === 'contactoTelefone') meta.contactoTelefone = value;
  }

  return meta;
}

function limparDescricao(descricao: string) {
  return descricao.replace(META_REGEX, '').trim();
}

function criarDescricaoBackend(formItem: FormItem) {
  const meta = [
    `tipo=${formItem.tipo}`,
    `modalidade=${formItem.modalidade}`,
    `tamanho=${formItem.tamanho}`,
    `inicio=${formItem.dataInicioDisponibilidade}`,
    `fim=${formItem.dataFimDisponibilidade}`,
    `origemNome=${formItem.origemNome}`,
    `contactoEmail=${formItem.contactoEmail}`,
    `contactoTelefone=${formItem.contactoTelefone}`,
  ].join('; ');

  return `${formItem.descricao.trim()}\n[ENTARTES_META ${meta}]`;
}

function normalizarItemBackend(item: MarketplaceItemApp): MarketplaceItem {
  const meta = parseMeta(item.descricao);

  return {
    ...item,
    descricao: limparDescricao(item.descricao),
    tipo: meta.tipo ?? normalizarTipo(item.tipo),
    modalidade: meta.modalidade ?? item.modalidade,
    tamanho: meta.tamanho ?? item.tamanho,
    imagemUrl: meta.imagemUrl ?? item.imagemUrl,
    dataInicioDisponibilidade:
      meta.dataInicioDisponibilidade ?? item.dataInicioDisponibilidade,
    dataFimDisponibilidade: meta.dataFimDisponibilidade ?? item.dataFimDisponibilidade,
    origem: getOrigemLabel(item.origem),
    origemNome: meta.origemNome ?? '',
    contactoEmail: meta.contactoEmail ?? '',
    contactoTelefone: meta.contactoTelefone ?? '',
  };
}

function getSubtitle(role: UserRole) {
  if (role === 'ALUNO') {
    return 'Consulta figurinos, acessórios e materiais disponíveis para eventos.';
  }

  if (role === 'ENCARREGADO') {
    return 'Consulta, solicita e publica figurinos/acessórios associados ao educando.';
  }

  if (role === 'PROFESSOR') {
    return 'Consulta materiais disponíveis e publica figurinos/acessórios associados às aulas ou eventos.';
  }

  return 'Gestão global de figurinos, acessórios, calçado, maquilhagem e materiais da escola.';
}

function getRequisicaoId(requisicao: RequisicaoBackend) {
  return requisicao._id ?? requisicao.id ?? '';
}


function isMongoObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value.trim());
}

function getOrigemLabelParaRole(role: UserRole) {
  if (role === 'COORDENACAO' || role === 'PROFESSOR') return 'Escola';
  if (role === 'ALUNO') return 'Aluno';

  return 'Encarregado';
}

function getOrigemComNome(
  item: MarketplaceItem,
  currentUser?: CurrentUser,
  currentUserIds: string[] = []
) {
  const nome = item.origemNome?.trim();
  const itemDoUtilizadorAtual = currentUserIds.filter(Boolean).includes(item.utilizadorId);

  if (itemDoUtilizadorAtual && currentUser?.name) {
    return `${getOrigemLabelParaRole(currentUser.role)} — ${currentUser.name}`;
  }

  if (nome && !isMongoObjectId(nome)) {
    return nome;
  }

  if (item.origem === 'ESCOLA' || item.origem === 'Escola') {
    return 'Escola — Ent’Artes';
  }

  if (item.origem === 'ENCARREGADO' || item.origem === 'Encarregado') {
    return 'Encarregado responsável';
  }

  if (item.origem === 'ALUNO' || item.origem === 'Aluno') {
    return 'Aluno responsável';
  }

  return item.origem || 'Responsável não identificado';
}

function getContactoItem(item: MarketplaceItem) {
  const contactos = [item.contactoEmail, item.contactoTelefone]
    .map((contacto) => contacto?.trim())
    .filter(Boolean);

  return contactos.length > 0 ? contactos.join(' · ') : 'Contacto não indicado';
}

function getPeriodoAluguer(item: MarketplaceItem) {
  return `${formatDate(item.dataInicioDisponibilidade)} a ${formatDate(
    item.dataFimDisponibilidade
  )}`;
}

function getTaxaAluguer(item: MarketplaceItem) {
  return `${item.preco}€ / período de aluguer`;
}

function getRequisicaoNome(requisicao: RequisicaoBackend) {
  const nome = requisicao.perfilNome?.trim();

  if (nome && !isMongoObjectId(nome)) {
    return nome;
  }

  return requisicao.utilizadorId;
}

function getPeriodoRequisicao(requisicao: RequisicaoBackend) {
  if (!requisicao.dataInicio && !requisicao.dataFim) {
    return '';
  }

  return `${formatDate(requisicao.dataInicio ?? '')} a ${formatDate(requisicao.dataFim ?? '')}`;
}

function contarRequisicoesPendentes(item: MarketplaceItem) {
  return item.requisicoes.filter((requisicao) => requisicao.estado === 'PENDENTE').length;
}

function getDataSugerida(requisicao: RequisicaoBackend) {
  if (!requisicao.dataSugeridaInicio && !requisicao.dataSugeridaFim) {
    return '';
  }

  return `${formatDate(requisicao.dataSugeridaInicio ?? '')} a ${formatDate(
    requisicao.dataSugeridaFim ?? ''
  )}`;
}

function itemAlugado(item: MarketplaceItem) {
  return item.estadoAnuncio === 'RESERVADO';
}

function getEstadoDisponibilidade(item: MarketplaceItem) {
  if (itemAlugado(item) && item.alugadoAte) {
    return `Alugado até ${formatDate(item.alugadoAte)}`;
  }

  if (item.estadoAnuncio === 'ATIVO' || item.estadoAnuncio === 'PUBLICADO') {
    return 'Disponível';
  }

  return estadoAnuncioLabels[item.estadoAnuncio] ?? item.estadoAnuncio;
}

export default function Marketplace({ currentUser }: { currentUser: CurrentUser }) {
  const isAluno = currentUser.role === 'ALUNO';
  const isEncarregado = currentUser.role === 'ENCARREGADO';
  const isProfessor = currentUser.role === 'PROFESSOR';
  const isCoordenacao = currentUser.role === 'COORDENACAO';

  const podePublicar = isEncarregado || isProfessor || isCoordenacao;
  const currentUserId = getCurrentUserId(currentUser);
  const currentUserIds = useMemo(
    () =>
      [
        currentUser.perfilId,
        currentUser.contaId,
        currentUser.email,
        currentUser.name,
        currentUserId,
      ].filter(Boolean) as string[],
    [
      currentUser.perfilId,
      currentUser.contaId,
      currentUser.email,
      currentUser.name,
      currentUserId,
    ]
  );
  const mostraMeusAnuncios = isEncarregado || isProfessor || isCoordenacao;

  const [itens, setItens] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [pesquisa, setPesquisa] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>('TODOS');
  const [modalidadeFiltro, setModalidadeFiltro] = useState('TODAS');

  const [modalAberta, setModalAberta] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [itemEditandoId, setItemEditandoId] = useState<string | null>(null);
  const [formItem, setFormItem] = useState<FormItem>(criarFormularioVazio());

  const [detalheItem, setDetalheItem] = useState<MarketplaceItem | null>(null);
  const [pedidosAluguer, setPedidosAluguer] = useState<string[]>([]);
  const [toast, setToast] = useState<ToastData | null>(null);

  function setMensagemSucesso(texto: string) {
    if (!texto) {
      setToast(null);
      return;
    }

    setToast({ mensagem: limparMensagemBackend(texto), tipo: inferirTipoMensagem(texto) });
  }

  const [itemAluguer, setItemAluguer] = useState<MarketplaceItem | null>(null);
  const [aluguerInicio, setAluguerInicio] = useState('');
  const [aluguerFim, setAluguerFim] = useState('');
  const [importarEscolaId, setImportarEscolaId] = useState('');

  const [itemSugestao, setItemSugestao] = useState<MarketplaceItem | null>(null);
  const [requisicaoSugestao, setRequisicaoSugestao] = useState<RequisicaoBackend | null>(null);
  const [sugestaoInicio, setSugestaoInicio] = useState('');
  const [sugestaoFim, setSugestaoFim] = useState('');
  const [sugestaoMensagem, setSugestaoMensagem] = useState('');

  const itensEscola = useMemo(
    () => itens.filter((item) => item.origem === 'ESCOLA' || item.origem === 'Escola'),
    [itens]
  );

  useEffect(() => {
    async function carregarInventario() {
      try {
        setIsLoading(true);
        setMensagemSucesso('');

        const itensBackend = await listarInventario();

        setItens(itensBackend.map(normalizarItemBackend));
      } catch (error) {
        setItens([]);
        setMensagemSucesso(
          `Não foi possível carregar o inventário. ${getErrorMessage(error)}`
        );
      } finally {
        setIsLoading(false);
      }
    }

    void carregarInventario();
  }, []);

  const ehMeuAnuncio = useCallback(
    (item: MarketplaceItem) => {
      const donoPorId = currentUserIds.includes(item.utilizadorId);
      const donoPorNome = item.origemNome === currentUser.name;
      const donoPorEmail = Boolean(currentUser.email) && item.contactoEmail === currentUser.email;

      return donoPorId || donoPorNome || donoPorEmail;
    },
    [currentUserIds, currentUser.name, currentUser.email]
  );

  const itensFiltrados = useMemo(() => {
    return itens.filter((item) => {
      if (ehMeuAnuncio(item)) {
        return false;
      }

      const pesquisaNormalizada = pesquisa.trim().toLowerCase();

      const correspondePesquisa =
        !pesquisaNormalizada ||
        item.nome.toLowerCase().includes(pesquisaNormalizada) ||
        item.descricao.toLowerCase().includes(pesquisaNormalizada) ||
        item.modalidade.toLowerCase().includes(pesquisaNormalizada) ||
        item.origemNome.toLowerCase().includes(pesquisaNormalizada) ||
        item.contactoEmail.toLowerCase().includes(pesquisaNormalizada) ||
        item.contactoTelefone.toLowerCase().includes(pesquisaNormalizada);

      const correspondeTipo = tipoFiltro === 'TODOS' || item.tipo === tipoFiltro;

      const correspondeModalidade =
        modalidadeFiltro === 'TODAS' || item.modalidade === modalidadeFiltro;

      return correspondePesquisa && correspondeTipo && correspondeModalidade;
    });
  }, [itens, pesquisa, tipoFiltro, modalidadeFiltro, ehMeuAnuncio]);

  const meusAnuncios = useMemo(() => {
    return itens.filter((item) => ehMeuAnuncio(item));
  }, [itens, ehMeuAnuncio]);

  const totalFigurinos = itens.filter((item) => item.tipo === 'FIGURINO').length;
  const totalAcessorios = itens.filter((item) => item.tipo === 'ACESSORIO').length;

  const precoMedio =
    itens.length > 0
      ? Math.round(itens.reduce((total, item) => total + item.preco, 0) / itens.length)
      : 0;

  function atualizarItemNaLista(itemAtualizado: MarketplaceItem) {
    setItens((atuais) =>
      atuais.map((item) => (item.id === itemAtualizado.id ? itemAtualizado : item))
    );

    setDetalheItem((atual) =>
      atual?.id === itemAtualizado.id ? itemAtualizado : atual
    );
  }

  function abrirModalPublicar() {
    setModoEdicao(false);
    setItemEditandoId(null);
    setImportarEscolaId('');
    setFormItem({
      ...criarFormularioVazio(),
      origemNome: currentUser.name,
      contactoEmail: currentUser.email ?? '',
    });
    setModalAberta(true);
    setMensagemSucesso('');
  }

  function abrirModalEditar(item: MarketplaceItem) {
    setModoEdicao(true);
    setItemEditandoId(item.id);
    setFormItem({
      nome: item.nome,
      descricao: item.descricao,
      tipo: item.tipo,
      modalidade: item.modalidade,
      tamanho: item.tamanho,
      estadoConservacao: item.estadoConservacao,
      origem: item.origem,
      dataInicioDisponibilidade: item.dataInicioDisponibilidade || '2026-01-01',
      dataFimDisponibilidade: item.dataFimDisponibilidade || '2026-12-31',
      preco: String(item.preco),
      imagemUrl: item.imagemUrl,
      origemNome: item.origemNome,
      contactoEmail: item.contactoEmail,
      contactoTelefone: item.contactoTelefone,
    });
    setModalAberta(true);
    setMensagemSucesso('');
  }

  function fecharModal() {
    setModalAberta(false);
    setModoEdicao(false);
    setItemEditandoId(null);
  }

  async function guardarItem() {
    if (!formItem.nome.trim() || !formItem.descricao.trim() || !formItem.tamanho.trim()) {
      setMensagemSucesso('Preenche pelo menos o nome, descrição e tamanho.');
      return;
    }

    const precoNumerico = Number(formItem.preco);

    if (Number.isNaN(precoNumerico) || precoNumerico < 0) {
      setMensagemSucesso('A taxa tem de ser um número válido.');
      return;
    }

    try {
      setIsSaving(true);
      setMensagemSucesso('');

      if (modoEdicao && itemEditandoId) {
        const itemOriginal = itens.find((item) => item.id === itemEditandoId);

        const itemAtualizado = await editarItemInventario(itemEditandoId, {
          titulo: formItem.nome,
          descricao: criarDescricaoBackend(formItem),
          estadoConservacao: formItem.estadoConservacao,
          tipoTransacao: 'ALUGAR',
          preco: precoNumerico,
          taxaSimbolica: precoNumerico,
          imagemUrl: formItem.imagemUrl,
        });

        const itemNormalizado = normalizarItemBackend(itemAtualizado);

        atualizarItemNaLista({
          ...itemOriginal,
          ...itemNormalizado,
          id: itemEditandoId,
          nome: formItem.nome,
          descricao: formItem.descricao,
          tipo: formItem.tipo,
          modalidade: formItem.modalidade,
          tamanho: formItem.tamanho,
          estadoConservacao: formItem.estadoConservacao,
          origem: formItem.origem,
          dataInicioDisponibilidade: formItem.dataInicioDisponibilidade,
          dataFimDisponibilidade: formItem.dataFimDisponibilidade,
          preco: precoNumerico,
          imagemUrl: formItem.imagemUrl,
          origemNome: formItem.origemNome,
          contactoEmail: formItem.contactoEmail,
          contactoTelefone: formItem.contactoTelefone,
          estadoAnuncio:
            itemNormalizado.estadoAnuncio ?? itemOriginal?.estadoAnuncio ?? 'ATIVO',
          utilizadorId:
            itemNormalizado.utilizadorId ?? itemOriginal?.utilizadorId ?? currentUserId,
          requisicoes: itemNormalizado.requisicoes ?? itemOriginal?.requisicoes ?? [],
        } as MarketplaceItem);

        setMensagemSucesso('Item atualizado com sucesso.');
        fecharModal();
        return;
      }

      const novoItem = await criarItemInventario({
        titulo: formItem.nome,
        descricao: criarDescricaoBackend(formItem),
        estadoConservacao: formItem.estadoConservacao,
        tipoTransacao: 'ALUGAR',
        preco: precoNumerico,
        utilizadorId: currentUserId,
        origem: getOrigemBackend(currentUser.role),
        imagemUrl: formItem.imagemUrl,
      });

      setItens((atuais) => [
        {
          ...normalizarItemBackend(novoItem),
          origemNome: formItem.origemNome || currentUser.name,
          contactoEmail: formItem.contactoEmail,
          contactoTelefone: formItem.contactoTelefone,
        },
        ...atuais,
      ]);
      setMensagemSucesso('Figurino/acessório publicado com sucesso.');
      fecharModal();
    } catch (error) {
      setMensagemSucesso(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  function abrirPedidoAluguer(item: MarketplaceItem) {
    setItemAluguer(item);
    setAluguerInicio(item.dataInicioDisponibilidade || '');
    setAluguerFim(item.dataFimDisponibilidade || '');
    setMensagemSucesso('');
  }

  function fecharPedidoAluguer() {
    setItemAluguer(null);
    setAluguerInicio('');
    setAluguerFim('');
  }

  async function confirmarAluguer() {
    if (!itemAluguer) return;

    if (!aluguerInicio || !aluguerFim) {
      setMensagemSucesso('Escolhe as datas de início e fim do aluguer.');
      return;
    }

    if (aluguerInicio > aluguerFim) {
      setMensagemSucesso('A data de início não pode ser posterior à data de fim.');
      return;
    }

    const inicioDisponivel = itemAluguer.dataInicioDisponibilidade;
    const fimDisponivel = itemAluguer.dataFimDisponibilidade;

    if (
      (inicioDisponivel && aluguerInicio < inicioDisponivel) ||
      (fimDisponivel && aluguerFim > fimDisponivel)
    ) {
      setMensagemSucesso(
        `As datas têm de estar dentro do período disponível (${getPeriodoAluguer(itemAluguer)}).`
      );
      return;
    }

    try {
      setIsSaving(true);
      setMensagemSucesso('');

      const itemAtualizado = await requisitarItemInventario(itemAluguer.id, {
        utilizadorId: currentUserId,
        perfilNome: currentUser.name,
        mensagem: `Pedido de aluguer de ${formatDate(aluguerInicio)} a ${formatDate(
          aluguerFim
        )} feito por ${currentUser.name}.`,
        dataInicio: aluguerInicio,
        dataFim: aluguerFim,
      });

      atualizarItemNaLista(normalizarItemBackend(itemAtualizado));
      setPedidosAluguer((atuais) =>
        atuais.includes(itemAluguer.id) ? atuais : [...atuais, itemAluguer.id]
      );
      setMensagemSucesso(`Pedido de aluguer enviado para "${itemAluguer.nome}".`);
      fecharPedidoAluguer();
    } catch (error) {
      setMensagemSucesso(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  function importarItemEscola(itemId: string) {
    setImportarEscolaId(itemId);

    if (!itemId) return;

    const base = itens.find((item) => item.id === itemId);

    if (!base) return;

    setFormItem((atual) => ({
      ...atual,
      nome: base.nome,
      descricao: base.descricao,
      tipo: base.tipo,
      modalidade: base.modalidade,
      tamanho: base.tamanho,
      estadoConservacao: base.estadoConservacao,
      origem: 'Escola',
      dataInicioDisponibilidade: base.dataInicioDisponibilidade || atual.dataInicioDisponibilidade,
      dataFimDisponibilidade: base.dataFimDisponibilidade || atual.dataFimDisponibilidade,
      preco: String(base.preco),
      imagemUrl: base.imagemUrl,
    }));
  }

  async function encerrarAnuncioAtual() {
    if (!itemEditandoId) return;

    const deveEncerrar = window.confirm(
      'Tens a certeza que queres remover/encerrar este anúncio do marketplace?'
    );

    if (!deveEncerrar) return;

    try {
      setIsSaving(true);
      setMensagemSucesso('');

      await encerrarItemInventario(itemEditandoId);

      setItens((atuais) => atuais.filter((item) => item.id !== itemEditandoId));
      setDetalheItem(null);

      setMensagemSucesso('Anúncio removido do marketplace.');
      fecharModal();
    } catch (error) {
      setMensagemSucesso(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function aceitarRequisicao(item: MarketplaceItem, requisicao: RequisicaoBackend) {
    const requisicaoId = getRequisicaoId(requisicao);

    if (!requisicaoId) {
      setMensagemSucesso('Não foi possível identificar a requisição.');
      return;
    }

    try {
      const itemAtualizado = await aceitarRequisicaoInventario(item.id, requisicaoId);

      atualizarItemNaLista(normalizarItemBackend(itemAtualizado));
      setMensagemSucesso('Requisição aceite com sucesso.');
    } catch (error) {
      setMensagemSucesso(getErrorMessage(error));
    }
  }

  async function rejeitarRequisicao(item: MarketplaceItem, requisicao: RequisicaoBackend) {
    const requisicaoId = getRequisicaoId(requisicao);

    if (!requisicaoId) {
      setMensagemSucesso('Não foi possível identificar a requisição.');
      return;
    }

    try {
      const itemAtualizado = await rejeitarRequisicaoInventario(item.id, requisicaoId);

      atualizarItemNaLista(normalizarItemBackend(itemAtualizado));
      setMensagemSucesso('Requisição rejeitada com sucesso.');
    } catch (error) {
      setMensagemSucesso(getErrorMessage(error));
    }
  }


  function handleUploadImagem(file: File | undefined) {
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      setMensagemSucesso('A imagem é demasiado grande (máx. 1.5 MB).');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        atualizarForm('imagemUrl', reader.result);
      }
    };

    reader.readAsDataURL(file);
  }

  function abrirSugestao(item: MarketplaceItem, requisicao: RequisicaoBackend) {
    setItemSugestao(item);
    setRequisicaoSugestao(requisicao);
    setSugestaoInicio(requisicao.dataInicio ?? item.dataInicioDisponibilidade ?? '');
    setSugestaoFim(requisicao.dataFim ?? item.dataFimDisponibilidade ?? '');
    setSugestaoMensagem('');
    setMensagemSucesso('');
  }

  function fecharSugestao() {
    setItemSugestao(null);
    setRequisicaoSugestao(null);
    setSugestaoInicio('');
    setSugestaoFim('');
    setSugestaoMensagem('');
  }

  async function confirmarSugestao() {
    if (!itemSugestao || !requisicaoSugestao) return;

    if (!sugestaoInicio || !sugestaoFim) {
      setMensagemSucesso('Indica as novas datas a sugerir.');
      return;
    }

    if (sugestaoInicio > sugestaoFim) {
      setMensagemSucesso('A data de início não pode ser posterior à data de fim.');
      return;
    }

    const requisicaoId = getRequisicaoId(requisicaoSugestao);

    if (!requisicaoId) {
      setMensagemSucesso('Não foi possível identificar a requisição.');
      return;
    }

    try {
      setIsSaving(true);

      const itemAtualizado = await sugerirDataRequisicaoInventario(itemSugestao.id, requisicaoId, {
        dataSugeridaInicio: sugestaoInicio,
        dataSugeridaFim: sugestaoFim,
        mensagemResposta: sugestaoMensagem,
      });

      atualizarItemNaLista(normalizarItemBackend(itemAtualizado));
      setMensagemSucesso('Sugestão de nova data enviada ao interessado.');
      fecharSugestao();
    } catch (error) {
      setMensagemSucesso(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  function atualizarForm<K extends keyof FormItem>(campo: K, valor: FormItem[K]) {
    setFormItem((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  return (
    <div className="p-8 max-w-[1500px] mx-auto">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full bg-[#d4e8df] text-[#2d5f4f] text-sm">
              {currentUser.roleLabel}
            </span>

            {isLoading && (
              <span className="px-3 py-1 rounded-full bg-[#f0f6f3] text-[#5a7a6c] text-sm">
                A carregar inventário...
              </span>
            )}

            {isAluno && (
              <span className="px-3 py-1 rounded-full bg-[#f0f6f3] text-[#5a7a6c] text-sm">
                Apenas consulta e aluguer
              </span>
            )}

            {isEncarregado && (
              <span className="px-3 py-1 rounded-full bg-[#d4e8ff] text-[#2d5f4f] text-sm">
                Pode publicar
              </span>
            )}

            {isCoordenacao && (
              <span className="px-3 py-1 rounded-full bg-[#fff4d4] text-[#8a6d1d] text-sm">
                Gestão global
              </span>
            )}
          </div>

          <h1 className="text-[#2d5f4f] mb-2">Marketplace</h1>

          <p className="text-[#7a9a8c]">{getSubtitle(currentUser.role)}</p>
        </div>

        {podePublicar && (
          <button
            onClick={abrirModalPublicar}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors"
          >
            <Upload className="w-4 h-4" />
            Publicar figurino/acessório
          </button>
        )}
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <SummaryCard
          icon={<ShoppingBag className="w-5 h-5 text-[#2d5f4f]" />}
          label="Itens visíveis"
          value={itensFiltrados.length}
          color="bg-[#d4e8df]"
        />

        <SummaryCard
          icon={<ImageIcon className="w-5 h-5 text-[#2d5f4f]" />}
          label="Figurinos"
          value={totalFigurinos}
          color="bg-[#e8d4ff]"
        />

        <SummaryCard
          icon={<Tag className="w-5 h-5 text-[#2d5f4f]" />}
          label="Acessórios"
          value={totalAcessorios}
          color="bg-[#fff4d4]"
        />

        <SummaryCard
          icon={<ShieldCheck className="w-5 h-5 text-[#2d5f4f]" />}
          label="Taxa média"
          value={precoMedio}
          suffix="€"
          color="bg-[#d4e8ff]"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="w-5 h-5 text-[#2d5f4f]" />
          <h2 className="text-[#2d5f4f]">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#5a7a6c]">Pesquisar</span>

            <div className="relative">
              <Search className="w-4 h-4 text-[#7a9a8c] absolute left-3 top-1/2 -translate-y-1/2" />

              <input
                value={pesquisa}
                onChange={(event) => setPesquisa(event.target.value)}
                placeholder="Ex.: Gala, Ballet, sapatilhas..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#d9e8e1] bg-[#f8faf9] text-[#2d5f4f] outline-none focus:border-[#2d5f4f]"
              />
            </div>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#5a7a6c]">Tipo</span>

            <select
              value={tipoFiltro}
              onChange={(event) => setTipoFiltro(event.target.value as TipoFiltro)}
              className="inputEntartes"
            >
              <option value="TODOS">Todos</option>
              <option value="FIGURINO">Figurinos</option>
              <option value="ACESSORIO">Acessórios</option>
              <option value="CALCADO">Calçado</option>
              <option value="MAQUILHAGEM">Maquilhagem</option>
              <option value="OUTRO">Outro</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#5a7a6c]">Modalidade</span>

            <select
              value={modalidadeFiltro}
              onChange={(event) => setModalidadeFiltro(event.target.value)}
              className="inputEntartes"
            >
              <option value="TODAS">Todas</option>

              {modalidades.map((modalidade) => (
                <option value={modalidade} key={modalidade}>
                  {modalidade}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {mostraMeusAnuncios && (
        <section className="mb-8 bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className="text-[#2d5f4f]">Meus anúncios</h2>
              <p className="text-sm text-[#7a9a8c]">
                Gere os teus anúncios e os pedidos de aluguer recebidos. A disponibilidade é automática:
                o item fica indisponível enquanto está alugado e volta a ficar disponível no fim do período.
              </p>
            </div>

            <button
              onClick={abrirModalPublicar}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors"
            >
              <Upload className="w-4 h-4" />
              Novo anúncio
            </button>
          </div>

          {meusAnuncios.length === 0 ? (
            <p className="text-sm text-[#7a9a8c]">
              Ainda não tens anúncios criados neste perfil.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {meusAnuncios.map((item) => (
                <article
                  key={`meu-${item.id}`}
                  className="rounded-xl border border-[#e8f0ed] bg-[#f8faf9] p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-[#2d5f4f] mb-1">{item.nome}</h3>
                      <p className="text-xs text-[#7a9a8c]">{tipoLabels[item.tipo]} · {item.modalidade}</p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        itemAlugado(item)
                          ? 'bg-[#fff4d4] text-[#8a6d1d]'
                          : 'bg-[#d4e8df] text-[#2d5f4f]'
                      }`}
                    >
                      {getEstadoDisponibilidade(item)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <InfoLine label="Origem" value={getOrigemComNome(item, currentUser, currentUserIds)} />
                    <InfoLine label="Contacto" value={getContactoItem(item)} />
                    <InfoLine label="Disponível" value={getPeriodoAluguer(item)} />
                    <InfoLine label="Taxa" value={getTaxaAluguer(item)} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => abrirModalEditar(item)}
                      className="px-4 py-2 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors"
                    >
                      Editar
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#e8f0ed]">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-[#2d5f4f]">Pedidos recebidos</p>
                      <span className="px-2 py-0.5 rounded-full bg-[#fff4d4] text-[#8a6d1d] text-xs">
                        {contarRequisicoesPendentes(item)} pendentes
                      </span>
                    </div>

                    {item.requisicoes.length === 0 ? (
                      <p className="text-xs text-[#7a9a8c]">Ainda sem pedidos de aluguer.</p>
                    ) : (
                      <div className="space-y-2">
                        {item.requisicoes.map((requisicao) => (
                          <div
                            key={getRequisicaoId(requisicao)}
                            className="rounded-lg bg-white border border-[#e8f0ed] p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm text-[#2d5f4f] truncate">
                                  {getRequisicaoNome(requisicao)}
                                </p>
                                <p className="text-xs text-[#7a9a8c]">
                                  Datas pretendidas:{' '}
                                  {getPeriodoRequisicao(requisicao) || 'não indicadas'}
                                </p>
                                {getDataSugerida(requisicao) && (
                                  <p className="text-xs text-[#8a6d1d]">
                                    Sugerido: {getDataSugerida(requisicao)}
                                  </p>
                                )}
                                <p className="text-xs text-[#7a9a8c]">
                                  {estadoRequisicaoLabels[requisicao.estado] ?? requisicao.estado}
                                </p>
                              </div>

                              {requisicao.estado === 'PENDENTE' && (
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => aceitarRequisicao(item, requisicao)}
                                    className="px-2 py-1 rounded-lg bg-[#2d5f4f] text-white text-xs hover:bg-[#244c40]"
                                  >
                                    Aceitar
                                  </button>

                                  <button
                                    onClick={() => abrirSugestao(item, requisicao)}
                                    className="px-2 py-1 rounded-lg border border-[#d9e8e1] text-[#2d5f4f] text-xs hover:bg-[#f0f6f3]"
                                  >
                                    Sugerir data
                                  </button>

                                  <button
                                    onClick={() => rejeitarRequisicao(item, requisicao)}
                                    className="px-2 py-1 rounded-lg border border-[#ffd2d2] text-[#9a3a3a] text-xs hover:bg-[#fff5f5]"
                                  >
                                    Rejeitar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {itensFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] p-10 text-center">
          <ShoppingBag className="w-10 h-10 text-[#7a9a8c] mx-auto mb-3" />
          <h3 className="text-[#2d5f4f] mb-2">Sem resultados</h3>
          <p className="text-[#7a9a8c]">
            Não foram encontrados figurinos ou acessórios com os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {itensFiltrados.map((item) => {
            const aluguerSolicitado =
              pedidosAluguer.includes(item.id) ||
              item.requisicoes.some((requisicao) => requisicao.utilizadorId === currentUserId);
            const anuncioAtivo = item.estadoAnuncio === 'ATIVO';
            const donoDoItem = item.utilizadorId === currentUserId;
            const podeSolicitar = anuncioAtivo && !donoDoItem;

            return (
              <article
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-[#e8f0ed] overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-52 bg-[#f0f6f3] flex items-center justify-center border-b border-[#e8f0ed]">
                  {item.imagemUrl ? (
                    <img
                      src={item.imagemUrl}
                      alt={item.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-[#7a9a8c]">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-sm">Imagem do figurino/acessório</p>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-[#2d5f4f] mb-1">{item.nome}</h3>
                      <p className="text-sm text-[#7a9a8c]">{item.modalidade}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#d4e8df] text-[#2d5f4f] text-xs whitespace-nowrap">
                        {tipoLabels[item.tipo]}
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                          itemAlugado(item)
                            ? 'bg-[#fff4d4] text-[#8a6d1d]'
                            : 'bg-[#f0f6f3] text-[#5a7a6c]'
                        }`}
                      >
                        {getEstadoDisponibilidade(item)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-[#5a7a6c] mb-4">{item.descricao}</p>

                  <div className="space-y-3 mb-5">
                    <InfoLine label="Tamanho" value={item.tamanho} />
                    <InfoLine label="Estado" value={item.estadoConservacao} />
                    <InfoLine label="Origem" value={getOrigemComNome(item, currentUser, currentUserIds)} />
                    <InfoLine label="Contacto" value={getContactoItem(item)} />

                    <div className="flex items-start gap-2 text-sm text-[#5a7a6c]">
                      <Calendar className="w-4 h-4 mt-0.5 text-[#7a9a8c]" />
                      <span>
                        Aluguer: {getPeriodoAluguer(item)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#e8f0ed]">
                    <div>
                      <p className="text-xs text-[#7a9a8c]">Taxa</p>
                      <p className="text-xl text-[#2d5f4f]">{item.preco}€</p>
                      <p className="text-xs text-[#7a9a8c]">por período de aluguer</p>
                    </div>

                    {(isAluno || isEncarregado) && (
                      <button
                        onClick={() => abrirPedidoAluguer(item)}
                        disabled={aluguerSolicitado || !podeSolicitar}
                        className={`px-4 py-2 rounded-xl transition-colors ${
                          aluguerSolicitado || !podeSolicitar
                            ? 'bg-[#d4e8df] text-[#2d5f4f] cursor-not-allowed'
                            : 'bg-[#2d5f4f] text-white hover:bg-[#244c40]'
                        }`}
                      >
                        {aluguerSolicitado ? 'Solicitado' : 'Solicitar aluguer'}
                      </button>
                    )}

                    {isProfessor && (
                      <button
                        onClick={() => setDetalheItem(item)}
                        className="px-4 py-2 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors"
                      >
                        Ver detalhes
                      </button>
                    )}

                    {isCoordenacao && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setDetalheItem(item)}
                          className="px-4 py-2 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors"
                        >
                          Requisições
                        </button>

                        <button
                          onClick={() => abrirModalEditar(item)}
                          className="px-4 py-2 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors"
                        >
                          Gerir item
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {modalAberta && (
        <Modal onClose={fecharModal}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-[#2d5f4f] mb-1">
                {modoEdicao ? 'Gerir figurino/acessório' : 'Publicar figurino/acessório'}
              </h2>

              <p className="text-sm text-[#7a9a8c]">
                Inclui origem, contactos e o intervalo de aluguer para facilitar a comunicação.
              </p>
            </div>

            <button
              onClick={fecharModal}
              className="p-2 rounded-lg hover:bg-[#f0f6f3]"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5 text-[#2d5f4f]" />
            </button>
          </div>

          {!modoEdicao && itensEscola.length > 0 && (
            <div className="mb-4 rounded-xl bg-[#f0f6f3] border border-[#d9e8e1] p-4">
              <FormField label="Importar do inventário da escola">
                <select
                  value={importarEscolaId}
                  onChange={(event) => importarItemEscola(event.target.value)}
                  className="inputEntartes"
                >
                  <option value="">Começar com um anúncio em branco</option>

                  {itensEscola.map((item) => (
                    <option value={item.id} key={`escola-${item.id}`}>
                      {item.nome} · {tipoLabels[item.tipo]}
                    </option>
                  ))}
                </select>
              </FormField>

              <p className="text-xs text-[#7a9a8c] mt-2">
                Seleciona um item do inventário da escola para preencher automaticamente o anúncio.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nome">
              <input
                value={formItem.nome}
                onChange={(event) => atualizarForm('nome', event.target.value)}
                className="inputEntartes"
                placeholder="Ex.: Figurino Gala Primavera"
              />
            </FormField>

            <FormField label="Tipo">
              <select
                value={formItem.tipo}
                onChange={(event) =>
                  atualizarForm('tipo', event.target.value as TipoFigurinoAcessorio)
                }
                className="inputEntartes"
              >
                <option value="FIGURINO">Figurino</option>
                <option value="ACESSORIO">Acessório</option>
                <option value="CALCADO">Calçado</option>
                <option value="MAQUILHAGEM">Maquilhagem</option>
                <option value="OUTRO">Outro</option>
              </select>
            </FormField>

            <FormField label="Modalidade">
              <select
                value={formItem.modalidade}
                onChange={(event) => atualizarForm('modalidade', event.target.value)}
                className="inputEntartes"
              >
                {modalidades.map((modalidade) => (
                  <option value={modalidade} key={modalidade}>
                    {modalidade}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Tamanho">
              <input
                value={formItem.tamanho}
                onChange={(event) => atualizarForm('tamanho', event.target.value)}
                className="inputEntartes"
                placeholder="Ex.: 10/12 anos, M, 38..."
              />
            </FormField>

            <FormField label="Estado de conservação">
              <input
                value={formItem.estadoConservacao}
                onChange={(event) => atualizarForm('estadoConservacao', event.target.value)}
                className="inputEntartes"
                placeholder="Ex.: Bom, Muito bom, Usado..."
              />
            </FormField>

            <FormField label="Origem">
              <input
                value={formItem.origem}
                onChange={(event) => atualizarForm('origem', event.target.value)}
                className="inputEntartes"
                placeholder="Ex.: Família, Escola, Professor..."
              />
            </FormField>

            <FormField label="Nome da origem/responsável">
              <input
                value={formItem.origemNome}
                onChange={(event) => atualizarForm('origemNome', event.target.value)}
                className="inputEntartes"
                placeholder="Ex.: João Silva, Diana Sá Carneiro..."
              />
            </FormField>

            <FormField label="Email de contacto">
              <input
                value={formItem.contactoEmail}
                onChange={(event) => atualizarForm('contactoEmail', event.target.value)}
                className="inputEntartes"
                placeholder="email@exemplo.pt"
              />
            </FormField>

            <FormField label="Telefone de contacto">
              <input
                value={formItem.contactoTelefone}
                onChange={(event) => atualizarForm('contactoTelefone', event.target.value)}
                className="inputEntartes"
                placeholder="912 345 678"
              />
            </FormField>

            <FormField label="Disponível desde">
              <input
                value={formItem.dataInicioDisponibilidade}
                onChange={(event) =>
                  atualizarForm('dataInicioDisponibilidade', event.target.value)
                }
                type="date"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Disponível até">
              <input
                value={formItem.dataFimDisponibilidade}
                onChange={(event) =>
                  atualizarForm('dataFimDisponibilidade', event.target.value)
                }
                type="date"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Taxa (€)">
              <input
                value={formItem.preco}
                onChange={(event) => atualizarForm('preco', event.target.value)}
                type="number"
                min="0"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Imagem (URL ou carregar ficheiro)">
              <input
                value={formItem.imagemUrl.startsWith('data:') ? '' : formItem.imagemUrl}
                onChange={(event) => atualizarForm('imagemUrl', event.target.value)}
                className="inputEntartes"
                placeholder="https://..."
              />

              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleUploadImagem(event.target.files?.[0])}
                className="mt-2 block w-full text-sm text-[#5a7a6c] file:mr-3 file:rounded-lg file:border-0 file:bg-[#d4e8df] file:px-4 file:py-2 file:text-[#2d5f4f]"
              />
            </FormField>

            <div className="md:col-span-2 flex items-center gap-4">
              {formItem.imagemUrl ? (
                <img
                  src={formItem.imagemUrl}
                  alt="Pré-visualização"
                  className="w-24 h-24 rounded-xl object-cover border border-[#e8f0ed]"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl border border-dashed border-[#d9e8e1] flex items-center justify-center text-[#7a9a8c]">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}

              <p className="text-xs text-[#7a9a8c]">
                Cola um URL ou carrega uma imagem do dispositivo (máx. 1.5 MB). A imagem fica guardada no anúncio.
              </p>
            </div>

            <div className="md:col-span-2">
              <FormField label="Descrição">
                <textarea
                  value={formItem.descricao}
                  onChange={(event) => atualizarForm('descricao', event.target.value)}
                  className="inputEntartes min-h-28 resize-none"
                  placeholder="Descrição do figurino/acessório..."
                />
              </FormField>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3 mt-6">
            <div>
              {modoEdicao && (
                <button
                  onClick={encerrarAnuncioAtual}
                  disabled={isSaving}
                  className="px-5 py-3 rounded-xl border border-[#ffd2d2] text-[#9a3a3a] hover:bg-[#fff5f5] transition-colors disabled:opacity-70"
                >
                  Remover anúncio
                </button>
              )}
            </div>

            <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-3">
              <button
                onClick={fecharModal}
                className="px-5 py-3 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={guardarItem}
                disabled={isSaving}
                className="px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors disabled:opacity-70"
              >
                {isSaving
                  ? 'A guardar...'
                  : modoEdicao
                    ? 'Guardar alterações'
                    : 'Publicar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {detalheItem && (
        <Modal onClose={() => setDetalheItem(null)}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-[#2d5f4f] mb-1">{detalheItem.nome}</h2>
              <p className="text-sm text-[#7a9a8c]">{tipoLabels[detalheItem.tipo]}</p>
            </div>

            <button
              onClick={() => setDetalheItem(null)}
              className="p-2 rounded-lg hover:bg-[#f0f6f3]"
              aria-label="Fechar detalhes"
            >
              <X className="w-5 h-5 text-[#2d5f4f]" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-[#5a7a6c]">{detalheItem.descricao}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoBox label="Modalidade" value={detalheItem.modalidade} />
              <InfoBox label="Tamanho" value={detalheItem.tamanho} />
              <InfoBox label="Estado" value={detalheItem.estadoConservacao} />
              <InfoBox label="Origem" value={getOrigemComNome(detalheItem, currentUser, currentUserIds)} />
              <InfoBox label="Contacto" value={getContactoItem(detalheItem)} />
              <InfoBox
                label="Disponibilidade"
                value={`${formatDate(detalheItem.dataInicioDisponibilidade)} a ${formatDate(
                  detalheItem.dataFimDisponibilidade
                )}`}
              />
              <InfoBox label="Taxa" value={getTaxaAluguer(detalheItem)} />
            </div>

            {isCoordenacao && (
              <div className="pt-5 border-t border-[#e8f0ed]">
                <h3 className="text-[#2d5f4f] mb-3">Requisições</h3>

                {detalheItem.requisicoes.length === 0 ? (
                  <p className="text-sm text-[#7a9a8c]">Ainda não existem requisições para este item.</p>
                ) : (
                  <div className="space-y-3">
                    {detalheItem.requisicoes.map((requisicao) => (
                      <div
                        key={getRequisicaoId(requisicao)}
                        className="rounded-xl bg-[#f8faf9] border border-[#e8f0ed] p-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div>
                            <p className="text-sm text-[#2d5f4f]">
                              {getRequisicaoNome(requisicao)}
                            </p>
                            {getPeriodoRequisicao(requisicao) && (
                              <p className="text-xs text-[#7a9a8c] mt-1">
                                Aluguer: {getPeriodoRequisicao(requisicao)}
                              </p>
                            )}
                            <p className="text-xs text-[#7a9a8c] mt-1">
                              Estado: {estadoRequisicaoLabels[requisicao.estado] ?? requisicao.estado}
                            </p>
                            {requisicao.mensagem && (
                              <p className="text-sm text-[#5a7a6c] mt-2">{requisicao.mensagem}</p>
                            )}
                          </div>

                          {requisicao.estado === 'PENDENTE' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => aceitarRequisicao(detalheItem, requisicao)}
                                className="px-3 py-2 rounded-lg bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors"
                              >
                                Aceitar
                              </button>

                              <button
                                onClick={() => rejeitarRequisicao(detalheItem, requisicao)}
                                className="px-3 py-2 rounded-lg border border-[#ffd2d2] text-[#9a3a3a] hover:bg-[#fff5f5] transition-colors"
                              >
                                Rejeitar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {itemAluguer && (
        <Modal onClose={fecharPedidoAluguer}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-[#2d5f4f] mb-1">Solicitar aluguer</h2>
              <p className="text-sm text-[#7a9a8c]">
                {itemAluguer.nome} · {getTaxaAluguer(itemAluguer)}
              </p>
            </div>

            <button
              onClick={fecharPedidoAluguer}
              className="p-2 rounded-lg hover:bg-[#f0f6f3]"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 text-[#2d5f4f]" />
            </button>
          </div>

          <div className="rounded-xl bg-[#f8faf9] border border-[#e8f0ed] p-4 mb-5 flex items-start gap-2">
            <Calendar className="w-4 h-4 mt-0.5 text-[#7a9a8c]" />
            <p className="text-sm text-[#5a7a6c]">
              Período disponível: {getPeriodoAluguer(itemAluguer)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Início do aluguer">
              <input
                value={aluguerInicio}
                onChange={(event) => setAluguerInicio(event.target.value)}
                type="date"
                min={itemAluguer.dataInicioDisponibilidade || undefined}
                max={itemAluguer.dataFimDisponibilidade || undefined}
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Fim do aluguer">
              <input
                value={aluguerFim}
                onChange={(event) => setAluguerFim(event.target.value)}
                type="date"
                min={aluguerInicio || itemAluguer.dataInicioDisponibilidade || undefined}
                max={itemAluguer.dataFimDisponibilidade || undefined}
                className="inputEntartes"
              />
            </FormField>
          </div>

          <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-3 mt-6">
            <button
              onClick={fecharPedidoAluguer}
              className="px-5 py-3 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={() => void confirmarAluguer()}
              disabled={isSaving}
              className="px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors disabled:opacity-70"
            >
              {isSaving ? 'A enviar...' : 'Enviar pedido de aluguer'}
            </button>
          </div>
        </Modal>
      )}

      {itemSugestao && requisicaoSugestao && (
        <Modal onClose={fecharSugestao}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-[#2d5f4f] mb-1">Sugerir outra data</h2>
              <p className="text-sm text-[#7a9a8c]">
                {itemSugestao.nome} · pedido de {getRequisicaoNome(requisicaoSugestao)}
              </p>
            </div>

            <button
              onClick={fecharSugestao}
              className="p-2 rounded-lg hover:bg-[#f0f6f3]"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 text-[#2d5f4f]" />
            </button>
          </div>

          <div className="rounded-xl bg-[#f8faf9] border border-[#e8f0ed] p-4 mb-5">
            <p className="text-sm text-[#5a7a6c]">
              Datas pretendidas pelo interessado:{' '}
              {getPeriodoRequisicao(requisicaoSugestao) || 'não indicadas'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nova data de início">
              <input
                value={sugestaoInicio}
                onChange={(event) => setSugestaoInicio(event.target.value)}
                type="date"
                className="inputEntartes"
              />
            </FormField>

            <FormField label="Nova data de fim">
              <input
                value={sugestaoFim}
                onChange={(event) => setSugestaoFim(event.target.value)}
                type="date"
                min={sugestaoInicio || undefined}
                className="inputEntartes"
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Mensagem (opcional)">
                <textarea
                  value={sugestaoMensagem}
                  onChange={(event) => setSugestaoMensagem(event.target.value)}
                  className="inputEntartes min-h-24 resize-none"
                  placeholder="Ex.: Nessas datas o item está livre, podes confirmar?"
                />
              </FormField>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-3 mt-6">
            <button
              onClick={fecharSugestao}
              className="px-5 py-3 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={() => void confirmarSugestao()}
              disabled={isSaving}
              className="px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors disabled:opacity-70"
            >
              {isSaving ? 'A enviar...' : 'Enviar sugestão'}
            </button>
          </div>
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

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#7a9a8c]">{label}</span>
      <span className="text-[#2d5f4f]">{value}</span>
    </div>
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
