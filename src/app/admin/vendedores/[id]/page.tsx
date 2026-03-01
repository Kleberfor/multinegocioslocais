import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Target,
  TrendingUp,
  UserCheck,
  UserX,
} from "lucide-react";
import { getCurrentUser } from "@/lib/get-current-user";
import { EditVendedorForm } from "@/components/admin/edit-vendedor-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VendedorDetalhePage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (user.role !== "admin") {
    redirect("/admin/dashboard");
  }

  const { id } = await params;

  const vendedor = await prisma.user.findUnique({
    where: { id, role: "vendedor" },
    select: {
      id: true,
      name: true,
      email: true,
      ativo: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          prospectsAtribuidos: true,
          leadsAtribuidos: true,
        },
      },
    },
  });

  if (!vendedor) {
    notFound();
  }

  // Buscar prospects recentes do vendedor
  const prospectsRecentes = await prisma.prospect.findMany({
    where: { vendedorId: id },
    select: {
      id: true,
      nome: true,
      negocio: true,
      statusPipeline: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Buscar leads recentes do vendedor
  const leadsRecentes = await prisma.lead.findMany({
    where: { vendedorId: id },
    select: {
      id: true,
      nome: true,
      negocio: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

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
    <div className="max-w-4xl mx-auto">
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
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Formulário de Edição */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Editar Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EditVendedorForm vendedor={vendedor} />
            </CardContent>
          </Card>

          {/* Prospects Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Prospects Recentes ({vendedor._count.prospectsAtribuidos})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prospectsRecentes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum prospect atribuído
                </p>
              ) : (
                <div className="space-y-3">
                  {prospectsRecentes.map((prospect) => (
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
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          statusColors[prospect.statusPipeline] ||
                          statusColors.NOVO
                        }`}
                      >
                        {prospect.statusPipeline.replace(/_/g, " ")}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leads Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Leads Recentes ({vendedor._count.leadsAtribuidos})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leadsRecentes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum lead atribuído
                </p>
              ) : (
                <div className="space-y-3">
                  {leadsRecentes.map((lead) => (
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
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          statusColors[lead.status] || statusColors.NOVO
                        }`}
                      >
                        {lead.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-muted-foreground">Prospects</span>
                </div>
                <span className="font-bold">
                  {vendedor._count.prospectsAtribuidos}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">Leads</span>
                </div>
                <span className="font-bold">
                  {vendedor._count.leadsAtribuidos}
                </span>
              </div>
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
