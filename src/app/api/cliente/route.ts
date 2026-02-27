import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClienteSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extrair campos adicionais antes da validação
    const {
      leadId,
      valorTotal,
      parcelas: parcelasInput,
      valorGestaoMensal,
      fromProposta,
      ...restBody
    } = body;

    // Validar dados básicos do cliente
    const validationResult = createClienteSchema.safeParse(restBody);

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

    // Determinar valores do contrato
    let contratoValor: number;
    let contratoParcelas: number;
    const contratoValorMensal: number = valorGestaoMensal || 0;

    if (fromProposta && valorTotal > 0) {
      // Fluxo da proposta: usar valores passados
      contratoValor = valorTotal;
      contratoParcelas = parcelasInput || 1;
    } else if (data.planoId === "plano-customizado" && valorTotal > 0) {
      // Admin: valor customizado
      contratoValor = valorTotal;
      contratoParcelas = parcelasInput || 12;
    } else {
      // Fallback para planos antigos (não deveria acontecer)
      const planoInfo = getPlanoInfo(data.planoId);
      contratoValor = planoInfo.total;
      contratoParcelas = planoInfo.parcelas;
    }

    // Criar cliente
    const cliente = await prisma.cliente.create({
      data: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        cpfCnpj: data.cpfCnpj.replace(/\D/g, ""),
        negocio: data.negocio,
        endereco: JSON.parse(JSON.stringify(data.endereco)),
        planoId: null, // Sempre null pois usamos valores dinâmicos
        leadId: leadId || null,
      },
    });

    // Criar contrato associado
    const contrato = await prisma.contrato.create({
      data: {
        clienteId: cliente.id,
        valor: contratoValor,
        parcelas: contratoParcelas,
        valorMensal: contratoValorMensal,
        status: "PENDENTE",
      },
    });

    // Atualizar lead se existir
    if (leadId) {
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          status: "CONVERTIDO",
          clienteId: cliente.id,
        },
      }).catch(() => {
        // Ignorar se lead não existir ou não puder atualizar
      });
    }

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

// Fallback para planos antigos (compatibilidade)
function getPlanoInfo(planoId: string) {
  const planos: Record<string, { total: number; parcelas: number }> = {
    "plano-6-meses": { total: 3000, parcelas: 6 },
    "plano-12-meses": { total: 4500, parcelas: 12 },
  };

  return planos[planoId] || { total: 3000, parcelas: 6 };
}
