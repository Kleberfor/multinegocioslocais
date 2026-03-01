import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Send,
  Mail,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { SendScoreButtons } from "@/components/admin/send-score-buttons";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface AnaliseData {
  problemas?: string[];
  oportunidades?: string[];
  recomendacoes?: string[];
  scoreGBP?: number;
  scoreSite?: number;
  scoreRedes?: number;
}

export default async function ProspectScorePage({ params }: PageProps) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const prospect = await prisma.prospect.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      negocio: true,
      score: true,
      analise: true,
    },
  });

  if (!prospect) {
    notFound();
  }

  if (prospect.score === null) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/admin/prospects/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Score de {prospect.nome}</h1>
            <p className="text-muted-foreground">{prospect.negocio}</p>
          </div>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Score não disponível</h2>
            <p className="text-muted-foreground mb-6">
              Este prospect ainda não passou pela análise de presença digital.
            </p>
            <Link href={`/analisar`}>
              <Button>
                <BarChart3 className="w-4 h-4 mr-2" />
                Fazer Análise
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const analise = prospect.analise as AnaliseData | null;
  const score = prospect.score;

  const getScoreColor = (s: number) => {
    if (s >= 70) return "text-green-600 bg-green-100";
    if (s >= 40) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 70) return "Bom";
    if (s >= 40) return "Regular";
    return "Crítico";
  };

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/resultado/${prospect.id}`;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/admin/prospects/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Score de {prospect.nome}</h1>
            <p className="text-muted-foreground">{prospect.negocio}</p>
          </div>
        </div>
        <Link href={publicUrl} target="_blank">
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Página Pública
          </Button>
        </Link>
      </div>

      {/* Score Principal */}
      <Card className="mb-6">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold ${getScoreColor(
                  score
                )}`}
              >
                {score}
              </div>
              <p className="mt-2 font-medium">{getScoreLabel(score)}</p>
            </div>
            <div className="text-left">
              {score >= 70 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-lg font-medium">
                    Presença digital acima da média
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="w-6 h-6" />
                  <span className="text-lg font-medium">
                    Oportunidade de melhorias
                  </span>
                </div>
              )}
              <p className="text-muted-foreground mt-2">
                Pontuação baseada na análise de presença digital do negócio.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enviar Score */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Send className="w-5 h-5" />
            Enviar Score para o Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Envie o resultado da análise para o cliente com um CTA para melhorar
            o negócio.
          </p>
          <SendScoreButtons
            prospectId={prospect.id}
            prospectNome={prospect.nome}
            prospectEmail={prospect.email}
            prospectTelefone={prospect.telefone}
            score={score}
            publicUrl={publicUrl}
          />
        </CardContent>
      </Card>

      {/* Detalhes da Análise */}
      {analise && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Problemas */}
          {analise.problemas && analise.problemas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  Problemas Identificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analise.problemas.map((problema, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{problema}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Oportunidades */}
          {analise.oportunidades && analise.oportunidades.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  Oportunidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analise.oportunidades.map((oportunidade, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{oportunidade}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recomendações */}
          {analise.recomendacoes && analise.recomendacoes.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
                  <BarChart3 className="w-5 h-5" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analise.recomendacoes.map((recomendacao, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recomendacao}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
