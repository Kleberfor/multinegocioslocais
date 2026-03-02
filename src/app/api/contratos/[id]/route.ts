import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { z } from "zod";

const updateContratoSchema = z.object({
  valor: z.number().positive("Valor deve ser positivo"),
  parcelas: z.number().int().min(1, "Mínimo 1 parcela").max(24, "Máximo 24 parcelas"),
  status: z.enum(["PENDENTE", "ASSINADO", "PAGO", "CANCELADO"]),
  valorMensal: z.number().nullable().optional(),
  incluiGestaoMensal: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contrato = await prisma.contrato.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            negocio: true,
          },
        },
      },
    });

    if (!contrato) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(contrato);
  } catch (error) {
    console.error("Erro ao buscar contrato:", error);
    return NextResponse.json(
      { error: "Erro ao buscar contrato" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const validationResult = updateContratoSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verificar se contrato existe
    const contratoExistente = await prisma.contrato.findUnique({
      where: { id },
    });

    if (!contratoExistente) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // Atualizar contrato
    const contrato = await prisma.contrato.update({
      where: { id },
      data: {
        valor: data.valor,
        parcelas: data.parcelas,
        status: data.status,
        valorMensal: data.valorMensal,
        incluiGestaoMensal: data.incluiGestaoMensal ?? false,
      },
    });

    return NextResponse.json({
      id: contrato.id,
      message: "Contrato atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar contrato:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao atualizar contrato", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar se contrato existe
    const contrato = await prisma.contrato.findUnique({
      where: { id },
    });

    if (!contrato) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // Deletar contrato
    await prisma.contrato.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Contrato excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir contrato:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao excluir contrato", details: errorMessage },
      { status: 500 }
    );
  }
}
