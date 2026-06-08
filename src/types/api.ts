// ═══════════════════════════════════════════════════════════════
// Tipos de API — Requests, Responses e Paginação
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// PAGINAÇÃO
// ═══════════════════════════════════════════════════════════════

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ═══════════════════════════════════════════════════════════════
// RESPOSTAS PADRÃO
// ═══════════════════════════════════════════════════════════════

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ═══════════════════════════════════════════════════════════════
// FILTROS COMUNS
// ═══════════════════════════════════════════════════════════════

export interface DateRangeFilter {
  inicio?: string;
  fim?: string;
}

export interface SearchFilter {
  search?: string;
}

export interface StatusFilter {
  status?: string;
}
