import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Zap,
  Target,
  BarChart3,
  Phone,
  Mail,
} from "lucide-react";

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropostaProspectPage({ params }: PageProps) {
  const { id } = await params;

  const prospect = await prisma.prospect.findUnique({
    where: { id },
  });

  if (!prospect) {
    notFound();
  }

  const analise = prospect.analise as AnaliseData | null;
  const scoreGeral = prospect.score || 50;

  // Valores com base no valor estimado ou padrão
  const valorEstimado = prospect.valorEstimado ? Number(prospect.valorEstimado) : 2000;
  const VALOR_MENSAL_BASE = 300;

  // Calcular perda estimada (para ROI fazer sentido)
  const perdaEstimada = Math.round((100 - scoreGeral) * 50);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="MultiNegócios Locais"
              width={180}
              height={40}
              className="h-10 w-auto mx-auto mb-6"
            />
          </Link>
          <h1 className="text-3xl font-bold mb-2">Proposta Comercial</h1>
          <p className="text-muted-foreground">
            Preparamos um plano exclusivo para <strong>{prospect.negocio || prospect.nome}</strong>
          </p>
        </div>

        {/* Dados do Cliente */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{prospect.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Negócio</p>
                <p className="font-medium">{prospect.negocio || "-"}</p>
              </div>
              {prospect.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{prospect.email}</span>
                </div>
              )}
              {prospect.telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{prospect.telefone}</span>
                </div>
              )}
              {(prospect.cidade || prospect.estado) && (
                <div>
                  <p className="text-sm text-muted-foreground">Localização</p>
                  <p className="font-medium">
                    {prospect.cidade && prospect.estado
                      ? `${prospect.cidade}/${prospect.estado}`
                      : prospect.cidade || prospect.estado}
                  </p>
                </div>
              )}
              {prospect.segmento && (
                <div>
                  <p className="text-sm text-muted-foreground">Segmento</p>
                  <p className="font-medium">{prospect.segmento}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Score Resumo */}
        {prospect.score !== null && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Score Atual</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-4xl font-bold ${
                      scoreGeral >= 70 ? "text-green-600" :
                      scoreGeral >= 40 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {scoreGeral}
                    </span>
                    <span className="text-muted-foreground">/100</span>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    <span className="text-4xl font-bold text-green-600">85+</span>
                    <span className="text-muted-foreground">/100</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Meta após otimização
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Oportunidade</p>
                  <p className="text-3xl font-bold text-primary">
                    {100 - scoreGeral}%
                  </p>
                  <p className="text-sm text-muted-foreground">de melhoria</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ROI Estimado */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="w-5 h-5" />
              Retorno Estimado do Investimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-green-700" />
                </div>
                <p className="text-3xl font-bold text-green-700">+10</p>
                <p className="text-sm text-green-600">clientes/mês</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-green-700" />
                </div>
                <p className="text-3xl font-bold text-green-700">
                  R$ {perdaEstimada.toLocaleString("pt-BR")}
                </p>
                <p className="text-sm text-green-600">faturamento adicional/mês</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-green-700" />
                </div>
                <p className="text-3xl font-bold text-green-700">
                  {Math.max(Math.ceil(valorEstimado / perdaEstimada), 1)}
                </p>
                <p className="text-sm text-green-600">meses para retorno</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnóstico */}
        {analise && (analise.gbp || analise.site || analise.redes) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Diagnóstico e Oportunidades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analise.gbp && analise.gbp.problemas && analise.gbp.problemas.length > 0 && (
                <DiagnosticoItem
                  area="Google Business Profile"
                  problemas={analise.gbp.problemas}
                  solucao={analise.gbp.comoResolver}
                />
              )}
              {analise.site && analise.site.problemas && analise.site.problemas.length > 0 && (
                <DiagnosticoItem
                  area="Site"
                  problemas={analise.site.problemas}
                  solucao={analise.site.comoResolver}
                />
              )}
              {analise.redes && analise.redes.problemas && analise.redes.problemas.length > 0 && (
                <DiagnosticoItem
                  area="Redes Sociais"
                  problemas={analise.redes.problemas}
                  solucao={analise.redes.comoResolver}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Plano de Ação */}
        {analise?.planoAcao && analise.planoAcao.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Plano de Ação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analise.planoAcao.map((fase) => (
                  <div key={fase.fase} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                        {fase.fase}
                      </span>
                      <span className="font-medium">Fase {fase.fase}</span>
                      {fase.periodo && (
                        <span className="text-sm text-muted-foreground">({fase.periodo})</span>
                      )}
                    </div>
                    {fase.acoes && fase.acoes.length > 0 && (
                      <ul className="space-y-1 ml-10">
                        {fase.acoes.map((acao, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            {acao}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Argumentos de Fechamento */}
        {analise?.argumentos && analise.argumentos.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Por que investir agora?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analise.argumentos.map((arg, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{arg}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Justificativas Padrão */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Benefícios do Investimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <JustificativaItem text={`Você está deixando de faturar aproximadamente R$ ${Math.round((100 - scoreGeral) * 120).toLocaleString("pt-BR")}/mês por não estar visível online`} />
              <JustificativaItem text="97% dos consumidores pesquisam online antes de comprar de negócios locais" />
              <JustificativaItem text="Negócios com perfil otimizado recebem 7x mais cliques que perfis básicos" />
              <JustificativaItem text="Investimento se paga em média em 2-3 meses com os novos clientes" />
              <JustificativaItem text="Suporte especializado durante todo o processo de otimização" />
            </div>
          </CardContent>
        </Card>

        {/* Proposta de Valor */}
        <Card className="mb-6 border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Investimento
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Valor Total</p>
              <p className="text-5xl font-bold text-primary">
                R$ {valorEstimado.toLocaleString("pt-BR")}
              </p>
            </div>

            {/* Parcelamento */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <ParcelamentoOption parcelas={1} valor={valorEstimado} destaque />
              <ParcelamentoOption parcelas={3} valor={valorEstimado} />
              <ParcelamentoOption parcelas={6} valor={valorEstimado} />
            </div>

            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                + Gestão Mensal (opcional)
              </p>
              <p className="text-xl font-semibold">
                R$ {VALOR_MENSAL_BASE.toLocaleString("pt-BR")}/mês
              </p>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Pagamento seguro via PIX, Cartão ou Boleto
            </p>
          </CardContent>
        </Card>

        {/* Garantia */}
        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Garantia de Satisfação</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Se em 30 dias você não perceber melhoria na sua presença digital,
              devolvemos 100% do seu investimento.
            </p>
          </CardContent>
        </Card>

        {/* CTA - Aceitar Proposta */}
        <Card className="mb-8 border-2 border-primary bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Pronto para transformar seu negócio?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Clique no botão abaixo para aceitar esta proposta e iniciar o processo de contratação.
            </p>
            <Link href={`/contratar/dados?prospect=${id}&from=proposta&valor=${valorEstimado}`}>
              <Button size="lg" className="gap-2 text-lg px-8 py-6">
                <CheckCircle className="w-5 h-5" />
                Aceitar Proposta e Contratar
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-4">
              Você será direcionado para preencher seus dados e assinar o contrato
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Proposta gerada em{" "}
            {new Date().toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              timeZone: "America/Sao_Paulo",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// Componentes auxiliares
function DiagnosticoItem({ area, problemas, solucao }: {
  area: string;
  problemas: string[];
  solucao?: string;
}) {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-semibold mb-2 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-600" />
        {area}
      </h4>
      <ul className="space-y-1 mb-3">
        {problemas.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-yellow-600">•</span>
            {p}
          </li>
        ))}
      </ul>
      {solucao && (
        <div className="bg-green-50 p-3 rounded text-sm">
          <span className="font-medium text-green-800">Solução: </span>
          <span className="text-green-700">{solucao}</span>
        </div>
      )}
    </div>
  );
}

function JustificativaItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function ParcelamentoOption({ parcelas, valor, destaque = false }: {
  parcelas: number;
  valor: number;
  destaque?: boolean;
}) {
  const valorParcela = Math.round(valor / parcelas);

  return (
    <div className={`p-4 rounded-lg border-2 ${
      destaque ? "border-primary bg-primary/10" : "border-muted"
    }`}>
      <p className="font-bold text-lg">{parcelas}x</p>
      <p className="text-sm">R$ {valorParcela.toLocaleString("pt-BR")}</p>
      {parcelas === 1 && (
        <p className="text-xs text-primary mt-1">À vista</p>
      )}
    </div>
  );
}
