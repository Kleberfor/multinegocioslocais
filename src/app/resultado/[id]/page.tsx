import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Phone,
  TrendingDown,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultadoPage({ params }: PageProps) {
  const { id } = await params;

  // Tentar buscar como Lead primeiro (novo fluxo)
  const lead = await prisma.lead.findUnique({
    where: { id },
  });

  if (lead) {
    // Renderizar resultado simplificado para Lead
    return <ResultadoLead lead={lead} />;
  }

  // Se não for Lead, tentar como Prospect (fluxo antigo - manter compatibilidade)
  const prospect = await prisma.prospect.findUnique({
    where: { id },
  });

  if (prospect) {
    // Redirecionar para fluxo antigo ou mostrar versão simplificada
    return <ResultadoProspectSimplificado prospect={prospect} />;
  }

  notFound();
}

// Componente para resultado de Lead (novo fluxo - apenas scores)
function ResultadoLead({ lead }: { lead: any }) {
  const scoreGeral = lead.scoreGeral || 0;
  const scoreGBP = lead.scoreGBP || 0;
  const scoreSite = lead.scoreSite || 0;
  const scoreRedes = lead.scoreRedes || 0;

  // Calcular perda estimada
  const perdaEstimada = Math.round((100 - scoreGeral) * 120);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600 border-green-500 bg-green-50";
    if (score >= 40) return "text-yellow-600 border-yellow-500 bg-yellow-50";
    return "text-red-600 border-red-500 bg-red-50";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return "Bom";
    if (score >= 40) return "Regular";
    return "Crítico";
  };

  const getBarColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container py-8 max-w-3xl">
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
        </div>

        {/* Score Principal */}
        <Card className="mb-6">
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-semibold text-muted-foreground mb-2">
              Seu Score de Visibilidade Digital
            </h1>

            <div className="flex justify-center mb-4">
              <div
                className={`w-32 h-32 rounded-full border-8 flex flex-col items-center justify-center ${getScoreColor(scoreGeral)}`}
              >
                <span className="text-4xl font-bold">{scoreGeral}</span>
                <span className="text-sm font-medium">/100</span>
              </div>
            </div>

            <div
              className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4 ${getScoreColor(scoreGeral)}`}
            >
              {getScoreLabel(scoreGeral)}
            </div>

            <p className="text-muted-foreground max-w-md mx-auto">
              {scoreGeral < 50
                ? "Sua presença digital precisa de atenção urgente. Você está perdendo clientes todos os dias."
                : scoreGeral < 70
                  ? "Há oportunidades significativas de melhoria que podem aumentar suas vendas."
                  : "Sua presença está boa, mas ainda há espaço para crescer."}
            </p>
          </CardContent>
        </Card>

        {/* Negócio */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{lead.negocio}</p>
                <p className="text-sm text-muted-foreground">{lead.enderecoGoogle}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scores por Área */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4">Análise por Área</h2>

            <div className="space-y-4">
              {/* Google Business */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Google Business Profile</span>
                  <span className={`font-semibold ${scoreGBP >= 70 ? "text-green-600" : scoreGBP >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                    {scoreGBP}/100
                  </span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getBarColor(scoreGBP)} transition-all`}
                    style={{ width: `${scoreGBP}%` }}
                  />
                </div>
              </div>

              {/* Site */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Site</span>
                  <span className={`font-semibold ${scoreSite >= 70 ? "text-green-600" : scoreSite >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                    {lead.siteUrl ? `${scoreSite}/100` : "Sem site"}
                  </span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getBarColor(scoreSite)} transition-all`}
                    style={{ width: `${scoreSite}%` }}
                  />
                </div>
              </div>

              {/* Redes Sociais */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Redes Sociais</span>
                  <span className={`font-semibold ${scoreRedes >= 70 ? "text-green-600" : scoreRedes >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                    {scoreRedes}/100
                  </span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getBarColor(scoreRedes)} transition-all`}
                    style={{ width: `${scoreRedes}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerta de Perda */}
        {scoreGeral < 70 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">
                    Você está perdendo clientes
                  </h3>
                  <p className="text-red-700 text-sm mb-2">
                    Com base na sua análise, estimamos que você está deixando de
                    faturar aproximadamente:
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    R$ {perdaEstimada.toLocaleString("pt-BR")}/mês
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    *Estimativa baseada no seu segmento e score atual
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Problemas Identificados (sem detalhes) */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">Problemas Identificados</h3>
                <p className="text-sm text-muted-foreground">
                  Nossa análise encontrou pontos de melhoria que estão afetando sua visibilidade.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {scoreGBP < 70 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Seu Google Business Profile precisa de otimização</span>
                </div>
              )}
              {scoreSite < 50 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span>{lead.siteUrl ? "Seu site tem problemas de performance" : "Você não possui site profissional"}</span>
                </div>
              )}
              {scoreRedes < 50 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>Sua presença em redes sociais pode melhorar</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>Há oportunidades para aumentar suas avaliações</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4 italic">
              Os detalhes completos e o plano de ação serão apresentados por nosso especialista.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">
              Quer resolver esses problemas?
            </h2>
            <p className="opacity-90 mb-6">
              Nossa equipe de especialistas vai entrar em contato para apresentar
              um plano personalizado para melhorar sua presença digital.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/5511999999999?text=Olá! Fiz a análise do meu negócio ${lead.negocio} e gostaria de saber mais sobre como melhorar minha presença digital.`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="secondary" className="w-full sm:w-auto font-semibold">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Falar com Especialista
                </Button>
              </a>
            </div>

            <p className="text-sm opacity-70 mt-4">
              <Phone className="w-4 h-4 inline mr-1" />
              Entraremos em contato em até 24 horas úteis
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link
            href="/analisar"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← Analisar outro negócio
          </Link>
        </div>
      </div>
    </div>
  );
}

// Componente para resultado de Prospect (fluxo antigo - versão simplificada)
function ResultadoProspectSimplificado({ prospect }: { prospect: any }) {
  const analise = prospect.analise as any;
  const score = analise?.score?.total || prospect.score || 0;

  const getScoreColor = (s: number) => {
    if (s >= 70) return "text-green-600 border-green-500 bg-green-50";
    if (s >= 40) return "text-yellow-600 border-yellow-500 bg-yellow-50";
    return "text-red-600 border-red-500 bg-red-50";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 70) return "Bom";
    if (s >= 40) return "Regular";
    return "Crítico";
  };

  const perdaEstimada = Math.round((100 - score) * 120);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container py-8 max-w-3xl">
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
        </div>

        {/* Score Principal */}
        <Card className="mb-6">
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-semibold text-muted-foreground mb-2">
              Seu Score de Visibilidade Digital
            </h1>

            <div className="flex justify-center mb-4">
              <div
                className={`w-32 h-32 rounded-full border-8 flex flex-col items-center justify-center ${getScoreColor(score)}`}
              >
                <span className="text-4xl font-bold">{score}</span>
                <span className="text-sm font-medium">/100</span>
              </div>
            </div>

            <div
              className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4 ${getScoreColor(score)}`}
            >
              {getScoreLabel(score)}
            </div>

            <p className="text-muted-foreground max-w-md mx-auto">
              {score < 50
                ? "Sua presença digital precisa de atenção urgente."
                : score < 70
                  ? "Há oportunidades significativas de melhoria."
                  : "Sua presença está boa, mas ainda há espaço para crescer."}
            </p>
          </CardContent>
        </Card>

        {/* Negócio */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{prospect.nome}</p>
                <p className="text-sm text-muted-foreground">{analise?.place?.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerta de Perda */}
        {score < 70 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">
                    Você está perdendo clientes
                  </h3>
                  <p className="text-red-700 text-sm mb-2">
                    Estimamos que você está deixando de faturar aproximadamente:
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    R$ {perdaEstimada.toLocaleString("pt-BR")}/mês
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">
              Quer melhorar sua presença digital?
            </h2>
            <p className="opacity-90 mb-6">
              Deixe seus dados para receber uma proposta personalizada.
            </p>

            <Link href={`/contratar/dados?prospect=${prospect.id}`}>
              <Button size="lg" variant="secondary" className="font-semibold">
                Quero Melhorar Meu Negócio
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link
            href="/analisar"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← Analisar outro negócio
          </Link>
        </div>
      </div>
    </div>
  );
}
