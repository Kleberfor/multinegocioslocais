import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { enviarReenvioProposta } from "@/lib/email";
import { z } from "zod";

const resendPropostaSchema = z.object({
  tipo: z.enum(["lead", "prospect"]),
  id: z.string().min(1, "ID é obrigatório"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = resendPropostaSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { tipo, id } = validationResult.data;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://multinegocioslocais.vercel.app";

    let email: string;
    let nome: string;
    let negocio: string;
    let propostaUrl: string;
    let valorEstimado: number | undefined;

    if (tipo === "lead") {
      const lead = await prisma.lead.findUnique({
        where: { id },
      });

      if (!lead) {
        return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
      }

      email = lead.email;
      nome = lead.nome;
      negocio = lead.negocio;
      propostaUrl = `${baseUrl}/proposta/${id}`;
      valorEstimado = lead.valorSugerido ? Number(lead.valorSugerido) : undefined;

      // Registrar interação
      await prisma.interacao.create({
        data: {
          leadId: id,
          tipo: "EMAIL",
          descricao: "Proposta reenviada por email",
          criadoPorId: user.id,
          criadoPor: user.name || user.email || "Sistema",
          metadata: {
            acao: "reenvio_proposta",
            enviadoPor: user.id,
            enviadoEm: new Date().toISOString(),
          },
        },
      });
    } else {
      const prospect = await prisma.prospect.findUnique({
        where: { id },
      });

      if (!prospect) {
        return NextResponse.json({ error: "Prospect não encontrado" }, { status: 404 });
      }

      if (!prospect.email) {
        return NextResponse.json({ error: "Prospect não possui email cadastrado" }, { status: 400 });
      }

      email = prospect.email;
      nome = prospect.nome || "Cliente";
      negocio = prospect.negocio || "Seu negócio";
      propostaUrl = `${baseUrl}/proposta/prospect/${id}`;

      // Extrair valor estimado da análise ou do prospect
      if (prospect.valorEstimado) {
        valorEstimado = Number(prospect.valorEstimado);
      } else if (prospect.analise && typeof prospect.analise === "object") {
        const analise = prospect.analise as { valorEstimado?: number };
        valorEstimado = analise.valorEstimado;
      }

      // Registrar interação
      await prisma.interacao.create({
        data: {
          prospectId: id,
          tipo: "EMAIL",
          descricao: "Proposta reenviada por email",
          criadoPorId: user.id,
          criadoPor: user.name || user.email || "Sistema",
          metadata: {
            acao: "reenvio_proposta",
            enviadoPor: user.id,
            enviadoEm: new Date().toISOString(),
          },
        },
      });
    }

    // Enviar email
    const resultado = await enviarReenvioProposta({
      para: email,
      nome,
      negocio,
      propostaUrl,
      valorEstimado,
    });

    if (!resultado.success) {
      // Verificar se é erro de configuração
      if (resultado.error === "Email não configurado") {
        return NextResponse.json(
          {
            error: "Serviço de email não configurado",
            details: "A variável RESEND_API_KEY não está definida. Configure no arquivo .env para habilitar o envio de emails."
          },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: "Erro ao enviar email", details: resultado.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Proposta reenviada com sucesso",
      emailId: resultado.id,
    });
  } catch (error) {
    console.error("Erro ao reenviar proposta:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao reenviar proposta", details: errorMessage },
      { status: 500 }
    );
  }
}
