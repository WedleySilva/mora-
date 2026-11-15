import { Link } from 'react-router-dom';
import { MoraLogo } from './MoraLogo';
import { resetDemoData } from '../services/apiClient';
import { useMora } from '../context/MoraContext';

export function Footer() {
  const { showToast } = useMora();

  const handleResetDemo = () => {
    resetDemoData();
    showToast('Dados demonstrativos restaurados. Recarregando...', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <footer className="bg-[#123F52] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-white/15">
          <div className="md:col-span-1 space-y-4">
            <MoraLogo variant="light" size="md" showSlogan />
            <p className="text-sm text-white/75 leading-relaxed">
              Plataforma digital de intermediação habitacional. Onde o trabalho encontra a moradia e imóveis vazios ganham cuidado e propósito.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">Plataforma</h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link to="/explorar" className="hover:text-[#F59A16] transition-colors">
                  Explorar oportunidades
                </Link>
              </li>
              <li>
                <Link to="/explorar?modalidade=trabalho" className="hover:text-[#F59A16] transition-colors">
                  Mora+ Trabalho
                </Link>
              </li>
              <li>
                <Link to="/explorar?modalidade=ocupacao" className="hover:text-[#F59A16] transition-colors">
                  Mora+ Ocupação
                </Link>
              </li>
              <li>
                <Link to="/planos" className="hover:text-[#F59A16] transition-colors">
                  Planos e serviços
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">Contas e Painéis</h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link to="/cadastro?perfil=interessado" className="hover:text-[#F59A16] transition-colors">
                  Procuro moradia (Gratuito)
                </Link>
              </li>
              <li>
                <Link to="/cadastro?perfil=proprietario" className="hover:text-[#F59A16] transition-colors">
                  Tenho um imóvel disponível
                </Link>
              </li>
              <li>
                <Link to="/entrar" className="hover:text-[#F59A16] transition-colors">
                  Acessar conta demonstrativa
                </Link>
              </li>
              <li>
                <Link to="/mensagens" className="hover:text-[#F59A16] transition-colors">
                  Central de mensagens
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">Conformidade e Ajuda</h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link to="/como-funciona" className="hover:text-[#F59A16] transition-colors">
                  Como funciona na prática
                </Link>
              </li>
              <li>
                <Link to="/como-funciona#seguranca" className="hover:text-[#F59A16] transition-colors">
                  Segurança jurídica e LGPD
                </Link>
              </li>
              <li>
                <Link to="/planos#faq" className="hover:text-[#F59A16] transition-colors">
                  Dúvidas frequentes
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="text-left text-white/70 hover:text-[#F59A16] transition-colors cursor-pointer"
                >
                  Restaurar dados da demonstração
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/65">
          <p>
            © 2026 Mora Mais Tecnologia e Intermediação Ltda. · Ambiente MVP demonstrativo com dados fictícios.
          </p>
          <p>
            Atuação como intermediadora digital · Respeito à CLT, Lei nº 5.889/73, LC nº 150/2015 e Código Civil.
          </p>
        </div>
      </div>
    </footer>
  );
}
