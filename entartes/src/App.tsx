import { useState, type ReactNode } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarDays,
  GraduationCap,
  Home,
  KeyRound,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  Settings,
  ShieldCheck,
  ShoppingBag,
  UserCog,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';

import Dashboard from './design/Dashboard';
import Horario from './design/Horario';
import Coaching from './design/Coaching';
import Marketplace from './design/Marketplace';
import Eventos from './design/Eventos';
import Coordenacao from './design/Coordenacao';

import { ApiError } from './services/api';
import {
  buildAppUserFromAuthResponse,
  getProfileDescription,
  getRoleLabel,
  guardarSessao,
  login as loginConta,
  obterSessaoGuardada,
  selecionarPerfil as selecionarPerfilBackend,
  terminarSessao,
  type AppRole,
  type AppUser,
  type LoginResponse,
  type PerfilDisponivel,
  type TipoPerfilBackend,
} from './services/authService';

type Page =
  | 'dashboard'
  | 'horario'
  | 'coaching'
  | 'marketplace'
  | 'eventos'
  | 'coordenacao';

type MenuItem = {
  id: Page;
  label: string;
  icon: LucideIcon;
  allowedRoles: AppRole[];
};

const allRoles: AppRole[] = ['ALUNO', 'ENCARREGADO', 'PROFESSOR', 'COORDENACAO'];

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    allowedRoles: allRoles,
  },
  {
    id: 'horario',
    label: 'Horário',
    icon: Calendar,
    allowedRoles: allRoles,
  },
  {
    id: 'coaching',
    label: 'Coaching',
    icon: Users,
    allowedRoles: allRoles,
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingBag,
    allowedRoles: allRoles,
  },
  {
    id: 'eventos',
    label: 'Eventos',
    icon: CalendarDays,
    allowedRoles: allRoles,
  },
  {
    id: 'coordenacao',
    label: 'Coordenação',
    icon: Settings,
    allowedRoles: ['COORDENACAO'],
  },
];

