import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarEmailContrato } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clienteId } = body;

    if (!clienteId) {
      return NextResponse.json(
        { error: "ID do cliente é obrigatório" },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        contratos: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    const contrato = cliente.contratos[0];
    if (!contrato) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 }
      );
    }

    const result = await enviarEmailContrato({
      para: cliente.email,
      nome: cliente.nome,
      negocio: cliente.negocio,
      contratoId: contrato.id.substring(0, 8).toUpperCase(),
      valor: Number(contrato.valor),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Erro ao enviar email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email enviado com sucesso",
      emailId: result.id,
    });
  } catch (error) {
    console.error("Erro ao enviar email de contrato:", error);
    return NextResponse.json(
      { error: "Erro ao enviar email" },
      { status: 500 }
    );
  }
}
