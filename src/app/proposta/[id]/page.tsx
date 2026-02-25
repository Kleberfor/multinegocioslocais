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
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropostaPage({ params }: PageProps) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
  });

  if (!lead || !lead.proposta) {
    notFound();
  }

  const proposta = lead.proposta as any;
  const scoreGeral = lead.scoreGeral || 0;

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
          <h1 className="text-3xl font-bold mb-2">Proposta Personalizada</h1>
          <p className="text-muted-foreground">
            Preparamos um plano exclusivo para <strong>{lead.negocio}</strong>
          </p>
        </div>

        {/* Score Resumo */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Seu Score Atual</p>
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
                  {proposta.oportunidade || (100 - scoreGeral)}%
                </p>
                <p className="text-sm text-muted-foreground">de melhoria</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <p className="text-3xl font-bold text-green-700">
                  +{proposta.roiEstimado?.clientesAdicionaisMes || 15}
                </p>
                <p className="text-sm text-green-600">clientes/mês</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-green-700" />
                </div>
                <p className="text-3xl font-bold text-green-700">
                  R$ {(proposta.roiEstimado?.faturamentoAdicionalMes || 8000).toLocaleString("pt-BR")}
                </p>
                <p className="text-sm text-green-600">faturamento adicional/mês</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-green-700" />
                </div>
                <p className="text-3xl font-bold text-green-700">
                  {proposta.roiEstimado?.retornoInvestimentoMeses || 3}
                </p>
                <p className="text-sm text-green-600">meses para retorno</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prioridades de Ação */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Plano de Ação Prioritário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <PrioridadeItem
                area="Google Business Profile"
                impacto={((lead.scoreGBP as number) || 0) < 40 ? "critico" : "alto"}
                descricao="Otimização completa do seu perfil para aparecer nas buscas locais"
                potencialGanho="+40% de visibilidade"
                show={((lead.scoreGBP as number) || 0) < 70}
              />
              <PrioridadeItem
                area={lead.siteUrl ? "Performance do Site" : "Criação de Site"}
                impacto="alto"
                descricao={lead.siteUrl
                  ? "Melhorias de velocidade e SEO para converter mais visitantes"
                  : "Site profissional otimizado para converter visitantes em clientes"}
                potencialGanho="+60% de conversões"
                show={((lead.scoreSite as number) || 0) < 50}
              />
              <PrioridadeItem
                area="Redes Sociais"
                impacto="medio"
                descricao="Estratégia integrada de presença nas principais redes"
                potencialGanho="+25% de engajamento"
                show={((lead.scoreRedes as number) || 0) < 50}
              />
              <PrioridadeItem
                area="Gestão de Avaliações"
                impacto="alto"
                descricao="Estratégia para aumentar avaliações positivas"
                potencialGanho="+50 avaliações em 90 dias"
                show={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Justificativas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Por que este investimento vale a pena?
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
                R$ {(proposta.valorImplantacao || Number(lead.valorSugerido) || 6000).toLocaleString("pt-BR")}
              </p>
            </div>

            {/* Parcelamento */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <ParcelamentoOption parcelas={1} valor={proposta.valorImplantacao || Number(lead.valorSugerido) || 6000} destaque />
              <ParcelamentoOption parcelas={6} valor={proposta.valorImplantacao || Number(lead.valorSugerido) || 6000} />
              <ParcelamentoOption parcelas={12} valor={proposta.valorImplantacao || Number(lead.valorSugerido) || 6000} />
            </div>

            {proposta.valorMensal > 0 && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  + Gestão Mensal (opcional)
                </p>
                <p className="text-xl font-semibold">
                  R$ {proposta.valorMensal.toLocaleString("pt-BR")}/mês
                </p>
              </div>
            )}

            <Link href={`/contratar/dados?lead=${lead.id}&from=proposta`}>
              <Button size="lg" className="w-full md:w-auto px-12 text-lg h-14">
                Quero Contratar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

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

        {/* Footer */}
        <div className="text-center">
          <Link
            href={`/resultado/${lead.id}`}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← Voltar para análise
          </Link>
        </div>
      </div>
    </div>
  );
}

// Componentes auxiliares
function PrioridadeItem({ area, impacto, descricao, potencialGanho, show }: {
  area: string;
  impacto: string;
  descricao: string;
  potencialGanho: string;
  show: boolean;
}) {
  if (!show) return null;

  return (
    <div className={`flex items-start gap-4 p-4 rounded-lg border ${
      impacto === "critico" ? "border-red-200 bg-red-50" :
      impacto === "alto" ? "border-orange-200 bg-orange-50" :
      impacto === "medio" ? "border-yellow-200 bg-yellow-50" :
      "border-gray-200 bg-gray-50"
    }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        impacto === "critico" ? "bg-red-100" :
        impacto === "alto" ? "bg-orange-100" :
        impacto === "medio" ? "bg-yellow-100" :
        "bg-gray-100"
      }`}>
        {impacto === "critico" ? (
          <AlertTriangle className="w-5 h-5 text-red-600" />
        ) : (
          <Zap className="w-5 h-5 text-orange-600" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h4 className="font-semibold">{area}</h4>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            impacto === "critico" ? "bg-red-200 text-red-800" :
            impacto === "alto" ? "bg-orange-200 text-orange-800" :
            impacto === "medio" ? "bg-yellow-200 text-yellow-800" :
            "bg-gray-200 text-gray-800"
          }`}>
            Impacto {impacto}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{descricao}</p>
        <p className="text-sm text-green-600 mt-1 font-medium">
          Potencial: {potencialGanho}
        </p>
      </div>
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
