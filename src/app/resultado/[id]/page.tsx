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
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

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
      categories: any[];
      opportunities: any[];
      strengths: string[];
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

        {/* Business Info */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{place.name}</h1>
                  <div className="flex items-center text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {place.address}
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

                {/* Score Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-28 h-28 rounded-full border-8 ${
                      score.total >= 80
                        ? "border-green-500"
                        : score.total >= 60
                        ? "border-blue-500"
                        : score.total >= 40
                        ? "border-yellow-500"
                        : "border-red-500"
                    } flex items-center justify-center`}
                  >
                    <span className="text-4xl font-bold">{score.total}</span>
                  </div>
                  <span className={`mt-2 font-semibold ${scoreInfo.color}`}>
                    {scoreInfo.label}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-muted-foreground">{scoreInfo.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
          {/* Categories Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Análise por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {score.categories.map((category: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{category.name}</span>
                      <span>
                        {category.score}/{category.maxScore}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
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
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.details}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strengths */}
          {score.strengths.length > 0 && (
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

          {/* Opportunities */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <AlertCircle className="w-5 h-5 mr-2" />
                Oportunidades de Melhoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {score.opportunities.map((opp: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      opp.priority === "high"
                        ? "border-red-200 bg-red-50"
                        : opp.priority === "medium"
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold">{opp.title}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          opp.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : opp.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {opp.priority === "high"
                          ? "Alta"
                          : opp.priority === "medium"
                          ? "Média"
                          : "Baixa"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {opp.description}
                    </p>
                    <p className="text-sm font-medium mt-2">{opp.impact}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto mt-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">
                Quer melhorar sua presença digital?
              </h2>
              <p className="opacity-90 mb-6">
                Nossa equipe pode ajudar você a implementar todas essas melhorias
                e atrair mais clientes.
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

        {/* Back Link */}
        <div className="text-center mt-8">
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
