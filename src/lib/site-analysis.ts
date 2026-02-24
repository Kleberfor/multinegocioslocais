// Análise de Sites
// Utiliza Google PageSpeed Insights API para análise técnica

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface SiteAnalysis {
  url: string;
  score: number;                    // Score geral (0-100)
  temSite: boolean;

  // Core Web Vitals
  performance: {
    score: number;
    lcp: number;                    // Largest Contentful Paint (ms)
    fid: number;                    // First Input Delay (ms)
    cls: number;                    // Cumulative Layout Shift
    fcp: number;                    // First Contentful Paint (ms)
    ttfb: number;                   // Time to First Byte (ms)
  };

  // Outros scores
  accessibility: number;
  bestPractices: number;
  seo: number;

  // Diagnóstico detalhado (INTERNO)
  diagnostico: DiagnosticoItem[];

  // Status
  isHttps: boolean;
  isMobileFriendly: boolean;
  isIndexed: boolean | null;        // null se não foi possível verificar
}

export interface DiagnosticoItem {
  categoria: 'performance' | 'seo' | 'acessibilidade' | 'seguranca' | 'mobile';
  severidade: 'critico' | 'importante' | 'moderado' | 'info';
  titulo: string;
  descricao: string;
  impacto: string;
  comoResolver: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

// Thresholds para Core Web Vitals (em ms)
const THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1800, poor: 3000 },
  ttfb: { good: 800, poor: 1800 },
};

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES DE ANÁLISE
// ═══════════════════════════════════════════════════════════════

/**
 * Normaliza uma URL adicionando protocolo se necessário
 */
function normalizarUrl(url: string): string {
  let urlNormalizada = url.trim();
  if (!urlNormalizada.startsWith('http://') && !urlNormalizada.startsWith('https://')) {
    urlNormalizada = 'https://' + urlNormalizada;
  }
  return urlNormalizada;
}

/**
 * Analisa site usando PageSpeed Insights API
 */
