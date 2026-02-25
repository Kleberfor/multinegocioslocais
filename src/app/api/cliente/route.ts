import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClienteSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados
    const validationResult = createClienteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Determinar planoId real (null para valores customizados, senão buscar no banco)
    let planoIdReal: string | null = null;

    // Para planos predefinidos, buscar no banco pelo nome
    if (data.planoId !== "plano-customizado") {
      const plano = await prisma.plano.findFirst({
        where: {
          OR: [
            { id: data.planoId },
            { nome: data.planoId === "plano-6-meses" ? "Plano 6 Meses" : "Plano 12 Meses" }
          ]
        }
      });
      planoIdReal = plano?.id || null;
    }

    // Criar cliente
    const cliente = await prisma.cliente.create({
      data: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        cpfCnpj: data.cpfCnpj.replace(/\D/g, ""), // Salvar apenas números
        negocio: data.negocio,
        endereco: JSON.parse(JSON.stringify(data.endereco)),
        planoId: planoIdReal,
      },
    });

    // Criar contrato associado
    const planoInfo = getPlanoInfo(data.planoId, data.valorCustomizado);

    const contrato = await prisma.contrato.create({
      data: {
        clienteId: cliente.id,
        valor: planoInfo.total,
        parcelas: planoInfo.parcelas,
        status: "PENDENTE",
      },
    });

    return NextResponse.json({
      id: cliente.id,
      contratoId: contrato.id,
      message: "Cliente criado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao processar dados", details: errorMessage },
      { status: 500 }
    );
  }
}

// Temporário - depois virá do banco
function getPlanoInfo(planoId: string, valorCustomizado?: number) {
  // Se for valor personalizado, usar o valor informado
  if (planoId === "plano-customizado" && valorCustomizado) {
    // Parcelas padrão para valor personalizado: 12 meses
    return { total: valorCustomizado, parcelas: 12 };
  }

  const planos: Record<string, { total: number; parcelas: number }> = {
    "plano-6-meses": { total: 6000, parcelas: 6 },
    "plano-12-meses": { total: 9000, parcelas: 12 },
  };

  return planos[planoId] || { total: 6000, parcelas: 6 };
}
