import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  FileCheck2,
  Home,
  MessageSquare,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { OpportunityCard } from '../components/OpportunityCard';
import { SafeImage } from '../components/SafeImage';
import { TESTIMONIALS } from '../data/mockDatabase';
import { PROPERTY_IMAGES } from '../data/propertyImages';
import { oportunidadeService } from '../services/oportunidadeService';
import { Modality, Opportunity } from '../types/mora';

export function HomePage() {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');
  const [searchModality, setSearchModality] = useState<'todas' | Modality>('todas');
  const [featured, setFeatured] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    oportunidadeService
      .getFeatured(6)
      .then(setFeatured)
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity.trim()) params.set('busca', searchCity.trim());
    if (searchModality !== 'todas') params.set('modalidade', searchModality);
    navigate(`/explorar${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="bg-[#F5F6F7]">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between gap-8">
              <div className="space-y-5">
                <p className="text-sm font-semibold text-[#F59A16]">
                  Plataforma digital de intermediação habitacional
                </p>
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#123F52] tracking-tight leading-[1.12] [text-wrap:balance]">
                  Transformando imóveis vazios em novos lares.
                </h1>
                <p className="text-base sm:text-lg text-[#737B80] leading-relaxed max-w-xl">
                  Conectamos proprietários de casas, chácaras e sítios desocupados a pessoas que
                  buscam moradia — por meio de trabalho formal com residência ou acordos claros de
                  ocupação e conservação.
                </p>
              </div>

              {/* Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-[#F5F6F7] p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-2.5"
              >
                <div className="flex-1 flex items-center gap-2.5 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 focus-within:border-[#123F52]">
                  <Search className="w-4 h-4 text-[#737B80] shrink-0" />
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="Cidade, região ou tipo (ex.: Atibaia, Campinas, sítio)"
                    className="w-full text-sm text-[#111820] placeholder:text-[#737B80] bg-transparent focus:outline-none"
                    aria-label="Buscar por cidade ou região"
                  />
                </div>

                <select
                  value={searchModality}
                  onChange={(e) => setSearchModality(e.target.value as 'todas' | Modality)}
                  aria-label="Selecionar modalidade"
                  className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-[#123F52] focus:outline-none focus:border-[#123F52]"
                >
                  <option value="todas">Todas as modalidades</option>
                  <option value="trabalho">Mora+ Trabalho</option>
                  <option value="ocupacao">Mora+ Ocupação</option>
                </select>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#F59A16] hover:bg-[#DC860B] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Buscar oportunidades
                </button>
              </form>

              {/* Quick Entry Profile Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/explorar"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#123F52] hover:bg-[#0D2E3D] text-white text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  <Home className="w-4 h-4 text-[#F59A16]" />
                  <span>Procuro moradia</span>
                </Link>
                <Link
                  to="/cadastro?perfil=proprietario"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 hover:border-[#123F52] text-[#123F52] text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  <Building2 className="w-4 h-4 text-[#F59A16]" />
                  <span>Tenho um imóvel</span>
                </Link>
              </div>
            </div>

            {/* Hero Right Visual */}
            <div className="lg:col-span-6 relative rounded-2xl overflow-hidden min-h-[300px] lg:min-h-[430px] border border-slate-200">
              <SafeImage
                src={PROPERTY_IMAGES.heroHomestead}
                alt="Casa acolhedora com varanda e jardim bem cuidado"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#123F52]/80 via-[#123F52]/15 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#F59A16]">
                    Onde o trabalho encontra a moradia
                  </p>
                  <p className="font-display text-lg sm:text-xl font-bold leading-snug mt-0.5">
                    Imóveis cuidados e oportunidades reais além do aluguel tradicional.
                  </p>
                </div>
                <Link
                  to="/como-funciona"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-[#F59A16] whitespace-nowrap shrink-0"
                >
                  <span>Entender o modelo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modalities Presentation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-2xl mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#123F52] tracking-tight">
            Duas modalidades claras para necessidades diferentes
          </h2>
          <p className="mt-2 text-base text-[#737B80] leading-relaxed">
            A Mora+ separa desde o cadastro o que é relação profissional formalizada e o que é
            acordo de ocupação responsável, garantindo transparência para ambos os lados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mora+ Trabalho */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[#123F52]">
                  <Briefcase className="w-4 h-4 text-[#F59A16]" />
                  Mora+ Trabalho
                </span>
                <span className="text-xs font-medium text-[#737B80]">
                  Contratação com moradia no local
                </span>
              </div>

              <h3 className="font-display text-xl font-bold text-[#111820]">
                Oportunidades profissionais que oferecem moradia como parte das condições
              </h3>

              <p className="text-sm text-[#737B80] leading-relaxed">
                Indicado para chácaras, sítios, fazendas e casas de temporada que precisam de
                caseiro, jardineiro, zelador ou trabalhador rural com salário definido, jornada clara
                e registro respeitando a legislação trabalhista.
              </p>

              <ul className="space-y-2 text-sm text-[#111820] pt-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#123F52] shrink-0 mt-0.5" />
                  <span>Salário e jornada informados antes da conversa</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#123F52] shrink-0 mt-0.5" />
                  <span>Moradia nunca substitui salário nem direitos trabalhistas</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#123F52] shrink-0 mt-0.5" />
                  <span>Apoio com checklist CLT, rural ou doméstico e vistoria</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/explorar?modalidade=trabalho"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#123F52] hover:text-[#F59A16] transition-colors"
              >
                <span>Ver vagas em Mora+ Trabalho</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mora+ Ocupação */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[#C87706]">
                  <Home className="w-4 h-4 text-[#F59A16]" />
                  Mora+ Ocupação
                </span>
                <span className="text-xs font-medium text-[#737B80]">
                  Acordo de uso e conservação
                </span>
              </div>

              <h3 className="font-display text-xl font-bold text-[#111820]">
                Ocupação de imóveis desocupados mediante cuidados simples e preservação
              </h3>

              <p className="text-sm text-[#737B80] leading-relaxed">
                Pensado para casas urbanas, imóveis herdados ou propriedades vazias que precisam de
                presença, limpeza cotidiana e comunicação rápida de reparos — formalizado por
                comodato ou cessão de uso, sem substituir emprego formal.
              </p>

              <ul className="space-y-2 text-sm text-[#111820] pt-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F59A16] shrink-0 mt-0.5" />
                  <span>Alternativa acessível sem fiador ou caução tradicional</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F59A16] shrink-0 mt-0.5" />
                  <span>Responsabilidades proporcionais de conservação e aviso</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F59A16] shrink-0 mt-0.5" />
                  <span>Contrato de comodato ou cessão com vistoria fotográfica</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/explorar?modalidade=ocupacao"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#123F52] hover:text-[#F59A16] transition-colors"
              >
                <span>Ver imóveis em Mora+ Ocupação</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#123F52] tracking-tight">
              Oportunidades em destaque
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-[#737B80]">
              Imóveis verificados com condições transparentes nas duas modalidades.
            </p>
          </div>
          <Link
            to="/explorar"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#123F52] hover:text-[#F59A16] whitespace-nowrap"
          >
            <span>Explorar todos os anúncios</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200 h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-white border-y border-slate-200/80 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#123F52] tracking-tight">
              Como a plataforma funciona na prática
            </h2>
            <p className="mt-2 text-base text-[#737B80]">
              Um fluxo simples, gratuito para quem procura moradia e estruturado para dar segurança
              a proprietários.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01.',
                icon: ShieldCheck,
                title: 'Cadastro e verificação',
                desc: 'Proprietários informam o imóvel e escolhem a modalidade; interessados registram habilidades, região e composição familiar.',
              },
              {
                num: '02.',
                icon: Users,
                title: 'Compatibilidade clara',
                desc: 'O sistema sugere oportunidades por cidade, número de moradores, experiência e condições propostas sem decidir no lugar das partes.',
              },
              {
                num: '03.',
                icon: MessageSquare,
                title: 'Conversa e visita',
                desc: 'As partes alinham expectativas pelo chat interno com histórico registrado e agendam visita presencial antes do acordo.',
              },
              {
                num: '04.',
                icon: FileCheck2,
                title: 'Formalização e apoio',
                desc: 'Com checklists, modelos jurídicos adequados (CLT ou comodato) e vistoria fotográfica, tudo fica documentado.',
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-[#F5F6F7] rounded-2xl border border-slate-200/80 p-6 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-[#F59A16]">
                      {step.num}
                    </span>
                    <Icon className="w-5 h-5 text-[#123F52]" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#111820]">{step.title}</h3>
                  <p className="text-sm text-[#737B80] leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits + Impact Context + Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {/* Dual Audience Benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
            <h3 className="font-display text-xl font-bold text-[#123F52]">
              Benefícios para proprietários
            </h3>
            <ul className="space-y-3 text-sm text-[#111820]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#F59A16] shrink-0 mt-0.5" />
                <span>Evita deterioração, infiltrações sem aviso e risco de invasões em imóveis vazios.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#F59A16] shrink-0 mt-0.5" />
                <span>Reduz a dificuldade de encontrar caseiros ou ocupantes com referências verificáveis.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#F59A16] shrink-0 mt-0.5" />
                <span>Substitui acertos informais "de boca" por condições escritas e vistoria registrada.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#F59A16] shrink-0 mt-0.5" />
                <span>Preços fixos e previsíveis, sem cobrança de comissão percentual sobre aluguel.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
            <h3 className="font-display text-xl font-bold text-[#123F52]">
              Benefícios para quem procura moradia
            </h3>
            <ul className="space-y-3 text-sm text-[#111820]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#123F52] shrink-0 mt-0.5" />
                <span>Uso 100% gratuito da plataforma para buscar, conversar e se candidatar.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#123F52] shrink-0 mt-0.5" />
                <span>Alternativas reais ao aluguel convencional que exige fiador, caução e renda elevada.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#123F52] shrink-0 mt-0.5" />
                <span>Transparência prévia sobre deveres, prazos, remuneração e características da casa.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#123F52] shrink-0 mt-0.5" />
                <span>Proteção contra propostas abusivas através da moderação ativa de anúncios.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Impact Context & Testimonials */}
        <div className="bg-[#123F52] text-white rounded-2xl p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              <p className="text-xs font-semibold text-[#F59A16]">
                Por que a Mora+ existe · Dados IBGE e FJP
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                Há casas sem gente e gente sem casa no Brasil.
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                Enquanto milhões de imóveis permanecem fechados ou sem acompanhamento, o alto custo
                do aluguel pressiona famílias trabalhadoras. A tecnologia aproxima essas duas
                realidades com segurança.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-xl p-5 border border-white/15">
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#F59A16] tabular-nums">
                  11,4 mi
                </p>
                <p className="mt-1 text-xs text-white/80">
                  domicílios particulares vagos no país (Censo IBGE 2022)
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-5 border border-white/15">
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#F59A16] tabular-nums">
                  6,7 mi
                </p>
                <p className="mt-1 text-xs text-white/80">
                  imóveis de uso ocasional que exigem cuidado fora de temporada
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-5 border border-white/15">
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#F59A16] tabular-nums">
                  6,2 mi
                </p>
                <p className="mt-1 text-xs text-white/80">
                  famílias em déficit habitacional, 52% por ônus excessivo com aluguel
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-[#123F52]">
              Histórias demonstrativas de quem usa a Mora+
            </h2>
            <p className="text-sm text-[#737B80] mt-1">
              Relatos ilustrativos baseados nos perfis reais mapeados no plano da plataforma.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((dep) => (
              <div
                key={dep.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-[#F59A16]">{dep.modalidade}</p>
                  <p className="text-sm text-[#737B80] leading-relaxed">
                    <strong className="text-[#111820] font-semibold">Antes:</strong> {dep.antes}
                  </p>
                  <p className="text-sm text-[#111820] leading-relaxed">
                    <strong className="text-[#123F52] font-semibold">Com a Mora+:</strong>{' '}
                    {dep.resultado}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="font-display text-sm font-bold text-[#123F52]">{dep.nome}</p>
                  <p className="text-xs text-[#737B80]">
                    {dep.papel} · {dep.cidade}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Signup CTA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#123F52]">
              Pronto para testar a experiência da Mora+?
            </h2>
            <p className="text-sm sm:text-base text-[#737B80]">
              Crie sua conta demonstrativa gratuita, publique um anúncio de trabalho ou ocupação ou
              explore imóveis disponíveis com filtros reais.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/cadastro?perfil=interessado"
              className="px-5 py-3 rounded-xl bg-[#F59A16] hover:bg-[#DC860B] text-white text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Cadastrar para moradia
            </Link>
            <Link
              to="/cadastro?perfil=proprietario"
              className="px-5 py-3 rounded-xl bg-[#123F52] hover:bg-[#0D2E3D] text-white text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Anunciar meu imóvel
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
