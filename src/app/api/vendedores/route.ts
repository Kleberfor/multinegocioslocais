import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Função para validar CPF com algoritmo oficial
function validarCPF(cpf: string): boolean {
  const cpfLimpo = cpf.replace(/\D/g, "");

  // Deve ter 11 dígitos
  if (cpfLimpo.length !== 11) return false;

  // Não pode ser sequência de números iguais
  if (/^(\d)\1+$/.test(cpfLimpo)) return false;

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(9))) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(10))) return false;

  return true;
}

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
      where: {
        OR: [
          { role: "vendedor" },
          { role: "admin" },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        rg: true,
        comissao: true,
        ativo: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            prospects: true,
            leads: true,
          },
        },
      },
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
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
    const { name, email, password, cpf, rg, comissao } = body;

    // Validações detalhadas
    const errors: string[] = [];

    if (!name || name.trim().length < 3) {
      errors.push("Nome deve ter pelo menos 3 caracteres");
    }

    if (!email) {
      errors.push("Email é obrigatório");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Email inválido");
    }

    if (!cpf) {
      errors.push("CPF é obrigatório");
    } else if (!validarCPF(cpf)) {
      errors.push("CPF inválido");
    }

    if (!password) {
      errors.push("Senha é obrigatória");
    } else if (password.length < 6) {
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

    // Verificar se email já existe
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Este email já está cadastrado para outro usuário" },
        { status: 400 }
      );
    }

    // Verificar se CPF já existe
    const cpfLimpo = cpf.replace(/\D/g, "");
    const existingCpf = await prisma.user.findFirst({
      where: { cpf: cpfLimpo },
    });

    if (existingCpf) {
      return NextResponse.json(
        { error: "Este CPF já está cadastrado para outro usuário" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendedor = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        cpf: cpfLimpo,
        rg: rg?.trim() || null,
        comissao: comissao ? Number(comissao) : null,
        role: "vendedor",
        ativo: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        rg: true,
        comissao: true,
        ativo: true,
        createdAt: true,
      },
    });

    return NextResponse.json(vendedor, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar vendedor:", error);

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
      { error: "Erro interno ao criar vendedor. Tente novamente." },
      { status: 500 }
    );
  }
}
