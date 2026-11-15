import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, MessageSquare, User as UserIcon, X, LogOut, LayoutDashboard } from 'lucide-react';
import { MoraLogo } from './MoraLogo';
import { useMora } from '../context/MoraContext';

export function Header() {
  const { user, logout, unreadMessagesCount } = useMora();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const dashboardPath =
    user?.role === 'proprietario' ? '/painel/proprietario' : '/painel/interessado';

  const navLinks = [
    { to: '/explorar', label: 'Explorar' },
    { to: '/como-funciona', label: 'Como funciona' },
    { to: '/planos', label: 'Planos' },
    { to: '/mensagens', label: unreadMessagesCount > 0 ? `Mensagens (${unreadMessagesCount})` : 'Mensagens' },
  ];

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand mark only */}
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123F52] rounded-lg"
          aria-label="Mora+ Página Inicial"
        >
          <MoraLogo size="sm" />
        </Link>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Navegação principal">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
                isActive(link.to)
                  ? 'text-[#123F52] border-[#F59A16]'
                  : 'text-[#737B80] border-transparent hover:text-[#123F52] hover:border-slate-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Zone 3: 1 primary action area */}
        <div className="hidden md:flex items-center gap-3 shrink-0 relative">
          {!user ? (
            <Link
              to="/entrar"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-[#123F52] text-white hover:bg-[#0D2E3D] transition-colors whitespace-nowrap shrink-0"
            >
              Entrar ou cadastrar
            </Link>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-[#F5F6F7] text-sm font-semibold text-[#123F52] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-[#F59A16]" />
                <span className="max-w-[140px] truncate">{user.nome.split(' ')[0]}</span>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-xl bg-white border border-slate-200 shadow-lg py-2 z-50"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-semibold text-[#111820] truncate">{user.nome}</p>
                    <p className="text-xs text-[#737B80]">
                      {user.role === 'proprietario' ? 'Conta Proprietário' : 'Conta Interessado'}
                    </p>
                  </div>
                  <Link
                    to={dashboardPath}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#111820] hover:bg-[#F5F6F7]"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#123F52]" />
                    <span>{user.role === 'proprietario' ? 'Painel do Proprietário' : 'Painel do Interessado'}</span>
                  </Link>
                  <Link
                    to="/mensagens"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#111820] hover:bg-[#F5F6F7]"
                  >
                    <MessageSquare className="w-4 h-4 text-[#123F52]" />
                    <span>Conversas</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair da conta</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-[#123F52] hover:bg-[#F5F6F7] cursor-pointer"
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive(link.to)
                  ? 'bg-[#EAF1F4] text-[#123F52]'
                  : 'text-[#111820] hover:bg-[#F5F6F7]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#123F52] text-white"
                >
                  {user.role === 'proprietario' ? 'Painel do Proprietário' : 'Painel do Interessado'}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-center px-4 py-2 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Sair da conta ({user.nome.split(' ')[0]})
                </button>
              </>
            ) : (
              <Link
                to="/entrar"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#123F52] text-white"
              >
                Entrar ou cadastrar
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
