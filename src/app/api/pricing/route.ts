import { NextRequest, NextResponse } from "next/server";
import { gerarProposta, listarSegmentos, AnaliseInput } from "@/lib/pricing-agent";

// GET: Retorna lista de segmentos disponíveis
export async function GET() {
  const segmentos = listarSegmentos();
  return NextResponse.json({ segmentos });
}

// POST: Gera proposta de precificação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      scoreGBP,
      scoreSite,
      scoreRedes,
      segmento,
      avaliacoes,
      notaMedia,
      temSite,
      concorrentes,
    } = body;

    // Validação básica
    if (typeof scoreGBP !== "number" || typeof segmento !== "string") {
      return NextResponse.json(
        { error: "Dados inválidos. scoreGBP e segmento são obrigatórios." },
        { status: 400 }
      );
    }

    const input: AnaliseInput = {
      scoreGBP: scoreGBP ?? 50,
      scoreSite: scoreSite ?? 0,
      scoreRedes: scoreRedes ?? 0,
      segmento: segmento ?? "outro",
      avaliacoes: avaliacoes ?? 0,
      notaMedia: notaMedia ?? 0,
      temSite: temSite ?? false,
      concorrentes: concorrentes ?? 5,
    };

    const proposta = gerarProposta(input);

    return NextResponse.json(proposta);
  } catch (error) {
    console.error("Erro ao gerar proposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar precificação" },
      { status: 500 }
    );
  }
}
