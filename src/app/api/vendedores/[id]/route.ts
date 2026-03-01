import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET - Buscar vendedor específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;

    const vendedor = await prisma.user.findUnique({
      where: { id, role: "vendedor" },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        rg: true,
        comissao: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            prospectsAtribuidos: true,
            leadsAtribuidos: true,
          },
        },
      },
    });

    if (!vendedor) {
      return NextResponse.json(
        { error: "Vendedor não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(vendedor);
  } catch (error) {
    console.error("Erro ao buscar vendedor:", error);
    return NextResponse.json(
      { error: "Erro ao buscar vendedor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar vendedor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, password, ativo, cpf, rg, comissao } = body;

    // Verificar se vendedor existe
    const vendedor = await prisma.user.findUnique({
      where: { id, role: "vendedor" },
    });

    if (!vendedor) {
      return NextResponse.json(
        { error: "Vendedor não encontrado" },
        { status: 404 }
      );
    }

    // Validações detalhadas
    const errors: string[] = [];

    if (name !== undefined && name.trim().length < 3) {
      errors.push("Nome deve ter pelo menos 3 caracteres");
    }

    if (email !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Email inválido");
      }
    }

    if (cpf !== undefined) {
      const cpfLimpo = cpf.replace(/\D/g, "");
      if (cpfLimpo.length !== 11) {
        errors.push("CPF deve ter 11 dígitos");
      }
    }

    if (password !== undefined && password.length < 6) {
      errors.push("Senha deve ter pelo menos 6 caracteres");
    }

    if (comissao !== null && comissao !== undefined) {
      const comissaoNum = Number(comissao);
      if (isNaN(comissaoNum) || comissaoNum < 0 || comissaoNum > 100) {
        errors.push("Comissão deve ser um valor entre 0 e 100");
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join(". ") },
        { status: 400 }
      );
    }

    // Verificar se email já existe em outro usuário
    if (email && email !== vendedor.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Este email já está cadastrado para outro usuário" },
          { status: 400 }
        );
      }
    }

    // Verificar se CPF já existe em outro usuário
    if (cpf) {
      const cpfLimpo = cpf.replace(/\D/g, "");
      if (cpfLimpo !== vendedor.cpf) {
        const existingCpf = await prisma.user.findFirst({
          where: { cpf: cpfLimpo, id: { not: id } },
        });

        if (existingCpf) {
          return NextResponse.json(
            { error: "Este CPF já está cadastrado para outro usuário" },
            { status: 400 }
          );
        }
      }
    }

    // Montar dados de atualização
    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      ativo?: boolean;
      cpf?: string;
      rg?: string | null;
      comissao?: number | null;
    } = {};

    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (typeof ativo === "boolean") updateData.ativo = ativo;
    if (cpf) updateData.cpf = cpf.replace(/\D/g, "");
    if (rg !== undefined) updateData.rg = rg?.trim() || null;
    if (comissao !== undefined) updateData.comissao = comissao ? Number(comissao) : null;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedVendedor = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        rg: true,
        comissao: true,
        ativo: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedVendedor);
  } catch (error) {
    console.error("Erro ao atualizar vendedor:", error);

    // Tratar erros específicos do Prisma
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "Email ou CPF já cadastrado no sistema" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Erro interno ao atualizar vendedor. Tente novamente." },
      { status: 500 }
    );
  }
}

// DELETE - Remover vendedor (soft delete - desativa)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;

    const vendedor = await prisma.user.findUnique({
      where: { id, role: "vendedor" },
    });

    if (!vendedor) {
      return NextResponse.json(
        { error: "Vendedor não encontrado" },
        { status: 404 }
      );
    }

    // Soft delete - apenas desativa
    await prisma.user.update({
      where: { id },
      data: { ativo: false },
    });

    return NextResponse.json({ message: "Vendedor desativado com sucesso" });
  } catch (error) {
    console.error("Erro ao desativar vendedor:", error);
    return NextResponse.json(
      { error: "Erro ao desativar vendedor" },
      { status: 500 }
    );
  }
}
