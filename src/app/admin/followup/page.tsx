import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  AlertCircle,
  Send,
  XCircle,
} from "lucide-react";

type FollowUpWithLead = {
  id: string;
  leadId: string;
  tipo: string;
  agendadoPara: Date;
  status: string;
  canal: string;
  assunto: string | null;
  lead: {
    nome: string;
    negocio: string;
    email: string;
    telefone: string;
  } | null;
};

async function getFollowUps() {
  const proximosFollowUps = await prisma.followUp.findMany({
    where: {
      status: "PENDENTE",
    },
    orderBy: { agendadoPara: "asc" },
    take: 30,
  });

  const leadIds = [...new Set(proximosFollowUps.map((f) => f.leadId))];

  const leads = await prisma.lead.findMany({
    where: { id: { in: leadIds } },
    select: {
      id: true,
      nome: true,
      negocio: true,
      email: true,
      telefone: true,
    },
  });

  const leadsMap = new Map(leads.map((l) => [l.id, l]));

  return proximosFollowUps.map((f) => ({
    ...f,
    lead: leadsMap.get(f.leadId) || null,
  })) as FollowUpWithLead[];
}

async function getStats() {
  const [pendentes, enviados, realizados, cancelados] = await Promise.all([
    prisma.followUp.count({ where: { status: "PENDENTE" } }),
    prisma.followUp.count({ where: { status: "ENVIADO" } }),
    prisma.followUp.count({ where: { status: "REALIZADO" } }),
    prisma.followUp.count({ where: { status: "CANCELADO" } }),
  ]);

  const atrasados = await prisma.followUp.count({
    where: {
      status: "PENDENTE",
      agendadoPara: {
        lt: new Date(),
      },
    },
  });

  return { pendentes, enviados, realizados, cancelados, atrasados };
}

export default async function FollowUpPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  const [followUps, stats] = await Promise.all([getFollowUps(), getStats()]);

  const tipoConfig: Record<string, { color: string; label: string }> = {
    PRIMEIRO_CONTATO: { color: "bg-blue-100 text-blue-700", label: "1o Contato" },
    SEGUNDO_CONTATO: { color: "bg-purple-100 text-purple-700", label: "2o Contato" },
    TERCEIRO_CONTATO: { color: "bg-orange-100 text-orange-700", label: "3o Contato" },
    PROPOSTA: { color: "bg-green-100 text-green-700", label: "Proposta" },
    FECHAMENTO: { color: "bg-red-100 text-red-700", label: "Fechamento" },
  };

  const canalIcon: Record<string, React.ElementType> = {
    EMAIL: Mail,
    WHATSAPP: MessageSquare,
    TELEFONE: Phone,
  };

  const agora = new Date();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Follow-ups</h1>
          <p className="text-muted-foreground">
            Gerencie os follow-ups automáticos dos leads
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pendentes}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={stats.atrasados > 0 ? "border-red-200" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atrasados</p>
                <p className="text-2xl font-bold text-red-600">{stats.atrasados}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enviados</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.enviados}</p>
              </div>
              <Send className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Realizados</p>
                <p className="text-2xl font-bold text-green-600">{stats.realizados}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelados</p>
                <p className="text-2xl font-bold text-gray-600">{stats.cancelados}</p>
              </div>
              <XCircle className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Follow-ups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Próximos Follow-ups
          </CardTitle>
        </CardHeader>
        <CardContent>
          {followUps.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum follow-up pendente
            </p>
          ) : (
            <div className="space-y-4">
              {followUps.map((followUp) => {
                const config = tipoConfig[followUp.tipo] || tipoConfig.PRIMEIRO_CONTATO;
                const CanalIcon = canalIcon[followUp.canal] || Mail;
                const isAtrasado = new Date(followUp.agendadoPara) < agora;

                return (
                  <div
                    key={followUp.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isAtrasado ? "border-red-200 bg-red-50" : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <CanalIcon className="w-5 h-5 text-muted-foreground" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{followUp.lead?.negocio || "Lead"}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                            {config.label}
                          </span>
                          {isAtrasado && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Atrasado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {followUp.lead?.nome} - {followUp.lead?.email}
                        </p>
                        {followUp.assunto && (
                          <p className="text-sm text-muted-foreground mt-1 truncate max-w-md">
                            {followUp.assunto}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(followUp.agendadoPara).toLocaleDateString("pt-BR", {
                            timeZone: "America/Sao_Paulo",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(followUp.agendadoPara).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "America/Sao_Paulo",
                          })}
                        </p>
                      </div>

                      <Link href={`/admin/leads/${followUp.leadId}`}>
                        <Button variant="outline" size="sm">
                          Ver Lead
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
