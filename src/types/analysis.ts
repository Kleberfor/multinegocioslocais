// ═══════════════════════════════════════════════════════════════
// Tipos de Análise e Precificação
// ═══════════════════════════════════════════════════════════════

import type { Impacto, ScoreStatus } from "./domain";

// ═══════════════════════════════════════════════════════════════
// INPUTS DE ANÁLISE
// ═══════════════════════════════════════════════════════════════

/** Input para o agente de precificação */
export interface AnaliseInput {
  scoreGBP: number;
  scoreSite: number;
  scoreRedes: number;
  segmento: string;
  avaliacoes: number;
  notaMedia: number;
  temSite: boolean;
  concorrentes: number;
}

/** Configuração de segmento para precificação */
export interface SegmentoConfig {
  nome: string;
  ticketMedio: number;
  fatorMultiplicador: number;
  clientesPotenciaisMes: number;
}

// ═══════════════════════════════════════════════════════════════
// OUTPUTS DE ANÁLISE
// ═══════════════════════════════════════════════════════════════

/** Proposta de precificação gerada pelo agente */
export interface PropostaPrecificacao {
  valorImplantacao: number;
  valorMensal: number;
  parcelamento: ParcelamentoOption[];
  roiEstimado: RoiEstimado;
  justificativas: string[];
  prioridades: Prioridade[];
  scoreGeral: number;
  oportunidade: number;
}

export interface ParcelamentoOption {
  parcelas: number;
  valorParcela: number;
}

export interface RoiEstimado {
  clientesAdicionaisMes: number;
  faturamentoAdicionalMes: number;
  retornoInvestimentoMeses: number;
}

export interface Prioridade {
  area: string;
  impacto: Impacto;
  descricao: string;
  potencialGanho: string;
}

// ═══════════════════════════════════════════════════════════════
// SCORES
// ═══════════════════════════════════════════════════════════════

/** Resultado de verificação de um guideline */
export interface CheckResult {
  guideline: GuidelineCheck;
  passed: boolean;
  currentValue?: string;
  recommendation?: string;
}

/** Guideline de verificação do GBP */
export interface GuidelineCheck {
  id: string;
  category: string;
  check: string;
  description: string;
  weight: number;
}

/** Score por categoria */
export interface CategoryScore {
  name: string;
  displayName: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: ScoreStatus;
  checks: CheckResult[];
  passedCount: number;
  totalCount: number;
}

// ═══════════════════════════════════════════════════════════════
// ANÁLISE DE SITE
// ═══════════════════════════════════════════════════════════════

export interface SiteAnalysis {
  url: string;
  score: number;
  temSite: boolean;
  performance: SitePerformance;
  accessibility: number;
  bestPractices: number;
  seo: number;
  diagnostico: DiagnosticoItem[];
}

export interface SitePerformance {
  score: number;
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
}

export interface DiagnosticoItem {
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  category: string;
}

// ═══════════════════════════════════════════════════════════════
// ANÁLISE DE REDES SOCIAIS
// ═══════════════════════════════════════════════════════════════

export interface SocialScore {
  platform: string;
  score: number;
  followers?: number;
  lastPost?: string;
  activity: "active" | "inactive" | "abandoned";
}
