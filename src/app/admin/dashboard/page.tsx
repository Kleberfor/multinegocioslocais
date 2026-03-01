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
  Search,
} from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "./charts-section";
import { getCurrentUser, type CurrentUser } from "@/lib/get-current-user";
import { Prisma } from "@prisma/client";

async function getStats(user: CurrentUser) {
  const isVendedor = user.role === "vendedor";
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Filtro base para vendedor (só vê seus próprios dados)
  const vendedorFilter = isVendedor ? { vendedorId: user.id } : {};
  const prospectFilter = isVendedor ? { vendedorId: user.id } : {};

  // Para clientes, precisamos filtrar via lead (se existir)
  const clienteFilter = isVendedor
    ? { lead: { vendedorId: user.id } }
    : {};

  const [
    // Totais
    totalLeads,
    totalProspects,
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
    // Prospects por status
    prospectsNovos,
    prospectsEmContato,
    prospectsNegociando,
    // Leads recentes
    recentLeads,
    // Prospects recentes
    recentProspects,
    // Leads por dia (últimos 7 dias)
    leadsPorDia,
  ] = await Promise.all([
    // Totais
    prisma.lead.count({ where: vendedorFilter }),
    prisma.prospect.count({ where: prospectFilter }),
    prisma.cliente.count({ where: clienteFilter }),
    prisma.contrato.count({
      where: {
        status: "PAGO",
        ...(isVendedor ? { cliente: { lead: { vendedorId: user.id } } } : {}),
      }
    }),
    prisma.contrato.aggregate({
      where: {
        status: "PAGO",
        ...(isVendedor ? { cliente: { lead: { vendedorId: user.id } } } : {}),
      },
      _sum: { valor: true },
    }),
    // Status
    prisma.lead.count({ where: { status: "NOVO", ...vendedorFilter } }),
    prisma.lead.count({ where: { status: "CONTATADO", ...vendedorFilter } }),
    prisma.lead.count({ where: { convertido: true, ...vendedorFilter } }),
    prisma.lead.count({ where: { status: "PERDIDO", ...vendedorFilter } }),
    // Score
    prisma.lead.count({ where: { scoreGeral: { lt: 40 }, ...vendedorFilter } }),
    prisma.lead.count({ where: { scoreGeral: { gte: 40, lt: 70 }, ...vendedorFilter } }),
    prisma.lead.count({ where: { scoreGeral: { gte: 70 }, ...vendedorFilter } }),
    // Comparação mensal
    prisma.lead.count({
      where: { pesquisaEm: { gte: startOfMonth }, ...vendedorFilter },
    }),
    prisma.lead.count({
      where: {
        pesquisaEm: { gte: startOfLastMonth, lte: endOfLastMonth },
        ...vendedorFilter,
      },
    }),
    // Prospects por status
    prisma.prospect.count({ where: { statusPipeline: "NOVO", ...prospectFilter } }),
    prisma.prospect.count({ where: { statusPipeline: "EM_CONTATO", ...prospectFilter } }),
    prisma.prospect.count({ where: { statusPipeline: "NEGOCIANDO", ...prospectFilter } }),
    // Recentes - Leads
    prisma.lead.findMany({
      where: vendedorFilter,
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
    // Recentes - Prospects
    prisma.prospect.findMany({
      where: prospectFilter,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        nome: true,
        negocio: true,
        statusPipeline: true,
        score: true,
        telefone: true,
        createdAt: true,
      },
    }),
    // Últimos 7 dias
    isVendedor
      ? prisma.$queryRaw`
          SELECT
            DATE("pesquisaEm") as date,
            COUNT(*) as count
          FROM "Lead"
          WHERE "pesquisaEm" >= NOW() - INTERVAL '7 days'
            AND "vendedorId" = ${user.id}
          GROUP BY DATE("pesquisaEm")
          ORDER BY date ASC
        ` as Promise<{ date: Date; count: bigint }[]>
      : prisma.$queryRaw`
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
    totalProspects,
    totalClientes,
    totalContratos,
    totalFaturamento: Number(totalFaturamento._sum.valor || 0),
    leadsNovos,
    prospectsNovos,
    prospectsEmContato,
    prospectsNegociando,
    leadsMesAtual,
    variacaoMensal,
    taxaConversao,
    recentLeads,
    recentProspects,
    leadsChartData,
    statusChartData,
    scoresChartData,
  };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  const stats = await getStats(user);
  const isVendedor = user.role === "vendedor";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {isVendedor ? "Meu Dashboard" : "Dashboard"}
          </h1>
          {isVendedor && (
            <p className="text-muted-foreground">
              Visualizando apenas seus dados
            </p>
          )}
        </div>
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
              {isVendedor ? "Meus Leads" : "Total de Leads"}
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
              {isVendedor ? "Meus Prospects" : "Total de Prospects"}
            </CardTitle>
            <Search className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalProspects}</p>
            <p className="text-xs text-muted-foreground">
              {stats.prospectsNovos} novos • {stats.prospectsNegociando} negociando
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
              {isVendedor ? "Meu Faturamento" : "Faturamento"}
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

      {/* Stats Cards - Linha 2 (Tendências) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
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

        <Card className="col-span-3 hidden lg:block">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-sm text-muted-foreground">Prospects Novos</p>
                  <p className="text-xl font-bold text-blue-600">{stats.prospectsNovos}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Em Contato</p>
                  <p className="text-xl font-bold text-yellow-600">{stats.prospectsEmContato}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Negociando</p>
                  <p className="text-xl font-bold text-purple-600">{stats.prospectsNegociando}</p>
                </div>
              </div>
              <Link
                href="/admin/prospects"
                className="text-sm text-primary hover:underline"
              >
                Ver pipeline →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <DashboardCharts
        leadsChartData={stats.leadsChartData}
        statusChartData={stats.statusChartData}
        scoresChartData={stats.scoresChartData}
      />

      {/* Prospects e Leads Recentes lado a lado */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Prospects Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Prospects Recentes</CardTitle>
            <Link
              href="/admin/prospects"
              className="text-sm text-primary hover:underline"
            >
              Ver todos →
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentProspects.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum prospect ainda</p>
            ) : (
              <div className="space-y-3">
                {stats.recentProspects.map((prospect) => (
                  <Link
                    key={prospect.id}
                    href={`/admin/prospects/${prospect.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{prospect.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {prospect.negocio || "Sem negócio"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prospect.statusPipeline === "NOVO"
                          ? "bg-blue-100 text-blue-700"
                          : prospect.statusPipeline === "EM_CONTATO"
                          ? "bg-yellow-100 text-yellow-700"
                          : prospect.statusPipeline === "NEGOCIANDO"
                          ? "bg-purple-100 text-purple-700"
                          : prospect.statusPipeline === "ASSINADO"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {prospect.statusPipeline || "NOVO"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads Recentes */}
        <Card>
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
              <div className="space-y-3">
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

                    <div className="flex items-center gap-3">
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

                      <div className="flex gap-1">
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
    </div>
  );
}
