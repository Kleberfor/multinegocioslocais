import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// API para simular pagamento aprovado (apenas em modo de teste)
export async function POST(request: NextRequest) {
  // Bloquear se não estiver em modo de teste
  if (process.env.NEXT_PUBLIC_TEST_MODE !== "true") {
    return NextResponse.json(
      { error: "Não disponível em produção" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { pagamentoId } = body;

    if (!pagamentoId) {
      return NextResponse.json(
        { error: "ID do pagamento é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar pagamento
    const pagamento = await prisma.pagamento.findUnique({
      where: { id: pagamentoId },
    });

    if (!pagamento) {
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar pagamento para PAGO
    await prisma.pagamento.update({
      where: { id: pagamentoId },
      data: {
        status: "PAGO",
        paidAt: new Date(),
      },
    });

    // Atualizar contrato para PAGO
    await prisma.contrato.update({
      where: { id: pagamento.contratoId },
      data: { status: "PAGO" },
    });

    return NextResponse.json({
      success: true,
      message: "Pagamento simulado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao simular pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao simular pagamento" },
      { status: 500 }
    );
  }
}
