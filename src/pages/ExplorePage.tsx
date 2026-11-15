import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Home,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { OpportunityCard } from '../components/OpportunityCard';
import { oportunidadeService } from '../services/oportunidadeService';
import { Modality, Opportunity, OpportunityFilters } from '../types/mora';

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialModality = (searchParams.get('modalidade') as 'todas' | Modality) || 'todas';
  const initialSearch = searchParams.get('busca') || '';

  const [filters, setFilters] = useState<OpportunityFilters>({
    busca: initialSearch,
    modalidade: initialModality,
    estado: '',
    tipoImovel: '',
    quartosMin: 0,
    moradoresMin: 0,
    apenasVerificados: false,
    cargo: '',
    salarioMin: 0,
    aceitaFilhos: false,
    aceitaPets: false,
    ordenacao: 'destaques',
  });

  const [showFilters, setShowFilters] = useState(true);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const paramMod = (searchParams.get('modalidade') as 'todas' | Modality) || 'todas';
    const paramBusca = searchParams.get('busca') || '';
    setFilters((prev) => ({
      ...prev,
      modalidade: paramMod,
      busca: paramBusca,
    }));
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    oportunidadeService
      .list(filters)
      .then((res) => {
        if (active) setOpportunities(res);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters]);

  const handleModalityChange = (mod: 'todas' | Modality) => {
    setFilters((prev) => ({
      ...prev,
      modalidade: mod,
      // Limpa filtros específicos da modalidade oposta ao alternar
      cargo: mod === 'ocupacao' ? '' : prev.cargo,
      salarioMin: mod === 'ocupacao' ? 0 : prev.salarioMin,
      aceitaFilhos: mod === 'trabalho' ? false : prev.aceitaFilhos,
    }));
    const nextParams = new URLSearchParams(searchParams);
    if (mod === 'todas') nextParams.delete('modalidade');
    else nextParams.set('modalidade', mod);
    setSearchParams(nextParams, { replace: true });
  };

  const handleClearFilters = () => {
    setFilters({
      busca: '',
      modalidade: 'todas',
      estado: '',
      tipoImovel: '',
      quartosMin: 0,
      moradoresMin: 0,
      apenasVerificados: false,
      cargo: '',
      salarioMin: 0,
      aceitaFilhos: false,
      aceitaPets: false,
      ordenacao: 'destaques',
    });
    setSearchParams({}, { replace: true });
  };

  const activeFiltersCount = [
    filters.estado,
    filters.tipoImovel,
    filters.quartosMin && filters.quartosMin > 0,
    filters.moradoresMin && filters.moradoresMin > 0,
    filters.apenasVerificados,
    filters.cargo,
    filters.salarioMin && filters.salarioMin > 0,
    filters.aceitaFilhos,
    filters.aceitaPets,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* Search & Modality Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#123F52]">
                Explorar oportunidades
              </h1>
              <p className="text-sm text-[#737B80] mt-1">
                Compare vagas de trabalho com moradia e imóveis disponíveis para ocupação responsável.
              </p>
            </div>

            {/* Modality Segmented Tabs */}
            <div className="inline-flex items-center p-1 bg-[#F5F6F7] rounded-xl border border-slate-200 self-start">
              <button
                type="button"
                onClick={() => handleModalityChange('todas')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  filters.modalidade === 'todas'
                    ? 'bg-white text-[#123F52] shadow-sm'
                    : 'text-[#737B80] hover:text-[#123F52]'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Todas</span>
              </button>
              <button
                type="button"
                onClick={() => handleModalityChange('trabalho')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  filters.modalidade === 'trabalho'
                    ? 'bg-[#123F52] text-white shadow-sm'
                    : 'text-[#737B80] hover:text-[#123F52]'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Mora+ Trabalho</span>
              </button>
              <button
                type="button"
                onClick={() => handleModalityChange('ocupacao')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  filters.modalidade === 'ocupacao'
                    ? 'bg-[#F59A16] text-white shadow-sm'
                    : 'text-[#737B80] hover:text-[#123F52]'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Mora+ Ocupação</span>
              </button>
            </div>
          </div>

          {/* Search Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2.5 bg-[#F5F6F7] px-4 py-2.5 rounded-xl border border-slate-200 focus-within:bg-white focus-within:border-[#123F52]">
              <Search className="w-4 h-4 text-[#737B80] shrink-0" />
              <input
                type="text"
                value={filters.busca || ''}
                onChange={(e) => setFilters((p) => ({ ...p, busca: e.target.value }))}
                placeholder="Buscar por cidade, bairro, cargo (caseiro, zelador) ou tipo de imóvel..."
                className="w-full text-sm text-[#111820] placeholder:text-[#737B80] bg-transparent focus:outline-none"
              />
              {filters.busca && (
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, busca: '' }))}
                  className="text-[#737B80] hover:text-[#111820] cursor-pointer"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((p) => !p)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-[#F5F6F7] text-sm font-semibold text-[#123F52] transition-colors whitespace-nowrap cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#F59A16]" />
              <span>Filtros {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
            </button>

            <select
              value={filters.ordenacao || 'destaques'}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  ordenacao: e.target.value as OpportunityFilters['ordenacao'],
                }))
              }
              aria-label="Ordenar resultados"
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-[#123F52] focus:outline-none focus:border-[#123F52]"
            >
              <option value="destaques">Destaques primeiro</option>
              <option value="recentes">Mais recentes</option>
              <option value="maior_salario">Maior remuneração</option>
              <option value="mais_quartos">Mais quartos</option>
            </select>
          </div>

          {/* Dynamic Modality-Specific Filter Panel */}
          {showFilters && (
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#737B80] mb-1">Estado</label>
                <select
                  value={filters.estado || ''}
                  onChange={(e) => setFilters((p) => ({ ...p, estado: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-[#111820]"
                >
                  <option value="">Todos os estados</option>
                  <option value="SP">São Paulo (SP)</option>
                  <option value="MG">Minas Gerais (MG)</option>
                  <option value="PR">Paraná (PR)</option>
                  <option value="RJ">Rio de Janeiro (RJ)</option>
                  <option value="SC">Santa Catarina (SC)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#737B80] mb-1">
                  Tipo de imóvel
                </label>
                <select
                  value={filters.tipoImovel || ''}
                  onChange={(e) => setFilters((p) => ({ ...p, tipoImovel: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-[#111820]"
                >
                  <option value="">Todos os tipos</option>
                  <option value="Chácara">Chácara</option>
                  <option value="Sítio">Sítio</option>
                  <option value="Casa urbana">Casa urbana</option>
                  <option value="Sobrado">Sobrado</option>
                  <option value="Fazenda">Fazenda</option>
                  <option value="Casa de temporada">Casa de temporada</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#737B80] mb-1">
                  Quartos mínimos
                </label>
                <select
                  value={filters.quartosMin || 0}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, quartosMin: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-[#111820]"
                >
                  <option value={0}>Qualquer quantidade</option>
                  <option value={1}>1+ quarto</option>
                  <option value={2}>2+ quartos</option>
                  <option value={3}>3+ quartos</option>
                </select>
              </div>

              {/* Modality-specific filters */}
              {filters.modalidade === 'trabalho' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#737B80] mb-1">
                      Cargo ou função
                    </label>
                    <select
                      value={filters.cargo || ''}
                      onChange={(e) => setFilters((p) => ({ ...p, cargo: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-[#111820]"
                    >
                      <option value="">Todos os cargos</option>
                      <option value="Caseiro">Caseiro(a)</option>
                      <option value="Rural">Trabalhador Rural</option>
                      <option value="Zelador">Zelador(a)</option>
                      <option value="Jardineiro">Jardineiro(a)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#737B80] mb-1">
                      Salário mínimo
                    </label>
                    <select
                      value={filters.salarioMin || 0}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, salarioMin: Number(e.target.value) }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-[#111820]"
                    >
                      <option value={0}>Qualquer faixa</option>
                      <option value={2000}>A partir de R$ 2.000</option>
                      <option value={2200}>A partir de R$ 2.200</option>
                      <option value={2400}>A partir de R$ 2.400</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#737B80] mb-1">
                      Moradores suportados
                    </label>
                    <select
                      value={filters.moradoresMin || 0}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, moradoresMin: Number(e.target.value) }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-[#111820]"
                    >
                      <option value={0}>Qualquer tamanho</option>
                      <option value={2}>2+ pessoas</option>
                      <option value={3}>3+ pessoas</option>
                      <option value={4}>4+ pessoas</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end gap-1.5">
                    <label className="inline-flex items-center gap-2 text-xs text-[#111820] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(filters.aceitaFilhos)}
                        onChange={(e) =>
                          setFilters((p) => ({ ...p, aceitaFilhos: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-[#123F52]"
                      />
                      <span>Aceita crianças</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs text-[#111820] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(filters.aceitaPets)}
                        onChange={(e) =>
                          setFilters((p) => ({ ...p, aceitaPets: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-[#123F52]"
                      />
                      <span>Aceita animais de estimação</span>
                    </label>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <p className="text-sm text-[#737B80]">
            <span className="font-semibold text-[#123F52] tabular-nums">
              {opportunities.length}
            </span>{' '}
            {opportunities.length === 1 ? 'oportunidade encontrada' : 'oportunidades encontradas'}
          </p>

          {(activeFiltersCount > 0 || filters.busca || filters.modalidade !== 'todas') && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-semibold text-[#F59A16] hover:text-[#DC860B] cursor-pointer"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-96 animate-pulse" />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8 space-y-4">
            <h2 className="font-display text-xl font-bold text-[#123F52]">
              Nenhuma oportunidade corresponde aos filtros atuais
            </h2>
            <p className="text-sm text-[#737B80]">
              Tente ampliar a cidade buscada, remover a exigência de salário mínimo ou alternar entre
              as modalidades Trabalho e Ocupação.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-5 py-2.5 rounded-xl bg-[#123F52] text-white text-sm font-semibold hover:bg-[#0D2E3D] cursor-pointer"
            >
              Mostrar todas as oportunidades
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
