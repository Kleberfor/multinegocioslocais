import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPixPayment } from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clienteId, contratoId } = body;

    if (!clienteId || !contratoId) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    // Buscar cliente e contrato
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    const contrato = await prisma.contrato.findUnique({
      where: { id: contratoId },
    });

    if (!cliente || !contrato) {
      return NextResponse.json(
        { error: "Cliente ou contrato não encontrado" },
        { status: 404 }
      );
    }

    // Separar nome em primeiro e último
    const nameParts = cliente.nome.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || firstName;

    // Criar pagamento PIX no Mercado Pago
    const pixPayment = await createPixPayment({
      amount: Number(contrato.valor),
      description: `Contrato MultiNegócios Locais - ${cliente.negocio}`,
      email: cliente.email,
      firstName,
      lastName,
      cpf: cliente.cpfCnpj,
      contratoId: contrato.id,
    });

    // Criar registro de pagamento no banco
    const pagamento = await prisma.pagamento.create({
      data: {
        contratoId,
        valor: contrato.valor,
        parcela: 1,
        status: "PENDENTE",
        mpId: String(pixPayment.id),
      },
    });

    return NextResponse.json({
      success: true,
      pagamentoId: pagamento.id,
      mpPaymentId: pixPayment.id,
      qrCode: pixPayment.qrCode,
      qrCodeBase64: pixPayment.qrCodeBase64,
      ticketUrl: pixPayment.ticketUrl,
      expirationDate: pixPayment.expirationDate,
    });
  } catch (error) {
    console.error("Erro ao criar pagamento PIX:", error);
    return NextResponse.json(
      { error: "Erro ao criar pagamento PIX" },
      { status: 500 }
    );
  }
}
