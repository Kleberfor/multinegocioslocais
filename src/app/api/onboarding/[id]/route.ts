import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clienteId } = await params;

    // Buscar cliente
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        onboarding: true,
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Se não tem onboarding, criar um
    let onboarding = cliente.onboarding;

    if (!onboarding) {
      onboarding = await prisma.onboardingCliente.create({
        data: {
          clienteId: cliente.id,
          etapaAtual: 1,
        },
      });
    }

    return NextResponse.json({
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        negocio: cliente.negocio,
      },
      onboarding,
    });
  } catch (error) {
    console.error("Erro ao buscar onboarding:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados do onboarding" },
      { status: 500 }
    );
  }
}
