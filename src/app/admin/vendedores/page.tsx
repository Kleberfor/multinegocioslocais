import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, UserCheck, UserX, Target, TrendingUp, Pencil } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/get-current-user";
import { ToggleVendedorStatus } from "@/components/admin/toggle-vendedor-status";
import { DeleteVendedorButton } from "@/components/admin/delete-vendedor-button";

async function getVendedores() {
  const vendedores = await prisma.user.findMany({
    where: { role: "vendedor" },
    select: {
      id: true,
      name: true,
      email: true,
      comissao: true,
      ativo: true,
      createdAt: true,
      _count: {
        select: {
          prospects: true,
          leads: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return vendedores;
}

async function getStats() {
  const [total, ativos, inativos] = await Promise.all([
    prisma.user.count({ where: { role: "vendedor" } }),
    prisma.user.count({ where: { role: "vendedor", ativo: true } }),
    prisma.user.count({ where: { role: "vendedor", ativo: false } }),
  ]);

  return { total, ativos, inativos };
}

export default async function VendedoresPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (user.role !== "admin") {
    redirect("/admin/dashboard");
  }

  const [vendedores, stats] = await Promise.all([getVendedores(), getStats()]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vendedores</h1>
          <p className="text-muted-foreground">
            Gerencie a equipe de vendas
          </p>
        </div>
        <Link href="/admin/vendedores/novo">
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            Novo Vendedor
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.ativos}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inativos</p>
                <p className="text-2xl font-bold text-red-600">{stats.inativos}</p>
              </div>
              <UserX className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Nome</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Comissão</th>
                  <th className="text-left p-4 font-medium">Prospects</th>
                  <th className="text-left p-4 font-medium">Leads</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Cadastro</th>
                  <th className="text-left p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {vendedores.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Nenhum vendedor cadastrado
                    </td>
                  </tr>
                ) : (
                  vendedores.map((vendedor) => (
                    <tr key={vendedor.id} className="border-b hover:bg-muted/30">
                      <td className="p-4">
                        <Link href={`/admin/vendedores/${vendedor.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-medium">
                              {vendedor.name?.charAt(0).toUpperCase() || "V"}
                            </span>
                          </div>
                          <span className="font-medium text-primary hover:underline">{vendedor.name || "Sem nome"}</span>
                        </Link>
                      </td>
                      <td className="p-4 text-muted-foreground">{vendedor.email}</td>
                      <td className="p-4">
                        {vendedor.comissao ? (
                          <span className="font-medium text-green-600">
                            {Number(vendedor.comissao)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-500" />
                          <span>{vendedor._count.prospects}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span>{vendedor._count.leads}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            vendedor.ativo
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {vendedor.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {new Date(vendedor.createdAt).toLocaleDateString("pt-BR", {
                          timeZone: "America/Sao_Paulo",
                        })}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/vendedores/${vendedor.id}/editar`}>
                            <Button variant="outline" size="sm">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </Link>
                          <ToggleVendedorStatus
                            vendedorId={vendedor.id}
                            ativo={vendedor.ativo}
                          />
                          <DeleteVendedorButton
                            vendedorId={vendedor.id}
                            vendedorName={vendedor.name || "Vendedor"}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
