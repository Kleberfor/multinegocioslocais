import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listarProximosFollowUps, obterEstatisticasFollowUp } from "@/lib/followup";

/**
 * GET /api/followup
 * Lista follow-ups pendentes e estatísticas
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");

    if (leadId) {
      // Listar follow-ups de um lead específico
      const followUps = await prisma.followUp.findMany({
        where: { leadId },
        orderBy: { agendadoPara: "asc" },
      });

      return NextResponse.json({ followUps });
    }

    // Listar próximos follow-ups e estatísticas
    const [proximos, estatisticas] = await Promise.all([
      listarProximosFollowUps(20),
      obterEstatisticasFollowUp(),
    ]);

    // Buscar dados dos leads para enriquecer
    const leadIds = [...new Set(proximos.map((f) => f.leadId))];
    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds } },
      select: {
        id: true,
        nome: true,
        negocio: true,
        email: true,
        telefone: true,
      },
    });

    const leadsMap = new Map(leads.map((l) => [l.id, l]));

    const followUpsComLead = proximos.map((f) => ({
      ...f,
      lead: leadsMap.get(f.leadId),
    }));

    return NextResponse.json({
      followUps: followUpsComLead,
      estatisticas,
    });
  } catch (error) {
    console.error("[API] Erro ao listar follow-ups:", error);
    return NextResponse.json(
      { error: "Erro ao listar follow-ups" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/followup
 * Atualiza um follow-up (marcar como realizado, cancelar, etc)
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, resultado, observacoes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID do follow-up é obrigatório" },
        { status: 400 }
      );
    }

    const updateData: {
      status?: string;
      executadoEm?: Date;
      resultado?: string;
      observacoes?: string;
    } = {};

    if (status) {
      updateData.status = status;
      if (status === "REALIZADO" || status === "CANCELADO") {
        updateData.executadoEm = new Date();
      }
    }

    if (resultado) {
      updateData.resultado = resultado;
    }

    if (observacoes !== undefined) {
      updateData.observacoes = observacoes;
    }

    const followUp = await prisma.followUp.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, followUp });
  } catch (error) {
    console.error("[API] Erro ao atualizar follow-up:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar follow-up" },
      { status: 500 }
    );
  }
}
