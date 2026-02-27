import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Phone,
  Target,
} from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "./charts-section";

async function getStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    // Totais
    totalLeads,
    totalClientes,
    totalContratos,
    totalFaturamento,
    // Leads por status
    leadsNovos,
    leadsContatados,
    leadsConvertidos,
    leadsPerdidos,
    // Leads por score
    leadsCriticos,
    leadsRegulares,
    leadsBons,
    // Este mês
    leadsMesAtual,
    leadsMesAnterior,
    // Leads recentes
    recentLeads,
    // Leads por dia (últimos 7 dias)
    leadsPorDia,
  ] = await Promise.all([
    // Totais
    prisma.lead.count(),
    prisma.cliente.count(),
    prisma.contrato.count({ where: { status: "PAGO" } }),
    prisma.contrato.aggregate({
      where: { status: "PAGO" },
      _sum: { valor: true },
    }),
    // Status
    prisma.lead.count({ where: { status: "NOVO" } }),
    prisma.lead.count({ where: { status: "CONTATADO" } }),
    prisma.lead.count({ where: { convertido: true } }),
    prisma.lead.count({ where: { status: "PERDIDO" } }),
    // Score
    prisma.lead.count({ where: { scoreGeral: { lt: 40 } } }),
    prisma.lead.count({ where: { scoreGeral: { gte: 40, lt: 70 } } }),
    prisma.lead.count({ where: { scoreGeral: { gte: 70 } } }),
    // Comparação mensal
    prisma.lead.count({
      where: { pesquisaEm: { gte: startOfMonth } },
    }),
    prisma.lead.count({
      where: {
        pesquisaEm: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    // Recentes
    prisma.lead.findMany({
      orderBy: { pesquisaEm: "desc" },
      take: 5,
      select: {
        id: true,
        nome: true,
        negocio: true,
        scoreGeral: true,
        status: true,
        pesquisaEm: true,
        telefone: true,
      },
    }),
    // Últimos 7 dias
    prisma.$queryRaw`
      SELECT
        DATE("pesquisaEm") as date,
        COUNT(*) as count
      FROM "Lead"
      WHERE "pesquisaEm" >= NOW() - INTERVAL '7 days'
      GROUP BY DATE("pesquisaEm")
      ORDER BY date ASC
    ` as Promise<{ date: Date; count: bigint }[]>,
  ]);

  // Calcular variação mensal
  const variacaoMensal = leadsMesAnterior > 0
    ? Math.round(((leadsMesAtual - leadsMesAnterior) / leadsMesAnterior) * 100)
    : leadsMesAtual > 0 ? 100 : 0;

  // Taxa de conversão
  const taxaConversao = totalLeads > 0
    ? Math.round((leadsConvertidos / totalLeads) * 100)
    : 0;

  // Formatar dados para gráficos
  const leadsChartData = leadsPorDia.map((item) => ({
    date: new Date(item.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "America/Sao_Paulo",
    }),
    leads: Number(item.count),
  }));

  const statusChartData = [
    { name: "Novos", value: leadsNovos },
    { name: "Contatados", value: leadsContatados },
    { name: "Convertidos", value: leadsConvertidos },
    { name: "Perdidos", value: leadsPerdidos },
  ].filter((item) => item.value > 0);

  const scoresChartData = [
    { name: "Crítico", value: leadsCriticos },
    { name: "Regular", value: leadsRegulares },
    { name: "Bom", value: leadsBons },
  ];

  return {
    totalLeads,
    totalClientes,
    totalContratos,
    totalFaturamento: Number(totalFaturamento._sum.valor || 0),
    leadsNovos,
    leadsMesAtual,
    variacaoMensal,
    taxaConversao,
    recentLeads,
    leadsChartData,
    statusChartData,
    scoresChartData,
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/admin/leads"
          className="text-sm text-primary hover:underline"
        >
          Ver todos os leads →
        </Link>
      </div>

      {/* Stats Cards - Linha 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Leads
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalLeads}</p>
            <p className="text-xs text-muted-foreground">
              {stats.leadsNovos} aguardando contato
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads este Mês
            </CardTitle>
            {stats.variacaoMensal >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.leadsMesAtual}</p>
            <p
              className={`text-xs ${
                stats.variacaoMensal >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.variacaoMensal >= 0 ? "+" : ""}
              {stats.variacaoMensal}% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conversão
            </CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.taxaConversao}%</p>
            <p className="text-xs text-muted-foreground">
              {stats.totalClientes} clientes ativos
            </p>
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
              {stats.totalContratos} contratos pagos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <DashboardCharts
        leadsChartData={stats.leadsChartData}
        statusChartData={stats.statusChartData}
        scoresChartData={stats.scoresChartData}
      />

      {/* Leads Recentes */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Leads Recentes</CardTitle>
          <Link
            href="/admin/leads?status=NOVO"
            className="text-sm text-primary hover:underline"
          >
            Ver novos →
          </Link>
        </CardHeader>
        <CardContent>
          {stats.recentLeads.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum lead ainda</p>
          ) : (
            <div className="space-y-4">
              {stats.recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{lead.nome}</p>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          lead.status === "NOVO"
                            ? "bg-blue-100 text-blue-700"
                            : lead.status === "CONTATADO"
                            ? "bg-yellow-100 text-yellow-700"
                            : lead.status === "CONVERTIDO"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lead.negocio}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          (lead.scoreGeral || 0) >= 70
                            ? "text-green-600"
                            : (lead.scoreGeral || 0) >= 40
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {lead.scoreGeral}/100
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(lead.pesquisaEm).toLocaleDateString("pt-BR", {
                          timeZone: "America/Sao_Paulo",
                        })}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`https://wa.me/55${lead.telefone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full hover:bg-green-100 text-green-600"
                        title="WhatsApp"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="p-2 rounded-full hover:bg-primary/10 text-primary"
                        title="Ver detalhes"
                      >
                        <FileText className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
