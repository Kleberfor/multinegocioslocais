import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Permitir acesso à página de login sem autenticação
  // O middleware vai lidar com redirecionamentos

  return (
    <div className="min-h-screen bg-background">
      {session?.user ? (
        <div className="flex">
          <AdminSidebar user={session.user} />
          <main className="flex-1 p-8">{children}</main>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
