// Algoritmo de Score de Presença Digital
// Baseado nas Diretrizes Oficiais do Google Business Profile
// S-2.2: Calcular score de 0 a 100

import { PlaceDetails } from "./google";
import {
  GBP_GUIDELINES,
  GuidelineCheck,
  CATEGORY_WEIGHTS,
} from "./gbp-guidelines";

export interface CheckResult {
  guideline: GuidelineCheck;
  passed: boolean;
  currentValue?: string;
  recommendation?: string;
}

export interface CategoryScore {
  name: string;
  displayName: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: "excellent" | "good" | "average" | "poor";
  checks: CheckResult[];
  passedCount: number;
  totalCount: number;
}

export interface ScoreBreakdown {
  total: number;
  grade: "A" | "B" | "C" | "D" | "F";
  categories: CategoryScore[];
  criticalIssues: CheckResult[];
  opportunities: {
    priority: "critical" | "high" | "medium" | "low";
    title: string;
    description: string;
    howToFix: string;
    impact: string;
    googleTip?: string;
  }[];
  strengths: string[];
  summary: {
    totalChecks: number;
    passedChecks: number;
    criticalPassed: number;
    criticalTotal: number;
  };
}

/**
 * Calcula o score de presença digital baseado nas diretrizes do Google
 */
export function calculateScore(place: PlaceDetails): ScoreBreakdown {
  const checkResults: CheckResult[] = [];
  const strengths: string[] = [];

  // Executar todas as verificações
  for (const guideline of GBP_GUIDELINES) {
    const result = evaluateGuideline(guideline, place);
    checkResults.push(result);
  }

  // Agrupar por categoria
  const categoryScores: CategoryScore[] = [];
  const categoryNames = ["info", "photos", "engagement", "content", "trust"];
  const categoryDisplayNames: Record<string, string> = {
    info: "Informações Básicas",
    photos: "Fotos",
    engagement: "Avaliações e Engajamento",
    content: "Conteúdo e Atualizações",
    trust: "Confiança e Verificação",
  };

  for (const catName of categoryNames) {
    const catChecks = checkResults.filter(
      (r) => r.guideline.category === catName
    );
    const passed = catChecks.filter((r) => r.passed).length;
    const total = catChecks.length;
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    const maxScore = CATEGORY_WEIGHTS[catName as keyof typeof CATEGORY_WEIGHTS];
    const score = Math.round((percentage / 100) * maxScore);

    categoryScores.push({
      name: catName,
      displayName: categoryDisplayNames[catName],
      score,
      maxScore,
      percentage,
      status: getStatus(percentage),
      checks: catChecks,
      passedCount: passed,
      totalCount: total,
    });
  }

  // Calcular score total
  const total = categoryScores.reduce((sum, cat) => sum + cat.score, 0);
  const grade = getGrade(total);

  // Identificar problemas críticos
  const criticalIssues = checkResults.filter(
    (r) => !r.passed && r.guideline.importance === "critical"
  );

  // Gerar lista de oportunidades (ordenadas por importância)
  const opportunities = checkResults
    .filter((r) => !r.passed)
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return (
        order[a.guideline.importance] - order[b.guideline.importance]
      );
    })
    .map((r) => ({
      priority: r.guideline.importance,
      title: r.guideline.title,
      description: r.guideline.description,
      howToFix: r.guideline.howToFix,
      impact: r.guideline.impact,
      googleTip: r.guideline.googleTip,
    }));

  // Identificar pontos fortes
  const passedCritical = checkResults.filter(
    (r) => r.passed && r.guideline.importance === "critical"
  );
  if (passedCritical.length > 0) {
    strengths.push(
      `${passedCritical.length} requisitos críticos atendidos`
    );
  }

  if (place.rating && place.rating >= 4.5) {
    strengths.push(`Excelente avaliação: ${place.rating} estrelas`);
  }

  if (place.userRatingsTotal && place.userRatingsTotal >= 100) {
    strengths.push(
      `Alto volume de avaliações: ${place.userRatingsTotal} avaliações`
    );
  }

  if (place.photos && place.photos >= 10) {
    strengths.push(`Boa quantidade de fotos: ${place.photosDisplay || place.photos} fotos`);
  }

  if (place.website) {
    strengths.push("Site vinculado ao perfil");
  }

  if (place.openingHours?.weekdayText) {
    strengths.push("Horários de funcionamento configurados");
  }

  // Estatísticas gerais
  const criticalTotal = checkResults.filter(
    (r) => r.guideline.importance === "critical"
  ).length;
  const criticalPassed = checkResults.filter(
    (r) => r.passed && r.guideline.importance === "critical"
  ).length;

  return {
    total,
    grade,
    categories: categoryScores,
    criticalIssues,
    opportunities,
    strengths,
    summary: {
      totalChecks: checkResults.length,
      passedChecks: checkResults.filter((r) => r.passed).length,
      criticalPassed,
      criticalTotal,
    },
  };
}

/**
 * Avalia uma diretriz específica
 */
