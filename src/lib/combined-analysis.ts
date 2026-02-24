// Análise Combinada
// Integra Google Business Profile + Site + Redes Sociais
// Gera análise completa para CRM interno e score simplificado para cliente

import { getPlaceDetails, PlaceDetails } from "./google";
import { calculateScore, ScoreBreakdown } from "./scoring";
import { analisarSite, SiteAnalysis } from "./site-analysis";
import { gerarProposta, AnaliseInput, PropostaPrecificacao } from "./pricing-agent";
import { verificarOutrasPlataformas, VerificacaoPlataformas, gerarDiagnosticoPlataformas } from "./other-platforms";

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface AnalisePublica {
  // O que o CLIENTE vê
  scoreGeral: number;
  scoreGBP: number;
  scoreSite: number;
  scoreRedes: number;
  statusGeral: 'bom' | 'regular' | 'critico';
  statusGBP: 'bom' | 'regular' | 'critico';
  statusSite: 'bom' | 'regular' | 'critico';
  statusRedes: 'bom' | 'regular' | 'critico';
  temSite: boolean;
  perdaPotencial: number; // R$ estimado que está perdendo/mês
  mensagemPrincipal: string;
  // Outras plataformas
  appleMaps: boolean;
  bingPlaces: boolean;
}

export interface AnaliseInterna {
  // O que NÓS vemos no CRM
  analisePublica: AnalisePublica;

  // Dados do Google Business
  dadosGBP: {
    placeId: string;
    nome: string;
    endereco: string;
    telefone?: string;
    website?: string;
    rating?: number;
    totalAvaliacoes?: number;
    fotos: number;
    detalhesScore: ScoreBreakdown;
  };

  // Dados do Site
  dadosSite: SiteAnalysis;

  // Diagnóstico detalhado por área
  diagnosticoGBP: DiagnosticoArea;
  diagnosticoSite: DiagnosticoArea;
  diagnosticoRedes: DiagnosticoArea;

  // Argumentos de fechamento
  argumentosFechamento: string[];

  // Plano de ação sugerido
  planoAcao: PlanoAcaoItem[];

  // Proposta de precificação
  proposta: PropostaPrecificacao;

  // Outras plataformas
  outrasPlataformas: VerificacaoPlataformas;

  // Metadados
  dataAnalise: string;
  versaoAnalise: string;
}

export interface DiagnosticoArea {
  score: number;
  status: 'bom' | 'regular' | 'critico';
  itens: {
    titulo: string;
    situacaoAtual: string;
    ideal: string;
    impacto: 'critico' | 'alto' | 'medio' | 'baixo';
    comoResolver: string;
  }[];
}

export interface PlanoAcaoItem {
  fase: string;
  periodo: string;
  acoes: string[];
  entregaveis: string[];
}

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════

function calcularStatus(score: number): 'bom' | 'regular' | 'critico' {
  if (score >= 70) return 'bom';
  if (score >= 40) return 'regular';
  return 'critico';
}

