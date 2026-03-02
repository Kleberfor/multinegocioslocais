import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateProspectSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  negocio: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
  segmento: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  valorEstimado: z.number().optional().nullable(),
});

// GET: Buscar prospect por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const prospect = await prisma.prospect.findUnique({
      where: { id },
    });

    if (!prospect) {
      return NextResponse.json({ error: "Prospect não encontrado" }, { status: 404 });
    }

    return NextResponse.json(prospect);
  } catch (error) {
    console.error("Erro ao buscar prospect:", error);
    return NextResponse.json({ error: "Erro ao buscar prospect" }, { status: 500 });
  }
}

// PUT: Atualizar prospect
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const validationResult = updateProspectSchema.safeParse(body);

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

    // Verificar se prospect existe
    const prospectExistente = await prisma.prospect.findUnique({
      where: { id },
    });

    if (!prospectExistente) {
      return NextResponse.json({ error: "Prospect não encontrado" }, { status: 404 });
    }

    // Atualizar prospect
    const prospect = await prisma.prospect.update({
      where: { id },
      data: {
        nome: data.nome,
        negocio: data.negocio || null,
        telefone: data.telefone || null,
        email: data.email || null,
        segmento: data.segmento || null,
        cidade: data.cidade || null,
        estado: data.estado || null,
        observacoes: data.observacoes || null,
        valorEstimado: data.valorEstimado || null,
      },
    });

    return NextResponse.json({
      id: prospect.id,
      message: "Prospect atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar prospect:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao atualizar prospect", details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE: Excluir prospect (apenas admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "Não autorizado" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    await prisma.prospect.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erro ao excluir prospect:", error);
    return NextResponse.json(
      { error: "Erro ao excluir prospect" },
      { status: 500 }
    );
  }
}
