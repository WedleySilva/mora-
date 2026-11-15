import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';
import { favoritoService } from '../services/favoritoService';
import { usuarioService } from '../services/usuarioService';
import { User } from '../types/mora';

interface ToastMessage {
  id: number;
  text: string;
  tone: 'info' | 'success' | 'warning';
}

interface MoraContextValue {
  user: User | null;
  loadingAuth: boolean;
  favorites: string[];
  unreadMessagesCount: number;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loginWithDemo: (demoUserId: string) => Promise<User>;
  logout: () => Promise<void>;
  toggleFavorite: (opportunityId: string) => Promise<boolean>;
  refreshUnreadCount: () => Promise<void>;
  updateCurrentUserProfile: (updates: Partial<User>) => Promise<User | null>;
  showToast: (text: string, tone?: 'info' | 'success' | 'warning') => void;
}

const MoraContext = createContext<MoraContextValue | undefined>(undefined);

export function MoraProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, tone: 'info' | 'success' | 'warning' = 'success') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  const refreshUnreadCount = useCallback(async (targetUser?: User | null) => {
    const active = targetUser ?? user;
    if (!active) {
      setUnreadMessagesCount(0);
      return;
    }
    try {
      const convs = await chatService.listConversations(active.id);
      const count = convs.reduce((acc, c) => {
        if (active.id === c.proprietarioId) return acc + c.naoLidasParaProprietario;
        return acc + c.naoLidasParaInteressado;
      }, 0);
      setUnreadMessagesCount(count);
    } catch {
      setUnreadMessagesCount(0);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const sessionUser = await authService.getSession();
        if (!active) return;
        setUser(sessionUser);
        if (sessionUser) {
          const favs = await favoritoService.getFavorites(sessionUser.id);
          if (active) setFavorites(favs);
          await refreshUnreadCount(sessionUser);
        } else {
          // Guest favorites stored in localStorage for browsing before login
          const guestFavs = await favoritoService.getFavorites('guest');
          if (active) setFavorites(guestFavs);
        }
      } finally {
        if (active) setLoadingAuth(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loadingAuth) {
      const ownerKey = user ? user.id : 'guest';
      favoritoService.getFavorites(ownerKey).then(setFavorites).catch(() => {});
      refreshUnreadCount(user);
    }
  }, [user, loadingAuth, refreshUnreadCount]);

  const loginWithDemo = useCallback(async (demoUserId: string) => {
    const logged = await authService.loginWithDemoAccount(demoUserId);
    setUser(logged);
    return logged;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setUnreadMessagesCount(0);
    showToast('Sessão encerrada.', 'info');
  }, [showToast]);

  const toggleFavorite = useCallback(
    async (opportunityId: string) => {
      const ownerKey = user ? user.id : 'guest';
      const res = await favoritoService.toggle(ownerKey, opportunityId);
      setFavorites(res.favorites);
      showToast(
        res.favorited ? 'Oportunidade salva nos favoritos.' : 'Oportunidade removida dos favoritos.',
        res.favorited ? 'success' : 'info'
      );
      return res.favorited;
    },
    [user, showToast]
  );

  const updateCurrentUserProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!user) return null;
      const updated = await usuarioService.updateProfile(user.id, updates);
      setUser(updated);
      showToast('Informações do perfil atualizadas.', 'success');
      return updated;
    },
    [user, showToast]
  );

  return (
    <MoraContext.Provider
      value={{
        user,
        loadingAuth,
        favorites,
        unreadMessagesCount,
        setUser,
        loginWithDemo,
        logout,
        toggleFavorite,
        refreshUnreadCount: () => refreshUnreadCount(user),
        updateCurrentUserProfile,
        showToast,
      }}
    >
      {children}

      {/* Toast stack */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl px-4 py-3 text-sm font-medium shadow-lg border transition-all duration-200 ${
              toast.tone === 'success'
                ? 'bg-[#123F52] text-white border-[#0D2E3D]'
                : toast.tone === 'warning'
                ? 'bg-[#FEF5E7] text-[#9A5B00] border-[#F59A16]/40'
                : 'bg-white text-[#111820] border-slate-200'
            }`}
          >
            {toast.text}
          </div>
        ))}
      </div>
    </MoraContext.Provider>
  );
}

export function useMora() {
  const ctx = useContext(MoraContext);
  if (!ctx) throw new Error('useMora must be used inside MoraProvider');
  return ctx;
}
