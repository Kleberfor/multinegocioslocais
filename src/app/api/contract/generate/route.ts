import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateContractHTML, ContractData } from "@/lib/contract";

// Planos (temporário - depois virá do banco)
const PLANOS: Record<string, { implantacao: number; mensalidade: number; parcelas: number }> = {
  "plano-6-meses": { implantacao: 3000, mensalidade: 500, parcelas: 6 },
  "plano-12-meses": { implantacao: 3000, mensalidade: 500, parcelas: 12 },
  "plano-customizado": { implantacao: 0, mensalidade: 0, parcelas: 1 }, // Plano customizado para conversão de leads
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clienteId } = body;

    if (!clienteId) {
      return NextResponse.json(
        { error: "ID do cliente é obrigatório" },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        contratos: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    const contrato = cliente.contratos[0];
    if (!contrato) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 }
      );
    }

    const endereco = cliente.endereco as {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      estado: string;
      cep: string;
    };

    const enderecoCompleto = endereco ? `${endereco.logradouro || ""}, ${endereco.numero || ""}${
      endereco.complemento ? `, ${endereco.complemento}` : ""
    } - ${endereco.bairro || ""}, ${endereco.cidade || ""}/${endereco.estado || ""} - CEP: ${endereco.cep || ""}` : "Endereço não informado";

    // Data de vencimento: 30 dias após hoje
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 30);

    // SEMPRE usar valores do contrato - são os valores confirmados pelo cliente
    const valorTotal = Number(contrato.valor) || 0;
    const valorImplantacao = valorTotal;
    const valorMensalidade = Number(contrato.valorMensal) || 0;
    const parcelas = contrato.parcelas || 1;

    const contractData: ContractData = {
      clienteNome: cliente.nome || "Nome não informado",
      clienteCpfCnpj: formatCpfCnpj(cliente.cpfCnpj || ""),
      clienteEndereco: enderecoCompleto,
      clienteEmail: cliente.email || "Email não informado",
      clienteTelefone: formatPhone(cliente.telefone || ""),
      negocioNome: cliente.negocio || "Negócio não informado",
      valorImplantacao,
      valorMensalidade,
      parcelas,
      valorTotal,
      incluiGestaoMensal: contrato.incluiGestaoMensal || false,
      dataContrato: new Date().toISOString(),
      dataVencimentoPrimeiraParcela: dataVencimento.toISOString(),
      contratoId: contrato.id.substring(0, 8).toUpperCase(),
    };

    const html = generateContractHTML(contractData);

    return NextResponse.json({ html, contratoId: contrato.id });
  } catch (error) {
    console.error("Erro ao gerar contrato:", error);
    return NextResponse.json(
      { error: "Erro ao gerar contrato" },
      { status: 500 }
    );
  }
}

function formatCpfCnpj(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else if (clean.length === 14) {
    return clean.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }
  return value;
}

function formatPhone(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return value;
}
