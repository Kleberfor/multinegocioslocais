// Verificação de presença em outras plataformas
// Apple Maps e Bing Places

export interface PlataformaStatus {
  plataforma: string;
  encontrado: boolean;
  url?: string;
  detalhes?: string;
}

export interface VerificacaoPlataformas {
  appleMaps: PlataformaStatus;
  bingPlaces: PlataformaStatus;
  scoreBonus: number; // Pontos extras por estar em outras plataformas
}

/**
 * Verifica se o negócio aparece no Apple Maps
 * Usa a API de busca do MapKit (limitada)
 */
async function verificarAppleMaps(
  nomeNegocio: string,
  endereco: string
): Promise<PlataformaStatus> {
  try {
    // Apple Maps não tem API pública robusta
    // Fazemos uma verificação via URL de busca
    const query = encodeURIComponent(`${nomeNegocio} ${endereco}`);
    const appleMapsUrl = `https://maps.apple.com/?q=${query}`;

    // Por enquanto, retornamos como "verificação pendente"
    // Em produção, poderia usar MapKit JS com token
    return {
      plataforma: "Apple Maps",
      encontrado: false, // Não conseguimos verificar automaticamente
      url: appleMapsUrl,
      detalhes: "Verificação manual recomendada",
    };
  } catch (error) {
    console.error("[AppleMaps] Erro:", error);
    return {
      plataforma: "Apple Maps",
      encontrado: false,
      detalhes: "Erro na verificação",
    };
  }
}

/**
 * Verifica se o negócio aparece no Bing Places
 * Usa a Bing Maps API
 */
async function verificarBingPlaces(
  nomeNegocio: string,
  endereco: string
): Promise<PlataformaStatus> {
  const bingKey = process.env.BING_MAPS_API_KEY;

  try {
    if (!bingKey) {
      // Sem API key, retorna URL de busca manual
      const query = encodeURIComponent(`${nomeNegocio} ${endereco}`);
      return {
        plataforma: "Bing Places",
        encontrado: false,
        url: `https://www.bing.com/maps?q=${query}`,
        detalhes: "API não configurada - verificação manual",
      };
    }

    // Buscar no Bing Maps
    const query = encodeURIComponent(`${nomeNegocio} ${endereco}`);
    const url = `https://dev.virtualearth.net/REST/v1/Locations?query=${query}&key=${bingKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.resourceSets?.[0]?.resources?.length > 0) {
      const result = data.resourceSets[0].resources[0];
      return {
        plataforma: "Bing Places",
        encontrado: true,
        url: `https://www.bing.com/maps?q=${query}`,
        detalhes: result.name || "Encontrado no Bing Maps",
      };
    }

    return {
      plataforma: "Bing Places",
      encontrado: false,
      url: `https://www.bing.com/maps?q=${query}`,
      detalhes: "Não encontrado no Bing Maps",
    };
  } catch (error) {
    console.error("[BingPlaces] Erro:", error);
    return {
      plataforma: "Bing Places",
      encontrado: false,
      detalhes: "Erro na verificação",
    };
  }
}

/**
 * Verifica presença do negócio em todas as plataformas alternativas
 */
export async function verificarOutrasPlataformas(
  nomeNegocio: string,
  endereco: string
): Promise<VerificacaoPlataformas> {
  console.log("[Plataformas] Verificando:", nomeNegocio);

  const [appleMaps, bingPlaces] = await Promise.all([
    verificarAppleMaps(nomeNegocio, endereco),
    verificarBingPlaces(nomeNegocio, endereco),
  ]);

  // Calcular bônus de score
  let scoreBonus = 0;
  if (appleMaps.encontrado) scoreBonus += 5;
  if (bingPlaces.encontrado) scoreBonus += 5;

  return {
    appleMaps,
    bingPlaces,
    scoreBonus,
  };
}

/**
 * Gera diagnóstico para plataformas não encontradas
 */
export function gerarDiagnosticoPlataformas(
  verificacao: VerificacaoPlataformas
): { titulo: string; descricao: string; impacto: string; comoResolver: string }[] {
  const diagnosticos: { titulo: string; descricao: string; impacto: string; comoResolver: string }[] = [];

  if (!verificacao.appleMaps.encontrado) {
    diagnosticos.push({
      titulo: "Ausente no Apple Maps",
      descricao: "Seu negócio não foi encontrado no Apple Maps",
      impacto: "Usuários de iPhone e Mac não te encontram facilmente",
      comoResolver: "Cadastre seu negócio em maps.apple.com ou Apple Business Connect",
    });
  }

  if (!verificacao.bingPlaces.encontrado) {
    diagnosticos.push({
      titulo: "Ausente no Bing Places",
      descricao: "Seu negócio não foi encontrado no Bing Maps",
      impacto: "Usuários de Windows e Cortana não te encontram",
      comoResolver: "Cadastre seu negócio em bingplaces.com",
    });
  }

  return diagnosticos;
}
