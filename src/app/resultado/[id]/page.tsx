import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getScoreDescription } from "@/lib/scoring";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Phone,
  Globe,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Info,
  Camera,
  MessageSquare,
  FileText,
  Shield,
  Lightbulb,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const categoryIcons: Record<string, any> = {
  info: Info,
  photos: Camera,
  engagement: MessageSquare,
  content: FileText,
  trust: Shield,
};

const priorityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-gray-100 text-gray-800 border-gray-200",
};

const priorityLabels: Record<string, string> = {
  critical: "Crítico",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

export default async function ResultadoPage({ params }: PageProps) {
  const { id } = await params;

  const prospect = await prisma.prospect.findUnique({
    where: { id },
  });

  if (!prospect) {
    notFound();
  }

  const analise = prospect.analise as {
    place: any;
    score: {
      total: number;
      grade: string;
      categories: any[];
      criticalIssues: any[];
      opportunities: any[];
      strengths: string[];
      summary: {
        totalChecks: number;
        passedChecks: number;
        criticalPassed: number;
        criticalTotal: number;
      };
    };
  };

  const { place, score } = analise;
  const scoreInfo = getScoreDescription(score.total);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container py-8">
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

        {/* Business Info + Score */}
        <div className="max-w-5xl mx-auto mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Business Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{place.name}</h1>
                  <div className="flex items-center text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{place.address}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    {place.phoneNumber && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {place.phoneNumber}
                      </div>
                    )}
                    {place.website && (
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-1" />
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Ver site
                        </a>
                      </div>
                    )}
                    {place.rating && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
                        {place.rating} ({place.userRatingsTotal} avaliações)
                      </div>
                    )}
                  </div>
                </div>

                {/* Score Display */}
                <div className="flex flex-col items-center lg:items-end">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-24 h-24 rounded-full border-8 ${
                        score.total >= 80
                          ? "border-green-500"
                          : score.total >= 60
                          ? "border-blue-500"
                          : score.total >= 40
                          ? "border-yellow-500"
                          : "border-red-500"
                      } flex items-center justify-center`}
                    >
                      <span className="text-3xl font-bold">{score.total}</span>
                    </div>
                    <div className="text-center lg:text-right">
                      <div
                        className={`text-2xl font-bold ${
                          score.total >= 80
                            ? "text-green-500"
                            : score.total >= 60
                            ? "text-blue-500"
                            : score.total >= 40
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {score.grade}
                      </div>
                      <div className={`font-semibold ${scoreInfo.color}`}>
                        {scoreInfo.label}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 max-w-sm text-center lg:text-right">
                    {score.summary.passedChecks} de {score.summary.totalChecks}{" "}
                    verificações passaram
                  </p>
                </div>
              </div>

              <p className="mt-4 text-muted-foreground border-t pt-4">
                {scoreInfo.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Issues Alert */}
        {score.criticalIssues && score.criticalIssues.length > 0 && (
          <div className="max-w-5xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800">
                    {score.criticalIssues.length} Problema(s) Crítico(s)
                    Encontrado(s)
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    Estes itens são essenciais e devem ser corrigidos
                    imediatamente para melhorar sua visibilidade no Google.
                  </p>
                  <ul className="mt-2 space-y-1">
                    {score.criticalIssues.slice(0, 3).map((issue: any, i: number) => (
                      <li key={i} className="text-sm text-red-700 flex items-center">
                        <XCircle className="w-4 h-4 mr-2" />
                        {issue.guideline.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="max-w-5xl mx-auto mb-8">
          <h2 className="text-xl font-bold mb-4">Análise por Categoria</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {score.categories.map((category: any) => {
              const Icon = categoryIcons[category.name] || Info;
              return (
                <Card key={category.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center">
                        <Icon className="w-5 h-5 mr-2 text-primary" />
                        {category.displayName}
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          category.status === "excellent"
                            ? "text-green-600"
                            : category.status === "good"
                            ? "text-blue-600"
                            : category.status === "average"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {category.score}/{category.maxScore}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Progress bar */}
                    <div className="w-full bg-muted rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          category.status === "excellent"
                            ? "bg-green-500"
                            : category.status === "good"
                            ? "bg-blue-500"
                            : category.status === "average"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {category.passedCount} de {category.totalCount} itens OK
                    </p>

                    {/* Check items */}
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {category.checks.slice(0, 5).map((check: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-start text-sm"
                        >
                          {check.passed ? (
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2 text-red-400 flex-shrink-0 mt-0.5" />
                          )}
                          <span
                            className={
                              check.passed
                                ? "text-muted-foreground"
                                : "text-foreground"
                            }
                          >
                            {check.guideline.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-2 mb-8">
          {/* Strengths */}
          {score.strengths && score.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Pontos Fortes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {score.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Resumo da Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {score.summary.passedChecks}
                  </div>
                  <div className="text-sm text-muted-foreground">Itens OK</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-red-500">
                    {score.summary.totalChecks - score.summary.passedChecks}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    A Melhorar
                  </div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {score.summary.criticalPassed}/{score.summary.criticalTotal}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Críticos OK
                  </div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{place.photos || 0}</div>
                  <div className="text-sm text-muted-foreground">Fotos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opportunities */}
        <div className="max-w-5xl mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                Oportunidades de Melhoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {score.opportunities.slice(0, 8).map((opp: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${priorityColors[opp.priority]}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium ${priorityColors[opp.priority]}`}
                          >
                            {priorityLabels[opp.priority]}
                          </span>
                          <h4 className="font-semibold">{opp.title}</h4>
                        </div>
                        <p className="text-sm opacity-80">{opp.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-current/10">
                      <p className="text-sm">
                        <strong>Como resolver:</strong> {opp.howToFix}
                      </p>
                      <p className="text-sm mt-1">
                        <strong>Impacto:</strong> {opp.impact}
                      </p>
                      {opp.googleTip && (
                        <p className="text-sm mt-1 italic">
                          💡 Dica do Google: {opp.googleTip}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {score.opportunities.length > 8 && (
                <p className="text-center text-muted-foreground mt-4">
                  + {score.opportunities.length - 8} outras oportunidades
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="max-w-5xl mx-auto mb-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">
                Quer melhorar sua presença digital?
              </h2>
              <p className="opacity-90 mb-6 max-w-2xl mx-auto">
                Nossa equipe especializada pode implementar todas essas
                melhorias baseadas nas diretrizes oficiais do Google para você
                atrair mais clientes.
              </p>
              <Link href={`/contratar/dados?prospect=${id}`}>
                <Button size="lg" variant="secondary" className="font-semibold">
                  Quero Melhorar Meu Negócio
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Análise baseada nas{" "}
            <a
              href="https://support.google.com/business/answer/7667250"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Diretrizes Oficiais do Google Business Profile
            </a>
          </p>
          <Link
            href="/analisar"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Analisar outro negócio
          </Link>
        </div>
      </div>
    </div>
  );
}
