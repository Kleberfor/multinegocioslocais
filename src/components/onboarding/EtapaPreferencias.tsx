"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings2, ChevronRight, Loader2, Mail, MessageCircle, FileBarChart, Clock } from "lucide-react";

interface Props {
  onProximo: (dados: Record<string, any>) => Promise<void>;
  isSaving: boolean;
  onboarding?: any;
}

const FREQUENCIAS = [
  { id: "SEMANAL", label: "Semanal", descricao: "Toda sexta-feira" },
  { id: "QUINZENAL", label: "Quinzenal", descricao: "A cada 15 dias" },
  { id: "MENSAL", label: "Mensal", descricao: "Todo início do mês" },
];

const HORARIOS = [
  { id: "MANHA", label: "Manhã", descricao: "8h às 12h" },
  { id: "TARDE", label: "Tarde", descricao: "13h às 17h" },
  { id: "NOITE", label: "Noite", descricao: "18h às 21h" },
];

export default function EtapaPreferencias({
  onProximo,
  isSaving,
  onboarding,
}: Props) {
  const [notificacaoEmail, setNotificacaoEmail] = useState(
    onboarding?.notificacaoEmail ?? true
  );
  const [notificacaoWhatsApp, setNotificacaoWhatsApp] = useState(
    onboarding?.notificacaoWhatsApp ?? true
  );
  const [frequenciaRelatorio, setFrequenciaRelatorio] = useState(
    onboarding?.frequenciaRelatorio || "MENSAL"
  );
  const [melhorHorario, setMelhorHorario] = useState(
    onboarding?.melhorHorario || "MANHA"
  );

  const handleContinuar = async () => {
    await onProximo({
      etapa6Completa: true,
      notificacaoEmail,
      notificacaoWhatsApp,
      frequenciaRelatorio,
      melhorHorario,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center mx-auto">
          <Settings2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Preferências de Comunicação</h1>
        <p className="text-muted-foreground">
          Como você prefere ser contatado e receber relatórios?
        </p>
      </div>

      {/* Notificações */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Notificações por E-mail</p>
                <p className="text-sm text-muted-foreground">
                  Receber atualizações importantes
                </p>
              </div>
            </div>
            <Switch
              checked={notificacaoEmail}
              onCheckedChange={setNotificacaoEmail}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Notificações por WhatsApp</p>
                <p className="text-sm text-muted-foreground">
                  Lembretes e alertas urgentes
                </p>
              </div>
            </div>
            <Switch
              checked={notificacaoWhatsApp}
              onCheckedChange={setNotificacaoWhatsApp}
            />
          </div>
        </CardContent>
      </Card>

      {/* Frequência de Relatórios */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center space-x-2 mb-3">
            <FileBarChart className="w-5 h-5 text-primary" />
            <Label className="text-base">Relatórios de Desempenho</Label>
          </div>
          <RadioGroup
            value={frequenciaRelatorio}
            onValueChange={setFrequenciaRelatorio}
          >
            {FREQUENCIAS.map((freq) => (
              <div
                key={freq.id}
                className="flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer hover:bg-gray-50"
                onClick={() => setFrequenciaRelatorio(freq.id)}
              >
                <RadioGroupItem value={freq.id} id={freq.id} />
                <Label htmlFor={freq.id} className="flex-1 cursor-pointer">
                  <p className="font-medium">{freq.label}</p>
                  <p className="text-sm text-muted-foreground">{freq.descricao}</p>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Melhor Horário */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-5 h-5 text-primary" />
            <Label className="text-base">Melhor horário para contato</Label>
          </div>
          <RadioGroup value={melhorHorario} onValueChange={setMelhorHorario}>
            <div className="grid grid-cols-3 gap-3">
              {HORARIOS.map((horario) => (
                <div
                  key={horario.id}
                  className="text-center"
                  onClick={() => setMelhorHorario(horario.id)}
                >
                  <div
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      melhorHorario === horario.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value={horario.id} id={horario.id} className="sr-only" />
                    <p className="font-semibold text-sm">{horario.label}</p>
                    <p className="text-xs text-muted-foreground">{horario.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex justify-end items-center pt-4 pb-16 md:pb-4">
        <Button onClick={handleContinuar} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Finalizando...
            </>
          ) : (
            <>
              Finalizar Configuração
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
