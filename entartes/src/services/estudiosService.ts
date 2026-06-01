import { api } from './api';

export type EstadoEstudioBackend = 'ATIVO' | 'INATIVO' | 'EM_CONSTRUCAO';

export type EstudioBackend = {
  _id?: string;
  id?: string;
  nome: string;
  capacidade: number;
  modalidadesPermitidas: string[];
  estado: EstadoEstudioBackend;
  createdAt?: string;
  updatedAt?: string;
};

export type ListarEstudiosResponse = {
  total: number;
  estudios: EstudioBackend[];
};

export type EstudioMutationResponse = {
  mensagem: string;
  estudio: EstudioBackend;
};

export type CriarEstudioInput = {
  nome: string;
  capacidade: number;
  modalidadesPermitidas?: string[];
  estado?: EstadoEstudioBackend;
};

export type DisponibilidadeEstudioResponse = {
  estudio: EstudioBackend;
  disponivel: boolean;
  conflito: unknown | null;
};

function getId(estudio: EstudioBackend) {
  return estudio._id ?? estudio.id ?? crypto.randomUUID();
}

export type EstudioApp = {
  id: string;
  nome: string;
  capacidade: number;
  modalidadesPermitidas: string[];
  estado: EstadoEstudioBackend;
};

export function adaptarEstudioBackend(estudio: EstudioBackend): EstudioApp {
  return {
    id: getId(estudio),
    nome: estudio.nome,
    capacidade: estudio.capacidade,
    modalidadesPermitidas: estudio.modalidadesPermitidas ?? [],
    estado: estudio.estado,
  };
}

export async function listarEstudios() {
  const response = await api.get<ListarEstudiosResponse>('/estudios');

  return response.estudios.map(adaptarEstudioBackend);
}

export async function criarEstudio(input: CriarEstudioInput) {
  const response = await api.post<EstudioMutationResponse>('/estudios', {
    nome: input.nome,
    capacidade: input.capacidade,
    modalidadesPermitidas: input.modalidadesPermitidas ?? [],
    estado: input.estado ?? 'ATIVO',
  });

  return adaptarEstudioBackend(response.estudio);
}

export async function atualizarEstudio(
  id: string,
  input: Partial<CriarEstudioInput>
) {
  const response = await api.patch<EstudioMutationResponse>(`/estudios/${id}`, input);

  return adaptarEstudioBackend(response.estudio);
}

export async function removerEstudio(id: string) {
  return api.delete<{ mensagem: string }>(`/estudios/${id}`);
}

export async function verificarDisponibilidadeEstudio(
  estudioId: string,
  dataInicio: string,
  dataFim: string
) {
  return api.get<DisponibilidadeEstudioResponse>(
    `/estudios/${estudioId}/disponibilidade?dataInicio=${encodeURIComponent(
      dataInicio
    )}&dataFim=${encodeURIComponent(dataFim)}`
  );
}