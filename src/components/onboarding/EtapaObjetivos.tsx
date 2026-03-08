"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Target, ChevronRight, Loader2, TrendingUp, Users, Star } from "lucide-react";

interface Props {
  onProximo: (dados: Record<string, any>) => Promise<void>;
  onPular: () => void;
  isSaving: boolean;
  onboarding?: any;
}

const OBJETIVOS = [
  {
    id: "MAIS_CLIENTES",
    titulo: "Atrair Mais Clientes",
    descricao: "Aumentar o número de clientes novos todo mês",
    icone: Users,
    cor: "from-blue-500 to-blue-600",
  },
  {
    id: "MELHOR_REPUTACAO",
    titulo: "Melhorar Reputação",
    descricao: "Mais avaliações positivas e melhor imagem online",
    icone: Star,
    cor: "from-yellow-500 to-orange-500",
  },
  {
    id: "AUMENTAR_FATURAMENTO",
    titulo: "Aumentar Faturamento",
    descricao: "Crescer vendas e receita do negócio",
    icone: TrendingUp,
    cor: "from-green-500 to-green-600",
  },
];

const PRAZOS = [
  { id: "3_MESES", label: "3 meses" },
  { id: "6_MESES", label: "6 meses" },
  { id: "12_MESES", label: "12 meses" },
];

export default function EtapaObjetivos({
  onProximo,
  onPular,
  isSaving,
  onboarding,
}: Props) {
  const [objetivoPrincipal, setObjetivoPrincipal] = useState(
    onboarding?.objetivoPrincipal || ""
  );
  const [metaClientes, setMetaClientes] = useState(
    onboarding?.metaClientes?.toString() || ""
  );
  const [prazoMeta, setPrazoMeta] = useState(
    onboarding?.prazoMeta || "6_MESES"
  );

  const handleContinuar = async () => {
    await onProximo({
      etapa5Completa: true,
      objetivoPrincipal,
      metaClientes: metaClientes ? parseInt(metaClientes) : null,
      prazoMeta,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Seus Objetivos</h1>
        <p className="text-muted-foreground">
          Defina metas claras para guiarmos nossa estratégia
        </p>
      </div>

      {/* Objetivo Principal */}
      <div className="space-y-3">
        <Label className="text-base">Qual é seu objetivo principal?</Label>
        <div className="grid gap-3">
          {OBJETIVOS.map((obj) => {
            const Icone = obj.icone;
            return (
              <Card
                key={obj.id}
                className={`cursor-pointer transition-all ${
                  objetivoPrincipal === obj.id
                    ? "ring-2 ring-primary shadow-md"
                    : "hover:shadow"
                }`}
                onClick={() => setObjetivoPrincipal(obj.id)}
              >
                <CardContent className="p-4 flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${obj.cor} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{obj.titulo}</p>
                    <p className="text-sm text-muted-foreground">{obj.descricao}</p>
                  </div>
                  {objetivoPrincipal === obj.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Meta de Clientes */}
      {objetivoPrincipal === "MAIS_CLIENTES" && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meta">
                Quantos novos clientes por mês você quer atrair?
              </Label>
              <Input
                id="meta"
                type="number"
                placeholder="Ex: 50"
                value={metaClientes}
                onChange={(e) => setMetaClientes(e.target.value)}
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Seja realista, mas ambicioso. Vamos trabalhar juntos para alcançar!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prazo */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <Label>Em quanto tempo quer alcançar essa meta?</Label>
          <RadioGroup value={prazoMeta} onValueChange={setPrazoMeta}>
            <div className="flex gap-3">
              {PRAZOS.map((prazo) => (
                <div
                  key={prazo.id}
                  className="flex-1"
                  onClick={() => setPrazoMeta(prazo.id)}
                >
                  <div
                    className={`p-4 rounded-lg border-2 text-center cursor-pointer transition-all ${
                      prazoMeta === prazo.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value={prazo.id} id={prazo.id} className="sr-only" />
                    <p className="font-semibold">{prazo.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex justify-between items-center pt-4 pb-16 md:pb-4">
        <Button variant="ghost" onClick={onPular} disabled={isSaving}>
          Pular esta etapa
        </Button>

        <Button
          onClick={handleContinuar}
          disabled={isSaving || !objetivoPrincipal}
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              Continuar
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