function evaluateGuideline(
  guideline: GuidelineCheck,
  place: PlaceDetails
): CheckResult {
  let passed = false;
  let currentValue: string | undefined;

  switch (guideline.id) {
    // === INFORMAÇÕES ===
    case "name_accurate":
      // Verificar se nome não tem keywords stuffing (simplificado)
      passed = place.name.length > 0 && place.name.length < 80;
      currentValue = place.name;
      break;

    case "address_complete":
      passed = !!place.address && place.address.length > 10;
      currentValue = place.address || "Não informado";
      break;

    case "phone_local":
      passed = !!place.phoneNumber;
      currentValue = place.phoneNumber || "Não informado";
      break;

    case "hours_accurate":
      passed = !!place.openingHours?.weekdayText;
      currentValue = place.openingHours?.weekdayText
        ? "Configurado"
        : "Não configurado";
      break;

    case "category_primary":
      passed = !!place.types && place.types.length > 0;
      currentValue = place.types?.[0] || "Não definida";
      break;

    case "categories_secondary":
      passed = !!place.types && place.types.length >= 2;
      currentValue = `${place.types?.length || 0} categorias`;
      break;

    case "website_linked":
      passed = !!place.website;
      currentValue = place.website || "Não informado";
      break;

    case "description_complete":
      // Não temos acesso à descrição via Places API
      // Assumir como não verificado
      passed = false;
      currentValue = "Não verificável via API";
      break;

    // === FOTOS ===
    case "photo_logo":
    case "photo_cover":
    case "photos_exterior":
    case "photos_interior":
      // Não conseguimos diferenciar tipos de foto via API
      // Usar quantidade como proxy
      passed = !!place.photos && place.photos >= 3;
      currentValue = `${place.photosDisplay || place.photos || 0} fotos no perfil`;
      break;

    case "photos_products":
    case "photos_team":
      passed = !!place.photos && place.photos >= 5;
      currentValue = `${place.photosDisplay || place.photos || 0} fotos no perfil`;
      break;

    case "photos_quantity":
      passed = !!place.photos && place.photos >= 10;
      currentValue = `${place.photosDisplay || place.photos || 0} fotos`;
      break;

    case "photos_quality":
      // Não verificável via API
      passed = !!place.photos && place.photos > 0;
      currentValue = "Não verificável via API";
      break;

    // === ENGAJAMENTO ===
    case "reviews_respond":
      // Não verificável via API se dono responde
      passed = false;
      currentValue = "Verificar manualmente no perfil";
      break;

    case "reviews_quantity":
      passed = !!place.userRatingsTotal && place.userRatingsTotal >= 20;
      currentValue = `${place.userRatingsTotal || 0} avaliações`;
      break;

    case "reviews_recent":
      // Verificar se há reviews nos últimos 3 meses
      if (place.reviews && place.reviews.length > 0) {
        const threeMonthsAgo = Date.now() / 1000 - 90 * 24 * 60 * 60;
        const recentCount = place.reviews.filter(
          (r) => r.time > threeMonthsAgo
        ).length;
        passed = recentCount >= 2;
        currentValue = `${recentCount} avaliações recentes (3 meses)`;
      } else {
        passed = false;
        currentValue = "Sem avaliações recentes";
      }
      break;

    case "reviews_rating":
      passed = !!place.rating && place.rating >= 4.0;
      currentValue = place.rating ? `${place.rating} estrelas` : "Sem avaliações";
      break;

    case "qna_active":
      // Não verificável via Places API
      passed = false;
      currentValue = "Verificar manualmente no perfil";
      break;

    // === CONTEÚDO ===
    case "posts_active":
    case "products_services":
    case "attributes_set":
    case "menu_booking":
      // Não verificável via Places API
      passed = false;
      currentValue = "Verificar manualmente no perfil";
      break;

    // === CONFIANÇA ===
    case "verified":
      // Assumir verificado se tem dados completos
      passed =
        !!place.phoneNumber &&
        !!place.address &&
        !!place.openingHours;
      currentValue = passed ? "Provavelmente verificado" : "Verificar status";
      break;

    case "nap_consistency":
      // Não verificável - precisaria comparar com outras fontes
      passed = false;
      currentValue = "Requer verificação manual em outras plataformas";
      break;

    default:
      passed = false;
      currentValue = "Não avaliado";
  }

  return {
    guideline,
    passed,
    currentValue,
    recommendation: passed ? undefined : guideline.howToFix,
  };
}

function getStatus(
  percentage: number
): "excellent" | "good" | "average" | "poor" {
  if (percentage >= 80) return "excellent";
  if (percentage >= 60) return "good";
  if (percentage >= 40) return "average";
  return "poor";
}

function getGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

/**
 * Retorna uma descrição geral baseada no score
 */
export function getScoreDescription(score: number): {
  label: string;
  description: string;
  color: string;
} {
  if (score >= 80) {
    return {
      label: "Excelente",
      description:
        "Sua presença digital está muito boa! Seu perfil segue a maioria das diretrizes do Google. Continue mantendo-o atualizado.",
      color: "text-green-600",
    };
  }
  if (score >= 60) {
    return {
      label: "Bom",
      description:
        "Você está no caminho certo, mas há oportunidades importantes de melhoria. Siga as recomendações para subir no ranking.",
      color: "text-blue-600",
    };
  }
  if (score >= 40) {
    return {
      label: "Regular",
      description:
        "Seu perfil precisa de atenção. Existem problemas críticos que podem estar prejudicando sua visibilidade no Google.",
      color: "text-yellow-600",
    };
  }
  return {
    label: "Precisa Melhorar",
    description:
      "Sua presença digital está fraca. Há muito potencial de crescimento! Comece pelos itens críticos.",
    color: "text-red-600",
  };
}
