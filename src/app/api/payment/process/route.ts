import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TODO: Integrar com Mercado Pago no E-4
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clienteId, contratoId, method } = body;

    if (!clienteId || !contratoId) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    // Verificar se o contrato existe
    const contrato = await prisma.contrato.findUnique({
      where: { id: contratoId },
    });

    if (!contrato) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 }
      );
    }

    // Criar registro de pagamento
    const pagamento = await prisma.pagamento.create({
      data: {
        contratoId,
        valor: contrato.valor,
        parcela: 1,
        status: method === "pix" ? "PROCESSANDO" : "PENDENTE",
      },
    });

    // Simular processamento de PIX (aprovação instantânea em dev)
    if (method === "pix") {
      // Em produção, isso seria feito via webhook do Mercado Pago
      await prisma.pagamento.update({
        where: { id: pagamento.id },
        data: {
          status: "PAGO",
          paidAt: new Date(),
        },
      });

      // Atualizar status do contrato
      await prisma.contrato.update({
        where: { id: contratoId },
        data: { status: "PAGO" },
      });
    }

    // TODO: Integração com Mercado Pago
    // - PIX: Gerar QR Code via API do MP
    // - Cartão: Processar via tokenização do MP
    // - Boleto: Gerar boleto via API do MP

    return NextResponse.json({
      success: true,
      pagamentoId: pagamento.id,
      method,
      status: pagamento.status,
    });
  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao processar pagamento" },
      { status: 500 }
    );
  }
}
