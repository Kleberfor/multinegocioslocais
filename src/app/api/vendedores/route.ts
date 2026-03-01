import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET - Listar vendedores
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é admin
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const vendedores = await prisma.user.findMany({
      where: { role: "vendedor" },
      select: {
        id: true,
        name: true,
        email: true,
        ativo: true,
        createdAt: true,
        _count: {
          select: {
            prospectsAtribuidos: true,
            leadsAtribuidos: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vendedores);
  } catch (error) {
    console.error("Erro ao listar vendedores:", error);
    return NextResponse.json(
      { error: "Erro ao listar vendedores" },
      { status: 500 }
    );
  }
}

// POST - Criar vendedor
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é admin
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendedor = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "vendedor",
        ativo: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        ativo: true,
        createdAt: true,
      },
    });

    return NextResponse.json(vendedor, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar vendedor:", error);
    return NextResponse.json(
      { error: "Erro ao criar vendedor" },
      { status: 500 }
    );
  }
}
