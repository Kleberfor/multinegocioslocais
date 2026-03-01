import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPixPayment } from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  try {
    // Verificar se o token do Mercado Pago está configurado
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error("MERCADOPAGO_ACCESS_TOKEN não configurado");
      return NextResponse.json(
        { error: "Configuração de pagamento incompleta. Entre em contato com o suporte." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { clienteId, contratoId } = body;

    if (!clienteId || !contratoId) {
      return NextResponse.json(
        { error: "Dados incompletos: clienteId e contratoId são obrigatórios" },
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

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    if (!contrato) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 }
      );
    }

    // Validar CPF/CNPJ
    const cpfCnpj = cliente.cpfCnpj?.replace(/\D/g, "");
    if (!cpfCnpj || (cpfCnpj.length !== 11 && cpfCnpj.length !== 14)) {
      return NextResponse.json(
        { error: "CPF/CNPJ do cliente inválido" },
        { status: 400 }
      );
    }

    // Separar nome em primeiro e último
    const nameParts = cliente.nome.trim().split(" ");
    const firstName = nameParts[0] || "Cliente";
    const lastName = nameParts.slice(1).join(" ") || firstName;

    // Criar pagamento PIX no Mercado Pago
    const pixPayment = await createPixPayment({
      amount: Number(contrato.valor),
      description: `Contrato MultiNegócios Locais - ${cliente.negocio}`,
      email: cliente.email,
      firstName,
      lastName,
      cpf: cpfCnpj,
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
    console.error("Erro completo (JSON):", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    // Tratar erros específicos do Mercado Pago
    if (error instanceof Error) {
      const errorMessage = error.message;
      console.error("Mensagem do erro:", errorMessage);

      // Erros comuns do Mercado Pago
      if (errorMessage.includes("invalid_token") || errorMessage.includes("unauthorized") || errorMessage.includes("401")) {
        return NextResponse.json(
          { error: "Erro de autenticação com o gateway de pagamento. Verifique as credenciais." },
          { status: 500 }
        );
      }

      if (errorMessage.includes("invalid_payer") || errorMessage.includes("payer")) {
        return NextResponse.json(
          { error: "Dados do pagador inválidos. Verifique o CPF e email." },
          { status: 400 }
        );
      }

      // Em produção, mostrar erro genérico mas logar o detalhe
      // Temporariamente, retornar erro detalhado para debug
      return NextResponse.json(
        { error: `Erro: ${errorMessage}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar pagamento PIX. Tente novamente ou escolha outra forma de pagamento." },
      { status: 500 }
    );
  }
}