function gerarDiagnosticoGBP(place: PlaceDetails, scoreResult: ScoreBreakdown): DiagnosticoArea {
  const itens: DiagnosticoArea['itens'] = [];

  // Avaliações
  const avaliacoes = place.userRatingsTotal || 0;
  if (avaliacoes < 10) {
    itens.push({
      titulo: 'Poucas avaliações',
      situacaoAtual: `${avaliacoes} avaliações`,
      ideal: '50+ avaliações',
      impacto: 'critico',
      comoResolver: 'Implementar estratégia de solicitação de avaliações pós-compra',
    });
  } else if (avaliacoes < 50) {
    itens.push({
      titulo: 'Avaliações insuficientes',
      situacaoAtual: `${avaliacoes} avaliações`,
      ideal: '50+ avaliações',
      impacto: 'alto',
      comoResolver: 'Criar campanha de incentivo a avaliações com QR Code',
    });
  }

  // Nota média
  const rating = place.rating || 0;
  if (rating < 4.0) {
    itens.push({
      titulo: 'Nota baixa',
      situacaoAtual: `Nota ${rating.toFixed(1)}`,
      ideal: 'Nota 4.5+',
      impacto: 'critico',
      comoResolver: 'Responder avaliações negativas e melhorar atendimento',
    });
  } else if (rating < 4.5) {
    itens.push({
      titulo: 'Nota pode melhorar',
      situacaoAtual: `Nota ${rating.toFixed(1)}`,
      ideal: 'Nota 4.5+',
      impacto: 'medio',
      comoResolver: 'Incentivar clientes satisfeitos a deixar avaliações',
    });
  }

  // Fotos
  const fotos = place.photos || 0;
  if (fotos < 5) {
    itens.push({
      titulo: 'Poucas fotos',
      situacaoAtual: `${fotos} fotos`,
      ideal: '20+ fotos',
      impacto: 'alto',
      comoResolver: 'Adicionar fotos profissionais do estabelecimento, produtos e equipe',
    });
  } else if (fotos < 15) {
    itens.push({
      titulo: 'Fotos insuficientes',
      situacaoAtual: `${fotos} fotos`,
      ideal: '20+ fotos',
      impacto: 'medio',
      comoResolver: 'Adicionar mais fotos variadas e atualizadas',
    });
  }

  // Website
  if (!place.website) {
    itens.push({
      titulo: 'Sem website vinculado',
      situacaoAtual: 'Nenhum site',
      ideal: 'Site profissional vinculado',
      impacto: 'alto',
      comoResolver: 'Criar site e vincular ao perfil do Google Business',
    });
  }

  // Horário de funcionamento
  if (!place.openingHours) {
    itens.push({
      titulo: 'Horário não informado',
      situacaoAtual: 'Sem horário',
      ideal: 'Horário completo configurado',
      impacto: 'alto',
      comoResolver: 'Adicionar horário de funcionamento completo',
    });
  }

  return {
    score: scoreResult.total,
    status: calcularStatus(scoreResult.total),
    itens,
  };
}

function gerarDiagnosticoSite(siteAnalysis: SiteAnalysis): DiagnosticoArea {
  return {
    score: siteAnalysis.score,
    status: calcularStatus(siteAnalysis.score),
    itens: siteAnalysis.diagnostico.map(d => ({
      titulo: d.titulo,
      situacaoAtual: d.descricao,
      ideal: 'Score 90+',
      impacto: d.severidade === 'critico' ? 'critico' : d.severidade === 'importante' ? 'alto' : 'medio',
      comoResolver: d.comoResolver,
    })),
  };
}

function gerarDiagnosticoRedes(): DiagnosticoArea {
  // Por enquanto, retorna análise genérica
  // Futuramente, integrar com APIs de redes sociais
  return {
    score: 50,
    status: 'regular',
    itens: [
      {
        titulo: 'Análise de redes sociais',
        situacaoAtual: 'Análise manual necessária',
        ideal: 'Presença ativa em 2+ redes',
        impacto: 'medio',
        comoResolver: 'Verificar Instagram, Facebook e outras redes manualmente',
      },
    ],
  };
}

function gerarArgumentosFechamento(
  analisePublica: AnalisePublica,
  place: PlaceDetails,
  siteAnalysis: SiteAnalysis
): string[] {
  const argumentos: string[] = [];

  // Argumento de perda financeira
  if (analisePublica.perdaPotencial > 0) {
    argumentos.push(
      `Estimamos que você está deixando de faturar aproximadamente R$ ${analisePublica.perdaPotencial.toLocaleString('pt-BR')}/mês por falta de visibilidade digital.`
    );
  }

  // Argumento de avaliações
  const avaliacoes = place.userRatingsTotal || 0;
  if (avaliacoes < 50) {
    argumentos.push(
      `Com apenas ${avaliacoes} avaliações, você está em desvantagem. Negócios com 50+ avaliações convertem 270% mais clientes.`
    );
  }

  // Argumento de site
  if (!siteAnalysis.temSite) {
    argumentos.push(
      `A ausência de site profissional prejudica sua credibilidade. 75% dos consumidores julgam empresas pela qualidade do site.`
    );
  } else if (siteAnalysis.score < 50) {
    argumentos.push(
      `Seu site está com performance crítica (${siteAnalysis.score}/100). Sites lentos perdem 40% dos visitantes nos primeiros 3 segundos.`
    );
  }

  // Argumento de busca local
  argumentos.push(
    `46% de todas as buscas no Google são locais. Otimizar sua presença digital significa capturar esses clientes antes da concorrência.`
  );

  // Argumento de ROI
  argumentos.push(
    `Com as melhorias propostas, estimamos um retorno do investimento em até 3 meses, com aumento de 30-50% nas ligações e visitas.`
  );

  return argumentos;
}

