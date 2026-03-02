import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Buscar dados públicos do lead (sem autenticação)
// Usado pela página de contratação para carregar dados da proposta
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        negocio: true,
        proposta: true,
        valorSugerido: true,
        scoreGeral: true,
        scoreGBP: true,
        scoreSite: true,
        scoreRedes: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead não encontrado" },
        { status: 404 }
      );
    }

    // Retornar apenas dados necessários para a página de contratação
    return NextResponse.json({
      id: lead.id,
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      negocio: lead.negocio,
      proposta: lead.proposta,
      valorSugerido: lead.valorSugerido,
      scoreGeral: lead.scoreGeral,
    });

  } catch (error) {
    console.error("Erro ao buscar lead público:", error);
    return NextResponse.json(
      { error: "Erro ao buscar lead" },
      { status: 500 }
    );
  }
}
