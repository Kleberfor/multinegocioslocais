import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/prospects - Listar prospects
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const vendedorId = searchParams.get("vendedorId");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Filtrar por status
    if (status) {
      where.statusPipeline = status;
    }

    // Filtrar por vendedor (se não for admin, filtrar pelo próprio vendedor)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (user?.role !== "admin") {
      where.vendedorId = user?.id;
    } else if (vendedorId) {
      where.vendedorId = vendedorId;
    }

    // Busca por nome, email ou negócio
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { negocio: { contains: search, mode: "insensitive" } },
      ];
    }

    const prospects = await prisma.prospect.findMany({
      where,
      include: {
        vendedor: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { interacoes: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(prospects);
  } catch (error) {
    console.error("Erro ao listar prospects:", error);
    return NextResponse.json(
      { error: "Erro ao listar prospects" },
      { status: 500 }
    );
  }
}

// POST /api/prospects - Criar prospect
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await request.json();

    // Buscar usuário logado para atribuir como vendedor
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Criar prospect
    const prospect = await prisma.prospect.create({
      data: {
        nome: data.nome,
        email: data.email || null,
        telefone: data.telefone,
        negocio: data.negocio || null,
        segmento: data.segmento || null,
        cidade: data.cidade || null,
        estado: data.estado || null,
        origem: data.origem || "CAPTACAO_ATIVA",
        observacoes: data.observacoes || null,
        valorEstimado: data.valorEstimado || null,
        statusPipeline: "NOVO",
        vendedorId: user.id, // Atribuir ao usuário que criou
      },
    });

    // Criar interação inicial
    await prisma.interacao.create({
      data: {
        prospectId: prospect.id,
        tipo: "NOTA",
        descricao: `Prospect cadastrado via ${data.origem === "CAPTACAO_ATIVA" ? "captação ativa" : data.origem}`,
        criadoPorId: user.id,
        criadoPor: user.name || user.email,
      },
    });

    return NextResponse.json(prospect, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar prospect:", error);
    return NextResponse.json(
      { error: "Erro ao criar prospect" },
      { status: 500 }
    );
  }
}
