// Dados de Mercado por Região e Segmento
// Estes valores podem ser ajustados baseados em pesquisas reais
// Fonte recomendada: SEBRAE, IBGE, Google Keyword Planner

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface DadosMercadoSegmento {
  ticketMedio: number;           // Valor médio por transação
  clientesPotenciaisMes: number; // Buscas mensais estimadas
  fatorMultiplicador: number;    // Complexidade do serviço
  fonteTicket?: string;          // Origem do dado (ex: "SEBRAE 2024")
  fonteBuscas?: string;          // Origem do dado (ex: "Google Keyword Planner")
  atualizadoEm?: string;         // Data da última atualização
}

export interface DadosMercadoRegiao {
  nome: string;
  fatorRegional: number;         // Ajuste baseado no custo de vida (1.0 = médio Brasil)
  populacao?: number;            // Para calcular proporcionalmente
  rendaMediaFamiliar?: number;   // Dado IBGE
  segmentos: Record<string, Partial<DadosMercadoSegmento>>;
}

// ═══════════════════════════════════════════════════════════════
// DADOS BASE (MÉDIAS NACIONAIS)
// Atualize conforme pesquisas de mercado
// ═══════════════════════════════════════════════════════════════

export const DADOS_BASE: Record<string, DadosMercadoSegmento> = {
  'restaurante': {
    ticketMedio: 50,
    clientesPotenciaisMes: 500,
    fatorMultiplicador: 1.0,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
  'bar': {
    ticketMedio: 80,
    clientesPotenciaisMes: 400,
    fatorMultiplicador: 1.0,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
  'farmacia': {
    ticketMedio: 60,
    clientesPotenciaisMes: 350,
    fatorMultiplicador: 1.1,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
  'clinica-saude': {
    ticketMedio: 200,
    clientesPotenciaisMes: 200,
    fatorMultiplicador: 1.2,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
  'clinica-estetica': {
    ticketMedio: 300,
    clientesPotenciaisMes: 150,
    fatorMultiplicador: 1.3,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
  'dentista': {
    ticketMedio: 250,
    clientesPotenciaisMes: 180,
    fatorMultiplicador: 1.2,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
  'advocacia': {
    ticketMedio: 500,
    clientesPotenciaisMes: 100,
    fatorMultiplicador: 1.4,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
  'contabilidade': {
    ticketMedio: 400,
    clientesPotenciaisMes: 80,
    fatorMultiplicador: 1.3,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
  'imobiliaria': {
    ticketMedio: 5000,
    clientesPotenciaisMes: 50,
    fatorMultiplicador: 1.5,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
  'concessionaria': {
    ticketMedio: 50000,
    clientesPotenciaisMes: 30,
    fatorMultiplicador: 1.8,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
  'varejo': {
    ticketMedio: 100,
    clientesPotenciaisMes: 300,
    fatorMultiplicador: 1.0,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
  'servicos': {
    ticketMedio: 150,
    clientesPotenciaisMes: 200,
    fatorMultiplicador: 1.2,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
  'educacao': {
    ticketMedio: 300,
    clientesPotenciaisMes: 150,
    fatorMultiplicador: 1.3,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
  'academia': {
    ticketMedio: 100,
    clientesPotenciaisMes: 250,
    fatorMultiplicador: 1.1,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
  'salao-beleza': {
    ticketMedio: 80,
    clientesPotenciaisMes: 300,
    fatorMultiplicador: 1.0,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
  'pet-shop': {
    ticketMedio: 120,
    clientesPotenciaisMes: 200,
    fatorMultiplicador: 1.2,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
  'hotelaria': {
    ticketMedio: 300,
    clientesPotenciaisMes: 100,
    fatorMultiplicador: 1.8,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
  'outro': {
    ticketMedio: 150,
    clientesPotenciaisMes: 200,
    fatorMultiplicador: 1.0,
    fonteTicket: 'Estimativa interna',
    fonteBuscas: 'Estimativa interna',
    atualizadoEm: '2024-01',
  },
};

// ═══════════════════════════════════════════════════════════════
// AJUSTES POR REGIÃO
// Adicione regiões conforme necessidade
// ═══════════════════════════════════════════════════════════════

export const DADOS_REGIONAIS: Record<string, DadosMercadoRegiao> = {
  // Exemplo: Capital vs Interior
  'capital-sp': {
    nome: 'São Paulo - Capital',
    fatorRegional: 1.4,           // 40% acima da média nacional
    populacao: 12000000,
    rendaMediaFamiliar: 5500,
    segmentos: {
      'restaurante': { ticketMedio: 70, clientesPotenciaisMes: 800 },
      'farmacia': { ticketMedio: 80, clientesPotenciaisMes: 500 },
      'clinica-estetica': { ticketMedio: 450, clientesPotenciaisMes: 250 },
    },
  },
  'interior-sp': {
    nome: 'São Paulo - Interior',
    fatorRegional: 1.1,
    segmentos: {
      'restaurante': { ticketMedio: 45, clientesPotenciaisMes: 400 },
    },
  },
  'capital-rj': {
    nome: 'Rio de Janeiro - Capital',
    fatorRegional: 1.3,
    segmentos: {},
  },
  'nordeste-capital': {
    nome: 'Nordeste - Capitais',
    fatorRegional: 0.9,
    segmentos: {
      'restaurante': { ticketMedio: 40, clientesPotenciaisMes: 350 },
    },
  },
  'sul-capital': {
    nome: 'Sul - Capitais',
    fatorRegional: 1.2,
    segmentos: {},
  },
};

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════

/**
 * Obtém dados de mercado para um segmento, considerando região
 */
export function getDadosMercado(
  segmento: string,
  regiao?: string
): DadosMercadoSegmento {
  const dadosBase = DADOS_BASE[segmento] || DADOS_BASE['outro'];

  if (!regiao) {
    return dadosBase;
  }

  const dadosRegiao = DADOS_REGIONAIS[regiao];
  if (!dadosRegiao) {
    return dadosBase;
  }

  const ajusteSegmento = dadosRegiao.segmentos[segmento] || {};

  // Mescla dados base com ajustes regionais
  return {
    ...dadosBase,
    ticketMedio: ajusteSegmento.ticketMedio
      || Math.round(dadosBase.ticketMedio * dadosRegiao.fatorRegional),
    clientesPotenciaisMes: ajusteSegmento.clientesPotenciaisMes
      || dadosBase.clientesPotenciaisMes,
    fatorMultiplicador: ajusteSegmento.fatorMultiplicador
      || dadosBase.fatorMultiplicador,
  };
}

/**
 * Lista todas as regiões disponíveis
 */
export function listarRegioes(): { value: string; label: string }[] {
  return Object.entries(DADOS_REGIONAIS).map(([value, config]) => ({
    value,
    label: config.nome,
  }));
}

// ═══════════════════════════════════════════════════════════════
// GUIA DE PESQUISA DE DADOS
// ═══════════════════════════════════════════════════════════════

/**
 * COMO ATUALIZAR OS DADOS:
 *
 * 1. TICKET MÉDIO:
 *    - SEBRAE: Pesquisas setoriais (https://sebrae.com.br/sites/PortalSebrae/estudos_pesquisas)
 *    - Associações: ABRASEL (restaurantes), ANVISA (farmácias), CFM (clínicas)
 *    - Pesquisa própria: Média de 10-20 negócios locais do segmento
 *
 * 2. CLIENTES POTENCIAIS (buscas mensais):
 *    - Google Keyword Planner: Busque termos como "farmácia perto de mim",
 *      "restaurante [cidade]", "dentista [bairro]"
 *    - Google Trends: Compare volume de buscas entre regiões
 *    - Ubersuggest/SEMrush: Volume de busca por palavra-chave
 *
 * 3. FATOR REGIONAL:
 *    - IBGE: Renda média familiar por município
 *    - Custo de vida: Compare preços médios entre regiões
 *    - Fórmula simples: (Renda média regional / Renda média Brasil)
 *
 * 4. PERIODICIDADE:
 *    - Revisar dados a cada 6-12 meses
 *    - Atualizar após mudanças econômicas significativas
 *
 * 5. VALIDAÇÃO:
 *    - Compare estimativas com dados reais de clientes existentes
 *    - Ajuste baseado no feedback de conversões
 */
