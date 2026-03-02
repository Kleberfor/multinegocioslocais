import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { z } from "zod";

const updateClienteSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  cpfCnpj: z.string().min(11, "CPF/CNPJ inválido"),
  negocio: z.string().min(2, "Nome do negócio deve ter pelo menos 2 caracteres"),
  endereco: z.object({
    rua: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    cep: z.string().optional(),
  }).optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cliente = await prisma.cliente.findUnique({
      where: { id },
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

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cliente" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const validationResult = updateClienteSchema.safeParse(body);

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

    // Verificar se cliente existe e se tem prospect associado
    const clienteExistente = await prisma.cliente.findUnique({
      where: { id },
      include: { prospect: true },
    });

    if (!clienteExistente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Atualizar cliente
    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        cpfCnpj: data.cpfCnpj.replace(/\D/g, ""),
        negocio: data.negocio,
        endereco: data.endereco ? JSON.parse(JSON.stringify(data.endereco)) : undefined,
      },
    });

    // Sincronizar com Prospect se existir (link bidirecional)
    if (clienteExistente.prospectId) {
      await prisma.prospect.update({
        where: { id: clienteExistente.prospectId },
        data: {
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          negocio: data.negocio,
        },
      }).catch((err) => {
        console.error("Erro ao sincronizar prospect:", err);
      });
    }

    return NextResponse.json({
      id: cliente.id,
      message: "Cliente atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao atualizar cliente", details: errorMessage },
      { status: 500 }
    );
  }
}
