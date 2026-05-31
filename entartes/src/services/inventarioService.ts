import { api } from './api';

export type TipoTransacaoBackend = 'ALUGAR' | 'VENDER' | 'REQUISITAR';

export type EstadoAnuncioBackend =
  | 'PUBLICADO'
  | 'ATIVO'
  | 'RESERVADO'
  | 'CONCLUIDO'
  | 'INATIVO'
  | 'ENCERRADO';

export type EstadoRequisicaoBackend = 'PENDENTE' | 'ACEITE' | 'REJEITADA';

export type OrigemInventarioBackend = 'ESCOLA' | 'ENCARREGADO' | 'ALUNO';

export type RequisicaoBackend = {
  _id?: string;
  id?: string;
  utilizadorId: string;
  perfilNome?: string;
  mensagem?: string;
  dataInicio?: string;
  dataFim?: string;
  dataSugeridaInicio?: string;
  dataSugeridaFim?: string;
  mensagemResposta?: string;
  estado: EstadoRequisicaoBackend;
  dataRequisicao?: string;
};

export type ItemInventarioBackend = {
  _id?: string;
  id?: string;
  titulo: string;
  descricao: string;
  estadoConservacao: string;
  tipoTransacao: TipoTransacaoBackend;
  preco: number;
  taxaSimbolica?: number;
  utilizadorId: string;
  origem?: OrigemInventarioBackend;
  estadoAnuncio: EstadoAnuncioBackend;
  imagemUrl?: string;
  alugadoDesde?: string | null;
  alugadoAte?: string | null;
  requisicoes?: RequisicaoBackend[];
  createdAt?: string;
  updatedAt?: string;
};

export type ListarInventarioResponse = {
  total: number;
  itens: ItemInventarioBackend[];
};

export type InventarioMutationResponse = {
  mensagem: string;
  item: ItemInventarioBackend;
};

export type MarketplaceItemApp = {
  id: string;
  nome: string;
  descricao: string;
  tipo: string;
  modalidade: string;
  tamanho: string;
  estadoConservacao: string;
  origem: OrigemInventarioBackend;
  estadoAnuncio: EstadoAnuncioBackend;
  preco: number;
  imagemUrl: string;
  dataInicioDisponibilidade: string;
  dataFimDisponibilidade: string;
  alugadoDesde: string;
  alugadoAte: string;
  utilizadorId: string;
  requisicoes: RequisicaoBackend[];
};

export type CriarItemInventarioInput = {
  titulo: string;
  descricao: string;
  estadoConservacao: string;
  tipoTransacao: TipoTransacaoBackend;
  preco: number;
  utilizadorId: string;
  origem?: OrigemInventarioBackend;
  imagemUrl?: string;
};

export type EditarItemInventarioInput = {
  titulo: string;
  descricao: string;
  estadoConservacao: string;
  tipoTransacao: TipoTransacaoBackend;
  preco: number;
  taxaSimbolica?: number;
  imagemUrl?: string;
  estadoAnuncio?: EstadoAnuncioBackend;
};

export type SugerirDataRequisicaoInput = {
  dataSugeridaInicio?: string;
  dataSugeridaFim?: string;
  mensagemResposta?: string;
};

export type RequisitarItemInput = {
  utilizadorId: string;
  perfilNome?: string;
  mensagem?: string;
  dataInicio?: string;
  dataFim?: string;
};

function getId(item: ItemInventarioBackend) {
  return item._id ?? item.id ?? crypto.randomUUID();
}

function inferirTipo(titulo: string, descricao: string) {
  const texto = `${titulo} ${descricao}`.toLowerCase();

  if (texto.includes('sapatilha')) return 'Sapatilhas';
  if (texto.includes('acessório') || texto.includes('acessorio')) return 'Acessório';
  if (texto.includes('figurino')) return 'Figurino';

  return 'Figurino/Acessório';
}

function inferirModalidade(titulo: string, descricao: string) {
  const texto = `${titulo} ${descricao}`.toLowerCase();

  if (texto.includes('ballet')) return 'Ballet';
  if (texto.includes('jazz')) return 'Jazz';
  if (texto.includes('hip hop')) return 'Hip Hop';
  if (texto.includes('contempor')) return 'Dança Contemporânea';
  if (texto.includes('acrodance')) return 'Acrodance';

  return 'Geral';
}

function inferirTamanho(titulo: string, descricao: string) {
  const texto = `${titulo} ${descricao}`;

  const match = texto.match(/\b(?:tam(?:anho)?\.?\s*)?([0-9]{2}|XS|S|M|L|XL)\b/i);

  return match?.[1]?.toUpperCase() ?? 'Único';
}

