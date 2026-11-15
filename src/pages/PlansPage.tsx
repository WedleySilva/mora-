import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Info, ShieldCheck } from 'lucide-react';
import { ADDON_SERVICES, COMMERCIAL_PLANS } from '../data/mockDatabase';
import { useMora } from '../context/MoraContext';

export function PlansPage() {
  const { showToast } = useMora();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-proprietario');
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');

  const handleSelectPlan = (planName: string) => {
    showToast(
      `Seleção demonstrativa: "${planName}". Nenhuma cobrança real é realizada neste MVP.`,
      'info'
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F6F7] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#F59A16]">
            <Info className="w-4 h-4" />
            <span>Valores demonstrativos e ilustrativos · Sem cobrança real no MVP</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#123F52] tracking-tight">
            Planos transparentes e acessíveis, sem comissão sobre aluguel
          </h1>
          <p className="text-base text-[#737B80] leading-relaxed">
            O uso da Mora+ é <strong>sempre gratuito para quem procura moradia</strong>. Para
            proprietários e empresas, oferecemos entrada gratuita e serviços opcionais de
            segurança, verificação e formalização jurídica.
          </p>

          {/* Cycle Switch */}
          <div className="inline-flex items-center p-1 bg-white rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setBillingCycle('mensal')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                billingCycle === 'mensal'
                  ? 'bg-[#123F52] text-white'
                  : 'text-[#737B80] hover:text-[#123F52]'
              }`}
            >
              Referência mensal
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('anual')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                billingCycle === 'anual'
                  ? 'bg-[#123F52] text-white'
                  : 'text-[#737B80] hover:text-[#123F52]'
              }`}
            >
              Referência anual (desconto ~2 meses)
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {COMMERCIAL_PLANS.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const displayPrice =
              plan.id === 'plan-proprietario' && billingCycle === 'anual'
                ? 'R$ 399,00'
                : plan.preco;
            const displayCadence =
              plan.id === 'plan-proprietario' && billingCycle === 'anual'
                ? 'por ano (equivalente a R$ 33,25/mês)'
                : plan.cadencia;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`rounded-2xl p-6 flex flex-col justify-between gap-6 border transition-all cursor-pointer ${
                  plan.destaque
                    ? 'bg-[#123F52] text-white border-[#123F52] shadow-md'
                    : isSelected
                    ? 'bg-white text-[#111820] border-[#F59A16] ring-2 ring-[#F59A16]/20'
                    : 'bg-white text-[#111820] border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  <div>
                    <p
                      className={`text-xs font-semibold ${
                        plan.destaque ? 'text-[#F59A16]' : 'text-[#737B80]'
                      }`}
                    >
                      {plan.publico}
                    </p>
                    <h2 className="font-display text-xl font-bold mt-1">{plan.nome}</h2>
                  </div>

                  <div>
                    <p className="font-display text-3xl font-extrabold tabular-nums">
                      {displayPrice}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        plan.destaque ? 'text-white/75' : 'text-[#737B80]'
                      }`}
                    >
                      {displayCadence}
                    </p>
                  </div>

                  <ul className="space-y-2.5 pt-3 border-t border-current/10 text-sm">
                    {plan.itens.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            plan.destaque ? 'text-[#F59A16]' : 'text-[#123F52]'
                          }`}
                        />
                        <span className={plan.destaque ? 'text-white/90' : 'text-[#111820]'}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan(plan.nome);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    plan.destaque
                      ? 'bg-[#F59A16] hover:bg-[#DC860B] text-white'
                      : 'bg-[#F5F6F7] hover:bg-[#EAF1F4] text-[#123F52]'
                  }`}
                >
                  Simular escolha
                </button>
              </div>
            );
          })}
        </div>

        {/* Add-on Formalization & Protection Services */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-[#123F52]">
              Serviços sob demanda de formalização e acompanhamento
            </h2>
            <p className="text-sm text-[#737B80] mt-1">
              Contratados apenas quando proprietário e interessado decidem fechar um acordo com
              segurança documental. Valores meramente ilustrativos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ADDON_SERVICES.map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#F59A16]">{srv.para}</p>
                      <h3 className="font-display text-lg font-bold text-[#123F52]">{srv.nome}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-xl font-extrabold text-[#123F52] tabular-nums">
                        {srv.preco}
                      </p>
                      <p className="text-[11px] text-[#737B80]">{srv.cobranca}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#737B80] leading-relaxed">{srv.descricao}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-[#737B80]">Valor ilustrativo de referência</span>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(srv.nome)}
                    className="text-xs font-semibold text-[#123F52] hover:text-[#F59A16] cursor-pointer"
                  >
                    Simular contratação →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Social Price & Legal Model Explanation */}
        <section
          id="faq"
          className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-[#123F52]">
              <ShieldCheck className="w-5 h-5 text-[#F59A16]" />
              <span>Por que a Mora+ não cobra comissão sobre aluguel?</span>
            </div>
            <p className="text-sm text-[#737B80] leading-relaxed">
              A plataforma cobra valores fixos por tecnologia, verificação e apoio documental — e
              não percentuais sobre salários ou ocupações. Isso garante preço previsível, evita que
              a empresa lucre com o trabalho do ocupante e respeita a Lei nº 6.530/1978, mantendo a
              Mora+ dedicada à intermediação tecnológica.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-base font-bold text-[#123F52]">
              Programa Fundadores e Preço Social (CRAS)
            </h3>
            <ul className="space-y-2 text-sm text-[#737B80]">
              <li>
                <strong className="text-[#111820]">Programa Fundadores:</strong> primeiros
                proprietários da região-piloto recebem período demonstrativo gratuito do Plano
                Proprietário em troca de validação.
              </li>
              <li>
                <strong className="text-[#111820]">Preço Social:</strong> imóveis cedidos na
                modalidade Ocupação para famílias encaminhadas por CRAS e entidades parceiras são
                isentos da taxa de formalização.
              </li>
            </ul>
            <div className="pt-2">
              <Link
                to="/cadastro"
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#123F52] text-white text-sm font-semibold hover:bg-[#0D2E3D]"
              >
                Criar conta demonstrativa
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
