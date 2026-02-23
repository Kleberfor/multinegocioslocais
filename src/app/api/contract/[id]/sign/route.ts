import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contrato = await prisma.contrato.findUnique({
      where: { id },
    });

    if (!contrato) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar status para ASSINADO
    const contratoAtualizado = await prisma.contrato.update({
      where: { id },
      data: {
        status: "ASSINADO",
        assinadoEm: new Date(),
      },
    });

    return NextResponse.json({
      message: "Contrato assinado com sucesso",
      contrato: contratoAtualizado,
    });
  } catch (error) {
    console.error("Erro ao assinar contrato:", error);
    return NextResponse.json(
      { error: "Erro ao assinar contrato" },
      { status: 500 }
    );
  }
}
