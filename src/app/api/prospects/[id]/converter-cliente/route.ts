import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface ConversaoBody {
  // Dados do cliente
  cpfCnpj: string;
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
  // Dados do contrato
  valorContrato: number;
  parcelas: number;
  valorGestaoMensal?: number;
  incluiGestaoMensal?: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id: prospectId } = await params;
    const body: ConversaoBody = await request.json();

    // Validar dados obrigatórios
    if (!body.cpfCnpj || !body.valorContrato || !body.parcelas) {
      return NextResponse.json(
        { error: "CPF/CNPJ, valor do contrato e parcelas são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar prospect
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId },
    });

    if (!prospect) {
      return NextResponse.json(
        { error: "Prospect não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se prospect já foi convertido
    if (prospect.statusPipeline === "PAGO" || prospect.statusPipeline === "ASSINADO") {
      return NextResponse.json(
        { error: "Prospect já foi convertido" },
        { status: 400 }
      );
    }

    // Verificar permissão: vendedor só pode converter seus próprios prospects
    const user = session.user as { id: string; role: string };
    if (user.role === "vendedor" && prospect.vendedorId !== user.id) {
      return NextResponse.json(
        { error: "Sem permissão para converter este prospect" },
        { status: 403 }
      );
    }

    // Criar cliente
    console.log("Criando cliente com dados:", {
      nome: prospect.nome,
      email: prospect.email,
      telefone: prospect.telefone,
      cpfCnpj: body.cpfCnpj,
      negocio: prospect.negocio,
      vendedorId: prospect.vendedorId,
    });

    const cliente = await prisma.cliente.create({
      data: {
        nome: prospect.nome,
        email: prospect.email || "",
        telefone: prospect.telefone || "",
        cpfCnpj: body.cpfCnpj.replace(/\D/g, ""),
        negocio: prospect.negocio || prospect.nome,
        endereco: body.endereco ? JSON.parse(JSON.stringify(body.endereco)) : null,
        vendedorId: prospect.vendedorId, // Herda o vendedor do prospect
      },
    });
    console.log("Cliente criado:", cliente.id);

    // Criar contrato
    const incluiGestaoMensal = body.incluiGestaoMensal || (body.valorGestaoMensal && body.valorGestaoMensal > 0);
    console.log("Criando contrato com dados:", {
      clienteId: cliente.id,
      valor: body.valorContrato,
      parcelas: body.parcelas,
      valorMensal: incluiGestaoMensal ? body.valorGestaoMensal : null,
      incluiGestaoMensal: incluiGestaoMensal || false,
    });

    const contrato = await prisma.contrato.create({
      data: {
        clienteId: cliente.id,
        valor: body.valorContrato,
        parcelas: body.parcelas,
        valorMensal: incluiGestaoMensal ? body.valorGestaoMensal : null,
        incluiGestaoMensal: incluiGestaoMensal || false,
        status: "PENDENTE",
      },
    });
    console.log("Contrato criado:", contrato.id);

    // Atualizar status do prospect
    await prisma.prospect.update({
      where: { id: prospectId },
      data: {
        statusPipeline: "CONTRATO_ENVIADO",
      },
    });

    // Registrar interação
    await prisma.interacao.create({
      data: {
        prospectId,
        tipo: "NOTA",
        descricao: `Prospect convertido em cliente. Contrato #${contrato.id.substring(0, 8).toUpperCase()} criado no valor de R$ ${body.valorContrato.toLocaleString("pt-BR")}`,
        criadoPorId: user.id,
        criadoPor: session.user.name || session.user.email || "Sistema",
      },
    });

    return NextResponse.json({
      success: true,
      clienteId: cliente.id,
      contratoId: contrato.id,
      message: "Prospect convertido em cliente com sucesso",
    });
  } catch (error) {
    console.error("Erro ao converter prospect:", error);
    // Log detalhado do erro
    let errorDetails = "Erro desconhecido";
    let errorStack = "";
    let errorCode = "";

    if (error instanceof Error) {
      console.error("Erro stack:", error.stack);
      console.error("Erro nome:", error.name);
      errorDetails = error.message;
      errorStack = error.stack || "";
      // Prisma error code
      if ("code" in error) {
        errorCode = (error as { code: string }).code;
      }
    }

    return NextResponse.json(
      {
        error: "Erro ao converter prospect",
        details: errorDetails,
        code: errorCode,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 }
    );
  }
}
