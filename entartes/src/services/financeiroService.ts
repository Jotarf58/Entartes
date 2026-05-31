import { api } from './api';

export type OrigemFinanceiraBackend = 'COACHING' | 'INVENTARIO' | 'MANUAL';
export type EstadoFinanceiroBackend = 'PENDENTE' | 'FATURADO' | 'CANCELADO';

export type RegistoFinanceiroBackend = {
  _id?: string;
  id?: string;
  tipo: string;
  descricao: string;
  valor: number;
  data: string;
  origem: OrigemFinanceiraBackend;
  origemId?: string | null;
  estado: EstadoFinanceiroBackend;
  createdAt?: string;
  updatedAt?: string;
};

export type ListarFinanceiroResponse = {
  totalRegistos: number;
  totalValor: number;
  registos: RegistoFinanceiroBackend[];
};

export type FinanceiroMutationResponse = {
  mensagem: string;
  registo: RegistoFinanceiroBackend;
};

export type CriarRegistoFinanceiroInput = {
  tipo: string;
  descricao: string;
  valor: number;
  data?: string;
  origem?: OrigemFinanceiraBackend;
  origemId?: string | null;
  estado?: EstadoFinanceiroBackend;
};

export type RegistoFinanceiroApp = {
  id: string;
  tipo: string;
  descricao: string;
  valor: number;
  data: string;
  origem: OrigemFinanceiraBackend;
  origemId: string;
  estado: EstadoFinanceiroBackend;
};

function getId(registo: RegistoFinanceiroBackend) {
  return registo._id ?? registo.id ?? crypto.randomUUID();
}

export function adaptarRegistoFinanceiroBackend(
  registo: RegistoFinanceiroBackend
): RegistoFinanceiroApp {
  return {
    id: getId(registo),
    tipo: registo.tipo,
    descricao: registo.descricao,
    valor: registo.valor,
    data: registo.data?.slice(0, 10) ?? '',
    origem: registo.origem,
    origemId: registo.origemId ?? '',
    estado: registo.estado,
  };
}

export async function listarFinanceiro() {
  const response = await api.get<ListarFinanceiroResponse>('/financeiro');

  return {
    totalRegistos: response.totalRegistos,
    totalValor: response.totalValor,
    registos: response.registos.map(adaptarRegistoFinanceiroBackend),
  };
}

export async function criarRegistoFinanceiro(input: CriarRegistoFinanceiroInput) {
  const response = await api.post<FinanceiroMutationResponse>('/financeiro', {
    tipo: input.tipo,
    descricao: input.descricao,
    valor: input.valor,
    data: input.data,
    origem: input.origem ?? 'MANUAL',
    origemId: input.origemId ?? null,
    estado: input.estado ?? 'FATURADO',
  });

  return adaptarRegistoFinanceiroBackend(response.registo);
}

export async function exportarFinanceiroCsv() {
  return api.get<string>('/financeiro/exportar');
}