import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const VALID_STATUS = [
  "NOVO",
  "EM_CONTATO",
  "REUNIAO_AGENDADA",
  "PROPOSTA_ENVIADA",
  "NEGOCIANDO",
  "CONTRATO_ENVIADO",
  "ASSINADO",
  "PAGO",
  "PERDIDO",
  "INATIVO",
];

const STATUS_LABELS: Record<string, string> = {
  NOVO: "Novo",
  EM_CONTATO: "Em Contato",
  REUNIAO_AGENDADA: "Reunião Agendada",
  PROPOSTA_ENVIADA: "Proposta Enviada",
  NEGOCIANDO: "Negociando",
  CONTRATO_ENVIADO: "Contrato Enviado",
  ASSINADO: "Assinado",
  PAGO: "Pago",
  PERDIDO: "Perdido",
  INATIVO: "Inativo",
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUS.includes(status)) {
      return NextResponse.json(
        { error: "Status inválido" },
        { status: 400 }
      );
    }

    // Buscar prospect atual
    const prospect = await prisma.prospect.findUnique({
      where: { id },
      select: { id: true, statusPipeline: true, vendedorId: true },
    });

    if (!prospect) {
      return NextResponse.json(
        { error: "Prospect não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se vendedor tem permissão (só pode editar seus próprios prospects)
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || "" },
      select: { id: true, role: true },
    });

    if (user?.role === "vendedor" && prospect.vendedorId !== user.id) {
      return NextResponse.json(
        { error: "Sem permissão para editar este prospect" },
        { status: 403 }
      );
    }

    const oldStatus = prospect.statusPipeline || "NOVO";

    // Atualizar status
    const updatedProspect = await prisma.prospect.update({
      where: { id },
      data: { statusPipeline: status },
    });

    // Registrar mudança de status na timeline
    await prisma.interacao.create({
      data: {
        prospectId: id,
        tipo: "STATUS_CHANGE",
        descricao: `Status alterado de "${STATUS_LABELS[oldStatus] || oldStatus}" para "${STATUS_LABELS[status] || status}"`,
        criadoPorId: user?.id || "system",
        criadoPor: session.user?.name || session.user?.email || "Sistema",
      },
    });

    return NextResponse.json(updatedProspect);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status" },
      { status: 500 }
    );
  }
}
