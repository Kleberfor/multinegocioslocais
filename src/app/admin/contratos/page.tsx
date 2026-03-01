import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, FileText, DollarSign, Users, Clock } from "lucide-react";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ContratosFilters } from "@/components/admin/contratos-filters";
import { getCurrentUser } from "@/lib/get-current-user";

type ContratoWithCliente = {
  id: string;
  valor: Prisma.Decimal;
  parcelas: number;
  status: string;
  createdAt: Date;
  cliente: {
    id: string;
    nome: string;
    negocio: string;
  };
};

interface SearchParams {
  search?: string;
  status?: string;
}

async function getContratos(filters: SearchParams): Promise<ContratoWithCliente[]> {
  const where: Prisma.ContratoWhereInput = {};

  // Filtro de busca por texto
  if (filters.search) {
    where.OR = [
      { id: { contains: filters.search, mode: "insensitive" } },
      { cliente: { nome: { contains: filters.search, mode: "insensitive" } } },
      { cliente: { negocio: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  // Filtro de status
  if (filters.status && filters.status !== "all") {
    where.status = filters.status;
  }

  const contratos = await prisma.contrato.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      cliente: {
        select: {
          id: true,
          nome: true,
          negocio: true,
        },
      },
    },
  });
  return contratos as ContratoWithCliente[];
}

async function getStats() {
  const [total, pendentes, assinados, pagos, valorTotal] = await Promise.all([
    prisma.contrato.count(),
    prisma.contrato.count({ where: { status: "PENDENTE" } }),
    prisma.contrato.count({ where: { status: "ASSINADO" } }),
    prisma.contrato.count({ where: { status: "PAGO" } }),
    prisma.contrato.aggregate({
      where: { status: "PAGO" },
      _sum: { valor: true },
    }),
  ]);

  return {
    total,
    pendentes,
    assinados,
    pagos,
    valorTotal: Number(valorTotal._sum.valor || 0),
  };
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ContratosPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const [contratos, stats] = await Promise.all([
    getContratos(params),
    getStats(),
  ]);

  const hasFilters = params.search || params.status;

  const statusColors: Record<string, string> = {
    PENDENTE: "bg-yellow-100 text-yellow-700",
    ASSINADO: "bg-blue-100 text-blue-700",
    PAGO: "bg-green-100 text-green-700",
    CANCELADO: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-muted-foreground">
            {contratos.length} contratos {hasFilters ? "encontrados" : ""}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pagos</p>
                <p className="text-2xl font-bold text-green-600">{stats.pagos}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {stats.valorTotal.toLocaleString("pt-BR")}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <ContratosFilters />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">ID</th>
                  <th className="text-left p-4 font-medium">Cliente</th>
                  <th className="text-left p-4 font-medium">Negócio</th>
                  <th className="text-left p-4 font-medium">Valor</th>
                  <th className="text-left p-4 font-medium">Parcelas</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Data</th>
                  <th className="text-left p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {contratos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      {hasFilters
                        ? "Nenhum contrato encontrado com os filtros aplicados."
                        : "Nenhum contrato encontrado"}
                    </td>
                  </tr>
                ) : (
                  contratos.map((contrato) => (
                    <tr key={contrato.id} className="border-b hover:bg-muted/30">
                      <td className="p-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {contrato.id.substring(0, 8)}
                        </code>
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/admin/clientes/${contrato.cliente.id}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {contrato.cliente.nome}
                        </Link>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {contrato.cliente.negocio}
                      </td>
                      <td className="p-4 font-medium text-green-600">
                        R$ {Number(contrato.valor).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-4">
                        {contrato.parcelas}x de R${" "}
                        {(Number(contrato.valor) / contrato.parcelas).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[contrato.status] || statusColors.PENDENTE
                          }`}
                        >
                          {contrato.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {new Date(contrato.createdAt).toLocaleDateString("pt-BR", {
                          timeZone: "America/Sao_Paulo",
                        })}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/contratos/${contrato.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                          </Link>
                          <Link
                            href={`/api/contratos/${contrato.id}/pdf`}
                            target="_blank"
                          >
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </Link>
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
