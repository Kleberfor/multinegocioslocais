// Agente de Precificação Inteligente
// Calcula valor personalizado baseado na oportunidade de melhoria

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface AnaliseInput {
  scoreGBP: number;        // Score Google Business Profile (0-100)
  scoreSite: number;       // Score do Site (0-100, 0 se não tem)
  scoreRedes: number;      // Score Redes Sociais (0-100)
  segmento: string;        // Categoria do negócio
  avaliacoes: number;      // Número de avaliações no Google
  notaMedia: number;       // Nota média (1-5)
  temSite: boolean;        // Se possui site
  concorrentes: number;    // Número de concorrentes na região
}

export interface PropostaPrecificacao {
  valorImplantacao: number;
  valorMensal: number;
  parcelamento: {
    parcelas: number;
    valorParcela: number;
  }[];
  roiEstimado: {
    clientesAdicionaisMes: number;
    faturamentoAdicionalMes: number;
    retornoInvestimentoMeses: number;
  };
  justificativas: string[];
  prioridades: {
    area: string;
    impacto: 'critico' | 'alto' | 'medio' | 'baixo';
    descricao: string;
    potencialGanho: string;
  }[];
  scoreGeral: number;
  oportunidade: number;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURAÇÕES DE SEGMENTOS
// ═══════════════════════════════════════════════════════════════

interface SegmentoConfig {
  nome: string;
  ticketMedio: number;     // Valor médio por cliente
  fatorMultiplicador: number;
  clientesPotenciaisMes: number; // Estimativa de clientes que buscam online
}

export const SEGMENTOS: Record<string, SegmentoConfig> = {
  'restaurante': {
    nome: 'Restaurante/Alimentação',
    ticketMedio: 50,
    fatorMultiplicador: 1.0,
    clientesPotenciaisMes: 500,
  },
  'bar': {
    nome: 'Bar/Pub',
    ticketMedio: 80,
    fatorMultiplicador: 1.0,
    clientesPotenciaisMes: 400,
  },
  'clinica-saude': {
    nome: 'Clínica/Saúde',
    ticketMedio: 200,
    fatorMultiplicador: 1.5,
    clientesPotenciaisMes: 200,
  },
  'clinica-estetica': {
    nome: 'Clínica Estética',
    ticketMedio: 300,
    fatorMultiplicador: 1.6,
    clientesPotenciaisMes: 150,
  },
  'dentista': {
    nome: 'Dentista/Odontologia',
    ticketMedio: 250,
    fatorMultiplicador: 1.5,
    clientesPotenciaisMes: 180,
  },
  'advocacia': {
    nome: 'Escritório de Advocacia',
    ticketMedio: 500,
    fatorMultiplicador: 2.0,
    clientesPotenciaisMes: 100,
  },
  'contabilidade': {
    nome: 'Contabilidade',
    ticketMedio: 400,
    fatorMultiplicador: 1.8,
    clientesPotenciaisMes: 80,
  },
  'imobiliaria': {
    nome: 'Imobiliária',
    ticketMedio: 5000,
    fatorMultiplicador: 2.5,
    clientesPotenciaisMes: 50,
  },
  'concessionaria': {
    nome: 'Concessionária/Veículos',
    ticketMedio: 50000,
    fatorMultiplicador: 3.0,
    clientesPotenciaisMes: 30,
  },
  'varejo': {
    nome: 'Varejo/Loja',
    ticketMedio: 100,
    fatorMultiplicador: 1.0,
    clientesPotenciaisMes: 300,
  },
  'servicos': {
    nome: 'Serviços Gerais',
    ticketMedio: 150,
    fatorMultiplicador: 1.2,
    clientesPotenciaisMes: 200,
  },
  'educacao': {
    nome: 'Educação/Cursos',
    ticketMedio: 300,
    fatorMultiplicador: 1.3,
    clientesPotenciaisMes: 150,
  },
  'academia': {
    nome: 'Academia/Fitness',
    ticketMedio: 100,
    fatorMultiplicador: 1.1,
    clientesPotenciaisMes: 250,
  },
  'salao-beleza': {
    nome: 'Salão de Beleza',
    ticketMedio: 80,
    fatorMultiplicador: 1.0,
    clientesPotenciaisMes: 300,
  },
  'pet-shop': {
    nome: 'Pet Shop/Veterinária',
    ticketMedio: 120,
    fatorMultiplicador: 1.2,
    clientesPotenciaisMes: 200,
  },
  'hotelaria': {
    nome: 'Hotel/Pousada',
    ticketMedio: 300,
    fatorMultiplicador: 1.8,
    clientesPotenciaisMes: 100,
  },
  'outro': {
    nome: 'Outro',
    ticketMedio: 150,
    fatorMultiplicador: 1.0,
    clientesPotenciaisMes: 200,
  },
};

// ═══════════════════════════════════════════════════════════════
// CONSTANTES DE PRECIFICAÇÃO
// ═══════════════════════════════════════════════════════════════

const VALOR_BASE = 6000;           // Valor mínimo de implantação
const VALOR_MAXIMO = 15000;        // Valor máximo de implantação
const VALOR_POR_PONTO = 90;        // R$ por ponto de oportunidade
const PERCENTUAL_MENSAL = 0.15;    // 15% do valor para gestão mensal

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES DE CÁLCULO
// ═══════════════════════════════════════════════════════════════

/**
 * Calcula o score geral ponderado
 */
function calcularScoreGeral(input: AnaliseInput): number {
  const pesoGBP = 0.40;      // 40% do peso
  const pesoSite = 0.35;     // 35% do peso
  const pesoRedes = 0.15;    // 15% do peso
  const pesoAvaliacoes = 0.10; // 10% do peso

  // Score de avaliações baseado na quantidade e nota
  const scoreAvaliacoes = calcularScoreAvaliacoes(input.avaliacoes, input.notaMedia);

  const scoreGeral =
    (input.scoreGBP * pesoGBP) +
    (input.scoreSite * pesoSite) +
    (input.scoreRedes * pesoRedes) +
    (scoreAvaliacoes * pesoAvaliacoes);

  return Math.round(scoreGeral);
}

/**
 * Calcula score baseado em avaliações
 */
function calcularScoreAvaliacoes(quantidade: number, nota: number): number {
  // Ideal: 50+ avaliações com nota 4.5+
  let scoreQuantidade = Math.min(quantidade / 50 * 100, 100);
  let scoreNota = (nota / 5) * 100;

  return Math.round((scoreQuantidade * 0.4) + (scoreNota * 0.6));
}

/**
 * Calcula fator de concorrência
 * Mais concorrentes = mais urgência = maior valor justificado
 */
function calcularFatorConcorrencia(concorrentes: number): number {
  if (concorrentes <= 3) return 0.9;
  if (concorrentes <= 5) return 1.0;
  if (concorrentes <= 10) return 1.1;
  if (concorrentes <= 20) return 1.2;
  return 1.3;
}

/**
 * Gera justificativas baseadas na análise
 */
function gerarJustificativas(input: AnaliseInput, segmento: SegmentoConfig): string[] {
  const justificativas: string[] = [];

  // Justificativas baseadas no score GBP
  if (input.scoreGBP < 50) {
    justificativas.push(
      `Seu perfil do Google Business está com apenas ${input.scoreGBP}% de otimização. ` +
      `Negócios otimizados recebem até 70% mais ligações.`
    );
  } else if (input.scoreGBP < 80) {
    justificativas.push(
      `Seu Google Business tem potencial de melhoria. ` +
      `Com otimização completa, você pode aumentar sua visibilidade em até 50%.`
    );
  }

  // Justificativas baseadas no site
  if (!input.temSite) {
    justificativas.push(
      `Você não possui site. 75% dos consumidores julgam a credibilidade ` +
      `de uma empresa pela qualidade do seu site.`
    );
  } else if (input.scoreSite < 50) {
    justificativas.push(
      `Seu site está com performance crítica (${input.scoreSite}/100). ` +
      `Sites lentos perdem 40% dos visitantes nos primeiros 3 segundos.`
    );
  }

  // Justificativas baseadas em avaliações
  if (input.avaliacoes < 10) {
    justificativas.push(
      `Você tem apenas ${input.avaliacoes} avaliações. ` +
      `Negócios com 50+ avaliações convertem 270% mais clientes.`
    );
  }

  if (input.notaMedia < 4.0) {
    justificativas.push(
      `Sua nota média é ${input.notaMedia.toFixed(1)}. ` +
      `68% dos consumidores só consideram negócios com nota 4.0 ou superior.`
    );
  }

  // Justificativa de concorrência
  if (input.concorrentes > 5) {
    justificativas.push(
      `Existem ${input.concorrentes} concorrentes diretos na sua região. ` +
      `Uma presença digital forte é essencial para se destacar.`
    );
  }

  // Justificativa de ROI
  const clientesPerdidos = Math.round(segmento.clientesPotenciaisMes * (1 - input.scoreGBP / 100) * 0.3);
  const valorPerdido = clientesPerdidos * segmento.ticketMedio;

  if (valorPerdido > 1000) {
    justificativas.push(
      `Estimamos que você está deixando de faturar aproximadamente ` +
      `R$ ${valorPerdido.toLocaleString('pt-BR')}/mês por falta de visibilidade digital.`
    );
  }

  return justificativas;
}

/**
 * Gera lista de prioridades
 */
function gerarPrioridades(input: AnaliseInput): PropostaPrecificacao['prioridades'] {
  const prioridades: PropostaPrecificacao['prioridades'] = [];

  // Google Business Profile
  if (input.scoreGBP < 40) {
    prioridades.push({
      area: 'Google Business Profile',
      impacto: 'critico',
      descricao: 'Perfil com informações incompletas ou desatualizadas',
      potencialGanho: '+70% de visibilidade nas buscas locais',
    });
  } else if (input.scoreGBP < 70) {
    prioridades.push({
      area: 'Google Business Profile',
      impacto: 'alto',
      descricao: 'Perfil parcialmente otimizado com oportunidades de melhoria',
      potencialGanho: '+40% de cliques e ligações',
    });
  } else {
    prioridades.push({
      area: 'Google Business Profile',
      impacto: 'medio',
      descricao: 'Perfil bem configurado, ajustes finos necessários',
      potencialGanho: '+15% de conversão',
    });
  }

  // Site
  if (!input.temSite) {
    prioridades.push({
      area: 'Site Profissional',
      impacto: 'critico',
      descricao: 'Ausência de site prejudica credibilidade e SEO',
      potencialGanho: '+200% de credibilidade e presença online',
    });
  } else if (input.scoreSite < 50) {
    prioridades.push({
      area: 'Otimização de Site',
      impacto: 'alto',
      descricao: 'Site com problemas de performance e/ou SEO',
      potencialGanho: '+60% de tempo na página e conversões',
    });
  } else if (input.scoreSite < 80) {
    prioridades.push({
      area: 'Otimização de Site',
      impacto: 'medio',
      descricao: 'Site funcional mas com espaço para melhorias',
      potencialGanho: '+25% de conversão',
    });
  }

  // Avaliações
  if (input.avaliacoes < 20) {
    prioridades.push({
      area: 'Gestão de Avaliações',
      impacto: 'alto',
      descricao: 'Poucas avaliações reduzem confiança do consumidor',
      potencialGanho: '+150% de confiança com 50+ avaliações',
    });
  }

  // Redes Sociais
  if (input.scoreRedes < 50) {
    prioridades.push({
      area: 'Redes Sociais',
      impacto: 'medio',
      descricao: 'Presença fraca ou inexistente em redes sociais',
      potencialGanho: '+30% de alcance e engajamento',
    });
  }

  // Ordenar por impacto
  const ordemImpacto = { critico: 0, alto: 1, medio: 2, baixo: 3 };
  prioridades.sort((a, b) => ordemImpacto[a.impacto] - ordemImpacto[b.impacto]);

  return prioridades;
}

/**
 * Calcula ROI estimado
 */
function calcularROI(
  input: AnaliseInput,
  segmento: SegmentoConfig,
  valorImplantacao: number
): PropostaPrecificacao['roiEstimado'] {
  // Estimativa conservadora: 10-30% dos clientes potenciais perdidos podem ser recuperados
  const oportunidade = 100 - calcularScoreGeral(input);
  const percentualRecuperacao = 0.15; // 15% conservador

  const clientesAdicionaisMes = Math.round(
    segmento.clientesPotenciaisMes * (oportunidade / 100) * percentualRecuperacao
  );

  const faturamentoAdicionalMes = clientesAdicionaisMes * segmento.ticketMedio;

  const retornoInvestimentoMeses = faturamentoAdicionalMes > 0
    ? Math.ceil(valorImplantacao / faturamentoAdicionalMes)
    : 12;

  return {
    clientesAdicionaisMes: Math.max(clientesAdicionaisMes, 5), // Mínimo 5 clientes
    faturamentoAdicionalMes: Math.max(faturamentoAdicionalMes, 500), // Mínimo R$500
    retornoInvestimentoMeses: Math.min(retornoInvestimentoMeses, 12), // Máximo 12 meses
  };
}

/**
 * Gera opções de parcelamento
 */
function gerarParcelamento(valor: number): PropostaPrecificacao['parcelamento'] {
  return [
    { parcelas: 1, valorParcela: valor },
    { parcelas: 3, valorParcela: Math.round(valor / 3) },
    { parcelas: 6, valorParcela: Math.round(valor / 6) },
    { parcelas: 12, valorParcela: Math.round((valor * 1.1) / 12) }, // 10% de juros
  ];
}

// ═══════════════════════════════════════════════════════════════
// FUNÇÃO PRINCIPAL DO AGENTE
// ═══════════════════════════════════════════════════════════════

/**
 * Agente de Precificação
 * Analisa os inputs e gera proposta personalizada
 */
export function gerarProposta(input: AnaliseInput): PropostaPrecificacao {
  // Buscar configuração do segmento
  const segmento = SEGMENTOS[input.segmento] || SEGMENTOS['outro'];

  // Calcular score geral
  const scoreGeral = calcularScoreGeral(input);

  // Calcular oportunidade (quanto menor o score, maior a oportunidade)
  const oportunidade = 100 - scoreGeral;

  // Calcular fatores
  const fatorConcorrencia = calcularFatorConcorrencia(input.concorrentes);
  const fatorSegmento = segmento.fatorMultiplicador;

  // Calcular valor base
  let valorCalculado = VALOR_BASE + (oportunidade * VALOR_POR_PONTO);

  // Aplicar fatores
  valorCalculado = valorCalculado * fatorConcorrencia * fatorSegmento;

  // Aplicar limites
  const valorImplantacao = Math.round(
    Math.min(Math.max(valorCalculado, VALOR_BASE), VALOR_MAXIMO)
  );

  // Calcular valor mensal
  const valorMensal = Math.round(valorImplantacao * PERCENTUAL_MENSAL);

  // Gerar proposta completa
  return {
    valorImplantacao,
    valorMensal,
    parcelamento: gerarParcelamento(valorImplantacao),
    roiEstimado: calcularROI(input, segmento, valorImplantacao),
    justificativas: gerarJustificativas(input, segmento),
    prioridades: gerarPrioridades(input),
    scoreGeral,
    oportunidade,
  };
}

/**
 * Retorna lista de segmentos disponíveis
 */
export function listarSegmentos(): { value: string; label: string }[] {
  return Object.entries(SEGMENTOS).map(([value, config]) => ({
    value,
    label: config.nome,
  }));
}
