// ═══════════════════════════════════════════════════════════════
// Tipos Centralizados — MultiNegócios Locais
//
// Importe de '@types' ou diretamente dos arquivos de tipo:
//   import type { Segmento, LeadStatus } from "@/types";
//   import type { PropostaPrecificacao, AnaliseInput } from "@/types";
//   import type { PaginatedResponse } from "@/types";
// ═══════════════════════════════════════════════════════════════

export type {
  // Domain
  Segmento,
  LeadStatus,
  ProspectStatus,
  ContratoStatus,
  PagamentoStatus,
  UserRole,
  OrigemProspect,
  FollowUpCanal,
  FollowUpTipo,
  Impacto,
  ScoreStatus,
} from "./domain";

export type {
  // Analysis
  AnaliseInput,
  SegmentoConfig,
  PropostaPrecificacao,
  ParcelamentoOption,
  RoiEstimado,
  Prioridade,
  CheckResult,
  GuidelineCheck,
  CategoryScore,
  SiteAnalysis,
  SitePerformance,
  DiagnosticoItem,
  SocialScore,
} from "./analysis";

export type {
  // API
  PaginationParams,
  PaginationMeta,
  PaginatedResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  DateRangeFilter,
  SearchFilter,
  StatusFilter,
} from "./api";
