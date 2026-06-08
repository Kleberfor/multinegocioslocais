import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { gerarProposta, type AnaliseInput } from "@/lib/pricing-agent";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDAÇÃO
// ═══════════════════════════════════════════════════════════════

const criarPropostaSchema = z.object({
  leadId: z.string().min(1, "ID do lead é obrigatório"),
  // Opcional: usar dados fornecidos em vez de buscar do lead
  scoreGBP: z.number().min(0).max(100).optional(),
  scoreSite: z.number().min(0).max(100).optional(),
  scoreRedes: z.number().min(0).max(100).optional(),
  segmento: z.string().optional(),
  avaliacoes: z.number().min(0).optional(),
  notaMedia: z.number().min(0).max(5).optional(),
  temSite: z.boolean().optional(),
  concorrentes: z.number().min(0).optional(),
});

// ═══════════════════════════════════════════════════════════════
// GET: Listar propostas (leads com proposta gerada)
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const status = searchParams.get("status"); // NOVO, CONTATADO, CONVERTIDO, PERDIDO

    const where: Record<string, unknown> = {
      proposta: { not: null }, // Apenas leads que têm proposta
    };

    if (status) {
      where.status = status;
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          negocio: true,
          segmento: true,
          scoreGeral: true,
          valorSugerido: true,
          proposta: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      propostas: leads.map((lead) => ({
        id: lead.id,
        leadId: lead.id,
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        negocio: lead.negocio,
        segmento: lead.segmento,
        scoreGeral: lead.scoreGeral,
        valorSugerido: lead.valorSugerido ? Number(lead.valorSugerido) : null,
        proposta: lead.proposta,
        status: lead.status,
        createdAt: lead.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao listar propostas:", error);
    return NextResponse.json(
      { error: "Erro ao listar propostas" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// POST: Criar/gerar proposta para um lead
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = criarPropostaSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { leadId, ...overrideData } = validationResult.data;

    // Buscar o lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead não encontrado" },
        { status: 404 }
      );
    }

    // Montar inputs para o agente de precificação
    // Usar overrides se fornecidos, senão usar dados do lead
    const input: AnaliseInput = {
      scoreGBP: overrideData.scoreGBP ?? lead.scoreGBP ?? 50,
      scoreSite: overrideData.scoreSite ?? lead.scoreSite ?? 0,
      scoreRedes: overrideData.scoreRedes ?? lead.scoreRedes ?? 0,
      segmento: overrideData.segmento ?? lead.segmento ?? "outro",
      avaliacoes: overrideData.avaliacoes ?? 0,
      notaMedia: overrideData.notaMedia ?? 0,
      temSite: overrideData.temSite ?? !!lead.siteUrl,
      concorrentes: overrideData.concorrentes ?? 5,
    };

    // Gerar proposta usando o agente de precificação
    const proposta = gerarProposta(input);

    // Salvar no lead
    const leadAtualizado = await prisma.lead.update({
      where: { id: leadId },
      data: {
        proposta: proposta as unknown as object,
        valorSugerido: proposta.valorImplantacao,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        negocio: true,
        segmento: true,
        scoreGeral: true,
        valorSugerido: true,
        proposta: true,
      },
    });

    // Registrar interação
    await prisma.interacao.create({
      data: {
        leadId,
        tipo: "PROPOSTA_GERADA",
        descricao: `Proposta gerada no valor de R$ ${proposta.valorImplantacao.toLocaleString("pt-BR")}`,
        criadoPorId: user.id,
        criadoPor: user.name || user.email || "Sistema",
        metadata: {
          acao: "gerar_proposta",
          valorImplantacao: proposta.valorImplantacao,
          valorMensal: proposta.valorMensal,
          geradoPor: user.id,
          geradoEm: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      proposta: {
        id: leadAtualizado.id,
        leadId: leadAtualizado.id,
        nome: leadAtualizado.nome,
        email: leadAtualizado.email,
        negocio: leadAtualizado.negocio,
        segmento: leadAtualizado.segmento,
        scoreGeral: leadAtualizado.scoreGeral,
        valorSugerido: leadAtualizado.valorSugerido
          ? Number(leadAtualizado.valorSugerido)
          : null,
        proposta: leadAtualizado.proposta,
      },
    });
  } catch (error) {
    console.error("Erro ao criar proposta:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao criar proposta", details: errorMessage },
      { status: 500 }
    );
  }
}
