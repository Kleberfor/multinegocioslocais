import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Target,
  TrendingUp,
  UserCheck,
  UserX,
  CreditCard,
  FileText,
  Percent,
  Pencil,
  DollarSign,
  Users,
  FileSignature,
  Clock,
} from "lucide-react";
import { getCurrentUser } from "@/lib/get-current-user";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VendedorDashboardPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (user.role !== "admin") {
    redirect("/admin/dashboard");
  }

  const { id } = await params;

  const vendedor = await prisma.user.findUnique({
    where: { id },
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
      updatedAt: true,
      _count: {
        select: {
          prospects: true,
          leads: true,
          clientes: true,
        },
      },
    },
  });

  if (!vendedor) {
    notFound();
  }

  // Buscar todos os prospects do vendedor
  const prospects = await prisma.prospect.findMany({
    where: { vendedorId: id },
    select: {
      id: true,
      nome: true,
      negocio: true,
      statusPipeline: true,
      valorEstimado: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Buscar todos os leads do vendedor
  const leads = await prisma.lead.findMany({
    where: { vendedorId: id },
    select: {
      id: true,
      nome: true,
      negocio: true,
      status: true,
      valorSugerido: true,
      convertido: true,
      clienteId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Buscar clientes do vendedor (atribuídos diretamente)
  const clientes = await prisma.cliente.findMany({
    where: { vendedorId: id },
    select: {
      id: true,
      nome: true,
      negocio: true,
      email: true,
      telefone: true,
      createdAt: true,
      contratos: {
        select: {
          id: true,
          valor: true,
          valorMensal: true,
          status: true,
          parcelas: true,
          assinadoEm: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calcular estatísticas
  const totalProspects = prospects.length;
  const totalLeads = leads.length;
  const leadsConvertidos = leads.filter(l => l.convertido).length;
  const totalClientes = clientes.length;

  // Calcular valor total de contratos assinados
  const valorTotalContratos = clientes.reduce((acc, cliente) => {
    const valorCliente = cliente.contratos
      .filter(c => c.status === "ASSINADO" || c.status === "PAGO")
      .reduce((sum, c) => sum + Number(c.valor), 0);
    return acc + valorCliente;
  }, 0);

  // Calcular comissão total
  const comissaoTotal = vendedor.comissao
    ? valorTotalContratos * (Number(vendedor.comissao) / 100)
    : 0;

  // Prospects por status
  const prospectsPorStatus = prospects.reduce((acc, p) => {
    acc[p.statusPipeline] = (acc[p.statusPipeline] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Leads por status
  const leadsPorStatus = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusColors: Record<string, string> = {
    NOVO: "bg-blue-100 text-blue-700",
    EM_CONTATO: "bg-yellow-100 text-yellow-700",
    CONTATADO: "bg-yellow-100 text-yellow-700",
    REUNIAO_AGENDADA: "bg-purple-100 text-purple-700",
    PROPOSTA_ENVIADA: "bg-orange-100 text-orange-700",
    NEGOCIANDO: "bg-cyan-100 text-cyan-700",
    CONTRATO_ENVIADO: "bg-indigo-100 text-indigo-700",
    ASSINADO: "bg-green-100 text-green-700",
    CONVERTIDO: "bg-green-100 text-green-700",
    PAGO: "bg-emerald-100 text-emerald-700",
    PERDIDO: "bg-red-100 text-red-700",
    INATIVO: "bg-gray-100 text-gray-700",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/vendedores">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-xl">
                {vendedor.name?.charAt(0).toUpperCase() || "V"}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">
                  {vendedor.name || "Sem nome"}
                </h1>
                {vendedor.role === "admin" && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    Admin
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    vendedor.ativo
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {vendedor.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
              <p className="text-muted-foreground">{vendedor.email}</p>
            </div>
          </div>
        </div>
        <Link href={`/admin/vendedores/${id}/editar`}>
          <Button variant="outline" className="gap-2">
            <Pencil className="w-4 h-4" />
            Editar
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prospects</p>
                <p className="text-2xl font-bold">{totalProspects}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leads</p>
                <p className="text-2xl font-bold">{totalLeads}</p>
                <p className="text-xs text-muted-foreground">
                  {leadsConvertidos} convertidos
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes</p>
                <p className="text-2xl font-bold">{totalClientes}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vendas</p>
                <p className="text-2xl font-bold text-green-600">
                  {valorTotalContratos.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
                {vendedor.comissao && (
                  <p className="text-xs text-muted-foreground">
                    Comissão: {comissaoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                )}
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Clientes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Clientes ({totalClientes})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clientes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum cliente convertido ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {clientes.map((cliente) => {
                    const valorTotal = cliente.contratos.reduce((sum, c) => sum + Number(c.valor), 0);
                    const contratosAssinados = cliente.contratos.filter(c => c.status === "ASSINADO" || c.status === "PAGO").length;
                    return (
                      <Link
                        key={cliente.id}
                        href={`/admin/clientes/${cliente.id}`}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{cliente.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {cliente.negocio}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cliente.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">
                            {valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contratosAssinados} contrato(s)
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prospects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Prospects ({totalProspects})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prospects.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum prospect atribuído
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {prospects.map((prospect) => (
                    <Link
                      key={prospect.id}
                      href={`/admin/prospects/${prospect.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{prospect.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {prospect.negocio}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {prospect.valorEstimado && (
                          <span className="text-sm text-green-600 font-medium">
                            {Number(prospect.valorEstimado).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            statusColors[prospect.statusPipeline] || statusColors.NOVO
                          }`}
                        >
                          {prospect.statusPipeline.replace(/_/g, " ")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leads */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Leads ({totalLeads})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum lead atribuído
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {leads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/admin/leads/${lead.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{lead.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {lead.negocio}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {lead.valorSugerido && (
                          <span className="text-sm text-green-600 font-medium">
                            {Number(lead.valorSugerido).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            statusColors[lead.status] || statusColors.NOVO
                          }`}
                        >
                          {lead.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          {/* Pipeline de Prospects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pipeline Prospects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(prospectsPorStatus).length === 0 ? (
                <p className="text-muted-foreground text-sm text-center">Sem dados</p>
              ) : (
                Object.entries(prospectsPorStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        statusColors[status] || statusColors.NOVO
                      }`}
                    >
                      {status.replace(/_/g, " ")}
                    </span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Pipeline de Leads */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pipeline Leads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(leadsPorStatus).length === 0 ? (
                <p className="text-muted-foreground text-sm text-center">Sem dados</p>
              ) : (
                Object.entries(leadsPorStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        statusColors[status] || statusColors.NOVO
                      }`}
                    >
                      {status}
                    </span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Informações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm">{vendedor.email}</p>
                </div>
              </div>
              {vendedor.cpf && (
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="text-sm font-mono">
                      {vendedor.cpf.replace(
                        /(\d{3})(\d{3})(\d{3})(\d{2})/,
                        "$1.$2.$3-$4"
                      )}
                    </p>
                  </div>
                </div>
              )}
              {vendedor.rg && (
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">RG</p>
                    <p className="text-sm font-mono">{vendedor.rg}</p>
                  </div>
                </div>
              )}
              {vendedor.comissao && (
                <div className="flex items-center gap-3">
                  <Percent className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Comissão</p>
                    <p className="text-sm font-bold text-green-600">
                      {Number(vendedor.comissao)}%
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Cadastrado em</p>
                  <p className="text-sm">
                    {new Date(vendedor.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      timeZone: "America/Sao_Paulo",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {vendedor.ativo ? (
                  <UserCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <UserX className="w-4 h-4 text-red-500" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p
                    className={`text-sm font-medium ${
                      vendedor.ativo ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {vendedor.ativo ? "Ativo" : "Inativo"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
