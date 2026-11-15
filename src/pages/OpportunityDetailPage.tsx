import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Briefcase,
  Calendar,
  CheckCircle2,
  FileText,
  Heart,
  Home,
  MapPin,
  Maximize2,
  MessageSquare,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import { SafeImage } from '../components/SafeImage';
import { useMora } from '../context/MoraContext';
import { SEED_USERS } from '../data/mockDatabase';
import { candidaturaService } from '../services/candidaturaService';
import { chatService } from '../services/chatService';
import { oportunidadeService } from '../services/oportunidadeService';
import { usuarioService } from '../services/usuarioService';
import { Application, Opportunity } from '../types/mora';

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, favorites, toggleFavorite, loginWithDemo, showToast } = useMora();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const [existingApp, setExistingApp] = useState<Application | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [applyStartDate, setApplyStartDate] = useState('Imediata');
  const [submittingApp, setSubmittingApp] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    oportunidadeService
      .getById(id)
      .then((opp) => {
        if (!active) return;
        setOpportunity(opp);
        setActivePhotoIndex(0);
        if (user && user.role === 'interessado') {
          usuarioService.recordView(user.id, opp.id).catch(() => {});
          candidaturaService
            .listBySeeker(user.id)
            .then((apps) => {
              if (!active) return;
              const match = apps.find((a) => a.oportunidadeId === opp.id) || null;
              setExistingApp(match);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (active) setError('Oportunidade não encontrada ou indisponível.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, user]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#123F52]">
          {error || 'Anúncio não encontrado'}
        </h1>
        <Link
          to="/explorar"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#123F52] text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para explorar</span>
        </Link>
      </div>
    );
  }

  const isFav = favorites.includes(opportunity.id);
  const isWork = opportunity.modalidade === 'trabalho';
  const photos = opportunity.imovel.imagens;

  const handleOpenChat = async () => {
    if (!user) {
      showToast('Entre com uma conta de interessado para conversar no chat.', 'warning');
      navigate(`/entrar?redirect=/oportunidade/${opportunity.id}`);
      return;
    }
    if (user.id === opportunity.proprietarioId) {
      navigate('/mensagens');
      return;
    }
    const conv = await chatService.ensureConversation(opportunity, user);
    navigate(`/mensagens?conversa=${conv.id}`);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!applyMessage.trim()) {
      showToast('Escreva uma breve apresentação para o proprietário.', 'warning');
      return;
    }
    setSubmittingApp(true);
    try {
      const created = await candidaturaService.apply(
        opportunity,
        user,
        applyMessage.trim(),
        applyStartDate
      );
      setExistingApp(created);
      setShowApplyModal(false);
      showToast('Candidatura registrada com sucesso! Acompanhe em seu painel.', 'success');
    } finally {
      setSubmittingApp(false);
    }
  };

  const handleQuickDemoSeekerLogin = async () => {
    const demoSeeker = SEED_USERS.find((u) => u.role === 'interessado')!;
    await loginWithDemo(demoSeeker.id);
    showToast(`Conectado como ${demoSeeker.nome} (Demonstração).`, 'success');
  };

  return (
    <div className="bg-[#F5F6F7] min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Back Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/explorar"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#737B80] hover:text-[#123F52]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar às oportunidades</span>
          </Link>

          <button
            type="button"
            onClick={() => toggleFavorite(opportunity.id)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-[#123F52] hover:bg-[#F5F6F7] cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 ${isFav ? 'fill-[#F59A16] text-[#F59A16]' : 'text-[#123F52]'}`}
            />
            <span>{isFav ? 'Salvo nos favoritos' : 'Favoritar'}</span>
          </button>
        </div>

        {/* Title Header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className={isWork ? 'text-[#123F52]' : 'text-[#C87706]'}>
              {isWork ? 'Mora+ Trabalho' : 'Mora+ Ocupação'}
            </span>
            <span className="text-[#737B80]" aria-hidden="true">
              ·
            </span>
            <span className="inline-flex items-center gap-1 text-[#737B80]">
              <MapPin className="w-3.5 h-3.5 text-[#F59A16]" />
              {opportunity.imovel.bairroOuRegiao}, {opportunity.imovel.cidade} -{' '}
              {opportunity.imovel.estado}
            </span>
            {opportunity.verificado && (
              <>
                <span className="text-[#737B80]" aria-hidden="true">
                  ·
                </span>
                <span className="inline-flex items-center gap-1 text-[#123F52]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Anúncio verificado
                </span>
              </>
            )}
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-[#123F52] tracking-tight leading-tight">
            {opportunity.titulo}
          </h1>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 aspect-[16/10] rounded-2xl overflow-hidden bg-slate-200 border border-slate-200">
            <SafeImage
              src={photos[activePhotoIndex]}
              alt={opportunity.titulo}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-4 grid grid-cols-3 lg:grid-cols-1 gap-3">
            {photos.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhotoIndex(idx)}
                className={`relative rounded-xl overflow-hidden aspect-[4/3] lg:aspect-[16/9] border-2 transition-all cursor-pointer ${
                  activePhotoIndex === idx
                    ? 'border-[#F59A16] ring-2 ring-[#F59A16]/25'
                    : 'border-slate-200 opacity-80 hover:opacity-100'
                }`}
              >
                <SafeImage
                  src={img}
                  alt={`${opportunity.titulo} - foto ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Two-Column Detail + Sticky Action Module */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Left Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Property Quick Specs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-[#737B80]">Tipo de imóvel</p>
                <p className="font-display text-sm font-bold text-[#123F52] flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-[#F59A16]" />
                  <span>{opportunity.imovel.tipo}</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#737B80]">Dormitórios e banheiros</p>
                <p className="font-display text-sm font-bold text-[#123F52] flex items-center gap-2 tabular-nums">
                  <span className="inline-flex items-center gap-1">
                    <BedDouble className="w-4 h-4 text-[#F59A16]" />
                    {opportunity.imovel.quartos} qts
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Bath className="w-4 h-4 text-[#F59A16]" />
                    {opportunity.imovel.banheiros} bhs
                  </span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#737B80]">Área da moradia</p>
                <p className="font-display text-sm font-bold text-[#123F52] flex items-center gap-1.5 tabular-nums">
                  <Maximize2 className="w-4 h-4 text-[#F59A16]" />
                  <span>{opportunity.imovel.areaM2} m²</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#737B80]">Capacidade</p>
                <p className="font-display text-sm font-bold text-[#123F52] flex items-center gap-1.5 tabular-nums">
                  <Users className="w-4 h-4 text-[#F59A16]" />
                  <span>Até {opportunity.imovel.capacidadeMoradores} pessoas</span>
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
              <h2 className="font-display text-xl font-bold text-[#123F52]">
                Sobre o imóvel e a oportunidade
              </h2>
              <p className="text-sm sm:text-base text-[#111820] leading-relaxed">
                {opportunity.descricaoCompleta}
              </p>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[#737B80]">Conservação atual: </span>
                  <span className="font-medium text-[#111820]">
                    {opportunity.imovel.estadoConservacao}
                  </span>
                </div>
                <div>
                  <span className="text-[#737B80]">Perfil familiar: </span>
                  <span className="font-medium text-[#111820]">
                    {opportunity.imovel.aceitaFilhos ? 'Aceita crianças' : 'Sem crianças'} ·{' '}
                    {opportunity.imovel.aceitaPets ? 'Aceita pets' : 'Não aceita pets'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#123F52] mb-2.5">Estrutura disponível</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {opportunity.imovel.estrutura.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-[#111820]">
                      <CheckCircle2 className="w-4 h-4 text-[#F59A16] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modality-Specific Section */}
            {isWork && opportunity.trabalho ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-5 h-5 text-[#123F52]" />
                  <h2 className="font-display text-xl font-bold text-[#123F52]">
                    Condições da vaga — Mora+ Trabalho
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F5F6F7] rounded-xl p-4 border border-slate-200/80">
                  <div>
                    <p className="text-xs text-[#737B80]">Cargo / Função</p>
                    <p className="text-sm font-bold text-[#111820] mt-0.5">
                      {opportunity.trabalho.cargo}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#737B80]">Remuneração mensal demonstrativa</p>
                    <p className="text-sm font-bold text-[#123F52] mt-0.5 tabular-nums">
                      R$ {opportunity.trabalho.salarioMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#737B80]">Jornada prevista</p>
                    <p className="text-sm font-medium text-[#111820] mt-0.5">
                      {opportunity.trabalho.jornada}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#737B80]">Enquadramento jurídico</p>
                    <p className="text-sm font-medium text-[#111820] mt-0.5">
                      {opportunity.trabalho.enquadramentoLegal}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-sm font-bold text-[#123F52]">Atividades esperadas</h3>
                  <ul className="space-y-2">
                    {opportunity.trabalho.atividades.map((atv) => (
                      <li key={atv} className="flex items-start gap-2.5 text-sm text-[#111820]">
                        <CheckCircle2 className="w-4 h-4 text-[#123F52] shrink-0 mt-0.5" />
                        <span>{atv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[#123F52]">Condições da moradia oferecida</h3>
                  <p className="text-sm text-[#111820] leading-relaxed">
                    {opportunity.trabalho.condicoesMoradiaLocal}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[#123F52]">Benefícios e adicionais</h3>
                  <ul className="space-y-1.5">
                    {opportunity.trabalho.beneficiosAdicionais.map((ben) => (
                      <li key={ben} className="flex items-center gap-2 text-sm text-[#111820]">
                        <CheckCircle2 className="w-4 h-4 text-[#F59A16] shrink-0" />
                        <span>{ben}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-[#EAF1F4] p-4 text-xs text-[#123F52] leading-relaxed">
                  <strong>Conformidade Mora+:</strong> Na modalidade Trabalho, a moradia integra as
                  condições da contratação e jamais substitui o salário ou direitos trabalhistas
                  previstos na CLT, LC nº 150/2015 ou Lei nº 5.889/1973.
                </div>
              </div>
            ) : (
              opportunity.ocupacao && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-[#F59A16]" />
                    <h2 className="font-display text-xl font-bold text-[#123F52]">
                      Condições do acordo — Mora+ Ocupação
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F5F6F7] rounded-xl p-4 border border-slate-200/80">
                    <div>
                      <p className="text-xs text-[#737B80]">Instrumento jurídico previsto</p>
                      <p className="text-sm font-bold text-[#111820] mt-0.5">
                        {opportunity.ocupacao.instrumentoJuridico}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#737B80]">Prazo previsto de ocupação</p>
                      <p className="text-sm font-bold text-[#123F52] mt-0.5">
                        {opportunity.ocupacao.prazoPrevisto}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-[#737B80]">Despesas e contas de consumo</p>
                      <p className="text-sm font-medium text-[#111820] mt-0.5">
                        {opportunity.ocupacao.despesasConsumo}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <h3 className="text-sm font-bold text-[#123F52]">
                      Responsabilidades de conservação e cuidado
                    </h3>
                    <ul className="space-y-2">
                      {opportunity.ocupacao.responsabilidades.map((resp) => (
                        <li key={resp} className="flex items-start gap-2.5 text-sm text-[#111820]">
                          <CheckCircle2 className="w-4 h-4 text-[#F59A16] shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-[#123F52]">Regras de utilização</h3>
                    <ul className="space-y-1.5">
                      {opportunity.ocupacao.regrasUtilizacao.map((regra) => (
                        <li key={regra} className="flex items-center gap-2 text-sm text-[#111820]">
                          <CheckCircle2 className="w-4 h-4 text-[#123F52] shrink-0" />
                          <span>{regra}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-[#FEF5E7] p-4 text-xs text-[#854D00] leading-relaxed">
                    <strong>Transparência Mora+:</strong> As responsabilidades listadas têm caráter
                    exclusivo de conservação cotidiana e comunicação preventiva, sem configurar
                    subordinação profissional ou vínculo empregatício.
                  </div>
                </div>
              )
            )}

            {/* Owner Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold text-[#123F52]">
                    {opportunity.proprietarioNome}
                  </h3>
                  {opportunity.proprietarioVerificado && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#123F52]">
                      <ShieldCheck className="w-4 h-4 text-[#F59A16]" />
                      Identidade verificada
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#737B80]">
                  Reside em {opportunity.proprietarioCidade} ·{' '}
                  <span className="tabular-nums">{opportunity.proprietarioTotalAcordos}</span>{' '}
                  acordos acompanhados pela plataforma
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#123F52] tabular-nums">
                <Star className="w-4 h-4 fill-[#F59A16] text-[#F59A16]" />
                <span>{opportunity.proprietarioAvaliacao.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Right Sticky Action Module */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              {isWork && opportunity.trabalho ? (
                <div>
                  <p className="text-xs font-medium text-[#737B80]">Remuneração + moradia</p>
                  <p className="font-display text-2xl font-extrabold text-[#123F52] tabular-nums mt-0.5">
                    R$ {opportunity.trabalho.salarioMensal.toLocaleString('pt-BR')}
                    <span className="text-sm font-normal text-[#737B80]"> / mês</span>
                  </p>
                  <p className="text-xs text-[#737B80] mt-1">{opportunity.trabalho.cargo}</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-[#737B80]">Condição de ocupação</p>
                  <p className="font-display text-2xl font-extrabold text-[#123F52] mt-0.5">
                    {opportunity.ocupacao?.valorMensalContribuicao === 0
                      ? 'Sem aluguel'
                      : `R$ ${opportunity.ocupacao?.valorMensalContribuicao.toLocaleString('pt-BR')}/mês`}
                  </p>
                  <p className="text-xs text-[#737B80] mt-1">
                    {opportunity.ocupacao?.instrumentoJuridico}
                  </p>
                </div>
              )}

              <div className="py-3 border-y border-slate-100 space-y-2 text-xs text-[#111820]">
                <div className="flex items-center justify-between">
                  <span className="text-[#737B80] inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Disponibilidade
                  </span>
                  <span className="font-semibold">{opportunity.disponibilidade}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#737B80]">Visualizações</span>
                  <span className="font-semibold tabular-nums">{opportunity.visualizacoes}</span>
                </div>
              </div>

              {user?.role === 'proprietario' && user.id === opportunity.proprietarioId ? (
                <Link
                  to="/painel/proprietario"
                  className="block w-full text-center px-5 py-3 rounded-xl bg-[#123F52] hover:bg-[#0D2E3D] text-white text-sm font-semibold transition-colors"
                >
                  Gerenciar meu anúncio
                </Link>
              ) : existingApp ? (
                <div className="space-y-3">
                  <div className="rounded-xl bg-[#EAF1F4] p-3.5 text-xs text-[#123F52]">
                    <p className="font-bold">Candidatura já enviada</p>
                    <p className="mt-1">
                      Status atual:{' '}
                      <strong className="uppercase">{existingApp.status.replace('_', ' ')}</strong>
                    </p>
                  </div>
                  <Link
                    to="/painel/interessado"
                    className="block w-full text-center px-5 py-3 rounded-xl bg-[#123F52] text-white text-sm font-semibold hover:bg-[#0D2E3D]"
                  >
                    Acompanhar no meu painel
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowApplyModal(true)}
                  className="w-full px-5 py-3 rounded-xl bg-[#F59A16] hover:bg-[#DC860B] text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  {isWork ? 'Candidatar-se à vaga' : 'Demonstrar interesse na ocupação'}
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenChat}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 hover:border-[#123F52] text-[#123F52] text-sm font-semibold transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#F59A16]" />
                <span>Enviar mensagem ao proprietário</span>
              </button>

              <p className="text-[11px] text-[#737B80] leading-relaxed text-center">
                A Mora+ recomenda sempre uma visita presencial ao imóvel antes da assinatura de
                qualquer contrato ou acordo.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Application Modal */}
      {showApplyModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#123F52]">
                  {isWork ? 'Enviar candidatura' : 'Demonstrar interesse na ocupação'}
                </h2>
                <p className="text-xs text-[#737B80] mt-1">{opportunity.titulo}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="text-sm font-semibold text-[#737B80] hover:text-[#111820] cursor-pointer"
              >
                Fechar
              </button>
            </div>

            {!user ? (
              <div className="space-y-4">
                <p className="text-sm text-[#111820] leading-relaxed">
                  Para registrar sua candidatura e acompanhar o andamento no painel, acesse com uma
                  conta gratuita de interessado.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleQuickDemoSeekerLogin}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#F59A16] hover:bg-[#DC860B] text-white text-sm font-semibold cursor-pointer"
                  >
                    Entrar com conta demo (Juliana)
                  </button>
                  <Link
                    to={`/cadastro?perfil=interessado`}
                    className="flex-1 text-center px-4 py-2.5 rounded-xl border border-slate-300 text-[#123F52] text-sm font-semibold hover:bg-[#F5F6F7]"
                  >
                    Criar meu cadastro
                  </Link>
                </div>
              </div>
            ) : user.role === 'proprietario' ? (
              <div className="space-y-4">
                <p className="text-sm text-[#737B80]">
                  Você está conectado com um perfil de <strong>Proprietário</strong>. Para testar o
                  envio de candidatura, alterne para uma conta de Interessado.
                </p>
                <button
                  type="button"
                  onClick={handleQuickDemoSeekerLogin}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#123F52] text-white text-sm font-semibold cursor-pointer"
                >
                  Alternar para conta demo (Juliana — Interessada)
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div className="bg-[#F5F6F7] rounded-xl p-3.5 text-xs text-[#111820] space-y-1">
                  <p>
                    <strong>Candidato(a):</strong> {user.nome} ({user.cidade}, {user.estado})
                  </p>
                  <p>
                    <strong>Moradores:</strong> {user.moradores || 1} pessoa(s)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#123F52] mb-1">
                    Disponibilidade para mudança / início
                  </label>
                  <select
                    value={applyStartDate}
                    onChange={(e) => setApplyStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="Imediata">Imediata</option>
                    <option value="Em até 15 dias">Em até 15 dias</option>
                    <option value="Em até 30 dias">Em até 30 dias</option>
                    <option value="A combinar após visita">A combinar após visita</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#123F52] mb-1">
                    Apresentação para o proprietário
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={applyMessage}
                    onChange={(e) => setApplyMessage(e.target.value)}
                    placeholder={
                      isWork
                        ? 'Conte sua experiência prática com as atividades da vaga e quem moraria com você...'
                        : 'Explique por que busca este imóvel, como pretende zelar pela conservação e sua rotina...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#123F52]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#737B80] hover:text-[#111820] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingApp}
                    className="px-5 py-2.5 rounded-xl bg-[#F59A16] hover:bg-[#DC860B] text-white text-sm font-semibold disabled:opacity-60 cursor-pointer"
                  >
                    {submittingApp ? 'Enviando...' : 'Confirmar envio'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
