export type UserRole = 'interessado' | 'proprietario';

export type Modality = 'trabalho' | 'ocupacao';

export type PropertyType =
  | 'Chácara'
  | 'Sítio'
  | 'Casa urbana'
  | 'Fazenda'
  | 'Casa de temporada'
  | 'Sobrado';

export type ApplicationStatus =
  | 'enviada'
  | 'em_analise'
  | 'visita_agendada'
  | 'aprovada'
  | 'recusada';

export type ListingStatus = 'ativo' | 'pausado' | 'em_acordo';

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  role: UserRole;
  cidade: string;
  estado: string;
  verificado: boolean;
  membroDesde: string;
  bio: string;
  // Campos específicos do Interessado
  moradores?: number;
  composicaoFamiliar?: string;
  modalidadeInteresse?: ('trabalho' | 'ocupacao')[];
  habilidades?: string[];
  experiencia?: string;
  disponibilidade?: string;
  // Campos específicos do Proprietário
  tipoProprietario?: 'Pessoa Física' | 'Produtor Rural' | 'Imobiliária / Empresa';
  documentoInfo?: string;
  planoAtual?: 'Anúncio Básico' | 'Plano Proprietário' | 'Mora+ Empresas';
}

export interface Property {
  id: string;
  proprietarioId: string;
  titulo: string;
  tipo: PropertyType;
  cidade: string;
  estado: string;
  bairroOuRegiao: string;
  quartos: number;
  banheiros: number;
  areaM2: number;
  capacidadeMoradores: number;
  imagens: string[];
  estrutura: string[];
  estadoConservacao: string;
  aceitaFilhos: boolean;
  aceitaPets: boolean;
}

export interface WorkDetails {
  cargo: string;
  salarioMensal: number;
  jornada: string;
  enquadramentoLegal: string;
  atividades: string[];
  experienciaDesejada: string;
  condicoesMoradiaLocal: string;
  beneficiosAdicionais: string[];
}

export interface OccupationDetails {
  instrumentoJuridico: 'Comodato (Art. 579 Código Civil)' | 'Cessão de Uso' | 'Acordo com Contribuição de Custos';
  prazoPrevisto: string;
  valorMensalContribuicao: number; // 0 = gratuita
  despesasConsumo: string;
  responsabilidades: string[];
  regrasUtilizacao: string[];
}

export interface Opportunity {
  id: string;
  imovelId: string;
  proprietarioId: string;
  proprietarioNome: string;
  proprietarioVerificado: boolean;
  proprietarioCidade: string;
  proprietarioAvaliacao: number;
  proprietarioTotalAcordos: number;
  modalidade: Modality;
  titulo: string;
  resumo: string;
  descricaoCompleta: string;
  imovel: Property;
  disponibilidade: string;
  destaque: boolean;
  verificado: boolean;
  status: ListingStatus;
  criadoEm: string;
  visualizacoes: number;
  trabalho?: WorkDetails;
  ocupacao?: OccupationDetails;
}

export interface OpportunityFilters {
  busca?: string;
  modalidade?: 'todas' | Modality;
  estado?: string;
  tipoImovel?: string;
  quartosMin?: number;
  moradoresMin?: number;
  apenasVerificados?: boolean;
  // Filtros Mora+ Trabalho
  cargo?: string;
  salarioMin?: number;
  // Filtros Mora+ Ocupação
  aceitaFilhos?: boolean;
  aceitaPets?: boolean;
  prazo?: string;
  ordenacao?: 'destaques' | 'recentes' | 'maior_salario' | 'mais_quartos';
}

export interface Application {
  id: string;
  oportunidadeId: string;
  oportunidadeTitulo: string;
  oportunidadeCidade: string;
  oportunidadeImagem: string;
  modalidade: Modality;
  interessadoId: string;
  interessadoNome: string;
  interessadoCidade: string;
  interessadoTelefone: string;
  interessadoHabilidades: string[];
  interessadoMoradores: number;
  proprietarioId: string;
  proprietarioNome: string;
  mensagem: string;
  disponibilidadeInicio: string;
  status: ApplicationStatus;
  criadaEm: string;
  atualizadaEm: string;
}

export interface ChatMessage {
  id: string;
  conversaId: string;
  remetenteId: string;
  remetenteNome: string;
  texto: string;
  enviadaEm: string;
}

export interface Conversation {
  id: string;
  oportunidadeId: string;
  oportunidadeTitulo: string;
  oportunidadeImagem: string;
  modalidade: Modality;
  proprietarioId: string;
  proprietarioNome: string;
  interessadoId: string;
  interessadoNome: string;
  mensagens: ChatMessage[];
  naoLidasParaProprietario: number;
  naoLidasParaInteressado: number;
  atualizadaEm: string;
}

export interface CreateOpportunityPayload {
  modalidade: Modality;
  titulo: string;
  resumo: string;
  descricaoCompleta: string;
  disponibilidade: string;
  destaque?: boolean;
  imovel: Omit<Property, 'id' | 'proprietarioId'>;
  trabalho?: WorkDetails;
  ocupacao?: OccupationDetails;
}
