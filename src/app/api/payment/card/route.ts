import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCardPayment } from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clienteId, contratoId, token, installments, paymentMethodId } = body;

    if (!clienteId || !contratoId || !token) {
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

    // Separar nome
    const nameParts = cliente.nome.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || firstName;

    // Criar pagamento com cartão no Mercado Pago
    const cardPayment = await createCardPayment({
      amount: Number(contrato.valor),
      description: `Contrato MultiNegócios Locais - ${cliente.negocio}`,
      email: cliente.email,
      firstName,
      lastName,
      cpf: cliente.cpfCnpj,
      contratoId: contrato.id,
      token,
      installments: installments || 1,
      paymentMethodId: paymentMethodId || "visa",
    });

    // Determinar status inicial
    const status = cardPayment.status === "approved" ? "PAGO" : "PROCESSANDO";

    // Criar registro de pagamento
    const pagamento = await prisma.pagamento.create({
      data: {
        contratoId,
        valor: contrato.valor,
        parcela: 1,
        status,
        mpId: String(cardPayment.id),
        paidAt: status === "PAGO" ? new Date() : null,
      },
    });

    // Se aprovado, atualizar contrato
    if (status === "PAGO") {
      await prisma.contrato.update({
        where: { id: contratoId },
        data: { status: "PAGO" },
      });
    }

    return NextResponse.json({
      success: true,
      pagamentoId: pagamento.id,
      mpPaymentId: cardPayment.id,
      status: cardPayment.status,
      statusDetail: cardPayment.statusDetail,
    });
  } catch (error) {
    console.error("Erro ao criar pagamento com cartão:", error);
    return NextResponse.json(
      { error: "Erro ao processar pagamento" },
      { status: 500 }
    );
  }
}
