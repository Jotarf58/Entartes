import { api } from './api';

export type TipoPerfil = 'ALUNO' | 'ENCARREGADO' | 'PROFESSOR' | 'DIRECAO' | 'ADMIN';

export type PerfilUtilizadorBackend = {
  _id?: string;
  id?: string;
  nome: string;
  tipoPerfil: TipoPerfil;
  ativo?: boolean;
};

export type UtilizadorBackend = {
  _id?: string;
  id?: string;
  nomeConta: string;
  email: string;
  tipoConta?: string;
  estado?: string;
  tiposUtilizador?: string[];
  perfis?: PerfilUtilizadorBackend[];
  createdAt?: string;
};

export type UtilizadorApp = {
  id: string;
  nomeConta: string;
  email: string;
  tipoConta: string;
  estado: string;
  perfis: { id: string; nome: string; tipoPerfil: TipoPerfil }[];
  temEncarregado: boolean;
};

export type CriarUtilizadorInput = {
  nomeConta: string;
  email: string;
  password: string;
  tipoConta?: string;
  perfis: { nome: string; tipoPerfil: TipoPerfil }[];
  pinEncarregado?: string;
};

function adaptar(utilizador: UtilizadorBackend): UtilizadorApp {
  const perfis = (utilizador.perfis ?? []).map((perfil) => ({
    id: perfil._id ?? perfil.id ?? crypto.randomUUID(),
    nome: perfil.nome,
    tipoPerfil: perfil.tipoPerfil,
  }));

  return {
    id: utilizador._id ?? utilizador.id ?? crypto.randomUUID(),
    nomeConta: utilizador.nomeConta,
    email: utilizador.email,
    tipoConta: utilizador.tipoConta ?? 'INDIVIDUAL',
    estado: utilizador.estado ?? 'ATIVO',
    perfis,
    temEncarregado: perfis.some((perfil) => perfil.tipoPerfil === 'ENCARREGADO'),
  };
}

export async function listarUtilizadores(): Promise<UtilizadorApp[]> {
  const response = await api.get<{ total: number; utilizadores: UtilizadorBackend[] }>(
    '/auth/utilizadores'
  );

  return response.utilizadores.map(adaptar);
}

export async function criarUtilizador(input: CriarUtilizadorInput) {
  const response = await api.post<{ mensagem: string; utilizador: UtilizadorBackend }>(
    '/auth/utilizadores',
    {
      nomeConta: input.nomeConta,
      email: input.email,
      password: input.password,
      tipoConta: input.tipoConta ?? 'INDIVIDUAL',
      perfis: input.perfis,
      ...(input.pinEncarregado ? { pinEncarregado: input.pinEncarregado } : {}),
    }
  );

  return adaptar(response.utilizador);
}

export async function atualizarEstadoUtilizador(id: string, estado: 'ATIVO' | 'INATIVO') {
  return api.patch<{ mensagem: string }>(`/auth/utilizadores/${id}/estado`, { estado });
}

export async function redefinirPasswordUtilizador(id: string, password: string) {
  return api.patch<{ mensagem: string }>(`/auth/utilizadores/${id}/password`, { password });
}

export async function redefinirPinEncarregado(id: string, pinEncarregado: string) {
  return api.patch<{ mensagem: string }>(`/auth/utilizadores/${id}/pin-encarregado`, {
    pinEncarregado,
  });
}

export async function adicionarPerfilUtilizador(
  id: string,
  input: { nome: string; tipoPerfil: TipoPerfil }
): Promise<UtilizadorApp> {
  const response = await api.post<{ mensagem: string; utilizador: UtilizadorBackend }>(
    `/auth/utilizadores/${id}/perfis`,
    { nome: input.nome, tipoPerfil: input.tipoPerfil }
  );

  return adaptar(response.utilizador);
}

export async function removerUtilizador(id: string) {
  return api.delete<{ mensagem: string }>(`/auth/utilizadores/${id}`);
}
