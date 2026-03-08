"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Store, Clock, Sparkles, ChevronRight, Loader2 } from "lucide-react";

interface Props {
  onProximo: (dados: Record<string, any>) => Promise<void>;
  onPular: () => void;
  isSaving: boolean;
  cliente?: {
    negocio: string;
  } | null;
  onboarding?: any;
}

const DIAS_SEMANA = [
  { id: "seg", label: "Seg" },
  { id: "ter", label: "Ter" },
  { id: "qua", label: "Qua" },
  { id: "qui", label: "Qui" },
  { id: "sex", label: "Sex" },
  { id: "sab", label: "Sáb" },
  { id: "dom", label: "Dom" },
];

const SERVICOS_COMUNS = [
  "Atendimento Presencial",
  "Delivery",
  "Agendamento Online",
  "Pagamento por PIX",
  "Cartão de Crédito",
  "Estacionamento",
  "Wi-Fi Gratuito",
  "Acessibilidade",
];

export default function EtapaPerfilNegocio({
  onProximo,
  onPular,
  isSaving,
  cliente,
  onboarding,
}: Props) {
  const [horarioAbertura, setHorarioAbertura] = useState(
    onboarding?.horarioAbertura || "08:00"
  );
  const [horarioFechamento, setHorarioFechamento] = useState(
    onboarding?.horarioFechamento || "18:00"
  );
  const [diasFuncionamento, setDiasFuncionamento] = useState<string[]>(
    onboarding?.diasFuncionamento || ["seg", "ter", "qua", "qui", "sex"]
  );
  const [servicos, setServicos] = useState<string[]>(
    onboarding?.servicos || []
  );
  const [diferenciais, setDiferenciais] = useState(
    onboarding?.diferenciais || ""
  );

  const toggleDia = (dia: string) => {
    setDiasFuncionamento((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const toggleServico = (servico: string) => {
    setServicos((prev) =>
      prev.includes(servico)
        ? prev.filter((s) => s !== servico)
        : [...prev, servico]
    );
  };

  const handleContinuar = async () => {
    await onProximo({
      etapa2Completa: true,
      horarioAbertura,
      horarioFechamento,
      diasFuncionamento,
      servicos,
      diferenciais,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto">
          <Store className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Perfil do Negócio</h1>
        <p className="text-muted-foreground">
          Conte-nos mais sobre como o <strong>{cliente?.negocio}</strong> funciona
        </p>
      </div>

      {/* Horário de Funcionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Horário de Funcionamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="abertura">Abertura</Label>
              <Input
                id="abertura"
                type="time"
                value={horarioAbertura}
                onChange={(e) => setHorarioAbertura(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechamento">Fechamento</Label>
              <Input
                id="fechamento"
                type="time"
                value={horarioFechamento}
                onChange={(e) => setHorarioFechamento(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dias de Funcionamento</Label>
            <div className="flex flex-wrap gap-2">
              {DIAS_SEMANA.map((dia) => (
                <button
                  key={dia.id}
                  type="button"
                  onClick={() => toggleDia(dia.id)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    diasFuncionamento.includes(dia.id)
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {dia.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Serviços Oferecidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span>Serviços e Facilidades</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {SERVICOS_COMUNS.map((servico) => (
              <div
                key={servico}
                className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleServico(servico)}
              >
                <Checkbox
                  id={servico}
                  checked={servicos.includes(servico)}
                  onCheckedChange={() => toggleServico(servico)}
                />
                <Label
                  htmlFor={servico}
                  className="flex-1 cursor-pointer"
                >
                  {servico}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diferenciais */}
      <Card>
        <CardHeader>
          <CardTitle>O que torna você único?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="diferenciais">
              Diferenciais do seu negócio (opcional)
            </Label>
            <Textarea
              id="diferenciais"
              placeholder="Ex: Atendimento personalizado, produtos orgânicos, entrega em 30 minutos..."
              value={diferenciais}
              onChange={(e) => setDiferenciais(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Destaque o que faz seu negócio ser especial. Isso ajudará a atrair
              mais clientes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex justify-between items-center pt-4 pb-16 md:pb-4">
        <Button variant="ghost" onClick={onPular} disabled={isSaving}>
          Pular esta etapa
        </Button>

        <Button onClick={handleContinuar} disabled={isSaving} size="lg">
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