export function adaptarItemInventarioBackend(
  item: ItemInventarioBackend
): MarketplaceItemApp {
  const dataCriacao = item.createdAt?.slice(0, 10) ?? '';

  return {
    id: getId(item),
    nome: item.titulo,
    descricao: item.descricao,
    tipo: inferirTipo(item.titulo, item.descricao),
    modalidade: inferirModalidade(item.titulo, item.descricao),
    tamanho: inferirTamanho(item.titulo, item.descricao),
    estadoConservacao: item.estadoConservacao,
    origem: item.origem ?? 'ENCARREGADO',
    estadoAnuncio: item.estadoAnuncio,
    preco: item.preco ?? item.taxaSimbolica ?? 0,
    imagemUrl: item.imagemUrl ?? '',
    dataInicioDisponibilidade: dataCriacao,
    dataFimDisponibilidade: '',
    alugadoDesde: item.alugadoDesde?.slice(0, 10) ?? '',
    alugadoAte: item.alugadoAte?.slice(0, 10) ?? '',
    utilizadorId: item.utilizadorId,
    requisicoes: item.requisicoes ?? [],
  };
}

export async function listarInventario() {
  const response = await api.get<ListarInventarioResponse>('/inventario');

  return response.itens.map(adaptarItemInventarioBackend);
}

export async function criarItemInventario(input: CriarItemInventarioInput) {
  const response = await api.post<InventarioMutationResponse>(
    '/inventario/anunciar',
    {
      titulo: input.titulo,
      descricao: input.descricao,
      estadoConservacao: input.estadoConservacao,
      tipoTransacao: input.tipoTransacao,
      preco: input.preco,
      taxaSimbolica: input.preco,
      utilizadorId: input.utilizadorId,
      origem: input.origem ?? 'ENCARREGADO',
      imagemUrl: input.imagemUrl ?? '',
    }
  );

  return adaptarItemInventarioBackend(response.item);
}

export async function editarItemInventario(
  id: string,
  input: EditarItemInventarioInput
) {
  const response = await api.patch<InventarioMutationResponse>(
    `/inventario/${id}/anuncio`,
    {
      titulo: input.titulo,
      descricao: input.descricao,
      estadoConservacao: input.estadoConservacao,
      tipoTransacao: input.tipoTransacao,
      preco: input.preco,
      taxaSimbolica: input.taxaSimbolica ?? input.preco,
      ...(input.imagemUrl !== undefined ? { imagemUrl: input.imagemUrl } : {}),
      ...(input.estadoAnuncio ? { estadoAnuncio: input.estadoAnuncio } : {}),
    }
  );

  return adaptarItemInventarioBackend(response.item);
}

export async function encerrarItemInventario(id: string) {
  const response = await api.patch<InventarioMutationResponse>(
    `/inventario/${id}/encerrar`
  );

  return adaptarItemInventarioBackend(response.item);
}

export async function requisitarItemInventario(
  id: string,
  input: RequisitarItemInput
) {
  const response = await api.post<InventarioMutationResponse>(
    `/inventario/${id}/requisicao`,
    {
      utilizadorId: input.utilizadorId,
      perfilNome: input.perfilNome ?? '',
      mensagem: input.mensagem ?? '',
      dataInicio: input.dataInicio || null,
      dataFim: input.dataFim || null,
    }
  );

  return adaptarItemInventarioBackend(response.item);
}

export async function aceitarRequisicaoInventario(
  itemId: string,
  requisicaoId: string
) {
  const response = await api.patch<InventarioMutationResponse>(
    `/inventario/${itemId}/requisicoes/${requisicaoId}/aceitar`
  );

  return adaptarItemInventarioBackend(response.item);
}

export async function rejeitarRequisicaoInventario(
  itemId: string,
  requisicaoId: string
) {
  const response = await api.patch<InventarioMutationResponse>(
    `/inventario/${itemId}/requisicoes/${requisicaoId}/rejeitar`
  );

  return adaptarItemInventarioBackend(response.item);
}

export async function sugerirDataRequisicaoInventario(
  itemId: string,
  requisicaoId: string,
  input: SugerirDataRequisicaoInput
) {
  const response = await api.patch<InventarioMutationResponse>(
    `/inventario/${itemId}/requisicoes/${requisicaoId}/sugerir`,
    {
      dataSugeridaInicio: input.dataSugeridaInicio || null,
      dataSugeridaFim: input.dataSugeridaFim || null,
      mensagemResposta: input.mensagemResposta ?? '',
    }
  );

  return adaptarItemInventarioBackend(response.item);
}