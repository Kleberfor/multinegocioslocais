import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const VALID_TIPOS = [
  "NOTA",
  "LIGACAO",
  "EMAIL",
  "WHATSAPP",
  "REUNIAO",
];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { prospectId, leadId, tipo, descricao, metadata } = body;

    // Validações
    if (!prospectId && !leadId) {
      return NextResponse.json(
        { error: "É necessário informar prospectId ou leadId" },
        { status: 400 }
      );
    }

    if (!tipo || !VALID_TIPOS.includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo de interação inválido" },
        { status: 400 }
      );
    }

    if (!descricao || descricao.trim().length === 0) {
      return NextResponse.json(
        { error: "Descrição é obrigatória" },
        { status: 400 }
      );
    }

    // Buscar usuário atual
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || "" },
      select: { id: true, name: true, email: true, role: true },
    });

    // Verificar permissão para prospect
    if (prospectId) {
      const prospect = await prisma.prospect.findUnique({
        where: { id: prospectId },
        select: { id: true, vendedorId: true },
      });

      if (!prospect) {
        return NextResponse.json(
          { error: "Prospect não encontrado" },
          { status: 404 }
        );
      }

      // Vendedor só pode adicionar interação em seus próprios prospects
      if (user?.role === "vendedor" && prospect.vendedorId !== user.id) {
        return NextResponse.json(
          { error: "Sem permissão para adicionar interação neste prospect" },
          { status: 403 }
        );
      }
    }

    // Verificar permissão para lead
    if (leadId) {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { id: true, vendedorId: true },
      });

      if (!lead) {
        return NextResponse.json(
          { error: "Lead não encontrado" },
          { status: 404 }
        );
      }

      // Vendedor só pode adicionar interação em seus próprios leads
      if (user?.role === "vendedor" && lead.vendedorId !== user.id) {
        return NextResponse.json(
          { error: "Sem permissão para adicionar interação neste lead" },
          { status: 403 }
        );
      }
    }

    // Criar interação
    const interacao = await prisma.interacao.create({
      data: {
        prospectId,
        leadId,
        tipo,
        descricao: descricao.trim(),
        criadoPorId: user?.id || "system",
        criadoPor: user?.name || user?.email || "Sistema",
        metadata: metadata || undefined,
      },
    });

    return NextResponse.json(interacao, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar interação:", error);
    return NextResponse.json(
      { error: "Erro ao criar interação" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const prospectId = searchParams.get("prospectId");
    const leadId = searchParams.get("leadId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!prospectId && !leadId) {
      return NextResponse.json(
        { error: "É necessário informar prospectId ou leadId" },
        { status: 400 }
      );
    }

    const interacoes = await prisma.interacao.findMany({
      where: {
        ...(prospectId && { prospectId }),
        ...(leadId && { leadId }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(interacoes);
  } catch (error) {
    console.error("Erro ao buscar interações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar interações" },
      { status: 500 }
    );
  }
}
