import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  FileText,
} from "lucide-react";
import { LeadActions } from "@/components/admin/lead-actions";
import { EditProposta } from "@/components/admin/edit-proposta";

type Lead = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string | null;
  negocio: string;
  siteUrl: string | null;
  segmento: string;
  placeId: string | null;
  enderecoGoogle: string | null;
  scoreGeral: number | null;
  scoreGBP: number | null;
  scoreSite: number | null;
  scoreRedes: number | null;
  analiseCompleta: any;
  argumentosFechamento: any;
  planoAcao: any;
  proposta: any;
  valorSugerido: any;
  status: string;
  motivoPerda: string | null;
  observacoes: string | null;
  convertido: boolean;
  origem: string | null;
  pesquisaEm: Date;
  contatadoEm: Date | null;
  createdAt: Date;
};

async function getLead(id: string): Promise<Lead | null> {
  const lead = await prisma.lead.findUnique({
    where: { id },
  });
  return lead as Lead | null;
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const lead = await getLead(id);

  if (!lead) {
    notFound();
  }

  const score = lead.scoreGeral || 0;
  const analise = lead.analiseCompleta as any;
  const argumentos = (lead.argumentosFechamento as string[]) || [];
  const planoAcao = (lead.planoAcao as any[]) || [];
  const proposta = lead.proposta as any;

  const getScoreColor = (s: number) => {
    if (s >= 70) return "text-green-600 bg-green-100";
    if (s >= 40) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      NOVO: "bg-blue-100 text-blue-700",
      CONTATADO: "bg-yellow-100 text-yellow-700",
      NEGOCIANDO: "bg-purple-100 text-purple-700",
      CONVERTIDO: "bg-green-100 text-green-700",
      PERDIDO: "bg-red-100 text-red-700",
    };
    return config[status] || config.NOVO;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/leads">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{lead.nome}</h1>
          <p className="text-muted-foreground">{lead.negocio}</p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <LeadActions
            lead={{
              id: lead.id,
              nome: lead.nome,
              email: lead.email,
              telefone: lead.telefone,
              negocio: lead.negocio,
              status: lead.status,
              valorSugerido: lead.valorSugerido ? Number(lead.valorSugerido) : null,
              observacoes: lead.observacoes,
            }}
          />
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(lead.status)}`}>
            {lead.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna 1: Dados do Lead e Scores */}
        <div className="space-y-6">
          {/* Dados de Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${lead.email}`} className="text-sm hover:underline">
                  {lead.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${lead.telefone}`} className="text-sm hover:underline">
                  {lead.telefone}
                </a>
              </div>
              {lead.whatsapp && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-500" />
                  <a
                    href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    className="text-sm hover:underline text-green-600"
                  >
                    WhatsApp: {lead.whatsapp}
                  </a>
                </div>
              )}
              {lead.siteUrl && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a href={lead.siteUrl} target="_blank" className="text-sm hover:underline">
                    {lead.siteUrl}
                  </a>
                </div>
              )}
              {lead.enderecoGoogle && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{lead.enderecoGoogle}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  Pesquisa em: {new Date(lead.pesquisaEm).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-6">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${getScoreColor(score)}`}
                >
                  {score}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Google Business</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${(lead.scoreGBP || 0) >= 70 ? "bg-green-500" : (lead.scoreGBP || 0) >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${lead.scoreGBP || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{lead.scoreGBP || 0}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Site</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${(lead.scoreSite || 0) >= 70 ? "bg-green-500" : (lead.scoreSite || 0) >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${lead.scoreSite || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{lead.scoreSite || 0}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Redes Sociais</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${(lead.scoreRedes || 0) >= 70 ? "bg-green-500" : (lead.scoreRedes || 0) >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${lead.scoreRedes || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{lead.scoreRedes || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proposta */}
          {proposta && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Proposta Sugerida
                  </span>
                  <EditProposta
                    leadId={lead.id}
                    valorSugerido={lead.valorSugerido ? Number(lead.valorSugerido) : null}
                    proposta={proposta}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-4">
                  R$ {Number(lead.valorSugerido || 0).toLocaleString("pt-BR")}
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Mensal:</strong> R$ {Number(proposta.valorMensal || 0).toLocaleString("pt-BR")}
                  </p>
                  <p>
                    <strong>ROI:</strong> Retorno em {proposta.roiEstimado?.retornoInvestimentoMeses || "?"} meses
                  </p>
                  <p>
                    <strong>Clientes adicionais:</strong> +{proposta.roiEstimado?.clientesAdicionaisMes || 0}/mês
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Parcelamento:</p>
                  <div className="flex flex-wrap gap-2">
                    {proposta.parcelamento?.map((p: any) => (
                      <span key={p.parcelas} className="text-xs bg-muted px-2 py-1 rounded">
                        {p.parcelas}x R$ {p.valorParcela.toLocaleString("pt-BR")}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna 2: Diagnóstico e Argumentos */}
        <div className="space-y-6">
          {/* Argumentos de Fechamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Argumentos de Fechamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {argumentos.length > 0 ? (
                <ul className="space-y-3">
                  {argumentos.map((arg: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{arg}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhum argumento gerado</p>
              )}
            </CardContent>
          </Card>

          {/* Diagnóstico GBP */}
          {analise?.diagnosticoGBP && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Diagnóstico Google Business</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analise.diagnosticoGBP.itens?.map((item: any, i: number) => (
                    <li key={i} className="border-l-2 border-l-red-500 pl-3">
                      <p className="font-medium text-sm">{item.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        Atual: {item.situacaoAtual} | Ideal: {item.ideal}
                      </p>
                      <p className="text-xs text-green-600 mt-1">{item.comoResolver}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Diagnóstico Site */}
          {analise?.diagnosticoSite && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Diagnóstico do Site</CardTitle>
              </CardHeader>
              <CardContent>
                {analise.diagnosticoSite.itens?.length > 0 ? (
                  <ul className="space-y-3">
                    {analise.diagnosticoSite.itens?.map((item: any, i: number) => (
                      <li key={i} className="border-l-2 border-l-yellow-500 pl-3">
                        <p className="font-medium text-sm">{item.titulo}</p>
                        <p className="text-xs text-muted-foreground">{item.situacaoAtual}</p>
                        <p className="text-xs text-green-600 mt-1">{item.comoResolver}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {lead.siteUrl ? "Sem problemas identificados" : "Cliente não possui site"}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna 3: Plano de Ação */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Plano de Ação
              </CardTitle>
            </CardHeader>
            <CardContent>
              {planoAcao.length > 0 ? (
                <div className="space-y-6">
                  {planoAcao.map((fase: any, i: number) => (
                    <div key={i} className="border-l-2 border-l-primary pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{fase.fase}</p>
                          <p className="text-xs text-muted-foreground">{fase.periodo}</p>
                        </div>
                      </div>
                      <ul className="space-y-1 ml-8">
                        {fase.acoes?.map((acao: string, j: number) => (
                          <li key={j} className="text-xs text-muted-foreground flex items-start gap-1">
                            <span>•</span>
                            <span>{acao}</span>
                          </li>
                        ))}
                      </ul>
                      {fase.entregaveis && (
                        <div className="ml-8 mt-2">
                          <p className="text-xs font-medium text-green-600">Entregáveis:</p>
                          <ul className="space-y-1">
                            {fase.entregaveis.map((e: string, k: number) => (
                              <li key={k} className="text-xs text-green-600 flex items-start gap-1">
                                <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                <span>{e}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhum plano gerado</p>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {lead.observacoes || "Nenhuma observação registrada"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
