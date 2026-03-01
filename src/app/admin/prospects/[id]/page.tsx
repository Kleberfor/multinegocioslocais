import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  BarChart3,
  Send,
  MessageSquare,
} from "lucide-react";
import { ProspectTimeline } from "@/components/admin/prospect-timeline";
import { ProspectStatusSelect } from "@/components/admin/prospect-status-select";
import { AddInteracaoForm } from "@/components/admin/add-interacao-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

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

export default async function ProspectDetalhePage({ params }: PageProps) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const prospect = await prisma.prospect.findUnique({
    where: { id },
    include: {
      vendedor: {
        select: { id: true, name: true, email: true },
      },
      interacoes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!prospect) {
    notFound();
  }

  const status = STATUS_LABELS[prospect.statusPipeline || "NOVO"] || STATUS_LABELS.NOVO;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/prospects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{prospect.nome}</h1>
            <p className="text-muted-foreground">{prospect.negocio || "Sem nome do negócio"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
          {prospect.score !== null && (
            <Link href={`/admin/prospects/${id}/score`}>
              <Button>
                <BarChart3 className="w-4 h-4 mr-2" />
                Ver Score
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Coluna Principal - Dados e Timeline */}
        <div className="md:col-span-2 space-y-6">
          {/* Dados do Prospect */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Prospect</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  {prospect.telefone ? (
                    <a
                      href={`https://wa.me/55${prospect.telefone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-green-600 hover:underline"
                    >
                      {prospect.telefone}
                    </a>
                  ) : (
                    <p className="font-medium">-</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{prospect.email || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Segmento</p>
                  <p className="font-medium">{prospect.segmento || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Localização</p>
                  <p className="font-medium">
                    {prospect.cidade && prospect.estado
                      ? `${prospect.cidade}/${prospect.estado}`
                      : prospect.cidade || prospect.estado || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cadastrado em</p>
                  <p className="font-medium">
                    {new Date(prospect.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "America/Sao_Paulo",
                    })}
                  </p>
                </div>
              </div>

              {prospect.valorEstimado && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-700 font-bold">R$</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Estimado</p>
                    <p className="font-medium text-green-700">
                      R$ {Number(prospect.valorEstimado).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          {prospect.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{prospect.observacoes}</p>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Timeline de Interações</CardTitle>
            </CardHeader>
            <CardContent>
              <AddInteracaoForm prospectId={prospect.id} />
              <div className="mt-6">
                <ProspectTimeline interacoes={prospect.interacoes} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral - Ações */}
        <div className="space-y-6">
          {/* Alterar Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alterar Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ProspectStatusSelect
                prospectId={prospect.id}
                currentStatus={prospect.statusPipeline || "NOVO"}
              />
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {prospect.telefone && (
                <a
                  href={`https://wa.me/55${prospect.telefone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2 text-green-600" />
                    WhatsApp
                  </Button>
                </a>
              )}

              {prospect.email && (
                <a href={`mailto:${prospect.email}`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2 text-blue-600" />
                    Enviar Email
                  </Button>
                </a>
              )}

              {prospect.score !== null && (
                <Link href={`/admin/prospects/${id}/score`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Send className="w-4 h-4 mr-2 text-purple-600" />
                    Enviar Score
                  </Button>
                </Link>
              )}

              <Link href={`/proposta/${id}`} target="_blank" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2 text-orange-600" />
                  Ver Proposta
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Vendedor Responsável */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vendedor Responsável</CardTitle>
            </CardHeader>
            <CardContent>
              {prospect.vendedor ? (
                <div>
                  <p className="font-medium">{prospect.vendedor.name || prospect.vendedor.email}</p>
                  <p className="text-sm text-muted-foreground">{prospect.vendedor.email}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum vendedor atribuído</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
