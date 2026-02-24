// Análise de Redes Sociais
// Verifica presença do negócio em Instagram e Facebook

export interface RedesSociaisAnalise {
  instagram: {
    encontrado: boolean;
    username?: string;
    url?: string;
  };
  facebook: {
    encontrado: boolean;
    pageName?: string;
    url?: string;
  };
  score: number; // 0-100
  recomendacoes: string[];
}

/**
 * Gera URLs de busca para redes sociais baseado no nome do negócio
 */
function gerarUrlsBusca(nomeNegocio: string): {
  instagramSearch: string;
  facebookSearch: string;
} {
  const query = encodeURIComponent(nomeNegocio);
  return {
    instagramSearch: `https://www.instagram.com/explore/search/keyword/?q=${query}`,
    facebookSearch: `https://www.facebook.com/search/pages/?q=${query}`,
  };
}

/**
 * Normaliza nome para username de rede social
 */
function normalizarParaUsername(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais
    .substring(0, 30);
}

/**
 * Analisa a presença do negócio em redes sociais
 * Versão simplificada que gera URLs de busca e estimativa
 */
export async function analisarRedesSociais(
  nomeNegocio: string,
  website?: string
): Promise<RedesSociaisAnalise> {
  console.log('[RedesSociais] Analisando:', nomeNegocio);

  const recomendacoes: string[] = [];
  const urlsBusca = gerarUrlsBusca(nomeNegocio);
  const usernameProvavel = normalizarParaUsername(nomeNegocio);

  // Por padrão, assumimos que não encontramos (análise conservadora)
  // Em produção, poderia integrar com APIs oficiais
  let instagramEncontrado = false;
  let facebookEncontrado = false;

  // Se tem website, verificar se tem links para redes sociais
  if (website) {
    try {
      const response = await fetch(website, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const html = await response.text();

        // Procurar links de Instagram
        if (html.includes('instagram.com/')) {
          instagramEncontrado = true;
          const match = html.match(/instagram\.com\/([a-zA-Z0-9_.]+)/i);
          if (match) {
            recomendacoes.push(`Instagram encontrado: @${match[1]}`);
          }
        }

        // Procurar links de Facebook
        if (html.includes('facebook.com/')) {
          facebookEncontrado = true;
          const match = html.match(/facebook\.com\/([a-zA-Z0-9_.]+)/i);
          if (match) {
            recomendacoes.push(`Facebook encontrado: ${match[1]}`);
          }
        }
      }
    } catch (error) {
      console.log('[RedesSociais] Erro ao verificar website:', error);
    }
  }

  // Calcular score baseado nas redes encontradas
  let score = 30; // Score base (sem redes = ruim)

  if (instagramEncontrado && facebookEncontrado) {
    score = 80;
  } else if (instagramEncontrado || facebookEncontrado) {
    score = 55;
  }

  // Gerar recomendações
  if (!instagramEncontrado) {
    recomendacoes.push('Criar perfil comercial no Instagram');
  }

  if (!facebookEncontrado) {
    recomendacoes.push('Criar página no Facebook');
  }

  if (!instagramEncontrado && !facebookEncontrado) {
    recomendacoes.push('Presença em redes sociais é essencial para negócios locais');
  }

  return {
    instagram: {
      encontrado: instagramEncontrado,
      username: instagramEncontrado ? usernameProvavel : undefined,
      url: urlsBusca.instagramSearch,
    },
    facebook: {
      encontrado: facebookEncontrado,
      pageName: facebookEncontrado ? usernameProvavel : undefined,
      url: urlsBusca.facebookSearch,
    },
    score,
    recomendacoes,
  };
}

/**
 * Gera diagnóstico detalhado para redes sociais
 */
export function gerarDiagnosticoRedesSociais(
  analise: RedesSociaisAnalise
): { titulo: string; descricao: string; impacto: string; comoResolver: string }[] {
  const diagnosticos: { titulo: string; descricao: string; impacto: string; comoResolver: string }[] = [];

  if (!analise.instagram.encontrado) {
    diagnosticos.push({
      titulo: 'Ausência no Instagram',
      descricao: 'Não foi encontrado perfil do negócio no Instagram',
      impacto: 'Instagram é a principal rede para descobrir negócios locais',
      comoResolver: 'Criar perfil comercial com fotos do estabelecimento, produtos e stories frequentes',
    });
  }

  if (!analise.facebook.encontrado) {
    diagnosticos.push({
      titulo: 'Ausência no Facebook',
      descricao: 'Não foi encontrada página do negócio no Facebook',
      impacto: 'Facebook é relevante para público 35+ e anúncios locais',
      comoResolver: 'Criar página comercial com informações completas e avaliações',
    });
  }

  return diagnosticos;
}
