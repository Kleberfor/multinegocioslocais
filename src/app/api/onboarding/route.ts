import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clienteId, ...dadosOnboarding } = body;

    if (!clienteId) {
      return NextResponse.json(
        { error: "clienteId é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar ou criar onboarding
    let onboarding = await prisma.onboardingCliente.findUnique({
      where: { clienteId },
    });

    const agora = new Date();
    const dataInicio = onboarding?.iniciadoEm || agora;
    const tempoDecorrido = Math.floor(
      (agora.getTime() - dataInicio.getTime()) / 1000 / 60
    ); // em minutos

    const dados: any = {
      ...dadosOnboarding,
    };

    // Se está completando, adicionar dados de conclusão
    if (dadosOnboarding.completado) {
      dados.completadoEm = agora;
      dados.tempoTotalMinutos = tempoDecorrido;
    }

    // Converter arrays/objetos para JSON se necessário
    if (dadosOnboarding.diasFuncionamento) {
      dados.diasFuncionamento = dadosOnboarding.diasFuncionamento;
    }
    if (dadosOnboarding.servicos) {
      dados.servicos = dadosOnboarding.servicos;
    }

    if (onboarding) {
      // Atualizar existente
      onboarding = await prisma.onboardingCliente.update({
        where: { clienteId },
        data: dados,
      });
    } else {
      // Criar novo
      onboarding = await prisma.onboardingCliente.create({
        data: {
          clienteId,
          ...dados,
        },
      });
    }

    return NextResponse.json(onboarding);
  } catch (error) {
    console.error("Erro ao salvar onboarding:", error);
    return NextResponse.json(
      { error: "Erro ao salvar progresso do onboarding" },
      { status: 500 }
    );
  }
}
