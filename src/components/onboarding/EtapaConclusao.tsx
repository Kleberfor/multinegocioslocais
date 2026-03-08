"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  PartyPopper,
  CheckCircle2,
  ArrowRight,
  Calendar,
  MessageCircle,
  Loader2,
} from "lucide-react";

interface Props {
  onProximo: (dados: Record<string, any>) => Promise<void>;
  isSaving: boolean;
  cliente?: {
    nome: string;
  };
  clienteId?: string | null;
}

export default function EtapaConclusao({
  onProximo,
  isSaving,
  cliente,
  clienteId,
}: Props) {
  const [finalizando, setFinalizando] = useState(false);

  const handleFinalizar = async () => {
    setFinalizando(true);

    // Marcar onboarding como completado
    await onProximo({
      etapa7Completa: true,
      completado: true,
      tourRealizado: false,
      consultoriaAgendada: false,
    });

    // Redirecionar para dashboard
    setTimeout(() => {
      window.location.href = `/cliente/dashboard?cliente=${clienteId}`;
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto">
          <PartyPopper className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-4xl font-bold">
          Parabéns, {cliente?.nome}! 🎉
        </h1>

        <p className="text-xl text-muted-foreground">
          Seu onboarding está completo! Agora é hora de ver a magia acontecer.
        </p>
      </div>

      {/* Resumo */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-lg mb-2">Tudo configurado!</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Perfil do negócio completo</li>
                <li>✓ Redes sociais conectadas</li>
                <li>✓ Objetivos definidos</li>
                <li>✓ Preferências configuradas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próximos Passos */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">O que acontece agora?</h2>

          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-medium text-primary">1</span>
              </div>
              <div>
                <p className="font-semibold">Análise Profunda</p>
                <p className="text-sm text-muted-foreground">
                  Nossa equipe está fazendo uma análise detalhada da sua presença
                  digital para criar uma estratégia personalizada
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-medium text-primary">2</span>
              </div>
              <div>
                <p className="font-semibold">Primeira Consultoria</p>
                <p className="text-sm text-muted-foreground">
                  Em até 24 horas, nosso especialista entrará em contato para
                  agendar a primeira consultoria
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-medium text-primary">3</span>
              </div>
              <div>
                <p className="font-semibold">Implementação</p>
                <p className="text-sm text-muted-foreground">
                  Começaremos a otimizar seu Google Business Profile e
                  implementar as melhorias planejadas
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-medium text-primary">4</span>
              </div>
              <div>
                <p className="font-semibold">Acompanhamento</p>
                <p className="text-sm text-muted-foreground">
                  Monitore seu progresso em tempo real pelo dashboard e
                  receba relatórios regulares
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-semibold">Agendar Consultoria</p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Escolha o melhor dia e horário para sua primeira consultoria
            </p>
            <Button variant="outline" className="w-full" disabled>
              Em breve disponível
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold">Falar no WhatsApp</p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Tire suas dúvidas direto com nossa equipe
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open("https://wa.me/5511916682510", "_blank")}
            >
              Abrir WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Botão Principal */}
      <div className="flex justify-center pt-6">
        <Button
          size="lg"
          onClick={handleFinalizar}
          disabled={isSaving || finalizando}
          className="px-12"
        >
          {finalizando ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Preparando seu dashboard...
            </>
          ) : (
            <>
              Ir para o Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
