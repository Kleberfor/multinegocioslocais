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

    // Verificar se email já existe em outro usuário
    if (email && email !== vendedor.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Este email já está cadastrado" },
          { status: 400 }
        );
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

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (typeof ativo === "boolean") updateData.ativo = ativo;
    if (cpf) updateData.cpf = cpf;
    if (rg !== undefined) updateData.rg = rg || null;
    if (comissao !== undefined) updateData.comissao = comissao || null;
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
    return NextResponse.json(
      { error: "Erro ao atualizar vendedor" },
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
