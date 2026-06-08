// ═══════════════════════════════════════════════════════════════
// Tipos de Domínio — MultiNegócios Locais
// ═══════════════════════════════════════════════════════════════

/** Segmentos de negócio suportados pela plataforma */
export type Segmento =
  | "restaurante"
  | "bar"
  | "farmacia"
  | "clinica-saude"
  | "clinica-estetica"
  | "dentista"
  | "advocacia"
  | "contabilidade"
  | "varejo"
  | "imobiliaria"
  | "concessionaria"
  | "educacao"
  | "servicos"
  | "outro";

/** Status do lead no pipeline */
export type LeadStatus =
  | "NOVO"
  | "ANALISADO"
  | "CONTATADO"
  | "PROPOSTA_ENVIADA"
  | "NEGOCIACAO"
  | "CONVERTIDO"
  | "PERDIDO";

/** Status do prospect no pipeline */
export type ProspectStatus =
  | "NOVO"
  | "CONTATADO"
  | "PROPOSTA_ENVIADA"
  | "NEGOCIACAO"
  | "FECHADO"
  | "PERDIDO";

/** Status de contrato */
export type ContratoStatus = "PENDENTE" | "ASSINADO" | "PAGO" | "CANCELADO";

/** Status de pagamento */
export type PagamentoStatus = "PENDENTE" | "APROVADO" | "RECUSADO" | "REEMBOLSADO";

/** Role de usuário */
export type UserRole = "admin" | "vendedor";

/** Origem do prospect */
export type OrigemProspect = "CAPTACAO_ATIVA" | "SITE" | "INDICACAO" | "OUTRO";

/** Canal de follow-up */
export type FollowUpCanal = "EMAIL" | "WHATSAPP" | "LIGACAO" | "SMS";

/** Tipo de follow-up */
export type FollowUpTipo =
  | "POS_CADASTRO"
  | "POS_ANALISE"
  | "POS_PROPOSTA"
  | "POS_CONTRATO"
  | "POS_PAGAMENTO"
  | "REATIVACAO"
  | "PERSONALIZADO";

/** Impacto de ação */
export type Impacto = "critico" | "alto" | "medio" | "baixo";

/** Status de score */
export type ScoreStatus = "excellent" | "good" | "average" | "poor";
