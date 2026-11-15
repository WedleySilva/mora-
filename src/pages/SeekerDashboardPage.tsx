import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  FileCheck2,
  Heart,
  MessageSquare,
  Save,
  Sparkles,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import { OpportunityCard } from '../components/OpportunityCard';
import { SafeImage } from '../components/SafeImage';
import { useMora } from '../context/MoraContext';
import { candidaturaService } from '../services/candidaturaService';
import { chatService } from '../services/chatService';
import { oportunidadeService } from '../services/oportunidadeService';
import { usuarioService, ViewedItem } from '../services/usuarioService';
import { Application, ApplicationStatus, Opportunity } from '../types/mora';

type TabKey = 'resumo' | 'candidaturas' | 'favoritos' | 'historico' | 'perfil';

const STATUS_LABELS: Record<ApplicationStatus, { label: string; style: string }> = {
  enviada: { label: 'Enviada', style: 'bg-slate-100 text-slate-700' },
  em_analise: { label: 'Em análise', style: 'bg-[#EAF1F4] text-[#123F52]' },
  visita_agendada: { label: 'Visita agendada', style: 'bg-[#FEF5E7] text-[#9A5B00]' },
  aprovada: { label: 'Aprovada', style: 'bg-emerald-50 text-emerald-800' },
  recusada: { label: 'Não selecionada', style: 'bg-red-50 text-red-700' },
};

