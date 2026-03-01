import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarEmailScore } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { prospectId, email, nome, score, publicUrl } = body;

    if (!prospectId || !email || !nome || score === undefined || !publicUrl) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    // Buscar usuário atual
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || "" },
      select: { id: true, name: true, email: true },
    });

    // Enviar email
    const result = await enviarEmailScore({
      para: email,
      nome,
      score,
      publicUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Erro ao enviar email" },
        { status: 500 }
      );
    }

    // Registrar interação de envio de score
    await prisma.interacao.create({
      data: {
        prospectId,
        tipo: "EMAIL",
        descricao: `Score de presença digital (${score}/100) enviado por email para ${email}`,
        criadoPorId: user?.id || "system",
        criadoPor: user?.name || user?.email || "Sistema",
        metadata: {
          tipo: "ENVIO_SCORE",
          email,
          score,
          publicUrl,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email enviado com sucesso",
      emailId: result.id,
    });
  } catch (error) {
    console.error("Erro ao enviar email de score:", error);
    return NextResponse.json(
      { error: "Erro ao enviar email" },
      { status: 500 }
    );
  }
}
