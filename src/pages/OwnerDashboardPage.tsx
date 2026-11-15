import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  Check,
  Edit3,
  Eye,
  Home,
  MessageSquare,
  PauseCircle,
  PlayCircle,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { SafeImage } from '../components/SafeImage';
import { useMora } from '../context/MoraContext';
import { PRESET_PROPERTY_PHOTOS } from '../data/propertyImages';
import { candidaturaService } from '../services/candidaturaService';
import { oportunidadeService } from '../services/oportunidadeService';
import {
  Application,
  ApplicationStatus,
  CreateOpportunityPayload,
  Modality,
  Opportunity,
  PropertyType,
} from '../types/mora';

type OwnerTab = 'anuncios' | 'candidatos' | 'novo';

const APP_STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'enviada', label: 'Recebida' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'visita_agendada', label: 'Visita agendada' },
  { value: 'aprovada', label: 'Acordo aprovado' },
  { value: 'recusada', label: 'Não selecionada' },
];

export function OwnerDashboardPage() {
  const { user, loginWithDemo, showToast } = useMora();
  const navigate = useNavigate();

  const [tab, setTab] = useState<OwnerTab>('anuncios');
  const [listings, setListings] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [modalidade, setModalidade] = useState<Modality>('trabalho');
  const [titulo, setTitulo] = useState('');
  const [resumo, setResumo] = useState('');
  const [descricaoCompleta, setDescricaoCompleta] = useState('');
  const [disponibilidade, setDisponibilidade] = useState('Imediata');
  const [destaque, setDestaque] = useState(false);

  // Property fields
  const [imovelTitulo, setImovelTitulo] = useState('');
  const [tipo, setTipo] = useState<PropertyType>('Chácara');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('SP');
  const [bairroOuRegiao, setBairroOuRegiao] = useState('');
  const [quartos, setQuartos] = useState(2);
  const [banheiros, setBanheiros] = useState(1);
  const [areaM2, setAreaM2] = useState(80);
  const [capacidadeMoradores, setCapacidadeMoradores] = useState(3);
  const [estadoConservacao, setEstadoConservacao] = useState('Bom estado, pronto para morar');
  const [estruturaStr, setEstruturaStr] = useState(
    'Água encanada, cozinha equipada, internet fibra, quintal cercado'
  );
  const [aceitaFilhos, setAceitaFilhos] = useState(true);
  const [aceitaPets, setAceitaPets] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([
    PRESET_PROPERTY_PHOTOS[0].url,
    PRESET_PROPERTY_PHOTOS[7].url,
  ]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  // Work-specific fields
  const [cargo, setCargo] = useState('Caseiro(a) e Manutenção Geral');
  const [salarioMensal, setSalarioMensal] = useState(2200);
  const [jornada, setJornada] = useState('44h semanais (segunda a sábado manhã)');
  const [enquadramentoLegal, setEnquadramentoLegal] = useState(
    'CLT — Empregado Doméstico / Chácara (LC nº 150/2015)'
  );
  const [atividadesStr, setAtividadesStr] = useState(
    'Manutenção do jardim e gramado, limpeza de áreas externas, comunicação de reparos'
  );
  const [condicoesMoradiaLocal, setCondicoesMoradiaLocal] = useState(
    'Casa independente no terreno com 2 quartos, cozinha e banheiro, sem desconto do salário.'
  );
  const [beneficiosStr, setBeneficiosStr] = useState(
    'Carteira assinada, FGTS e 13º salário, cesta básica'
  );

  // Occupation-specific fields
  const [instrumentoJuridico, setInstrumentoJuridico] = useState<
    'Comodato (Art. 579 Código Civil)' | 'Cessão de Uso' | 'Acordo com Contribuição de Custos'
  >('Comodato (Art. 579 Código Civil)');
  const [prazoPrevisto, setPrazoPrevisto] = useState('12 meses renováveis');
  const [valorMensalContribuicao, setValorMensalContribuicao] = useState(0);
  const [despesasConsumo, setDespesasConsumo] = useState(
    'Sem cobrança de aluguel. Ocupante assume consumo próprio de água e energia.'
  );
  const [responsabilidadesStr, setResponsabilidadesStr] = useState(
    'Manter imóvel limpo e ventilado, zelar pelo jardim frontal, comunicar vazamentos ou avarias'
  );
  const [regrasStr, setRegrasStr] = useState(
    'Uso exclusivamente residencial, proibida sublocação, vistoria registrada na plataforma'
  );

  const loadOwnerData = async (ownerId: string) => {
    setLoading(true);
    try {
      const [opps, apps] = await Promise.all([
        oportunidadeService.listByOwner(ownerId),
        candidaturaService.listByOwner(ownerId),
      ]);
      setListings(opps);
      setApplications(apps);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'proprietario') {
      loadOwnerData(user.id);
    } else {
      setLoading(false);
    }
  }, [user]);

  const resetForm = () => {
    setEditingId(null);
    setModalidade('trabalho');
    setTitulo('');
    setResumo('');
    setDescricaoCompleta('');
    setImovelTitulo('');
    setCidade('');
    setBairroOuRegiao('');
    setSelectedPhotos([PRESET_PROPERTY_PHOTOS[0].url, PRESET_PROPERTY_PHOTOS[7].url]);
  };

  const startEdit = (opp: Opportunity) => {
    setEditingId(opp.id);
    setModalidade(opp.modalidade);
    setTitulo(opp.titulo);
    setResumo(opp.resumo);
    setDescricaoCompleta(opp.descricaoCompleta);
    setDisponibilidade(opp.disponibilidade);
    setDestaque(opp.destaque);

    setImovelTitulo(opp.imovel.titulo);
    setTipo(opp.imovel.tipo);
    setCidade(opp.imovel.cidade);
    setEstado(opp.imovel.estado);
    setBairroOuRegiao(opp.imovel.bairroOuRegiao);
    setQuartos(opp.imovel.quartos);
    setBanheiros(opp.imovel.banheiros);
    setAreaM2(opp.imovel.areaM2);
    setCapacidadeMoradores(opp.imovel.capacidadeMoradores);
    setEstadoConservacao(opp.imovel.estadoConservacao);
    setEstruturaStr(opp.imovel.estrutura.join(', '));
    setAceitaFilhos(opp.imovel.aceitaFilhos);
    setAceitaPets(opp.imovel.aceitaPets);
    setSelectedPhotos(opp.imovel.imagens);

    if (opp.trabalho) {
      setCargo(opp.trabalho.cargo);
      setSalarioMensal(opp.trabalho.salarioMensal);
      setJornada(opp.trabalho.jornada);
      setEnquadramentoLegal(opp.trabalho.enquadramentoLegal);
      setAtividadesStr(opp.trabalho.atividades.join(', '));
      setCondicoesMoradiaLocal(opp.trabalho.condicoesMoradiaLocal);
      setBeneficiosStr(opp.trabalho.beneficiosAdicionais.join(', '));
    }
    if (opp.ocupacao) {
      setInstrumentoJuridico(opp.ocupacao.instrumentoJuridico);
      setPrazoPrevisto(opp.ocupacao.prazoPrevisto);
      setValorMensalContribuicao(opp.ocupacao.valorMensalContribuicao);
      setDespesasConsumo(opp.ocupacao.despesasConsumo);
      setResponsabilidadesStr(opp.ocupacao.responsabilidades.join(', '));
      setRegrasStr(opp.ocupacao.regrasUtilizacao.join(', '));
    }
    setTab('novo');
  };

  if (!user || user.role !== 'proprietario') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-5">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#123F52]">
          Área do Proprietário
        </h1>
        <p className="text-sm sm:text-base text-[#737B80]">
          Cadastre imóveis, publique oportunidades nas modalidades Trabalho ou Ocupação e gerencie
          candidatos interessados.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => loginWithDemo('usr-carlos')}
            className="px-5 py-3 rounded-xl bg-[#123F52] hover:bg-[#0D2E3D] text-white text-sm font-semibold cursor-pointer"
          >
            Entrar como Seu Carlos (Demo)
          </button>
          <Link
            to="/cadastro?perfil=proprietario"
            className="px-5 py-3 rounded-xl bg-[#F59A16] text-white text-sm font-semibold"
          >
            Cadastrar meu imóvel
          </Link>
        </div>
      </div>
    );
  }

  const togglePhotoSelection = (url: string) => {
    setSelectedPhotos((prev) => {
      if (prev.includes(url)) {
        return prev.length > 1 ? prev.filter((item) => item !== url) : prev;
      }
      return [...prev, url];
    });
  };

  const handleAddCustomPhoto = () => {
    if (!customPhotoUrl.trim()) return;
    setSelectedPhotos((prev) => [...prev, customPhotoUrl.trim()]);
    setCustomPhotoUrl('');
  };

  const handleSubmitOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !cidade.trim() || !resumo.trim()) {
      showToast('Preencha título, cidade e resumo do anúncio.', 'warning');
      return;
    }

    const payload: CreateOpportunityPayload = {
      modalidade,
      titulo: titulo.trim(),
      resumo: resumo.trim(),
      descricaoCompleta: descricaoCompleta.trim() || resumo.trim(),
      disponibilidade,
      destaque,
      imovel: {
        titulo: imovelTitulo.trim() || `${tipo} em ${cidade}`,
        tipo,
        cidade: cidade.trim(),
        estado,
        bairroOuRegiao: bairroOuRegiao.trim() || 'Região Central / Acesso fácil',
        quartos,
        banheiros,
        areaM2,
        capacidadeMoradores,
        imagens: selectedPhotos.length ? selectedPhotos : [PRESET_PROPERTY_PHOTOS[0].url],
        estrutura: estruturaStr
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        estadoConservacao,
        aceitaFilhos,
        aceitaPets,
      },
      trabalho:
        modalidade === 'trabalho'
          ? {
              cargo,
              salarioMensal: Math.max(1621, Number(salarioMensal)),
              jornada,
              enquadramentoLegal,
              atividades: atividadesStr
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
              experienciaDesejada: 'Experiência compatível com as atividades descritas.',
              condicoesMoradiaLocal,
              beneficiosAdicionais: beneficiosStr
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            }
          : undefined,
      ocupacao:
        modalidade === 'ocupacao'
          ? {
              instrumentoJuridico,
              prazoPrevisto,
              valorMensalContribuicao: Number(valorMensalContribuicao) || 0,
              despesasConsumo,
              responsabilidades: responsabilidadesStr
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
              regrasUtilizacao: regrasStr
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            }
          : undefined,
    };

    if (editingId) {
      await oportunidadeService.update(editingId, {
        ...payload,
        imovel: {
          ...payload.imovel,
          id: editingId,
          proprietarioId: user.id,
        },
      });
      showToast('Anúncio atualizado com sucesso!', 'success');
    } else {
      await oportunidadeService.create(payload, user);
      showToast('Oportunidade publicada! Já aparece na página Explorar.', 'success');
    }

    resetForm();
    await loadOwnerData(user.id);
    setTab('anuncios');
  };

  const handleToggleStatus = async (opp: Opportunity) => {
    const nextStatus = opp.status === 'ativo' ? 'pausado' : 'ativo';
    await oportunidadeService.update(opp.id, { status: nextStatus });
    setListings((prev) => prev.map((item) => (item.id === opp.id ? { ...item, status: nextStatus } : item)));
    showToast(
      nextStatus === 'ativo' ? 'Anúncio reativado nas buscas.' : 'Anúncio pausado.',
      'info'
    );
  };

  const handleDeleteListing = async (id: string) => {
    await oportunidadeService.remove(id);
    setListings((prev) => prev.filter((item) => item.id !== id));
    showToast('Anúncio excluído.', 'info');
  };

  const handleApplicationStatusChange = async (appId: string, status: ApplicationStatus) => {
    const updated = await candidaturaService.updateStatus(appId, status);
    setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
    showToast('Status da candidatura atualizado.', 'success');
  };

  const totalViews = listings.reduce((sum, l) => sum + l.visualizacoes, 0);
  const pendingApps = applications.filter(
    (a) => a.status === 'enviada' || a.status === 'em_analise'
  ).length;

  return (
    <div className="min-h-screen bg-[#F5F6F7] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Owner Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#F59A16]">
              Painel do Proprietário · {user.planoAtual || 'Plano Proprietário'}
            </p>
            <h1 className="font-display text-2xl font-bold text-[#123F52] mt-0.5">{user.nome}</h1>
            <p className="text-sm text-[#737B80]">
              {user.cidade}, {user.estado} · {user.tipoProprietario || 'Proprietário verificado'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/mensagens"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-[#123F52] hover:bg-[#F5F6F7]"
            >
              <MessageSquare className="w-4 h-4 text-[#F59A16]" />
              <span>Mensagens</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setTab('novo');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F59A16] hover:bg-[#DC860B] text-white text-sm font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar novo anúncio</span>
            </button>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-medium text-[#737B80]">Imóveis cadastrados</p>
            <p className="font-display text-3xl font-extrabold text-[#123F52] tabular-nums mt-2">
              {listings.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-medium text-[#737B80]">Total de interessados</p>
            <p className="font-display text-3xl font-extrabold text-[#123F52] tabular-nums mt-2">
              {applications.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-medium text-[#737B80]">Aguardando resposta</p>
            <p className="font-display text-3xl font-extrabold text-[#F59A16] tabular-nums mt-2">
              {pendingApps}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-medium text-[#737B80]">Visualizações acumuladas</p>
            <p className="font-display text-3xl font-extrabold text-[#123F52] tabular-nums mt-2">
              {totalViews}
            </p>
          </div>
        </div>

        {/* Workspace Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab('anuncios')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer ${
              tab === 'anuncios'
                ? 'bg-[#123F52] text-white'
                : 'bg-white border border-slate-200 text-[#737B80] hover:text-[#123F52]'
            }`}
          >
            Meus anúncios ({listings.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('candidatos')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer ${
              tab === 'candidatos'
                ? 'bg-[#123F52] text-white'
                : 'bg-white border border-slate-200 text-[#737B80] hover:text-[#123F52]'
            }`}
          >
            Interessados e candidaturas ({applications.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('novo')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer ${
              tab === 'novo'
                ? 'bg-[#F59A16] text-white'
                : 'bg-white border border-slate-200 text-[#737B80] hover:text-[#123F52]'
            }`}
          >
            {editingId ? 'Editando anúncio' : '+ Cadastrar novo anúncio'}
          </button>
        </div>

        {loading ? (
          <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        ) : (
          <>
            {/* Tab: Meus Anúncios */}
            {tab === 'anuncios' && (
              <div className="space-y-4">
                {listings.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-4">
                    <Building2 className="w-10 h-10 text-[#123F52] mx-auto opacity-60" />
                    <p className="font-display text-lg font-bold text-[#123F52]">
                      Você ainda não publicou imóveis
                    </p>
                    <button
                      type="button"
                      onClick={() => setTab('novo')}
                      className="px-5 py-2.5 rounded-xl bg-[#F59A16] text-white text-sm font-semibold cursor-pointer"
                    >
                      Cadastrar primeiro anúncio
                    </button>
                  </div>
                ) : (
                  listings.map((opp) => {
                    const appCount = applications.filter((a) => a.oportunidadeId === opp.id).length;
                    return (
                      <div
                        key={opp.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-28 h-22 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                            <SafeImage
                              src={opp.imovel.imagens[0]}
                              alt={opp.titulo}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span
                                className={`font-semibold ${
                                  opp.modalidade === 'trabalho' ? 'text-[#123F52]' : 'text-[#C87706]'
                                }`}
                              >
                                {opp.modalidade === 'trabalho' ? 'Mora+ Trabalho' : 'Mora+ Ocupação'}
                              </span>
                              <span className="text-[#737B80]">·</span>
                              <span className="text-[#737B80]">
                                {opp.imovel.cidade}, {opp.imovel.estado}
                              </span>
                              <span className="text-[#737B80]">·</span>
                              <span
                                className={`font-semibold ${
                                  opp.status === 'ativo' ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                {opp.status === 'ativo' ? 'Publicado' : 'Pausado'}
                              </span>
                            </div>

                            <Link
                              to={`/oportunidade/${opp.id}`}
                              className="font-display text-base font-bold text-[#111820] hover:text-[#123F52]"
                            >
                              {opp.titulo}
                            </Link>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-[#737B80] pt-1 tabular-nums">
                              <span className="inline-flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                {opp.visualizacoes} visualizações
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {appCount} interessado(s)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(opp)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#123F52] hover:bg-[#F5F6F7] cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(opp)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#123F52] hover:bg-[#F5F6F7] cursor-pointer"
                          >
                            {opp.status === 'ativo' ? (
                              <>
                                <PauseCircle className="w-3.5 h-3.5 text-[#F59A16]" />
                                <span>Pausar</span>
                              </>
                            ) : (
                              <>
                                <PlayCircle className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Ativar</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteListing(opp.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-red-700 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab: Candidatos */}
            {tab === 'candidatos' && (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                    <p className="font-display text-lg font-bold text-[#123F52]">
                      Nenhuma candidatura recebida até o momento
                    </p>
                    <p className="text-sm text-[#737B80] mt-1">
                      Quando interessados se candidatarem aos seus imóveis, eles aparecerão aqui.
                    </p>
                  </div>
                ) : (
                  applications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-[#F59A16]">
                            Para: {app.oportunidadeTitulo}
                          </p>
                          <h3 className="font-display text-lg font-bold text-[#123F52] mt-0.5">
                            {app.interessadoNome}
                          </h3>
                          <p className="text-xs text-[#737B80] mt-0.5">
                            {app.interessadoCidade} · {app.interessadoMoradores} morador(es) · Início:{' '}
                            {app.disponibilidadeInicio}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleApplicationStatusChange(
                                app.id,
                                e.target.value as ApplicationStatus
                              )
                            }
                            aria-label="Alterar status da candidatura"
                            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-[#F5F6F7] text-xs font-semibold text-[#123F52]"
                          >
                            {APP_STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => navigate('/mensagens')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#123F52] text-white text-xs font-semibold hover:bg-[#0D2E3D] cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Responder no chat</span>
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#F5F6F7] rounded-xl p-4 text-sm text-[#111820]">
                        “{app.mensagem}”
                      </div>

                      {app.interessadoHabilidades.length > 0 && (
                        <p className="text-xs text-[#737B80]">
                          <strong className="text-[#123F52]">Experiências informadas:</strong>{' '}
                          {app.interessadoHabilidades.join(' · ')}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Cadastrar / Editar Anúncio */}
            {tab === 'novo' && (
              <form
                onSubmit={handleSubmitOpportunity}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8"
              >
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="font-display text-xl font-bold text-[#123F52]">
                      {editingId ? 'Editar oportunidade' : 'Publicar novo imóvel e oportunidade'}
                    </h2>
                    <p className="text-sm text-[#737B80]">
                      Ao publicar, o anúncio passa a aparecer imediatamente na página Explorar.
                    </p>
                  </div>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setTab('anuncios');
                      }}
                      className="text-sm font-semibold text-[#737B80] hover:text-[#111820] cursor-pointer"
                    >
                      Cancelar edição
                    </button>
                  )}
                </div>

                {/* 1. Modality Switch */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#123F52]">
                    1. Escolha a modalidade da oportunidade
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setModalidade('trabalho')}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        modalidade === 'trabalho'
                          ? 'border-[#123F52] bg-[#EAF1F4]/70 ring-2 ring-[#123F52]/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-display text-sm font-bold text-[#123F52]">
                        <Briefcase className="w-4 h-4 text-[#123F52]" />
                        <span>Mora+ Trabalho</span>
                      </div>
                      <p className="text-xs text-[#737B80] mt-1">
                        Contratação profissional (caseiro, jardineiro, zelador) com salário + moradia.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalidade('ocupacao')}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        modalidade === 'ocupacao'
                          ? 'border-[#F59A16] bg-[#FEF5E7]/70 ring-2 ring-[#F59A16]/25'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-display text-sm font-bold text-[#123F52]">
                        <Home className="w-4 h-4 text-[#F59A16]" />
                        <span>Mora+ Ocupação</span>
                      </div>
                      <p className="text-xs text-[#737B80] mt-1">
                        Uso de imóvel desocupado mediante conservação e comunicação de problemas.
                      </p>
                    </button>
                  </div>
                </div>

                {/* 2. Property Info */}
                <div className="space-y-4">
                  <h3 className="font-display text-base font-bold text-[#123F52]">
                    2. Dados do imóvel e anúncio
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#123F52] mb-1">
                        Título do anúncio
                      </label>
                      <input
                        type="text"
                        required
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder={
                          modalidade === 'trabalho'
                            ? 'Ex.: Caseiro com moradia em chácara próxima a Sorocaba'
                            : 'Ex.: Casa térrea com quintal em Piracicaba para ocupação'
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#123F52] mb-1">
                        Tipo de imóvel
                      </label>
                      <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as PropertyType)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                      >
                        <option value="Chácara">Chácara</option>
                        <option value="Sítio">Sítio</option>
                        <option value="Casa urbana">Casa urbana</option>
                        <option value="Sobrado">Sobrado</option>
                        <option value="Fazenda">Fazenda</option>
                        <option value="Casa de temporada">Casa de temporada</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#123F52] mb-1">
                        Nome do imóvel (interno)
                      </label>
                      <input
                        type="text"
                        value={imovelTitulo}
                        onChange={(e) => setImovelTitulo(e.target.value)}
                        placeholder="Ex.: Chácara Recanto Verde"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#123F52] mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        required
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        placeholder="Ex.: Sorocaba"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
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
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-[#123F52] mb-1">
                          Bairro ou região
                        </label>
                        <input
                          type="text"
                          value={bairroOuRegiao}
                          onChange={(e) => setBairroOuRegiao(e.target.value)}
                          placeholder="Ex.: Zona Rural / Centro"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 sm:col-span-2">
                      <div>
                        <label className="block text-xs font-semibold text-[#123F52] mb-1">
                          Quartos
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={quartos}
                          onChange={(e) => setQuartos(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#123F52] mb-1">
                          Banheiros
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={banheiros}
                          onChange={(e) => setBanheiros(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#123F52] mb-1">
                          Área (m²)
                        </label>
                        <input
                          type="number"
                          min={20}
                          value={areaM2}
                          onChange={(e) => setAreaM2(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#123F52] mb-1">
                          Moradores
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={capacidadeMoradores}
                          onChange={(e) => setCapacidadeMoradores(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm tabular-nums"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#123F52] mb-1">
                        Resumo curto (exibido nos cards de busca)
                      </label>
                      <input
                        type="text"
                        required
                        value={resumo}
                        onChange={(e) => setResumo(e.target.value)}
                        placeholder="Resumo objetivo da oportunidade em 1 ou 2 frases..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#123F52] mb-1">
                        Descrição completa do imóvel e contexto
                      </label>
                      <textarea
                        rows={3}
                        value={descricaoCompleta}
                        onChange={(e) => setDescricaoCompleta(e.target.value)}
                        placeholder="Descreva os ambientes, acesso, vizinhança e como o imóvel é utilizado..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-wrap gap-6 text-sm">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={aceitaFilhos}
                          onChange={(e) => setAceitaFilhos(e.target.checked)}
                        />
                        <span>Aceita famílias com crianças</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={aceitaPets}
                          onChange={(e) => setAceitaPets(e.target.checked)}
                        />
                        <span>Aceita animais de estimação</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={destaque}
                          onChange={(e) => setDestaque(e.target.checked)}
                        />
                        <span>Marcar como Destaque (simulação comercial)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 3. Modality Dynamic Fields */}
                {modalidade === 'trabalho' ? (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="font-display text-base font-bold text-[#123F52]">
                      3. Condições obrigatórias — Mora+ Trabalho
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#123F52] mb-1">
                          Cargo / Função
                        </label>
                        <input
                          type="text"
                          required
                          value={cargo}
                          onChange={(e) => setCargo(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#123F52] mb-1">
                          Salário mensal (R$ — mínimo R$ 1.621,00)
                        </label>
                        <input
                          type="number"
                          min={1621}
                          required
                          value={salarioMensal}
                          onChange={(e) => setSalarioMensal(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#123F52] mb-1">
                          Jornada de trabalho
                        </label>
                        <input
                          type="text"
                          required
                          value={jornada}
                          onChange={(e) => setJornada(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#123F52] mb-1">
                          Enquadramento legal
                        </label>
                        <input
                          type="text"
                          value={enquadramentoLegal}
                          onChange={(e) => setEnquadramentoLegal(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#123F52] mb-1">
                          Atividades previstas (separadas por vírgula)
                        </label>
                        <input
                          type="text"
                          required
                          value={atividadesStr}
                          onChange={(e) => setAtividadesStr(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#123F52] mb-1">
                          Condições da moradia oferecida no local
                        </label>
                        <input
                          type="text"
                          required
                          value={condicoesMoradiaLocal}
                          onChange={(e) => setCondicoesMoradiaLocal(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="font-display text-base font-bold text-[#123F52]">
                      3. Condições do acordo — Mora+ Ocupação
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#123F52] mb-1">
                          Instrumento jurídico previsto
                        </label>
                        <select
                          value={instrumentoJuridico}
                          onChange={(e) =>
                            setInstrumentoJuridico(
                              e.target.value as
                                | 'Comodato (Art. 579 Código Civil)'
                                | 'Cessão de Uso'
                                | 'Acordo com Contribuição de Custos'
                            )
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                        >
                          <option value="Comodato (Art. 579 Código Civil)">
                            Comodato (Art. 579 Código Civil)
                          </option>
                          <option value="Cessão de Uso">Cessão de Uso</option>
                          <option value="Acordo com Contribuição de Custos">
                            Acordo com Contribuição de Custos
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#123F52] mb-1">
                          Prazo previsto de ocupação
                        </label>
                        <input
                          type="text"
                          required
                          value={prazoPrevisto}
                          onChange={(e) => setPrazoPrevisto(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#123F52] mb-1">
                          Contribuição mensal (R$ 0 para gratuito)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={valorMensalContribuicao}
                          onChange={(e) => setValorMensalContribuicao(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#123F52] mb-1">
                          Contas de consumo (água, luz, IPTU)
                        </label>
                        <input
                          type="text"
                          value={despesasConsumo}
                          onChange={(e) => setDespesasConsumo(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#123F52] mb-1">
                          Responsabilidades de conservação (separadas por vírgula)
                        </label>
                        <input
                          type="text"
                          required
                          value={responsabilidadesStr}
                          onChange={(e) => setResponsabilidadesStr(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#123F52] mb-1">
                          Regras de utilização (separadas por vírgula)
                        </label>
                        <input
                          type="text"
                          value={regrasStr}
                          onChange={(e) => setRegrasStr(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Photos Selection */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="font-display text-base font-bold text-[#123F52]">
                    4. Fotografias demonstrativas do imóvel
                  </h3>
                  <p className="text-xs text-[#737B80]">
                    Selecione uma ou mais imagens da galeria demonstrativa ou informe uma URL.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PRESET_PROPERTY_PHOTOS.map((preset) => {
                      const active = selectedPhotos.includes(preset.url);
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => togglePhotoSelection(preset.url)}
                          className={`relative rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer ${
                            active ? 'border-[#F59A16]' : 'border-slate-200 opacity-75 hover:opacity-100'
                          }`}
                        >
                          <div className="aspect-[4/3]">
                            <SafeImage
                              src={preset.url}
                              alt={preset.label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-2 bg-white text-[11px] font-medium text-[#111820] truncate">
                            {preset.label}
                          </div>
                          {active && (
                            <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#F59A16] text-white flex items-center justify-center shadow">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 max-w-md pt-2">
                    <input
                      type="url"
                      value={customPhotoUrl}
                      onChange={(e) => setCustomPhotoUrl(e.target.value)}
                      placeholder="Ou cole a URL de outra imagem..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomPhoto}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-[#123F52] hover:bg-[#F5F6F7] cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setTab('anuncios');
                    }}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#737B80] hover:text-[#111820] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-[#123F52] hover:bg-[#0D2E3D] text-white text-sm font-semibold cursor-pointer"
                  >
                    {editingId ? 'Salvar alterações do anúncio' : 'Publicar oportunidade na Mora+'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
