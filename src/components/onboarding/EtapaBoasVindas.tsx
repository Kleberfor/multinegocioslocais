"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, TrendingUp, Target, Rocket } from "lucide-react";

interface Props {
  onProximo: (dados: Record<string, any>) => Promise<void>;
  isSaving: boolean;
  cliente?: {
    nome: string;
    negocio: string;
  };
}

export default function EtapaBoasVindas({ onProximo, isSaving, cliente }: Props) {
  const handleContinuar = async () => {
    await onProximo({
      etapa1Completa: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-4xl font-bold">
          Bem-vindo(a), {cliente?.nome}! 🎉
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Você deu o primeiro passo para transformar a presença digital do{" "}
          <strong>{cliente?.negocio}</strong>. Estamos animados para essa jornada!
        </p>
      </div>

      {/* Cards de benefícios */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Mais Visibilidade</h3>
            <p className="text-sm text-muted-foreground">
              Apareça nas primeiras posições quando clientes procurarem por você
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Mais Clientes</h3>
            <p className="text-sm text-muted-foreground">
              Atraia clientes qualificados que estão prontos para comprar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
              <Rocket className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Crescimento Real</h3>
            <p className="text-sm text-muted-foreground">
              Resultados mensuráveis mês a mês com nosso acompanhamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* O que vamos fazer */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-4">
            O que vamos fazer nos próximos minutos?
          </h2>

          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-primary">1</span>
              </div>
              <div>
                <h3 className="font-medium">Conhecer seu negócio melhor</h3>
                <p className="text-sm text-muted-foreground">
                  Horários, serviços, diferenciais - tudo que torna você único
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-primary">2</span>
              </div>
              <div>
                <h3 className="font-medium">Conectar suas plataformas</h3>
                <p className="text-sm text-muted-foreground">
                  Google, redes sociais - centralizar tudo em um só lugar
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-primary">3</span>
              </div>
              <div>
                <h3 className="font-medium">Definir seus objetivos</h3>
                <p className="text-sm text-muted-foreground">
                  Metas claras para guiar nossa estratégia de crescimento
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-primary">4</span>
              </div>
              <div>
                <h3 className="font-medium">Configurar seu dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Acesso ao painel onde acompanhará todo o progresso
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tempo estimado */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-2xl">⏱️</span>
          </div>
          <div>
            <p className="font-medium">Tempo estimado: 5-7 minutos</p>
            <p className="text-sm text-muted-foreground">
              Você pode pausar e voltar depois a qualquer momento
            </p>
          </div>
        </div>
      </div>

      {/* Botão continuar */}
      <div className="flex justify-center pt-6">
        <Button
          size="lg"
          onClick={handleContinuar}
          disabled={isSaving}
          className="px-12"
        >
          {isSaving ? "Salvando..." : "Vamos começar! 🚀"}
        </Button>
      </div>
    </div>
  );
}
