import { NextRequest, NextResponse } from "next/server";
import { analisarSite, analisarSiteSimplificado } from "@/lib/site-analysis";

// POST: Analisa um site
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, simplificado } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL é obrigatória" },
        { status: 400 }
      );
    }

    // Se simplificado = true, retorna apenas score (para mostrar ao cliente)
    if (simplificado) {
      const resultado = await analisarSiteSimplificado(url);
      return NextResponse.json(resultado);
    }

    // Análise completa (para uso interno)
    const analise = await analisarSite(url);
    return NextResponse.json(analise);

  } catch (error) {
    console.error("Erro ao analisar site:", error);
    return NextResponse.json(
      { error: "Erro ao analisar site" },
      { status: 500 }
    );
  }
}
