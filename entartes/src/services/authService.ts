import { apiRequest, clearAuthToken, setAuthToken } from './api';

const AUTH_USER_STORAGE_KEY = 'entartes_auth_user';

export type TipoPerfilBackend =
  | 'ALUNO'
  | 'ENCARREGADO'
  | 'PROFESSOR'
  | 'DIRECAO'
  | 'ADMIN';

export type AppRole =
  | 'ALUNO'
  | 'ENCARREGADO'
  | 'PROFESSOR'
  | 'COORDENACAO';

export type UtilizadorConta = {
  id: string;
  nomeConta: string;
  email: string;
  tipoConta: string;
  tiposUtilizador?: string[];
  estado: string;
  perfisDisponiveis?: PerfilDisponivel[];
};

export type AlunoAssociado = {
  id: string;
  nome: string;
};

export type PerfilDisponivel = {
  id: string;
  nome: string;
  tipoPerfil: TipoPerfilBackend;
};

export type LoginResponse = {
  mensagem: string;
  tokenConta: string;
  necessitaEscolherPerfil: boolean;
  utilizador: UtilizadorConta;
  perfisDisponiveis: PerfilDisponivel[];
};

export type SelecionarPerfilResponse = {
  mensagem: string;
  token: string;
  utilizador: UtilizadorConta;
  perfilAtivo: PerfilDisponivel;
};

export type MeResponse = {
  utilizador: UtilizadorConta;
  autenticacao: {
    tipoToken: string;
    perfilAtivo?: PerfilDisponivel;
    tipoPerfilAtivo?: TipoPerfilBackend;
    modoAtivo?: TipoPerfilBackend;
  };
};

export type AppUser = {
  contaId: string;
  perfilId: string;
  email: string;
  nomeConta: string;
  name: string;
  role: AppRole;
  tipoPerfil: TipoPerfilBackend;
  roleLabel: string;
  description: string;
  initials: string;
  educandos: AlunoAssociado[];
  token: string;
};

export function getAppRole(tipoPerfil: TipoPerfilBackend): AppRole {
  if (tipoPerfil === 'DIRECAO' || tipoPerfil === 'ADMIN') {
    return 'COORDENACAO';
  }

  return tipoPerfil;
}

export function getRoleLabel(tipoPerfil: TipoPerfilBackend) {
  const labels: Record<TipoPerfilBackend, string> = {
    ALUNO: 'Aluno',
    ENCARREGADO: 'Encarregado',
    PROFESSOR: 'Professor',
    DIRECAO: 'Coordenação',
    ADMIN: 'Administração',
  };

  return labels[tipoPerfil];
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function getProfileDescription(tipoPerfil: TipoPerfilBackend) {
  const descriptions: Record<TipoPerfilBackend, string> = {
    ALUNO: 'Perfil de aluno',
    ENCARREGADO: 'Perfil de encarregado de educação',
    PROFESSOR: 'Perfil de professor',
    DIRECAO: 'Perfil de coordenação',
    ADMIN: 'Perfil de administração',
  };

  return descriptions[tipoPerfil];
}

export async function login(email: string, password: string) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: {
      email,
      password,
    },
  });
}

export async function selecionarPerfil(
  tokenConta: string,
  perfilId: string,
  pinEncarregado?: string
) {
  const body: {
    perfilId: string;
    pinEncarregado?: string;
  } = {
    perfilId,
  };

  if (pinEncarregado) {
    body.pinEncarregado = pinEncarregado;
  }

  const response = await apiRequest<SelecionarPerfilResponse>(
    '/auth/selecionar-perfil',
    {
      method: 'POST',
      token: tokenConta,
      body,
    }
  );

  setAuthToken(response.token);

  return response;
}

export async function getCurrentAuthUser() {
  return apiRequest<MeResponse>('/auth/me');
}

export async function listarAlunosDaConta(): Promise<AlunoAssociado[]> {
  const response = await getCurrentAuthUser();
  const perfis = response.utilizador.perfisDisponiveis ?? [];

  return perfis
    .filter((perfil) => perfil.tipoPerfil === 'ALUNO')
    .map((perfil) => ({ id: perfil.id, nome: perfil.nome }));
}

export function buildAppUserFromAuthResponse(
  response: SelecionarPerfilResponse,
  perfisConta: PerfilDisponivel[] = []
): AppUser {
  const perfil = response.perfilAtivo;
  const utilizador = response.utilizador;

  const educandos = perfisConta
    .filter((item) => item.tipoPerfil === 'ALUNO')
    .map((item) => ({ id: item.id, nome: item.nome }));

  return {
    contaId: utilizador.id,
    perfilId: perfil.id,
    email: utilizador.email,
    nomeConta: utilizador.nomeConta,
    name: perfil.nome,
    role: getAppRole(perfil.tipoPerfil),
    tipoPerfil: perfil.tipoPerfil,
    roleLabel: getRoleLabel(perfil.tipoPerfil),
    description: getProfileDescription(perfil.tipoPerfil),
    initials: getInitials(perfil.nome),
    educandos,
    token: response.token,
  };
}

export function guardarSessao(user: AppUser) {
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
}

export function obterSessaoGuardada() {
  try {
    const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser) as AppUser;
  } catch {
    return null;
  }
}

export function terminarSessao() {
  clearAuthToken();
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
}