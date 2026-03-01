import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/sidebar";

async function getUserRole(email: string): Promise<"admin" | "vendedor"> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  return (user?.role as "admin" | "vendedor") || "vendedor";
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Buscar role do usuário se autenticado
  let role: "admin" | "vendedor" = "vendedor";
  if (session?.user?.email) {
    role = await getUserRole(session.user.email);
  }

  return (
    <div className="min-h-screen bg-background">
      {session?.user ? (
        <div className="flex">
          <AdminSidebar user={session.user} role={role} />
          <main className="flex-1 p-8">{children}</main>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