function getRoleIcon(tipoPerfil: TipoPerfilBackend) {
  if (tipoPerfil === 'ALUNO') return GraduationCap;
  if (tipoPerfil === 'ENCARREGADO') return UserRound;
  if (tipoPerfil === 'PROFESSOR') return UserCog;
  return ShieldCheck;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado.';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() =>
    obterSessaoGuardada()
  );
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLoginCompleted(user: AppUser) {
    guardarSessao(user);
    setCurrentUser(user);
    setCurrentPage('dashboard');
    setSidebarOpen(false);
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLoginCompleted} />;
  }

  const loggedUser = currentUser;

  const availableMenuItems = menuItems.filter((item) =>
    item.allowedRoles.includes(loggedUser.role)
  );

  function logout() {
    terminarSessao();
    setCurrentUser(null);
    setCurrentPage('dashboard');
    setSidebarOpen(false);
  }

  function selectPage(page: Page) {
    setCurrentPage(page);
    setSidebarOpen(false);
  }

  function renderPage(): ReactNode {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard currentUser={loggedUser} onNavigate={setCurrentPage} />;

      case 'horario':
        return <Horario currentUser={loggedUser} />;

      case 'coaching':
        return <Coaching currentUser={loggedUser} />;

      case 'marketplace':
        return <Marketplace currentUser={loggedUser} />;

      case 'eventos':
        return <Eventos currentUser={loggedUser} />;

      case 'coordenacao':
        if (loggedUser.role !== 'COORDENACAO') {
          return <Dashboard currentUser={loggedUser} onNavigate={setCurrentPage} />;
        }

        return <Coordenacao />;

      default:
        return <Dashboard currentUser={loggedUser} onNavigate={setCurrentPage} />;
    }
  }

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      {sidebarOpen && (
        <button
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-white border-r border-[#e8f0ed] z-40 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-[#e8f0ed]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[#2d5f4f]">Ent’artes</h1>
                <p className="text-sm text-[#7a9a8c]">Gestão escolar</p>
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-[#f0f6f3]"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5 text-[#2d5f4f]" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {availableMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => selectPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                    isActive
                      ? 'bg-[#d4e8df] text-[#2d5f4f]'
                      : 'text-[#7a9a8c] hover:bg-[#f0f6f3] hover:text-[#2d5f4f]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#e8f0ed]">
            <UserCard user={loggedUser} />

            <button
              onClick={logout}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#d9e8e1] text-[#2d5f4f] hover:bg-[#f0f6f3] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-72 min-h-screen">
        <header className="bg-white border-b border-[#e8f0ed] px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#f0f6f3]"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6 text-[#2d5f4f]" />
            </button>

            <div>
              <p className="text-sm text-[#7a9a8c]">Perfil ativo</p>
              <h2 className="text-[#2d5f4f]">{loggedUser.roleLabel}</h2>
            </div>
          </div>

          <div className="hidden md:block text-right">
            <p className="text-sm text-[#7a9a8c]">Ano letivo</p>
            <p className="text-[#2d5f4f]">2025/2026</p>
          </div>
        </header>

        {renderPage()}
      </main>
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: (user: AppUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loginData, setLoginData] = useState<LoginResponse | null>(null);
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [selectedPerfil, setSelectedPerfil] = useState<PerfilDisponivel | null>(null);
  const [pinEncarregado, setPinEncarregado] = useState('');
  const [pinError, setPinError] = useState('');
  const [profileLoadingId, setProfileLoadingId] = useState<string | null>(null);

  function getPerfilEntradaDireta(response: LoginResponse) {
  return response.perfisDisponiveis.find((perfil) =>
    ['PROFESSOR', 'DIRECAO', 'ADMIN'].includes(perfil.tipoPerfil)
  );
}

  async function handleLogin() {
  if (!email.trim() || !password.trim()) {
    setLoginError('Preenche o email e a password.');
    return;
  }

  try {
    setIsLoginLoading(true);
    setLoginError('');
    setPinError('');
    setSelectedPerfil(null);

    const response = await loginConta(email.trim(), password);

    const perfilEntradaDireta = getPerfilEntradaDireta(response);

    if (perfilEntradaDireta) {
      const perfilResponse = await selecionarPerfilBackend(
        response.tokenConta,
        perfilEntradaDireta.id
      );

      const appUser = buildAppUserFromAuthResponse(perfilResponse);

      onLogin(appUser);
      return;
    }

    setLoginData(response);
  } catch (error) {
    setLoginError(getErrorMessage(error));
  } finally {
    setIsLoginLoading(false);
  }
}

  async function entrarComPerfil(perfil: PerfilDisponivel, pin?: string) {
    if (!loginData) {
      return;
    }

    try {
      setProfileLoadingId(perfil.id);
      setPinError('');
      setLoginError('');

      const response = await selecionarPerfilBackend(
        loginData.tokenConta,
        perfil.id,
        pin
      );

      const appUser = buildAppUserFromAuthResponse(response);

      onLogin(appUser);
    } catch (error) {
      const message = getErrorMessage(error);

      if (perfil.tipoPerfil === 'ENCARREGADO') {
        setPinError(message);
      } else {
        setLoginError(message);
      }
    } finally {
      setProfileLoadingId(null);
    }
  }

  function selecionarPerfil(perfil: PerfilDisponivel) {
    if (perfil.tipoPerfil === 'ENCARREGADO') {
      setSelectedPerfil(perfil);
      setPinEncarregado('');
      setPinError('');
      return;
    }

    void entrarComPerfil(perfil);
  }

  function confirmarPerfilComPin() {
    if (!selectedPerfil) {
      return;
    }

    if (!pinEncarregado.trim()) {
      setPinError('Introduz o PIN de encarregado.');
      return;
    }

    void entrarComPerfil(selectedPerfil, pinEncarregado.trim());
  }

  function voltarAoLogin() {
    setLoginData(null);
    setSelectedPerfil(null);
    setPinEncarregado('');
    setPinError('');
    setLoginError('');
  }

  if (loginData) {
    return (
      <main className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
          <section className="bg-white rounded-3xl border border-[#e8f0ed] shadow-sm p-8 lg:p-10">
            <button
              onClick={voltarAoLogin}
              className="mb-6 flex items-center gap-2 text-[#7a9a8c] hover:text-[#2d5f4f]"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao login
            </button>

            <div className="w-16 h-16 rounded-2xl bg-[#d4e8df] flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-[#2d5f4f]" />
            </div>

            <h1 className="text-[#2d5f4f] mb-3">Conta autenticada</h1>

            <p className="text-[#5a7a6c] mb-6">{loginData.mensagem}</p>

            <div className="rounded-2xl bg-[#f8faf9] border border-[#e8f0ed] p-5 space-y-2">
              <InfoLine label="Conta" value={loginData.utilizador.nomeConta} />
              <InfoLine label="Email" value={loginData.utilizador.email} />
              <InfoLine label="Tipo de conta" value={loginData.utilizador.tipoConta} />
              <InfoLine label="Estado" value={loginData.utilizador.estado} />
              <InfoLine label="Token temporário" value="Token de conta recebido" />
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-[#e8f0ed] shadow-sm p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-[#2d5f4f] mb-2">Escolher perfil</h2>

              <p className="text-[#7a9a8c]">
                Escolhe quem está a usar a aplicação neste momento.
              </p>
            </div>

            {loginError && (
              <div className="mb-5 flex items-center gap-2 text-sm text-[#9a3a3a]">
                <AlertCircle className="w-4 h-4" />
                {loginError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {loginData.perfisDisponiveis.map((perfil) => {
                const Icon = getRoleIcon(perfil.tipoPerfil);
                const isSelected = selectedPerfil?.id === perfil.id;
                const isLoading = profileLoadingId === perfil.id;

                return (
                  <button
                    key={perfil.id}
                    onClick={() => selecionarPerfil(perfil)}
                    disabled={profileLoadingId !== null}
                    className={`group text-left rounded-2xl border p-5 transition-colors disabled:opacity-70 ${
                      isSelected
                        ? 'bg-[#f0f6f3] border-[#2d5f4f]'
                        : 'border-[#e8f0ed] hover:bg-[#f0f6f3] hover:border-[#2d5f4f]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#d4e8df] flex items-center justify-center group-hover:bg-white">
                        <Icon className="w-6 h-6 text-[#2d5f4f]" />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-[#2d5f4f]">{perfil.nome}</h3>

                          <span className="px-2 py-1 rounded-full bg-white border border-[#e8f0ed] text-xs text-[#5a7a6c]">
                            {getRoleLabel(perfil.tipoPerfil)}
                          </span>
                        </div>

                        <p className="text-sm text-[#5a7a6c]">
                          {getProfileDescription(perfil.tipoPerfil)}
                        </p>

                        {perfil.tipoPerfil === 'ENCARREGADO' && (
                          <p className="text-xs text-[#8a6d1d] mt-2">
                            Este perfil exige PIN de encarregado.
                          </p>
                        )}

                        {isLoading && (
                          <p className="text-xs text-[#2d5f4f] mt-2">
                            A entrar...
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedPerfil?.tipoPerfil === 'ENCARREGADO' && (
              <div className="mt-6 rounded-2xl bg-[#fff9f0] border border-[#ffe4b8] p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-[#8a6d1d]" />
                  </div>

                  <div>
                    <h3 className="text-[#2d5f4f]">PIN de encarregado</h3>
                    <p className="text-sm text-[#7a9a8c]">
                      Introduz o PIN para entrar como {selectedPerfil.nome}.
                    </p>
                  </div>
                </div>

                <input
                  value={pinEncarregado}
                  onChange={(event) => setPinEncarregado(event.target.value)}
                  type="password"
                  inputMode="numeric"
                  placeholder="PIN"
                  className="w-full px-4 py-3 rounded-xl border border-[#d9e8e1] bg-white text-[#2d5f4f] outline-none focus:border-[#2d5f4f]"
                />

                {pinError && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-[#9a3a3a]">
                    <AlertCircle className="w-4 h-4" />
                    {pinError}
                  </div>
                )}

                <button
                  onClick={confirmarPerfilComPin}
                  disabled={profileLoadingId !== null}
                  className="mt-4 w-full px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors disabled:opacity-70"
                >
                  {profileLoadingId === selectedPerfil.id
                    ? 'A entrar...'
                    : 'Entrar como encarregado'}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-center">
        <section className="bg-white rounded-3xl border border-[#e8f0ed] shadow-sm p-8 lg:p-10">
          <div className="w-16 h-16 rounded-2xl bg-[#d4e8df] flex items-center justify-center mb-6">
            <GraduationCap className="w-8 h-8 text-[#2d5f4f]" />
          </div>

          <h1 className="text-[#2d5f4f] mb-4">Ent’artes App</h1>

          <p className="text-[#5a7a6c] mb-6">
            Plataforma para gestão de aulas, coaching, marketplace de figurinos,
            eventos, salas e coordenação escolar.
          </p>

          <div className="space-y-3">
            <LoginInfo
              icon={<Mail className="w-5 h-5" />}
              text="Login real através do backend"
            />

            <LoginInfo
              icon={<Users className="w-5 h-5" />}
              text="Uma conta pode ter vários perfis associados"
            />

            <LoginInfo
              icon={<KeyRound className="w-5 h-5" />}
              text="Perfil de encarregado protegido por PIN"
            />

            <LoginInfo
              icon={<ShieldCheck className="w-5 h-5" />}
              text="Token final aplicado ao perfil ativo"
            />
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-[#e8f0ed] shadow-sm p-8 lg:p-10">
          <div className="mb-8">
            <h2 className="text-[#2d5f4f] mb-2">Login da conta</h2>

            <p className="text-[#7a9a8c]">
              Primeiro autentica a conta. Depois escolhes o perfil ativo.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-[#5a7a6c]">Email</span>

              <div className="relative">
                <Mail className="w-4 h-4 text-[#7a9a8c] absolute left-3 top-1/2 -translate-y-1/2" />

                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#d9e8e1] bg-[#f8faf9] text-[#2d5f4f] outline-none focus:border-[#2d5f4f]"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-[#5a7a6c]">Password</span>

              <div className="relative">
                <LockKeyhole className="w-4 h-4 text-[#7a9a8c] absolute left-3 top-1/2 -translate-y-1/2" />

                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#d9e8e1] bg-[#f8faf9] text-[#2d5f4f] outline-none focus:border-[#2d5f4f]"
                />
              </div>
            </label>

            {loginError && (
              <div className="flex items-center gap-2 text-sm text-[#9a3a3a]">
                <AlertCircle className="w-4 h-4" />
                {loginError}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoginLoading}
              className="w-full px-5 py-3 rounded-xl bg-[#2d5f4f] text-white hover:bg-[#244c40] transition-colors disabled:opacity-70"
            >
              {isLoginLoading ? 'A entrar...' : 'Entrar'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function LoginInfo({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-[#5a7a6c]">
      <div className="w-10 h-10 rounded-xl bg-[#f0f6f3] text-[#2d5f4f] flex items-center justify-center">
        {icon}
      </div>

      <span>{text}</span>
    </div>
  );
}

function UserCard({ user }: { user: AppUser }) {
  return (
    <div className="bg-[#f8faf9] rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#d4e8df] flex items-center justify-center text-[#2d5f4f]">
          {user.initials}
        </div>

        <div className="min-w-0">
          <p className="text-[#2d5f4f] truncate">{user.name}</p>
          <p className="text-sm text-[#7a9a8c] truncate">{user.roleLabel}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#e8f0ed]">
        <p className="text-xs text-[#7a9a8c] truncate">{user.nomeConta}</p>
        <p className="text-xs text-[#7a9a8c] truncate">{user.email}</p>
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-[#7a9a8c]">{label}</span>
      <span className="text-[#2d5f4f] text-right break-all">{value}</span>
    </div>
  );
}