import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle2, FileText, Home, Scale, ShieldCheck } from 'lucide-react';

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#F5F6F7] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-[#F59A16]">Modelo operacional e jurídico</p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#123F52] tracking-tight">
            Como a Mora+ conecta proprietários e moradores com segurança
          </h1>
          <p className="text-base text-[#737B80] leading-relaxed">
            A Mora+ atua como intermediadora digital: organiza informações, promove compatibilidade
            entre perfis, preserva o histórico de negociação e oferece ferramentas de formalização. A
            empresa não é proprietária dos imóveis nem empregadora automática.
          </p>
        </div>

        {/* Comparison Table */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="font-display text-xl font-bold text-[#123F52]">
              Diferenças práticas entre as duas modalidades
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F6F7] text-[#123F52]">
                <tr>
                  <th className="py-3.5 px-6 font-bold">Aspecto</th>
                  <th className="py-3.5 px-6 font-bold">
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-[#123F52]" />
                      Mora+ Trabalho
                    </span>
                  </th>
                  <th className="py-3.5 px-6 font-bold">
                    <span className="inline-flex items-center gap-1.5">
                      <Home className="w-4 h-4 text-[#F59A16]" />
                      Mora+ Ocupação
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-4 px-6 font-semibold text-[#111820]">Finalidade principal</td>
                  <td className="py-4 px-6 text-[#737B80]">
                    Contratação de pessoa para atividades profissionais no imóvel.
                  </td>
                  <td className="py-4 px-6 text-[#737B80]">
                    Disponibilização de imóvel vazio para uso e conservação cotidiana.
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-[#111820]">Relação entre as partes</td>
                  <td className="py-4 px-6 text-[#737B80]">
                    Empregador e trabalhador, com vínculo formalizado quando aplicável.
                  </td>
                  <td className="py-4 px-6 text-[#737B80]">
                    Proprietário e ocupante, sem subordinação profissional.
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-[#111820]">Remuneração</td>
                  <td className="py-4 px-6 text-[#737B80]">
                    Salário definido + direitos trabalhistas. Moradia não substitui salário.
                  </td>
                  <td className="py-4 px-6 text-[#737B80]">
                    Não há salário; acordo gratuito ou contribuição combinada de custos.
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-[#111820]">Instrumento jurídico</td>
                  <td className="py-4 px-6 text-[#737B80]">
                    Registro CLT, trabalho rural (Lei 5.889/73) ou doméstico (LC 150/15).
                  </td>
                  <td className="py-4 px-6 text-[#737B80]">
                    Contrato de Comodato (Art. 579 CC), Cessão de Uso ou Locação específica.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Legal & LGPD Safeguards */}
        <section id="seguranca" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-[#123F52]">
              <Scale className="w-5 h-5 text-[#F59A16]" />
              <h2 className="font-display text-xl font-bold">Segurança jurídica e moderação</h2>
            </div>
            <ul className="space-y-3 text-sm text-[#111820]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#123F52] shrink-0 mt-0.5" />
                <span>
                  Anúncios que oferecem “casa em troca de trabalho” sem salário na modalidade
                  Trabalho são recusados na moderação.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#123F52] shrink-0 mt-0.5" />
                <span>
                  Se uma proposta de Ocupação exigir tarefas habituais e subordinadas, o proprietário
                  é orientado a migrar para Mora+ Trabalho.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#123F52] shrink-0 mt-0.5" />
                <span>
                  Vistoria digital de entrada e saída com fotos e checklist antes da entrega das
                  chaves.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-[#123F52]">
              <ShieldCheck className="w-5 h-5 text-[#123F52]" />
              <h2 className="font-display text-xl font-bold">Proteção de dados (LGPD)</h2>
            </div>
            <ul className="space-y-3 text-sm text-[#111820]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#F59A16] shrink-0 mt-0.5" />
                <span>
                  Coleta mínima de dados pessoais, com finalidade clara de aproximação habitacional.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#F59A16] shrink-0 mt-0.5" />
                <span>
                  Documentos de propriedade e identidade exibidos apenas como selo de verificação,
                  sem exposição pública de dados sensíveis.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#F59A16] shrink-0 mt-0.5" />
                <span>
                  Canal direto de suporte e denúncia para bloqueio imediato de anúncios irregulares.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Quick CTA */}
        <div className="bg-[#123F52] text-white rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#F59A16]" />
              <span>Veja os anúncios ativos na demonstração</span>
            </h3>
            <p className="text-sm text-white/80">
              Navegue pelos imóveis cadastrados e simule uma candidatura ou publicação.
            </p>
          </div>
          <Link
            to="/explorar"
            className="px-5 py-3 rounded-xl bg-[#F59A16] hover:bg-[#DC860B] text-white text-sm font-semibold whitespace-nowrap shrink-0"
          >
            Explorar oportunidades
          </Link>
        </div>
      </div>
    </div>
  );
}
