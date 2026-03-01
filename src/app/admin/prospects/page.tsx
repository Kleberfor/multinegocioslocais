import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ExternalLink,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Phone,
  Eye,
} from "lucide-react";
import { DeleteProspectButton } from "@/components/admin/delete-prospect-button";
import { ProspectsFilters } from "@/components/admin/prospects-filters";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/get-current-user";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NOVO: { label: "Novo", color: "bg-blue-100 text-blue-700" },
  EM_CONTATO: { label: "Em Contato", color: "bg-yellow-100 text-yellow-700" },
  REUNIAO_AGENDADA: { label: "Reunião Agendada", color: "bg-purple-100 text-purple-700" },
  PROPOSTA_ENVIADA: { label: "Proposta Enviada", color: "bg-orange-100 text-orange-700" },
  NEGOCIANDO: { label: "Negociando", color: "bg-amber-100 text-amber-700" },
  CONTRATO_ENVIADO: { label: "Contrato Enviado", color: "bg-cyan-100 text-cyan-700" },
  ASSINADO: { label: "Assinado", color: "bg-green-100 text-green-700" },
  PAGO: { label: "Pago", color: "bg-emerald-100 text-emerald-700" },
  PERDIDO: { label: "Perdido", color: "bg-red-100 text-red-700" },
  INATIVO: { label: "Inativo", color: "bg-gray-100 text-gray-700" },
};

interface SearchParams {
  search?: string;
  status?: string;
  score?: string;
  vendedorId?: string;
}

async function getProspects(filters: SearchParams, userId: string, isVendedor: boolean) {
  const where: Prisma.ProspectWhereInput = {};

  // Se for vendedor, filtra automaticamente por seus próprios prospects
  if (isVendedor) {
    where.vendedorId = userId;
  }

  // Filtro de busca por texto
  if (filters.search) {
    where.OR = [
      { nome: { contains: filters.search, mode: "insensitive" } },
      { negocio: { contains: filters.search, mode: "insensitive" } },
      { telefone: { contains: filters.search } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  // Filtro de status
  if (filters.status && filters.status !== "all") {
    where.statusPipeline = filters.status;
  }

  // Filtro de score
  if (filters.score && filters.score !== "all") {
    switch (filters.score) {
      case "high":
        where.score = { gte: 70 };
        break;
      case "medium":
        where.score = { gte: 40, lt: 70 };
        break;
      case "low":
        where.score = { gte: 0, lt: 40 };
        break;
      case "none":
        where.score = null;
        break;
    }
  }

  // Filtro de vendedor (apenas para admin)
  if (!isVendedor && filters.vendedorId && filters.vendedorId !== "all") {
    where.vendedorId = filters.vendedorId;
  }

  const prospects = await prisma.prospect.findMany({
    where,
    include: {
      vendedor: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { interacoes: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return prospects;
}

async function getVendedores() {
  const vendedores = await prisma.user.findMany({
    where: {
      OR: [{ role: "vendedor" }, { role: "admin" }],
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  return vendedores;
}

async function getStatusCounts(userId: string, isVendedor: boolean) {
  const where: Prisma.ProspectWhereInput = isVendedor ? { vendedorId: userId } : {};

  const allProspects = await prisma.prospect.findMany({
    where,
    select: { statusPipeline: true },
  });

  return allProspects.reduce((acc, p) => {
    const status = p.statusPipeline || "NOVO";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ProspectsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  const isVendedor = user.role === "vendedor";
  const params = await searchParams;

  const [prospects, vendedores, countByStatus] = await Promise.all([
    getProspects(params, user.id, isVendedor),
    isVendedor ? Promise.resolve([]) : getVendedores(),
    getStatusCounts(user.id, isVendedor),
  ]);

  const hasFilters =
    params.search || params.status || params.score || params.vendedorId;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isVendedor ? "Meus Prospects" : "Prospects"}
          </h1>
          <p className="text-muted-foreground">
            {prospects.length} prospects {hasFilters ? "encontrados" : "cadastrados"}
            {isVendedor && " (apenas os seus)"}
          </p>
        </div>
        <Link href="/admin/prospects/novo">
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Prospect
          </Button>
        </Link>
      </div>

      {/* Cards de resumo por status */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {Object.entries(STATUS_LABELS).slice(0, 5).map(([key, { label, color }]) => (
          <Card key={key} className="p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{countByStatus[key] || 0}</p>
          </Card>
        ))}
      </div>

      {/* Filtros (vendedores não veem filtro de vendedor) */}
      <ProspectsFilters vendedores={isVendedor ? [] : vendedores} />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Prospect</th>
                  <th className="text-left p-4 font-medium">Negócio</th>
                  <th className="text-left p-4 font-medium">Score</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  {!isVendedor && (
                    <th className="text-left p-4 font-medium">Vendedor</th>
                  )}
                  <th className="text-left p-4 font-medium">Data</th>
                  <th className="text-left p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {prospects.length === 0 ? (
                  <tr>
                    <td colSpan={isVendedor ? 6 : 7} className="p-8 text-center text-muted-foreground">
                      {hasFilters ? (
                        "Nenhum prospect encontrado com os filtros aplicados."
                      ) : (
                        <>
                          Nenhum prospect encontrado.{" "}
                          <Link href="/admin/prospects/novo" className="text-primary hover:underline">
                            Cadastrar primeiro prospect
                          </Link>
                        </>
                      )}
                    </td>
                  </tr>
                ) : (
                  prospects.map((prospect) => {
                    const status = STATUS_LABELS[prospect.statusPipeline || "NOVO"] || STATUS_LABELS.NOVO;
                    return (
                      <tr key={prospect.id} className="border-b hover:bg-muted/30">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{prospect.nome}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {prospect.telefone && (
                                <a
                                  href={`https://wa.me/55${prospect.telefone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-green-600 hover:underline"
                                >
                                  <Phone className="w-3 h-3" />
                                  {prospect.telefone}
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p>{prospect.negocio || "-"}</p>
                            {prospect.segmento && (
                              <p className="text-xs text-muted-foreground">{prospect.segmento}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {prospect.score !== null ? (
                            <div className="flex items-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                                  prospect.score >= 70
                                    ? "bg-green-500"
                                    : prospect.score >= 40
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                              >
                                {prospect.score}
                              </div>
                              <div className="ml-2">
                                {prospect.score >= 70 ? (
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        {!isVendedor && (
                          <td className="p-4 text-sm">
                            {prospect.vendedor?.name || prospect.vendedor?.email || "-"}
                          </td>
                        )}
                        <td className="p-4 text-muted-foreground text-sm">
                          {new Date(prospect.createdAt).toLocaleDateString("pt-BR", {
                            timeZone: "America/Sao_Paulo",
                          })}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/prospects/${prospect.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                Detalhes
                              </Button>
                            </Link>
                            {prospect.score !== null && (
                              <Link href={`/resultado/${prospect.id}`} target="_blank">
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </Link>
                            )}
                            <DeleteProspectButton prospectId={prospect.id} prospectNome={prospect.nome} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
