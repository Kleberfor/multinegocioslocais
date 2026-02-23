import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const pagamento = await prisma.pagamento.findUnique({
      where: { id },
      include: {
        contrato: {
          include: {
            cliente: true,
          },
        },
      },
    });

    if (!pagamento) {
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: pagamento.id,
      status: pagamento.status,
      valor: pagamento.valor,
      parcela: pagamento.parcela,
      mpId: pagamento.mpId,
      paidAt: pagamento.paidAt,
      contrato: {
        id: pagamento.contrato.id,
        status: pagamento.contrato.status,
      },
      cliente: {
        nome: pagamento.contrato.cliente.nome,
        email: pagamento.contrato.cliente.email,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar status do pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pagamento" },
      { status: 500 }
    );
  }
}
