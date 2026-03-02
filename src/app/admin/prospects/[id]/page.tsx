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
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target,
} from "lucide-react";
import { ProspectTimeline } from "@/components/admin/prospect-timeline";
import { ProspectStatusSelect } from "@/components/admin/prospect-status-select";
import { AddInteracaoForm } from "@/components/admin/add-interacao-form";
import { ConverterProspectModal } from "@/components/admin/converter-prospect-modal";
import { ReatribuirProspect } from "@/components/admin/reatribuir-prospect";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Tipo para análise do prospect
interface AnaliseData {
  gbp?: {
    problemas?: string[];
    situacaoAtual?: string;
    comoResolver?: string;
  };
  site?: {
    problemas?: string[];
    situacaoAtual?: string;
    comoResolver?: string;
  };
  redes?: {
    problemas?: string[];
    situacaoAtual?: string;
    comoResolver?: string;
  };
  planoAcao?: Array<{
    fase: number;
    periodo: string;
    acoes: string[];
    entregaveis: string[];
  }>;
  argumentos?: string[];
}

// Componente para exibir a análise
function AnaliseSection({ analise }: { analise: AnaliseData }) {
  const hasGBP = analise.gbp && (analise.gbp.problemas?.length || analise.gbp.situacaoAtual);
  const hasSite = analise.site && (analise.site.problemas?.length || analise.site.situacaoAtual);
  const hasRedes = analise.redes && (analise.redes.problemas?.length || analise.redes.situacaoAtual);
  const hasPlanoAcao = analise.planoAcao && analise.planoAcao.length > 0;
  const hasArgumentos = analise.argumentos && analise.argumentos.length > 0;

  if (!hasGBP && !hasSite && !hasRedes && !hasPlanoAcao && !hasArgumentos) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5" />
          Análise e Diagnóstico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Argumentos de Fechamento */}
        {hasArgumentos && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Argumentos de Fechamento
            </h4>
            <ul className="space-y-2">
              {analise.argumentos?.map((arg, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{arg}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Diagnóstico GBP */}
        {hasGBP && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Google Business Profile</h4>
            {analise.gbp?.problemas && analise.gbp.problemas.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-1">Problemas identificados:</p>
                <ul className="space-y-1">
                  {analise.gbp.problemas.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analise.gbp?.situacaoAtual && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-1">Situação atual:</p>
                <p className="text-sm bg-muted/50 p-2 rounded">{analise.gbp.situacaoAtual}</p>
              </div>
            )}
            {analise.gbp?.comoResolver && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Como resolver:</p>
                <p className="text-sm bg-green-50 text-green-800 p-2 rounded">{analise.gbp.comoResolver}</p>
              </div>
            )}
          </div>
        )}

        {/* Diagnóstico Site */}
        {hasSite && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Site</h4>
            {analise.site?.problemas && analise.site.problemas.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-1">Problemas identificados:</p>
                <ul className="space-y-1">
                  {analise.site.problemas.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analise.site?.situacaoAtual && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-1">Situação atual:</p>
                <p className="text-sm bg-muted/50 p-2 rounded">{analise.site.situacaoAtual}</p>
              </div>
            )}
            {analise.site?.comoResolver && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Como resolver:</p>
                <p className="text-sm bg-green-50 text-green-800 p-2 rounded">{analise.site.comoResolver}</p>
              </div>
            )}
          </div>
        )}

        {/* Diagnóstico Redes */}
        {hasRedes && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Redes Sociais</h4>
            {analise.redes?.problemas && analise.redes.problemas.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-1">Problemas identificados:</p>
                <ul className="space-y-1">
                  {analise.redes.problemas.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analise.redes?.situacaoAtual && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-1">Situação atual:</p>
                <p className="text-sm bg-muted/50 p-2 rounded">{analise.redes.situacaoAtual}</p>
              </div>
            )}
            {analise.redes?.comoResolver && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Como resolver:</p>
                <p className="text-sm bg-green-50 text-green-800 p-2 rounded">{analise.redes.comoResolver}</p>
              </div>
            )}
          </div>
        )}

        {/* Plano de Ação */}
        {hasPlanoAcao && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Plano de Ação</h4>
            <div className="space-y-4">
              {analise.planoAcao?.map((fase) => (
                <div key={fase.fase} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                      {fase.fase}
                    </span>
                    <span className="font-medium">Fase {fase.fase}</span>
                    {fase.periodo && (
                      <span className="text-sm text-muted-foreground">({fase.periodo})</span>
                    )}
                  </div>
                  {fase.acoes && fase.acoes.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1">Ações:</p>
                      <ul className="text-sm space-y-1">
                        {fase.acoes.map((acao, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {acao}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {fase.entregaveis && fase.entregaveis.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Entregáveis:</p>
                      <ul className="text-sm space-y-1">
                        {fase.entregaveis.map((ent, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                            {ent}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
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

          {/* Análise e Diagnóstico */}
          {prospect.analise && (
            <AnaliseSection analise={prospect.analise as AnaliseData} />
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

          {/* Converter em Cliente */}
          {prospect.statusPipeline !== "PAGO" && prospect.statusPipeline !== "ASSINADO" && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">Fechar Venda</CardTitle>
              </CardHeader>
              <CardContent>
                <ConverterProspectModal
                  prospectId={prospect.id}
                  prospectNome={prospect.nome}
                  valorEstimado={prospect.valorEstimado ? Number(prospect.valorEstimado) : undefined}
                />
              </CardContent>
            </Card>
          )}

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

              <Link href={`/proposta/prospect/${id}`} target="_blank" className="w-full">
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
            <CardContent className="space-y-4">
              {prospect.vendedor ? (
                <div>
                  <p className="font-medium">{prospect.vendedor.name || prospect.vendedor.email}</p>
                  <p className="text-sm text-muted-foreground">{prospect.vendedor.email}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum vendedor atribuído</p>
              )}

              {/* Reatribuição - apenas admin */}
              {(session.user as { role?: string })?.role === "admin" && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Reatribuir para:</p>
                  <ReatribuirProspect
                    prospectId={prospect.id}
                    vendedorAtualId={prospect.vendedorId}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