function gerarPlanoAcao(
  diagnosticoGBP: DiagnosticoArea,
  diagnosticoSite: DiagnosticoArea
): PlanoAcaoItem[] {
  const plano: PlanoAcaoItem[] = [];

  // Fase 1: Google Business (sempre prioritário)
  plano.push({
    fase: 'Otimização Google Business',
    periodo: 'Semana 1-2',
    acoes: [
      'Auditoria completa do perfil atual',
      'Otimização de informações básicas (NAP)',
      'Upload de fotos profissionais (20+)',
      'Configuração de categorias e atributos',
      'Criação de posts semanais',
      'Configuração de mensagens e FAQ',
    ],
    entregaveis: [
      'Perfil 100% otimizado',
      'Primeiros posts publicados',
      'Estratégia de conteúdo mensal',
    ],
  });

  // Fase 2: Site (se necessário)
  if (diagnosticoSite.score < 70) {
    plano.push({
      fase: 'Otimização/Criação de Site',
      periodo: 'Semana 3-4',
      acoes: [
        diagnosticoSite.score === 0 ? 'Desenvolvimento de site profissional' : 'Otimização do site existente',
        'Implementação de SEO on-page',
        'Otimização de velocidade (Core Web Vitals)',
        'Configuração de SSL/HTTPS',
        'Design responsivo para mobile',
        'Integração com Google Analytics',
      ],
      entregaveis: [
        'Site otimizado e responsivo',
        'Certificado SSL instalado',
        'Google Analytics configurado',
      ],
    });
  }

  // Fase 3: Estratégia de Avaliações
  plano.push({
    fase: 'Estratégia de Avaliações',
    periodo: 'Mês 2',
    acoes: [
      'Criação de QR Code para solicitação de avaliações',
      'Template de respostas para avaliações',
      'Treinamento de equipe para solicitar avaliações',
      'Monitoramento diário de novas avaliações',
    ],
    entregaveis: [
      'Material de solicitação de avaliações',
      'Manual de respostas',
      'Meta: +10 avaliações/mês',
    ],
  });

  // Fase 4: Monitoramento
  plano.push({
    fase: 'Monitoramento e Ajustes',
    periodo: 'Mês 3+',
    acoes: [
      'Análise semanal de métricas',
      'Ajustes baseados em performance',
      'Publicação contínua de conteúdo',
      'Relatório mensal de resultados',
    ],
    entregaveis: [
      'Relatório mensal de performance',
      'Dashboard de acompanhamento',
    ],
  });

  return plano;
}

// ═══════════════════════════════════════════════════════════════
// FUNÇÃO PRINCIPAL
// ═══════════════════════════════════════════════════════════════

/**
 * Realiza análise combinada completa
 * Retorna dados públicos (para cliente) e internos (para CRM)
 */
