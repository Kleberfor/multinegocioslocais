import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Search,
  FileText,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";

type RecentProspect = {
  id: string;
  nome: string;
  score: number;
};

type RecentCliente = {
  id: string;
  nome: string;
  negocio: string;
  contratos: { status: string }[];
};

type Stats = {
  totalProspects: number;
  totalClientes: number;
  totalContratos: number;
  contratosAssinados: number;
  contratosPagos: number;
  totalFaturamento: number;
  recentProspects: RecentProspect[];
  recentClientes: RecentCliente[];
};

async function getStats(): Promise<Stats> {
  const [
    totalProspects,
    totalClientes,
    totalContratos,
    contratosAssinados,
    contratosPagos,
    totalFaturamento,
    recentProspects,
    recentClientes,
  ] = await Promise.all([
    prisma.prospect.count(),
    prisma.cliente.count(),
    prisma.contrato.count(),
    prisma.contrato.count({ where: { status: "ASSINADO" } }),
    prisma.contrato.count({ where: { status: "PAGO" } }),
    prisma.contrato.aggregate({
      where: { status: "PAGO" },
      _sum: { valor: true },
    }),
    prisma.prospect.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.cliente.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { contratos: true },
    }),
  ]);

  return {
    totalProspects,
    totalClientes,
    totalContratos,
    contratosAssinados,
    contratosPagos,
    totalFaturamento: Number(totalFaturamento._sum.valor || 0),
    recentProspects: recentProspects as RecentProspect[],
    recentClientes: recentClientes as RecentCliente[],
  };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  const stats = await getStats();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prospects
            </CardTitle>
            <Search className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalProspects}</p>
            <p className="text-xs text-muted-foreground">
              Negócios analisados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalClientes}</p>
            <p className="text-xs text-muted-foreground">
              Cadastros completos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contratos
            </CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalContratos}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center text-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                {stats.contratosPagos} pagos
              </span>
              <span className="flex items-center text-yellow-600">
                <Clock className="w-3 h-3 mr-1" />
                {stats.contratosAssinados} pendentes
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              R$ {stats.totalFaturamento.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-muted-foreground">
              Total recebido
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Prospects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prospects Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentProspects.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhum prospect ainda
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentProspects.map((prospect) => (
                  <div
                    key={prospect.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{prospect.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Score: {prospect.score}/100
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        prospect.score >= 70
                          ? "bg-green-100 text-green-700"
                          : prospect.score >= 40
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {prospect.score >= 70
                        ? "Bom"
                        : prospect.score >= 40
                        ? "Regular"
                        : "Crítico"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clientes Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentClientes.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhum cliente ainda
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentClientes.map((cliente) => (
                  <div
                    key={cliente.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{cliente.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {cliente.negocio}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        cliente.contratos[0]?.status === "PAGO"
                          ? "bg-green-100 text-green-700"
                          : cliente.contratos[0]?.status === "ASSINADO"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {cliente.contratos[0]?.status || "Pendente"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
