import { Link } from 'react-router-dom';
import { Heart, MapPin, ShieldCheck, Users } from 'lucide-react';
import { Opportunity } from '../types/mora';
import { useMora } from '../context/MoraContext';
import { SafeImage } from './SafeImage';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const { favorites, toggleFavorite } = useMora();
  const isFav = favorites.includes(opportunity.id);

  const isWork = opportunity.modalidade === 'trabalho';

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(opportunity.id);
  };

  return (
    <Link
      to={`/oportunidade/${opportunity.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Image Container 4:3 */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <SafeImage
          src={opportunity.imovel.imagens[0]}
          alt={opportunity.titulo}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        {/* Subtle bottom scrim for readability if needed */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />

        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFav ? 'fill-[#F59A16] text-[#F59A16]' : 'text-[#123F52]'
            }`}
          />
        </button>

        {/* Bottom-left city overlay */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#F59A16]" />
            <span className="truncate">
              {opportunity.imovel.cidade}, {opportunity.imovel.estado}
            </span>
          </span>
          {opportunity.destaque && (
            <span className="text-[11px] font-semibold tracking-wide text-[#FEF5E7] shrink-0">
              Destaque
            </span>
          )}
        </div>
      </div>

      {/* Card Content - Zero-pill clean typography */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs font-semibold mb-1.5">
            <span className={isWork ? 'text-[#123F52]' : 'text-[#C87706]'}>
              {isWork ? 'Mora+ Trabalho' : 'Mora+ Ocupação'}
            </span>
            {opportunity.verificado && (
              <span className="inline-flex items-center gap-1 text-[#737B80] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#123F52]" />
                Verificado
              </span>
            )}
          </div>

          <h3 className="font-display text-base font-bold text-[#111820] leading-snug line-clamp-2 group-hover:text-[#123F52] transition-colors">
            {opportunity.titulo}
          </h3>

          <p className="mt-1.5 text-sm text-[#737B80] line-clamp-2 leading-relaxed">
            {opportunity.resumo}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-[#737B80]">
            <span>{opportunity.imovel.tipo}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{opportunity.imovel.quartos} quartos</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Users className="w-3.5 h-3.5" />
              até {opportunity.imovel.capacidadeMoradores}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            {isWork && opportunity.trabalho ? (
              <div>
                <span className="font-display text-base font-bold text-[#123F52] tabular-nums">
                  R$ {opportunity.trabalho.salarioMensal.toLocaleString('pt-BR')}
                </span>
                <span className="text-xs text-[#737B80]"> / mês + moradia</span>
              </div>
            ) : (
              <div>
                <span className="font-display text-sm font-bold text-[#123F52]">
                  {opportunity.ocupacao?.valorMensalContribuicao === 0
                    ? 'Sem aluguel'
                    : `R$ ${opportunity.ocupacao?.valorMensalContribuicao.toLocaleString('pt-BR')}/mês`}
                </span>
                <span className="text-xs text-[#737B80]">
                  {' '}
                  · {opportunity.ocupacao?.prazoPrevisto}
                </span>
              </div>
            )}

            <span className="text-xs font-semibold text-[#F59A16] group-hover:translate-x-0.5 transition-transform whitespace-nowrap">
              Ver detalhes →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