async function analisarComPageSpeed(url: string): Promise<any> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || process.env.GOOGLE_PLACES_API_KEY;

  console.log('[PageSpeed] Analisando URL:', url);
  console.log('[PageSpeed] API Key presente:', !!apiKey);

  const params = new URLSearchParams();
  params.append('url', url);
  params.append('category', 'performance');
  params.append('category', 'accessibility');
  params.append('category', 'best-practices');
  params.append('category', 'seo');
  params.append('strategy', 'mobile');

  if (apiKey) {
    params.append('key', apiKey);
  }

  const fullUrl = `${PAGESPEED_API_URL}?${params}`;
  console.log('[PageSpeed] Request URL:', fullUrl.replace(apiKey || '', '***'));

  const response = await fetch(fullUrl);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[PageSpeed] Erro:', response.status, errorText);
    throw new Error(`PageSpeed API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[PageSpeed] Score recebido:', data.lighthouseResult?.categories?.performance?.score);

  return data;
}

/**
 * Extrai métricas do resultado do PageSpeed
 */
function extrairMetricas(data: any): SiteAnalysis['performance'] {
  const audits = data.lighthouseResult?.audits || {};
  const categories = data.lighthouseResult?.categories || {};

  return {
    score: Math.round((categories.performance?.score || 0) * 100),
    lcp: audits['largest-contentful-paint']?.numericValue || 0,
    fid: audits['max-potential-fid']?.numericValue || 0,
    cls: audits['cumulative-layout-shift']?.numericValue || 0,
    fcp: audits['first-contentful-paint']?.numericValue || 0,
    ttfb: audits['server-response-time']?.numericValue || 0,
  };
}

/**
 * Gera diagnóstico detalhado baseado nas métricas
 */
function gerarDiagnostico(data: any, url: string): DiagnosticoItem[] {
  const diagnostico: DiagnosticoItem[] = [];
  const audits = data.lighthouseResult?.audits || {};
  const categories = data.lighthouseResult?.categories || {};

  // Performance - LCP
  const lcp = audits['largest-contentful-paint']?.numericValue || 0;
  if (lcp > THRESHOLDS.lcp.poor) {
    diagnostico.push({
      categoria: 'performance',
      severidade: 'critico',
      titulo: 'Carregamento muito lento',
      descricao: `O conteúdo principal leva ${(lcp / 1000).toFixed(1)}s para carregar (ideal: < 2.5s)`,
      impacto: '40% dos visitantes abandonam sites que demoram mais de 3s',
      comoResolver: 'Otimizar imagens, usar CDN, melhorar servidor de hospedagem',
    });
  } else if (lcp > THRESHOLDS.lcp.good) {
    diagnostico.push({
      categoria: 'performance',
      severidade: 'importante',
      titulo: 'Carregamento pode melhorar',
      descricao: `O conteúdo principal leva ${(lcp / 1000).toFixed(1)}s para carregar`,
      impacto: 'Cada segundo a mais reduz conversões em 7%',
      comoResolver: 'Otimizar imagens e reduzir scripts JavaScript',
    });
  }

  // Performance - CLS
  const cls = audits['cumulative-layout-shift']?.numericValue || 0;
  if (cls > THRESHOLDS.cls.poor) {
    diagnostico.push({
      categoria: 'performance',
      severidade: 'critico',
      titulo: 'Layout instável',
      descricao: `Elementos se movem durante o carregamento (CLS: ${cls.toFixed(2)})`,
      impacto: 'Causa frustração e cliques acidentais',
      comoResolver: 'Definir tamanhos fixos para imagens e anúncios',
    });
  }

  // SEO
  const seoScore = (categories.seo?.score || 0) * 100;
  if (seoScore < 50) {
    diagnostico.push({
      categoria: 'seo',
      severidade: 'critico',
      titulo: 'SEO crítico',
      descricao: 'O site tem problemas graves de otimização para buscadores',
      impacto: 'Dificilmente aparecerá nos resultados do Google',
      comoResolver: 'Adicionar meta tags, titles, descriptions e estruturar conteúdo',
    });
  } else if (seoScore < 80) {
    diagnostico.push({
      categoria: 'seo',
      severidade: 'importante',
      titulo: 'SEO precisa de melhorias',
      descricao: `Score SEO: ${Math.round(seoScore)}/100`,
      impacto: 'Posicionamento no Google pode melhorar significativamente',
      comoResolver: 'Revisar meta descriptions, headings e links internos',
    });
  }

  // Mobile
  const mobileScore = (categories.accessibility?.score || 0) * 100;
  if (mobileScore < 70) {
    diagnostico.push({
      categoria: 'mobile',
      severidade: 'importante',
      titulo: 'Experiência mobile ruim',
      descricao: 'O site não está bem otimizado para dispositivos móveis',
      impacto: '60% das buscas são feitas pelo celular',
      comoResolver: 'Implementar design responsivo e melhorar tamanho de fontes e botões',
    });
  }

  // HTTPS
  if (!url.startsWith('https://')) {
    diagnostico.push({
      categoria: 'seguranca',
      severidade: 'critico',
      titulo: 'Site sem HTTPS',
      descricao: 'O site não usa certificado SSL/HTTPS',
      impacto: 'Google penaliza sites sem HTTPS no ranking',
      comoResolver: 'Instalar certificado SSL (muitas hospedagens oferecem grátis)',
    });
  }

  // Verificar audits específicos do Lighthouse
  const failedAudits = Object.entries(audits).filter(([_, audit]: [string, any]) =>
    audit.score !== null && audit.score < 0.5
  );

  // Adicionar alguns audits críticos que falharam
  for (const [key, audit] of failedAudits.slice(0, 5) as [string, any][]) {
    if (audit.title && !diagnostico.some(d => d.titulo === audit.title)) {
      diagnostico.push({
        categoria: 'performance',
        severidade: audit.score < 0.25 ? 'critico' : 'moderado',
        titulo: audit.title,
        descricao: audit.description?.replace(/<[^>]*>/g, '').substring(0, 200) || '',
        impacto: 'Afeta a experiência do usuário e SEO',
        comoResolver: audit.description?.replace(/<[^>]*>/g, '').substring(0, 150) || 'Consultar documentação técnica',
      });
    }
  }

  return diagnostico;
}

/**
 * Calcula score geral do site
 */
function calcularScoreGeral(data: any): number {
  const categories = data.lighthouseResult?.categories || {};

  const performance = (categories.performance?.score || 0) * 100;
  const accessibility = (categories.accessibility?.score || 0) * 100;
  const bestPractices = (categories['best-practices']?.score || 0) * 100;
  const seo = (categories.seo?.score || 0) * 100;

  // Pesos: Performance 40%, SEO 30%, Best Practices 20%, Accessibility 10%
  const scoreGeral =
    (performance * 0.4) +
    (seo * 0.3) +
    (bestPractices * 0.2) +
    (accessibility * 0.1);

  return Math.round(scoreGeral);
}

// ═══════════════════════════════════════════════════════════════
// FUNÇÃO PRINCIPAL
// ═══════════════════════════════════════════════════════════════

/**
 * Analisa um site e retorna diagnóstico completo
 */
export async function analisarSite(url: string): Promise<SiteAnalysis> {
  console.log('[analisarSite] URL recebida:', url);

  // Se não tem URL, retorna análise vazia
  if (!url || url.trim() === '') {
    console.log('[analisarSite] URL vazia, retornando análise sem site');
    return {
      url: '',
      score: 0,
      temSite: false,
      performance: {
        score: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: 0,
        ttfb: 0,
      },
      accessibility: 0,
      bestPractices: 0,
      seo: 0,
      diagnostico: [{
        categoria: 'performance',
        severidade: 'critico',
        titulo: 'Ausência de site',
        descricao: 'Não foi informada URL de site',
        impacto: '75% dos consumidores julgam credibilidade pela qualidade do site',
        comoResolver: 'Criar um site profissional e responsivo',
      }],
      isHttps: false,
      isMobileFriendly: false,
      isIndexed: null,
    };
  }

  try {
    // Normalizar URL (adicionar https:// se necessário)
    const urlFinal = normalizarUrl(url);
    console.log('[analisarSite] URL normalizada:', urlFinal);

    // Analisar com PageSpeed Insights (direto, sem verificação prévia)
    const pageSpeedData = await analisarComPageSpeed(urlFinal);

    const categories = pageSpeedData.lighthouseResult?.categories || {};

    return {
      url: urlFinal,
      score: calcularScoreGeral(pageSpeedData),
      temSite: true,
      performance: extrairMetricas(pageSpeedData),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
      seo: Math.round((categories.seo?.score || 0) * 100),
      diagnostico: gerarDiagnostico(pageSpeedData, urlFinal),
      isHttps: urlFinal.startsWith('https://'),
      isMobileFriendly: (categories.accessibility?.score || 0) > 0.7,
      isIndexed: null, // Seria necessário usar Search Console API
    };

  } catch (error) {
    console.error('[analisarSite] Erro ao analisar site:', url, error);

    // Verificar se é erro de URL inválida vs erro de API
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isUrlError = errorMessage.includes('Invalid URL') || errorMessage.includes('fetch failed');

    return {
      url: url,
      score: 0,
      temSite: !isUrlError, // Se for erro de URL, não tem site válido
      performance: {
        score: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: 0,
        ttfb: 0,
      },
      accessibility: 0,
      bestPractices: 0,
      seo: 0,
      diagnostico: [{
        categoria: 'performance',
        severidade: 'moderado',
        titulo: isUrlError ? 'Site inacessível' : 'Análise incompleta',
        descricao: isUrlError
          ? `Não foi possível acessar ${url}. Verifique se o endereço está correto.`
          : 'Não foi possível completar a análise do site',
        impacto: isUrlError
          ? 'Clientes não conseguem acessar seu site'
          : 'Recomendamos uma análise manual',
        comoResolver: isUrlError
          ? 'Verificar se o domínio está ativo e acessível'
          : 'Tentar novamente ou realizar análise manual',
      }],
      isHttps: url.startsWith('https://'),
      isMobileFriendly: false,
      isIndexed: null,
    };
  }
}

/**
 * Análise simplificada (apenas score, sem detalhes)
 * Para mostrar ao cliente
 */
export async function analisarSiteSimplificado(url: string): Promise<{
  score: number;
  temSite: boolean;
  status: 'bom' | 'regular' | 'critico';
}> {
  const analise = await analisarSite(url);

  let status: 'bom' | 'regular' | 'critico' = 'critico';
  if (analise.score >= 70) status = 'bom';
  else if (analise.score >= 40) status = 'regular';

  return {
    score: analise.score,
    temSite: analise.temSite,
    status,
  };
}
