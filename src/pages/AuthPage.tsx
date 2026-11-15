import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, CheckCircle2, Home, ShieldCheck, UserCheck } from 'lucide-react';
import { useMora } from '../context/MoraContext';
import { SEED_USERS } from '../data/mockDatabase';
import { authService } from '../services/authService';
import { UserRole } from '../types/mora';

export function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, setUser, loginWithDemo, showToast } = useMora();

  const isRegisterRoute = location.pathname === '/cadastro';
  const [mode, setMode] = useState<'login' | 'register'>(isRegisterRoute ? 'register' : 'login');

  useEffect(() => {
    setMode(location.pathname === '/cadastro' ? 'register' : 'login');
  }, [location.pathname]);

  const initialRole =
    (searchParams.get('perfil') as UserRole) === 'proprietario' ? 'proprietario' : 'interessado';
  const [role, setRole] = useState<UserRole>(initialRole);

  useEffect(() => {
    const paramPerfil = searchParams.get('perfil');
    if (paramPerfil === 'proprietario' || paramPerfil === 'interessado') {
      setRole(paramPerfil);
    }
  }, [searchParams]);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Common Register fields
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('SP');
  const [bio, setBio] = useState('');

  // Seeker fields
  const [moradores, setMoradores] = useState(2);
  const [composicaoFamiliar, setComposicaoFamiliar] = useState('Casal ou família pequena');
  const [buscaTrabalho, setBuscaTrabalho] = useState(true);
  const [buscaOcupacao, setBuscaOcupacao] = useState(true);
  const [habilidadesText, setHabilidadesText] = useState('Jardinagem, limpeza, pequenos reparos');
  const [disponibilidade, setDisponibilidade] = useState('Imediata');

  // Owner fields
  const [tipoProprietario, setTipoProprietario] = useState<
    'Pessoa Física' | 'Produtor Rural' | 'Imobiliária / Empresa'
  >('Pessoa Física');
  const [documentoInfo, setDocumentoInfo] = useState('');

  const redirectAfterAuth = (loggedRole: UserRole) => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      navigate(redirect);
      return;
    }
    navigate(loggedRole === 'proprietario' ? '/painel/proprietario' : '/painel/interessado');
  };

  const handleDemoClick = async (demoId: string) => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      const logged = await loginWithDemo(demoId);
      showToast(`Bem-vindo(a), ${logged.nome}!`, 'success');
      redirectAfterAuth(logged.role);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginEmail.trim()) {
      setErrorMsg('Informe seu e-mail para entrar.');
      return;
    }
    setSubmitting(true);
    try {
      const logged = await authService.login(loginEmail.trim(), loginPassword);
      setUser(logged);
      showToast(`Sessão iniciada como ${logged.nome}.`, 'success');
      redirectAfterAuth(logged.role);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível entrar com este e-mail.';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nome.trim() || !email.trim() || !cidade.trim() || !telefone.trim()) {
      setErrorMsg('Preencha nome, e-mail, telefone e cidade para concluir o cadastro.');
      return;
    }
    if (!email.includes('@')) {
      setErrorMsg('Informe um endereço de e-mail válido.');
      return;
    }
    if (role === 'interessado' && !buscaTrabalho && !buscaOcupacao) {
      setErrorMsg('Selecione ao menos uma modalidade de interesse (Trabalho ou Ocupação).');
      return;
    }

    setSubmitting(true);
    try {
      const modalidades: ('trabalho' | 'ocupacao')[] = [];
      if (buscaTrabalho) modalidades.push('trabalho');
      if (buscaOcupacao) modalidades.push('ocupacao');

      const created = await authService.register({
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        role,
        cidade: cidade.trim(),
        estado,
        bio:
          bio.trim() ||
          (role === 'proprietario'
            ? 'Proprietário cadastrado na plataforma demonstrativa Mora+.'
            : 'Interessado em oportunidades de moradia pela Mora+.'),
        ...(role === 'interessado'
          ? {
              moradores,
              composicaoFamiliar,
              modalidadeInteresse: modalidades,
              habilidades: habilidadesText
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
              disponibilidade,
            }
          : {
              tipoProprietario,
              documentoInfo: documentoInfo.trim() || 'Verificação demonstrativa pendente',
            }),
      });
      setUser(created);
      showToast('Cadastro demonstrativo criado com sucesso!', 'success');
      redirectAfterAuth(created.role);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar cadastro.';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F7] py-10 sm:py-14 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Demo Accounts & Context */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#123F52] text-white rounded-2xl p-6 sm:p-8 space-y-4">
            <p className="text-xs font-semibold text-[#F59A16]">Acesso demonstrativo imediato</p>
            <h1 className="font-display text-2xl font-bold leading-snug">
              Teste os fluxos da Mora+ com um clique
            </h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Para facilitar a apresentação do MVP, você pode alternar entre contas fictícias já
              preenchidas com anúncios, candidaturas e mensagens, ou criar um novo perfil ao lado.
            </p>

            <div className="space-y-2.5 pt-2">
              {SEED_USERS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDemoClick(demo.id)}
                  className="w-full text-left rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 p-3.5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-bold text-white">{demo.nome}</span>
                    <span className="text-[11px] font-semibold text-[#F59A16]">
                      {demo.role === 'proprietario' ? 'Proprietário' : 'Interessado'}
                    </span>
                  </div>
                  <p className="text-xs text-white/75 mt-1">
                    {demo.cidade}, {demo.estado} · {demo.email}
                  </p>
                </button>
              ))}
            </div>

            {user && (
              <div className="pt-2 border-t border-white/15 text-xs text-white/85 flex items-center justify-between">
                <span>Sessão atual: {user.nome}</span>
                <Link
                  to={user.role === 'proprietario' ? '/painel/proprietario' : '/painel/interessado'}
                  className="font-semibold text-[#F59A16] hover:underline"
                >
                  Ir ao painel →
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#123F52]">
              <ShieldCheck className="w-4 h-4 text-[#F59A16]" />
              <span>Compromisso Mora+</span>
            </div>
            <ul className="space-y-2 text-xs text-[#737B80] leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#123F52] shrink-0 mt-0.5" />
                <span>Cadastro e uso sempre gratuitos para quem procura moradia.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#123F52] shrink-0 mt-0.5" />
                <span>Autenticação simulada localmente para fins de demonstração.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Auth Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          {/* Switch Login / Register */}
          <div className="flex items-center gap-1 p-1 bg-[#F5F6F7] rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                navigate('/entrar', { replace: true });
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#123F52] shadow-sm'
                  : 'text-[#737B80] hover:text-[#123F52]'
              }`}
            >
              Entrar na conta
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                navigate('/cadastro', { replace: true });
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#123F52] shadow-sm'
                  : 'text-[#737B80] hover:text-[#123F52]'
              }`}
            >
              Criar novo cadastro
            </button>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
              {errorMsg}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#123F52]">
                  Acesse sua conta demonstrativa
                </h2>
                <p className="text-sm text-[#737B80] mt-1">
                  Digite o e-mail de uma conta cadastrada ou escolha um perfil ao lado.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123F52] mb-1.5">E-mail</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ex.: juliana@moramais.demo ou carlos@moramais.demo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#123F52]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123F52] mb-1.5">
                  Senha (qualquer valor na demonstração)
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#123F52]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#123F52] hover:bg-[#0D2E3D] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                {submitting ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-[#123F52]">
                  Qual é o seu perfil na Mora+?
                </h2>
                <p className="text-sm text-[#737B80] mt-1">
                  O formulário abaixo se adapta automaticamente conforme o seu objetivo.
                </p>
              </div>

              {/* Profile Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('interessado')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    role === 'interessado'
                      ? 'border-[#F59A16] bg-[#FEF5E7]/60 ring-2 ring-[#F59A16]/25'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-display text-sm font-bold text-[#123F52]">
                    <Home className="w-4 h-4 text-[#F59A16]" />
                    <span>Procuro moradia</span>
                  </div>
                  <p className="text-xs text-[#737B80] mt-1">
                    Para morar mediante trabalho ou acordo de ocupação. Sempre gratuito.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('proprietario')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    role === 'proprietario'
                      ? 'border-[#123F52] bg-[#EAF1F4]/70 ring-2 ring-[#123F52]/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-display text-sm font-bold text-[#123F52]">
                    <Building2 className="w-4 h-4 text-[#123F52]" />
                    <span>Sou proprietário</span>
                  </div>
                  <p className="text-xs text-[#737B80] mt-1">
                    Para anunciar casa, chácara, sítio ou imóvel desocupado.
                  </p>
                </button>
              </div>

              {/* Common Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#123F52] mb-1">
                    {role === 'proprietario' ? 'Nome completo ou empresa' : 'Nome completo'}
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder={role === 'proprietario' ? 'Ex.: Roberto Nogueira' : 'Ex.: Mariana Silva'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#123F52] mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#123F52] mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 99999-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-[#123F52] mb-1">
                      {role === 'proprietario' ? 'Cidade onde reside' : 'Cidade de interesse'}
                    </label>
                    <input
                      type="text"
                      required
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="Ex.: Campinas"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#123F52] mb-1">UF</label>
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                    >
                      <option value="SP">SP</option>
                      <option value="MG">MG</option>
                      <option value="PR">PR</option>
                      <option value="RJ">RJ</option>
                      <option value="SC">SC</option>
                      <option value="BA">BA</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dynamic Fields by Role */}
              {role === 'interessado' ? (
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#123F52] mb-1">
                        Quantas pessoas vão morar?
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={moradores}
                        onChange={(e) => setMoradores(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#123F52] mb-1">
                        Disponibilidade para mudança
                      </label>
                      <select
                        value={disponibilidade}
                        onChange={(e) => setDisponibilidade(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                      >
                        <option value="Imediata">Imediata</option>
                        <option value="Em até 15 dias">Em até 15 dias</option>
                        <option value="Em até 30 dias">Em até 30 dias</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#123F52] mb-1">
                      Composição familiar
                    </label>
                    <input
                      type="text"
                      value={composicaoFamiliar}
                      onChange={(e) => setComposicaoFamiliar(e.target.value)}
                      placeholder="Ex.: Casal com 1 filho"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#123F52] mb-1.5">
                      Modalidades de interesse
                    </label>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={buscaTrabalho}
                          onChange={(e) => setBuscaTrabalho(e.target.checked)}
                        />
                        <span>Mora+ Trabalho (vaga com moradia)</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={buscaOcupacao}
                          onChange={(e) => setBuscaOcupacao(e.target.checked)}
                        />
                        <span>Mora+ Ocupação (conservação do imóvel)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#123F52] mb-1">
                      Experiências e habilidades (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      value={habilidadesText}
                      onChange={(e) => setHabilidadesText(e.target.value)}
                      placeholder="Ex.: Jardinagem, limpeza, pintura, cuidado de piscina"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#123F52] mb-1">
                        Tipo de proprietário
                      </label>
                      <select
                        value={tipoProprietario}
                        onChange={(e) =>
                          setTipoProprietario(
                            e.target.value as 'Pessoa Física' | 'Produtor Rural' | 'Imobiliária / Empresa'
                          )
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                      >
                        <option value="Pessoa Física">Pessoa Física</option>
                        <option value="Produtor Rural">Produtor Rural</option>
                        <option value="Imobiliária / Empresa">Imobiliária / Empresa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#123F52] mb-1">
                        Documento / Autorização (ilustrativo)
                      </label>
                      <input
                        type="text"
                        value={documentoInfo}
                        onChange={(e) => setDocumentoInfo(e.target.value)}
                        placeholder="Ex.: Matrícula do imóvel ou CNPJ"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#123F52] mb-1">
                  Breve apresentação
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre o que você procura ou sobre sua propriedade..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F59A16] hover:bg-[#DC860B] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'Criando cadastro...'
                    : role === 'proprietario'
                    ? 'Concluir cadastro de proprietário'
                    : 'Concluir cadastro gratuito'}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
