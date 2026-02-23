import { NextRequest, NextResponse } from "next/server";
import { searchPlaces, getPlaceDetails } from "@/lib/google";
import { calculateScore } from "@/lib/scoring";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, placeId } = body;

    // Se tiver placeId, busca detalhes direto
    if (placeId) {
      const details = await getPlaceDetails(placeId);

      if (!details) {
        return NextResponse.json(
          { error: "Negócio não encontrado" },
          { status: 404 }
        );
      }

      const scoreData = calculateScore(details);

      // Salvar como prospect (converter para JSON puro)
      const prospect = await prisma.prospect.create({
        data: {
          placeId: details.placeId,
          nome: details.name,
          score: scoreData.total,
          analise: JSON.parse(JSON.stringify({
            place: details,
            score: scoreData,
          })),
        },
      });

      return NextResponse.json({
        id: prospect.id,
        place: details,
        score: scoreData,
      });
    }

    // Se tiver query, busca primeiro
    if (query) {
      const results = await searchPlaces(query);

      return NextResponse.json({
        results: results.slice(0, 5), // Limitar a 5 resultados
      });
    }

    return NextResponse.json(
      { error: "Query ou placeId são obrigatórios" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro na análise:", error);
    return NextResponse.json(
      { error: "Erro ao processar análise" },
      { status: 500 }
    );
  }
}
