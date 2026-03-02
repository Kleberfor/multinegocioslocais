import { prisma } from "@/lib/prisma";
import { SEGMENTOS } from "@/lib/pricing-agent";

export interface DadosMercadoSegmento {
  nome: string;
  ticketMedio: number;
  fatorMultiplicador: number;
  clientesPotenciaisMes: number;
}

/**
 * Busca dados de mercado do banco de dados
 * Se não encontrar, retorna os valores padrão do pricing-agent
 */
export async function getDadosMercadoSegmento(
  segmento: string,
  regiao?: string | null
): Promise<DadosMercadoSegmento> {
  // Valores padrão do pricing-agent
  const padrao = SEGMENTOS[segmento] || SEGMENTOS["outro"];

  try {
    // Tentar buscar do banco
    const dado = await prisma.dadosMercado.findFirst({
      where: {
        segmento,
        regiao: regiao || null,
      },
    });

    if (dado) {
      return {
        nome: padrao.nome,
        ticketMedio: Number(dado.ticketMedio),
        fatorMultiplicador: Number(dado.fatorMultiplicador),
        clientesPotenciaisMes: dado.clientesPotenciaisMes,
      };
    }

    // Se tem região mas não encontrou, tentar sem região (dados base)
    if (regiao) {
      const dadoBase = await prisma.dadosMercado.findFirst({
        where: {
          segmento,
          regiao: null,
        },
      });

      if (dadoBase) {
        return {
          nome: padrao.nome,
          ticketMedio: Number(dadoBase.ticketMedio),
          fatorMultiplicador: Number(dadoBase.fatorMultiplicador),
          clientesPotenciaisMes: dadoBase.clientesPotenciaisMes,
        };
      }
    }
  } catch (error) {
    // Em caso de erro, usa valores padrão
    console.error("Erro ao buscar dados de mercado:", error);
  }

  // Retorna valores padrão
  return padrao;
}

/**
 * Busca todos os dados de mercado (para cache ou batch)
 */
export async function getAllDadosMercado(): Promise<Map<string, DadosMercadoSegmento>> {
  const mapa = new Map<string, DadosMercadoSegmento>();

  try {
    const dados = await prisma.dadosMercado.findMany({
      where: { regiao: null }, // Apenas dados base
    });

    dados.forEach((d) => {
      const padrao = SEGMENTOS[d.segmento] || SEGMENTOS["outro"];
      mapa.set(d.segmento, {
        nome: padrao.nome,
        ticketMedio: Number(d.ticketMedio),
        fatorMultiplicador: Number(d.fatorMultiplicador),
        clientesPotenciaisMes: d.clientesPotenciaisMes,
      });
    });
  } catch (error) {
    console.error("Erro ao buscar dados de mercado:", error);
  }

  return mapa;
}
