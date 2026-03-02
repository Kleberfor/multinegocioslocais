import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface ReatribuicaoBody {
  novoVendedorId: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Apenas admin pode reatribuir prospects
    const user = session.user as { id: string; role: string };
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem reatribuir prospects" },
        { status: 403 }
      );
    }

    const { id: prospectId } = await params;
    const body: ReatribuicaoBody = await request.json();

    if (!body.novoVendedorId) {
      return NextResponse.json(
        { error: "ID do novo vendedor é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar prospect atual
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId },
      include: {
        vendedor: { select: { name: true, email: true } },
      },
    });

    if (!prospect) {
      return NextResponse.json(
        { error: "Prospect não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o novo vendedor existe
    const novoVendedor = await prisma.user.findUnique({
      where: { id: body.novoVendedorId },
      select: { id: true, name: true, email: true, role: true, ativo: true },
    });

    if (!novoVendedor) {
      return NextResponse.json(
        { error: "Vendedor não encontrado" },
        { status: 404 }
      );
    }

    if (novoVendedor.role !== "vendedor" && novoVendedor.role !== "admin") {
      return NextResponse.json(
        { error: "Usuário selecionado não é um vendedor" },
        { status: 400 }
      );
    }

    if (!novoVendedor.ativo) {
      return NextResponse.json(
        { error: "Vendedor selecionado está inativo" },
        { status: 400 }
      );
    }

    // Verificar se é o mesmo vendedor
    if (prospect.vendedorId === body.novoVendedorId) {
      return NextResponse.json(
        { error: "Prospect já está atribuído a este vendedor" },
        { status: 400 }
      );
    }

    const vendedorAnterior = prospect.vendedor?.name || prospect.vendedor?.email || "Nenhum";

    // Atualizar prospect
    await prisma.prospect.update({
      where: { id: prospectId },
      data: {
        vendedorId: body.novoVendedorId,
      },
    });

    // Registrar interação
    await prisma.interacao.create({
      data: {
        prospectId,
        tipo: "NOTA",
        descricao: `Prospect reatribuído de "${vendedorAnterior}" para "${novoVendedor.name || novoVendedor.email}"`,
        criadoPorId: user.id,
        criadoPor: session.user.name || session.user.email || "Admin",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Prospect reatribuído para ${novoVendedor.name || novoVendedor.email}`,
      novoVendedor: {
        id: novoVendedor.id,
        name: novoVendedor.name,
        email: novoVendedor.email,
      },
    });
  } catch (error) {
    console.error("Erro ao reatribuir prospect:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao reatribuir prospect", details: errorMessage },
      { status: 500 }
    );
  }
}
