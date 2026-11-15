import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { MoraProvider } from './context/MoraContext';
import { AuthPage } from './pages/AuthPage';
import { ChatPage } from './pages/ChatPage';
import { ExplorePage } from './pages/ExplorePage';
import { HomePage } from './pages/HomePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { OpportunityDetailPage } from './pages/OpportunityDetailPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { PlansPage } from './pages/PlansPage';
import { SeekerDashboardPage } from './pages/SeekerDashboardPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <MoraProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#F5F6F7] text-[#111820]">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explorar" element={<ExplorePage />} />
              <Route path="/oportunidade/:id" element={<OpportunityDetailPage />} />
              <Route path="/entrar" element={<AuthPage />} />
              <Route path="/cadastro" element={<AuthPage />} />
              <Route path="/painel/interessado" element={<SeekerDashboardPage />} />
              <Route path="/painel/proprietario" element={<OwnerDashboardPage />} />
              <Route path="/mensagens" element={<ChatPage />} />
              <Route path="/planos" element={<PlansPage />} />
              <Route path="/como-funciona" element={<HowItWorksPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </MoraProvider>
    </BrowserRouter>
  );
}
