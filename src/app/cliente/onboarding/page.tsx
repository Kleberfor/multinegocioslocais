"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";

// Importar componentes das etapas
import EtapaBoasVindas from "@/components/onboarding/EtapaBoasVindas";
import EtapaPerfilNegocio from "@/components/onboarding/EtapaPerfilNegocio";
import EtapaRedesSociais from "@/components/onboarding/EtapaRedesSociais";
import EtapaGoogleBusiness from "@/components/onboarding/EtapaGoogleBusiness";
import EtapaObjetivos from "@/components/onboarding/EtapaObjetivos";
import EtapaPreferencias from "@/components/onboarding/EtapaPreferencias";
import EtapaConclusao from "@/components/onboarding/EtapaConclusao";

interface OnboardingData {
  id: string;
  clienteId: string;
  completado: boolean;
  etapaAtual: number;
  [key: string]: any;
}

interface ClienteData {
  id: string;
  nome: string;
  email: string;
  negocio: string;
  onboarding?: OnboardingData;
}

const ETAPAS = [
  { numero: 1, titulo: "Boas-vindas", icone: "👋" },
  { numero: 2, titulo: "Perfil do Negócio", icone: "🏪" },
  { numero: 3, titulo: "Redes Sociais", icone: "📱" },
  { numero: 4, titulo: "Google Business", icone: "📍" },
  { numero: 5, titulo: "Objetivos", icone: "🎯" },
  { numero: 6, titulo: "Preferências", icone: "⚙️" },
  { numero: 7, titulo: "Conclusão", icone: "🎉" },
];

function OnboardingContent() {
  const searchParams = useSearchParams();
  const clienteId = searchParams.get("cliente");

  const [cliente, setCliente] = useState<ClienteData | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (clienteId) {
      loadOnboarding();
    }
  }, [clienteId]);

  const loadOnboarding = async () => {
    try {
      const response = await fetch(`/api/onboarding/${clienteId}`);
      const data = await response.json();

      if (response.ok) {
        setCliente(data.cliente);
        setOnboarding(data.onboarding);
        setEtapaAtual(data.onboarding?.etapaAtual || 1);

        // Se já foi completado, redirecionar para dashboard
        if (data.onboarding?.completado) {
          window.location.href = `/cliente/dashboard?cliente=${clienteId}`;
        }
      }
    } catch (error) {
      console.error("Erro ao carregar onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const salvarProgresso = async (dados: Record<string, any>, proximaEtapa?: number) => {
    if (!clienteId) return false;

    setIsSaving(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId,
          etapaAtual: proximaEtapa || etapaAtual,
          ...dados,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOnboarding(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const proximaEtapa = async (dados: Record<string, any>) => {
    const sucesso = await salvarProgresso(dados, etapaAtual + 1);
    if (sucesso) {
      setFormData({ ...formData, ...dados });
      setEtapaAtual(etapaAtual + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const etapaAnterior = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const pularEtapa = async () => {
    await salvarProgresso({}, etapaAtual + 1);
    setEtapaAtual(etapaAtual + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderEtapa = () => {
    const props = {
      onProximo: proximaEtapa,
      onPular: pularEtapa,
      isSaving,
      cliente,
      onboarding,
      formData,
    };

    switch (etapaAtual) {
      case 1:
        return <EtapaBoasVindas {...props} />;
      case 2:
        return <EtapaPerfilNegocio {...props} />;
      case 3:
        return <EtapaRedesSociais {...props} />;
      case 4:
        return <EtapaGoogleBusiness {...props} />;
      case 5:
        return <EtapaObjetivos {...props} />;
      case 6:
        return <EtapaPreferencias {...props} />;
      case 7:
        return <EtapaConclusao {...props} clienteId={clienteId} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!clienteId || !cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Cliente não encontrado
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progresso = ((etapaAtual - 1) / (ETAPAS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-background to-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container max-w-4xl py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="MultiNegócios Locais"
                width={140}
                height={30}
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center space-x-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">
                Olá, <strong>{cliente.nome}</strong>
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Etapa {etapaAtual} de {ETAPAS.length}</span>
              <span>{Math.round(progresso)}% concluído</span>
            </div>
            <Progress value={progresso} className="h-2" />
          </div>

          {/* Stepper */}
          <div className="hidden md:flex justify-between mt-4">
            {ETAPAS.map((etapa) => (
              <div
                key={etapa.numero}
                className={`flex flex-col items-center space-y-1 ${
                  etapa.numero === etapaAtual
                    ? "text-primary font-medium"
                    : etapa.numero < etapaAtual
                    ? "text-green-600"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    etapa.numero === etapaAtual
                      ? "bg-primary/10 ring-2 ring-primary"
                      : etapa.numero < etapaAtual
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  {etapa.numero < etapaAtual ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{etapa.icone}</span>
                  )}
                </div>
                <span className="text-xs text-center max-w-[80px] leading-tight">
                  {etapa.titulo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo da etapa */}
      <div className="container max-w-3xl py-8">
        {renderEtapa()}
      </div>

      {/* Navegação (rodapé fixo) */}
      {etapaAtual > 1 && etapaAtual < ETAPAS.length && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="container max-w-3xl flex justify-between">
            <Button
              variant="ghost"
              onClick={etapaAnterior}
              disabled={isSaving}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
