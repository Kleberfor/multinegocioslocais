// Algoritmo de Score de Presença Digital
// S-2.2: Calcular score de 0 a 100

import { PlaceDetails } from "./google";

export interface ScoreBreakdown {
  total: number;
  categories: {
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
    status: "excellent" | "good" | "average" | "poor";
    details: string;
  }[];
  opportunities: {
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
    impact: string;
  }[];
  strengths: string[];
}

/**
 * Calcula o score de presença digital baseado nos dados do Google Business Profile
 *
 * Pesos:
 * - Avaliações (rating + quantidade): 25%
 * - Fotos: 15%
 * - Informações (telefone, site, horário): 20%
 * - Engajamento (reviews recentes): 25%
 * - Categorização: 15%
 */
export function calculateScore(place: PlaceDetails): ScoreBreakdown {
  const categories: ScoreBreakdown["categories"] = [];
  const opportunities: ScoreBreakdown["opportunities"] = [];
  const strengths: string[] = [];

  // 1. AVALIAÇÕES (25 pontos)
  let reviewScore = 0;
  const maxReviewScore = 25;

  if (place.rating && place.userRatingsTotal) {
    // Rating contribui com até 15 pontos (5.0 = 15 pontos)
    const ratingPoints = (place.rating / 5) * 15;

    // Quantidade de avaliações contribui com até 10 pontos
    // 100+ avaliações = 10 pontos
    const quantityPoints = Math.min((place.userRatingsTotal / 100) * 10, 10);

    reviewScore = Math.round(ratingPoints + quantityPoints);

    if (place.rating >= 4.5 && place.userRatingsTotal >= 50) {
      strengths.push(
        `Excelente reputação: ${place.rating} estrelas com ${place.userRatingsTotal} avaliações`
      );
    }
  }

  if (reviewScore < 15) {
    opportunities.push({
      priority: "high",
      title: "Aumentar avaliações",
      description:
        "Incentive clientes satisfeitos a deixarem avaliações no Google",
      impact: "Pode aumentar seu score em até 15 pontos",
    });
  }

  categories.push({
    name: "Avaliações",
    score: reviewScore,
    maxScore: maxReviewScore,
    percentage: Math.round((reviewScore / maxReviewScore) * 100),
    status: getStatus(reviewScore, maxReviewScore),
    details: place.rating
      ? `${place.rating} estrelas (${place.userRatingsTotal || 0} avaliações)`
      : "Sem avaliações",
  });

  // 2. FOTOS (15 pontos)
  let photoScore = 0;
  const maxPhotoScore = 15;

  if (place.photos) {
    // 10+ fotos = pontuação máxima
    photoScore = Math.min(Math.round((place.photos / 10) * maxPhotoScore), maxPhotoScore);

    if (place.photos >= 10) {
      strengths.push(`Galeria completa com ${place.photos} fotos`);
    }
  }

  if (photoScore < 10) {
    opportunities.push({
      priority: place.photos === 0 ? "high" : "medium",
      title: "Adicionar mais fotos",
      description:
        "Fotos de qualidade aumentam em 42% a chance de cliques no seu perfil",
      impact: `Adicione ${Math.max(10 - (place.photos || 0), 0)} fotos para maximizar`,
    });
  }

  categories.push({
    name: "Fotos",
    score: photoScore,
    maxScore: maxPhotoScore,
    percentage: Math.round((photoScore / maxPhotoScore) * 100),
    status: getStatus(photoScore, maxPhotoScore),
    details: `${place.photos || 0} fotos no perfil`,
  });

  // 3. INFORMAÇÕES (20 pontos)
  let infoScore = 0;
  const maxInfoScore = 20;
  const infoItems: string[] = [];

  if (place.phoneNumber) {
    infoScore += 5;
    infoItems.push("Telefone");
  } else {
    opportunities.push({
      priority: "high",
      title: "Adicionar telefone",
      description: "Clientes precisam de uma forma fácil de entrar em contato",
      impact: "Informação essencial para conversões",
    });
  }

  if (place.website) {
    infoScore += 5;
    infoItems.push("Website");
  } else {
    opportunities.push({
      priority: "medium",
      title: "Adicionar website",
      description: "Um site aumenta a credibilidade do seu negócio",
      impact: "Melhora a confiança do cliente",
    });
  }

  if (place.openingHours?.weekdayText) {
    infoScore += 5;
    infoItems.push("Horário de funcionamento");
  } else {
    opportunities.push({
      priority: "high",
      title: "Definir horário de funcionamento",
      description: "Clientes querem saber quando você está aberto",
      impact: "Evita perda de clientes por informação incompleta",
    });
  }

  if (place.address) {
    infoScore += 5;
    infoItems.push("Endereço");
  }

  if (infoScore >= 15) {
    strengths.push("Informações de contato completas");
  }

  categories.push({
    name: "Informações",
    score: infoScore,
    maxScore: maxInfoScore,
    percentage: Math.round((infoScore / maxInfoScore) * 100),
    status: getStatus(infoScore, maxInfoScore),
    details:
      infoItems.length > 0 ? infoItems.join(", ") : "Informações incompletas",
  });

  // 4. ENGAJAMENTO / ATIVIDADE (25 pontos)
  let engagementScore = 0;
  const maxEngagementScore = 25;

  if (place.reviews && place.reviews.length > 0) {
    // Verificar reviews recentes (últimos 6 meses)
    const sixMonthsAgo = Date.now() / 1000 - 6 * 30 * 24 * 60 * 60;
    const recentReviews = place.reviews.filter(
      (r) => r.time > sixMonthsAgo
    ).length;

    // Reviews recentes contribuem mais
    engagementScore = Math.min(
      Math.round((recentReviews / 5) * maxEngagementScore),
      maxEngagementScore
    );

    if (recentReviews >= 3) {
      strengths.push(`${recentReviews} avaliações recentes nos últimos 6 meses`);
    }
  }

  if (engagementScore < 15) {
    opportunities.push({
      priority: "medium",
      title: "Aumentar engajamento",
      description:
        "Peça avaliações regularmente para manter seu perfil ativo",
      impact: "Perfis ativos aparecem mais nas buscas",
    });
  }

  categories.push({
    name: "Engajamento",
    score: engagementScore,
    maxScore: maxEngagementScore,
    percentage: Math.round((engagementScore / maxEngagementScore) * 100),
    status: getStatus(engagementScore, maxEngagementScore),
    details:
      place.reviews && place.reviews.length > 0
        ? `${place.reviews.length} avaliações com texto`
        : "Sem avaliações detalhadas",
  });

  // 5. CATEGORIZAÇÃO (15 pontos)
  let categoryScore = 0;
  const maxCategoryScore = 15;

  if (place.types && place.types.length > 0) {
    // Mais categorias = melhor visibilidade
    categoryScore = Math.min(
      Math.round((place.types.length / 5) * maxCategoryScore),
      maxCategoryScore
    );

    if (place.types.length >= 3) {
      strengths.push("Bem categorizado no Google");
    }
  }

  if (categoryScore < 10) {
    opportunities.push({
      priority: "low",
      title: "Revisar categorias",
      description:
        "Verifique se todas as categorias relevantes estão selecionadas",
      impact: "Melhora a descoberta por diferentes buscas",
    });
  }

  categories.push({
    name: "Categorização",
    score: categoryScore,
    maxScore: maxCategoryScore,
    percentage: Math.round((categoryScore / maxCategoryScore) * 100),
    status: getStatus(categoryScore, maxCategoryScore),
    details: `${place.types?.length || 0} categorias definidas`,
  });

  // TOTAL
  const total = categories.reduce((sum, cat) => sum + cat.score, 0);

  // Ordenar oportunidades por prioridade
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  opportunities.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return {
    total,
    categories,
    opportunities,
    strengths,
  };
}

function getStatus(
  score: number,
  maxScore: number
): "excellent" | "good" | "average" | "poor" {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return "excellent";
  if (percentage >= 60) return "good";
  if (percentage >= 40) return "average";
  return "poor";
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
        "Sua presença digital está ótima! Continue mantendo seu perfil atualizado.",
      color: "text-green-600",
    };
  }
  if (score >= 60) {
    return {
      label: "Bom",
      description:
        "Você está no caminho certo, mas há oportunidades de melhoria.",
      color: "text-blue-600",
    };
  }
  if (score >= 40) {
    return {
      label: "Regular",
      description:
        "Seu perfil precisa de atenção. Siga as recomendações para melhorar.",
      color: "text-yellow-600",
    };
  }
  return {
    label: "Precisa Melhorar",
    description:
      "Sua presença digital está fraca. Há muito potencial de crescimento!",
    color: "text-red-600",
  };
}
