import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentStatus, mapPaymentStatus } from "@/lib/mercadopago";

// Webhook do Mercado Pago para notificações de pagamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verificar tipo de notificação
    if (body.type !== "payment") {
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    // Buscar status do pagamento no Mercado Pago
    const paymentData = await getPaymentStatus(Number(paymentId));

    if (!paymentData.externalReference) {
      console.log("Pagamento sem referência externa:", paymentId);
      return NextResponse.json({ received: true });
    }

    // Buscar pagamento no banco pelo mpId
    const pagamento = await prisma.pagamento.findFirst({
      where: { mpId: String(paymentId) },
    });

    if (!pagamento) {
      console.log("Pagamento não encontrado no banco:", paymentId);
      return NextResponse.json({ received: true });
    }

    // Mapear status
    const novoStatus = mapPaymentStatus(paymentData.status || "pending");

    // Atualizar pagamento
    await prisma.pagamento.update({
      where: { id: pagamento.id },
      data: {
        status: novoStatus,
        paidAt: novoStatus === "PAGO" ? new Date() : pagamento.paidAt,
      },
    });

    // Se pagamento aprovado, atualizar contrato
    if (novoStatus === "PAGO") {
      await prisma.contrato.update({
        where: { id: pagamento.contratoId },
        data: { status: "PAGO" },
      });

      // TODO: Enviar e-mail de confirmação para o cliente
      console.log("Pagamento aprovado para contrato:", pagamento.contratoId);
    }

    return NextResponse.json({ received: true, status: novoStatus });
  } catch (error) {
    console.error("Erro no webhook:", error);
    // Retornar 200 para o Mercado Pago não reenviar
    return NextResponse.json({ received: true, error: "Internal error" });
  }
}

// Mercado Pago também pode enviar GET para verificar endpoint
export async function GET() {
  return NextResponse.json({ status: "Webhook ativo" });
}
