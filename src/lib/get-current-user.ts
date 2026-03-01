import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type UserRole = "admin" | "vendedor";

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  ativo: boolean;
}

/**
 * Obtém o usuário atual com suas informações do banco de dados
 * Retorna null se não estiver autenticado ou usuário não encontrado
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      ativo: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: (user.role as UserRole) || "vendedor",
    ativo: user.ativo ?? true,
  };
}

/**
 * Verifica se o usuário atual é admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

/**
 * Verifica se o usuário atual é vendedor
 */
export async function isVendedor(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "vendedor";
}
