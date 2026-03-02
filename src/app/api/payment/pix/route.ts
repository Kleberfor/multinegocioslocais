import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPixPayment } from "@/lib/mercadopago";

// Modo de teste/simulação
const TEST_MODE = process.env.TEST_MODE === "true" || !process.env.MERCADOPAGO_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  try {
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

    // MODO TESTE: Simular PIX sem chamar Mercado Pago
    if (TEST_MODE) {
      console.log("[PIX] Modo de teste ativado - simulando pagamento");

      // Criar registro de pagamento simulado
      const pagamento = await prisma.pagamento.create({
        data: {
          contratoId,
          valor: contrato.valor,
          parcela: 1,
          status: "PENDENTE",
          mpId: `TEST-${Date.now()}`,
        },
      });

      // QR Code de exemplo (apenas visual)
      const qrCodeSimulado = `00020126580014br.gov.bcb.pix0136${pagamento.id}5204000053039865802BR5925MULTINEGOCIOSLOCAIS6009SAO PAULO62070503***6304`;

      return NextResponse.json({
        success: true,
        testMode: true,
        pagamentoId: pagamento.id,
        mpPaymentId: `TEST-${pagamento.id}`,
        qrCode: qrCodeSimulado,
        qrCodeBase64: null, // Sem imagem em modo teste
        ticketUrl: null,
        expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
      });
    }

    // MODO PRODUÇÃO: Usar Mercado Pago
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