export function SeekerDashboardPage() {
  const { user, favorites, updateCurrentUserProfile, loginWithDemo, showToast } = useMora();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>('resumo');
  const [applications, setApplications] = useState<Application[]>([]);
  const [allOpportunities, setAllOpportunities] = useState<Opportunity[]>([]);
  const [recommended, setRecommended] = useState<Opportunity[]>([]);
  const [viewedHistory, setViewedHistory] = useState<ViewedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Editable profile form state
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('SP');
  const [moradores, setMoradores] = useState(1);
  const [composicaoFamiliar, setComposicaoFamiliar] = useState('');
  const [habilidadesStr, setHabilidadesStr] = useState('');
  const [bio, setBio] = useState('');
  const [buscaTrabalho, setBuscaTrabalho] = useState(true);
  const [buscaOcupacao, setBuscaOcupacao] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'interessado') {
      setLoading(false);
      return;
    }

    setNome(user.nome);
    setTelefone(user.telefone);
    setCidade(user.cidade);
    setEstado(user.estado);
    setMoradores(user.moradores || 1);
    setComposicaoFamiliar(user.composicaoFamiliar || '');
    setHabilidadesStr((user.habilidades || []).join(', '));
    setBio(user.bio || '');
    setBuscaTrabalho(user.modalidadeInteresse?.includes('trabalho') ?? true);
    setBuscaOcupacao(user.modalidadeInteresse?.includes('ocupacao') ?? true);

    setLoading(true);
    Promise.all([
      candidaturaService.listBySeeker(user.id),
      oportunidadeService.list(),
      oportunidadeService.getRecommendedForUser(user, 3),
      usuarioService.getViewedHistory(user.id),
    ])
      .then(([apps, opps, recs, viewed]) => {
        setApplications(apps);
        setAllOpportunities(opps);
        setRecommended(recs);
        setViewedHistory(viewed);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'interessado') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-5">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#123F52]">
          Área do Interessado em Moradia
        </h1>
        <p className="text-sm sm:text-base text-[#737B80]">
          Acesse com uma conta de interessado para visualizar favoritos, candidaturas, histórico e
          recomendações personalizadas.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => loginWithDemo('usr-juliana')}
            className="px-5 py-3 rounded-xl bg-[#F59A16] hover:bg-[#DC860B] text-white text-sm font-semibold cursor-pointer"
          >
            Entrar como Juliana (Demo)
          </button>
          <Link
            to="/entrar"
            className="px-5 py-3 rounded-xl bg-[#123F52] text-white text-sm font-semibold"
          >
            Ir para login / cadastro
          </Link>
        </div>
      </div>
    );
  }

  const favoriteOpportunities = allOpportunities.filter((o) => favorites.includes(o.id));
  const viewedOpportunities = viewedHistory
    .map((v) => ({
      viewedAt: v.viewedAt,
      opp: allOpportunities.find((o) => o.id === v.opportunityId),
    }))
    .filter((item): item is { viewedAt: string; opp: Opportunity } => Boolean(item.opp));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const modalidades: ('trabalho' | 'ocupacao')[] = [];
    if (buscaTrabalho) modalidades.push('trabalho');
    if (buscaOcupacao) modalidades.push('ocupacao');

    const updated = await updateCurrentUserProfile({
      nome: nome.trim(),
      telefone: telefone.trim(),
      cidade: cidade.trim(),
      estado,
      moradores,
      composicaoFamiliar,
      habilidades: habilidadesStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      bio: bio.trim(),
      modalidadeInteresse: modalidades.length ? modalidades : ['ocupacao'],
    });
    if (updated) {
      const recs = await oportunidadeService.getRecommendedForUser(updated, 3);
      setRecommended(recs);
    }
  };

  const handleWithdrawApp = async (appId: string) => {
    await candidaturaService.withdraw(appId);
    setApplications((prev) => prev.filter((a) => a.id !== appId));
    showToast('Candidatura retirada.', 'info');
  };

  const handleOpenChatForApp = async (app: Application) => {
    const opp = allOpportunities.find((o) => o.id === app.oportunidadeId);
    if (!opp) {
      navigate('/mensagens');
      return;
    }
    const conv = await chatService.ensureConversation(opp, user);
    navigate(`/mensagens?conversa=${conv.id}`);
  };

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'resumo', label: 'Resumo e recomendações' },
    { key: 'candidaturas', label: 'Candidaturas', count: applications.length },
    { key: 'favoritos', label: 'Favoritos', count: favoriteOpportunities.length },
    { key: 'historico', label: 'Visualizadas', count: viewedOpportunities.length },
    { key: 'perfil', label: 'Editar perfil' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F7] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Profile Strip */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#F59A16]">Painel do Interessado · Uso gratuito</p>
            <h1 className="font-display text-2xl font-bold text-[#123F52]">{user.nome}</h1>
            <p className="text-sm text-[#737B80]">
              {user.cidade}, {user.estado} · {user.moradores || 1} morador(es) ·{' '}
              {(user.habilidades || []).slice(0, 3).join(', ')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/mensagens"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-[#123F52] text-sm font-semibold text-[#123F52]"
            >
              <MessageSquare className="w-4 h-4 text-[#F59A16]" />
              <span>Abrir chat</span>
            </Link>
            <Link
              to="/explorar"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#123F52] hover:bg-[#0D2E3D] text-white text-sm font-semibold"
            >
              <span>Buscar imóveis</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#123F52] text-white'
                  : 'bg-white border border-slate-200 text-[#737B80] hover:text-[#123F52]'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 tabular-nums opacity-80">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        ) : (
          <>
            {/* Tab 1: Resumo & Recomendações */}
            {activeTab === 'resumo' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between text-xs font-medium text-[#737B80]">
                      <span>Candidaturas enviadas</span>
                      <FileCheck2 className="w-4 h-4 text-[#123F52]" />
                    </div>
                    <p className="font-display text-3xl font-extrabold text-[#123F52] tabular-nums mt-2">
                      {applications.length}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between text-xs font-medium text-[#737B80]">
                      <span>Oportunidades salvas</span>
                      <Heart className="w-4 h-4 text-[#F59A16]" />
                    </div>
                    <p className="font-display text-3xl font-extrabold text-[#123F52] tabular-nums mt-2">
                      {favoriteOpportunities.length}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between text-xs font-medium text-[#737B80]">
                      <span>Imóveis visualizados</span>
                      <Clock className="w-4 h-4 text-[#123F52]" />
                    </div>
                    <p className="font-display text-3xl font-extrabold text-[#123F52] tabular-nums mt-2">
                      {viewedOpportunities.length}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-display text-xl font-bold text-[#123F52] flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#F59A16]" />
                        <span>Recomendadas para o seu perfil</span>
                      </h2>
                      <p className="text-sm text-[#737B80]">
                        Selecionadas por compatibilidade de localização, moradores, modalidade e
                        habilidades.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommended.map((opp) => (
                      <OpportunityCard key={opp.id} opportunity={opp} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Candidaturas */}
            {activeTab === 'candidaturas' && (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                    <p className="font-display text-lg font-bold text-[#123F52]">
                      Você ainda não enviou candidaturas
                    </p>
                    <p className="text-sm text-[#737B80]">
                      Explore as oportunidades disponíveis e demonstre interesse nas que combinam
                      com sua família.
                    </p>
                    <Link
                      to="/explorar"
                      className="inline-block px-5 py-2.5 rounded-xl bg-[#F59A16] text-white text-sm font-semibold"
                    >
                      Explorar oportunidades
                    </Link>
                  </div>
                ) : (
                  applications.map((app) => {
                    const st = STATUS_LABELS[app.status];
                    return (
                      <div
                        key={app.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                            <SafeImage
                              src={app.oportunidadeImagem}
                              alt={app.oportunidadeTitulo}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-semibold text-[#123F52]">
                                {app.modalidade === 'trabalho' ? 'Mora+ Trabalho' : 'Mora+ Ocupação'}
                              </span>
                              <span className="text-[#737B80]">·</span>
                              <span className="text-[#737B80]">{app.oportunidadeCidade}</span>
                              <span className="text-[#737B80]">·</span>
                              <span className={`px-2 py-0.5 rounded font-semibold ${st.style}`}>
                                {st.label}
                              </span>
                            </div>
                            <Link
                              to={`/oportunidade/${app.oportunidadeId}`}
                              className="font-display text-base font-bold text-[#111820] hover:text-[#123F52]"
                            >
                              {app.oportunidadeTitulo}
                            </Link>
                            <p className="text-xs text-[#737B80] line-clamp-2 max-w-2xl">
                              Sua mensagem: “{app.mensagem}”
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenChatForApp(app)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#123F52] text-white text-xs font-semibold hover:bg-[#0D2E3D] cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Conversar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleWithdrawApp(app.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-red-700 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Cancelar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 3: Favoritos */}
            {activeTab === 'favoritos' && (
              <div>
                {favoriteOpportunities.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                    <p className="font-display text-lg font-bold text-[#123F52]">
                      Nenhuma oportunidade favoritada ainda
                    </p>
                    <p className="text-sm text-[#737B80]">
                      Clique no coração em qualquer anúncio para salvar e comparar depois.
                    </p>
                    <Link
                      to="/explorar"
                      className="inline-block px-5 py-2.5 rounded-xl bg-[#123F52] text-white text-sm font-semibold"
                    >
                      Explorar imóveis
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteOpportunities.map((opp) => (
                      <OpportunityCard key={opp.id} opportunity={opp} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Histórico Visualizado */}
            {activeTab === 'historico' && (
              <div>
                {viewedOpportunities.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                    <p className="font-display text-lg font-bold text-[#123F52]">
                      Sem histórico recente
                    </p>
                    <p className="text-sm text-[#737B80] mt-1">
                      Os anúncios que você abrir aparecerão aqui para fácil retorno.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {viewedOpportunities.map(({ opp }) => (
                      <OpportunityCard key={opp.id} opportunity={opp} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: Editar Perfil */}
            {activeTab === 'perfil' && (
              <form
                onSubmit={handleSaveProfile}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-3xl space-y-5"
              >
                <div className="flex items-center gap-2.5">
                  <UserIcon className="w-5 h-5 text-[#F59A16]" />
                  <h2 className="font-display text-xl font-bold text-[#123F52]">
                    Minhas informações pessoais
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#123F52] mb-1">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#123F52] mb-1">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="text"
                      required
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#123F52] mb-1">
                      Cidade de interesse
                    </label>
                    <input
                      type="text"
                      required
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#123F52] mb-1">UF</label>
                      <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                      >
                        <option value="SP">SP</option>
                        <option value="MG">MG</option>
                        <option value="PR">PR</option>
                        <option value="RJ">RJ</option>
                        <option value="SC">SC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#123F52] mb-1">
                        Moradores
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={moradores}
                        onChange={(e) => setMoradores(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm tabular-nums"
                      />
                    </div>
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#123F52] mb-1.5">
                    Modalidades que procuro
                  </label>
                  <div className="flex flex-wrap gap-5 text-sm">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={buscaTrabalho}
                        onChange={(e) => setBuscaTrabalho(e.target.checked)}
                      />
                      <span>Mora+ Trabalho</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={buscaOcupacao}
                        onChange={(e) => setBuscaOcupacao(e.target.checked)}
                      />
                      <span>Mora+ Ocupação</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#123F52] mb-1">
                    Habilidades e experiências (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={habilidadesStr}
                    onChange={(e) => setHabilidadesStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#123F52] mb-1">
                    Sobre você
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#123F52] hover:bg-[#0D2E3D] text-white text-sm font-semibold cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#F59A16]" />
                  <span>Salvar alterações e atualizar recomendações</span>
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
