import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  Phone,
  Mail,
  TrendingUp,
  TrendingDown,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Download,
} from "lucide-react";

type LeadListItem = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  negocio: string;
  segmento: string;
  scoreGeral: number | null;
  scoreGBP: number | null;
  scoreSite: number | null;
  valorSugerido: any;
  status: string;
  convertido: boolean;
  pesquisaEm: Date;
  contatadoEm: Date | null;
};

async function getLeads(): Promise<LeadListItem[]> {
  const leads = await prisma.lead.findMany({
    orderBy: { pesquisaEm: "desc" },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      negocio: true,
      segmento: true,
      scoreGeral: true,
      scoreGBP: true,
      scoreSite: true,
      valorSugerido: true,
      status: true,
      convertido: true,
      pesquisaEm: true,
      contatadoEm: true,
    },
  });
  return leads as LeadListItem[];
}

async function getStats() {
  const [total, novos, contatados, convertidos] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NOVO" } }),
    prisma.lead.count({ where: { status: "CONTATADO" } }),
    prisma.lead.count({ where: { convertido: true } }),
  ]);

  return { total, novos, contatados, convertidos };
}

export default async function LeadsPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  const [leads, stats] = await Promise.all([getLeads(), getStats()]);

  const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    NOVO: { color: "bg-blue-100 text-blue-700", icon: Clock, label: "Novo" },
    CONTATADO: { color: "bg-yellow-100 text-yellow-700", icon: Phone, label: "Contatado" },
    NEGOCIANDO: { color: "bg-purple-100 text-purple-700", icon: TrendingUp, label: "Negociando" },
    CONVERTIDO: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Convertido" },
    PERDIDO: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Perdido" },
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">
            {leads.length} leads capturados
          </p>
        </div>
        <a href="/api/leads/export" download>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
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
                <p className="text-sm text-muted-foreground">Novos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.novos}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contatados</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.contatados}</p>
              </div>
              <Phone className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Convertidos</p>
                <p className="text-2xl font-bold text-green-600">{stats.convertidos}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Lead</th>
                  <th className="text-left p-4 font-medium">Score</th>
                  <th className="text-left p-4 font-medium">Valor Sugerido</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Data</th>
                  <th className="text-left p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Nenhum lead capturado ainda
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const config = statusConfig[lead.status] || statusConfig.NOVO;
                    const StatusIcon = config.icon;
                    const score = lead.scoreGeral || 0;

                    return (
                      <tr key={lead.id} className="border-b hover:bg-muted/30">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{lead.nome}</p>
                            <p className="text-sm text-muted-foreground">{lead.negocio}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {lead.email}
                              </span>
                              <span className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {lead.telefone}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                                score >= 70
                                  ? "bg-green-500"
                                  : score >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            >
                              {score}
                            </div>
                            <div className="text-xs">
                              {score >= 70 ? (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-green-600">
                            R$ {Number(lead.valorSugerido || 0).toLocaleString("pt-BR")}
                          </p>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(lead.pesquisaEm).toLocaleDateString("pt-BR", {
                            timeZone: "America/Sao_Paulo",
                          })}
                          <br />
                          <span className="text-xs">
                            {new Date(lead.pesquisaEm).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "America/Sao_Paulo",
                            })}
                          </span>
                        </td>
                        <td className="p-4">
                          <Link href={`/admin/leads/${lead.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Ficha
                            </Button>
                          </Link>
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