export async function realizarAnaliseCombinada(
  placeId: string,
  siteUrl: string | null,
  segmento: string
): Promise<AnaliseInterna> {
  // 1. Buscar dados do Google Business
  const placeDetails = await getPlaceDetails(placeId);

  if (!placeDetails) {
    throw new Error('Não foi possível obter dados do Google Business');
  }

  // 2. Calcular score do GBP
  const scoreGBP = calculateScore(placeDetails);

  // 3. Analisar site (se tiver)
  const siteAnalysis = await analisarSite(siteUrl || '');

  // 4. Score de redes sociais (placeholder - futuramente integrar APIs)
  const scoreRedes = 50; // Valor padrão até implementar análise real

  // 4.5. Verificar outras plataformas (Apple Maps, Bing)
  const outrasPlataformas = await verificarOutrasPlataformas(
    placeDetails.name,
    placeDetails.address
  );

  // 5. Calcular score geral ponderado (com bônus de outras plataformas)
  const scoreGeral = Math.round(
    (scoreGBP.total * 0.4) +
    (siteAnalysis.score * 0.35) +
    (scoreRedes * 0.15) +
    (((placeDetails.userRatingsTotal || 0) > 50 ? 100 : ((placeDetails.userRatingsTotal || 0) * 2)) * 0.1)
  );

  // 6. Calcular perda potencial
  const perdaPotencial = Math.round((100 - scoreGeral) * 120); // R$120 por ponto perdido

  // 7. Gerar diagnósticos
  const diagnosticoGBP = gerarDiagnosticoGBP(placeDetails, scoreGBP);
  const diagnosticoSite = gerarDiagnosticoSite(siteAnalysis);
  const diagnosticoRedes = gerarDiagnosticoRedes();

  // 8. Montar análise pública
  const analisePublica: AnalisePublica = {
    scoreGeral,
    scoreGBP: scoreGBP.total,
    scoreSite: siteAnalysis.score,
    scoreRedes,
    statusGeral: calcularStatus(scoreGeral),
    statusGBP: calcularStatus(scoreGBP.total),
    statusSite: calcularStatus(siteAnalysis.score),
    statusRedes: calcularStatus(scoreRedes),
    temSite: siteAnalysis.temSite,
    perdaPotencial,
    mensagemPrincipal: scoreGeral < 50
      ? 'Sua presença digital precisa de atenção urgente'
      : scoreGeral < 70
        ? 'Há oportunidades significativas de melhoria'
        : 'Sua presença está boa, mas pode melhorar',
    appleMaps: outrasPlataformas.appleMaps.encontrado,
    bingPlaces: outrasPlataformas.bingPlaces.encontrado,
  };

  // 9. Gerar argumentos de fechamento
  const argumentosFechamento = gerarArgumentosFechamento(
    analisePublica,
    placeDetails,
    siteAnalysis
  );

  // 10. Gerar plano de ação
  const planoAcao = gerarPlanoAcao(diagnosticoGBP, diagnosticoSite);

  // 11. Gerar proposta de precificação
  const inputPrecificacao: AnaliseInput = {
    scoreGBP: scoreGBP.total,
    scoreSite: siteAnalysis.score,
    scoreRedes,
    segmento,
    avaliacoes: placeDetails.userRatingsTotal || 0,
    notaMedia: placeDetails.rating || 0,
    temSite: siteAnalysis.temSite,
    concorrentes: 5, // Placeholder - futuramente buscar concorrentes reais
  };

  const proposta = gerarProposta(inputPrecificacao);

  // 12. Montar análise interna completa
  return {
    analisePublica,
    dadosGBP: {
      placeId: placeDetails.placeId,
      nome: placeDetails.name,
      endereco: placeDetails.address,
      telefone: placeDetails.phoneNumber,
      website: placeDetails.website,
      rating: placeDetails.rating,
      totalAvaliacoes: placeDetails.userRatingsTotal,
      fotos: placeDetails.photos || 0,
      detalhesScore: scoreGBP,
    },
    dadosSite: siteAnalysis,
    diagnosticoGBP,
    diagnosticoSite,
    diagnosticoRedes,
    argumentosFechamento,
    planoAcao,
    proposta,
    outrasPlataformas,
    dataAnalise: new Date().toISOString(),
    versaoAnalise: '2.1',
  };
}
