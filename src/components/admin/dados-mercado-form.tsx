"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface DadoMercado {
  segmento: string;
  nome: string;
  ticketMedio: number | null;
  clientesPotenciaisMes: number | null;
  fatorMultiplicador: number;
  fonteTicket: string | null;
  fonteBuscas: string | null;
  observacoes: string | null;
  atualizadoEm: Date | null;
  atualizadoPor: string | null;
}

interface DadosMercadoFormProps {
  dado: DadoMercado;
}

export function DadosMercadoForm({ dado }: DadosMercadoFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const [ticketMedio, setTicketMedio] = useState(dado.ticketMedio?.toString() || "");
  const [clientesPotenciaisMes, setClientesPotenciaisMes] = useState(
    dado.clientesPotenciaisMes?.toString() || ""
  );
  const [fatorMultiplicador, setFatorMultiplicador] = useState(
    dado.fatorMultiplicador?.toString() || "1.0"
  );
  const [fonteTicket, setFonteTicket] = useState(dado.fonteTicket || "");
  const [fonteBuscas, setFonteBuscas] = useState(dado.fonteBuscas || "");
  const [observacoes, setObservacoes] = useState(dado.observacoes || "");

  const handleSave = async () => {
    if (!ticketMedio || !clientesPotenciaisMes) {
      alert("Preencha ticket médio e clientes potenciais");
      return;
    }

    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const response = await fetch("/api/admin/dados-mercado", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segmento: dado.segmento,
          regiao: null,
          ticketMedio: parseFloat(ticketMedio),
          clientesPotenciaisMes: parseInt(clientesPotenciaisMes),
          fatorMultiplicador: parseFloat(fatorMultiplicador) || 1.0,
          fonteTicket: fonteTicket || null,
          fonteBuscas: fonteBuscas || null,
          observacoes: observacoes || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar");
      }

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const isConfigured = dado.ticketMedio !== null;

  return (
    <div className="border rounded-lg">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isConfigured ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          <span className="font-medium">{dado.nome}</span>
          {isConfigured && (
            <span className="text-sm text-muted-foreground">
              R$ {dado.ticketMedio?.toLocaleString("pt-BR")} | {dado.clientesPotenciaisMes} clientes/mês
            </span>
          )}
          {!isConfigured && (
            <span className="text-sm text-yellow-600">Usando valores padrão</span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Form */}
      {isOpen && (
        <div className="p-4 pt-0 border-t">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Ticket Médio */}
            <div className="space-y-2">
              <Label htmlFor={`ticket-${dado.segmento}`}>
                Ticket Médio (R$) *
              </Label>
              <Input
                id={`ticket-${dado.segmento}`}
                type="number"
                step="0.01"
                placeholder="Ex: 150.00"
                value={ticketMedio}
                onChange={(e) => setTicketMedio(e.target.value)}
              />
            </div>

            {/* Clientes Potenciais */}
            <div className="space-y-2">
              <Label htmlFor={`clientes-${dado.segmento}`}>
                Clientes Potenciais/Mês *
              </Label>
              <Input
                id={`clientes-${dado.segmento}`}
                type="number"
                placeholder="Ex: 200"
                value={clientesPotenciaisMes}
                onChange={(e) => setClientesPotenciaisMes(e.target.value)}
              />
            </div>

            {/* Fator Multiplicador */}
            <div className="space-y-2">
              <Label htmlFor={`fator-${dado.segmento}`}>
                Fator Multiplicador
              </Label>
              <Input
                id={`fator-${dado.segmento}`}
                type="number"
                step="0.1"
                min="0.5"
                max="3.0"
                placeholder="1.0"
                value={fatorMultiplicador}
                onChange={(e) => setFatorMultiplicador(e.target.value)}
              />
            </div>

            {/* Fonte Ticket */}
            <div className="space-y-2">
              <Label htmlFor={`fonte-ticket-${dado.segmento}`}>
                Fonte do Ticket Médio
              </Label>
              <Input
                id={`fonte-ticket-${dado.segmento}`}
                placeholder="Ex: SEBRAE 2024"
                value={fonteTicket}
                onChange={(e) => setFonteTicket(e.target.value)}
              />
            </div>

            {/* Fonte Buscas */}
            <div className="space-y-2">
              <Label htmlFor={`fonte-buscas-${dado.segmento}`}>
                Fonte das Buscas
              </Label>
              <Input
                id={`fonte-buscas-${dado.segmento}`}
                placeholder="Ex: Google Keyword Planner"
                value={fonteBuscas}
                onChange={(e) => setFonteBuscas(e.target.value)}
              />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor={`obs-${dado.segmento}`}>Observações</Label>
              <Input
                id={`obs-${dado.segmento}`}
                placeholder="Notas adicionais..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
          </div>

          {/* Info de última atualização */}
          {dado.atualizadoEm && (
            <p className="text-xs text-muted-foreground mt-4">
              Última atualização:{" "}
              {new Date(dado.atualizadoEm).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {dado.atualizadoPor && ` por ${dado.atualizadoPor}`}
            </p>
          )}

          {/* Botão Salvar */}
          <div className="flex items-center gap-3 mt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>

            {saveStatus === "success" && (
              <span className="flex items-center text-green-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                Salvo com sucesso!
              </span>
            )}

            {saveStatus === "error" && (
              <span className="flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                Erro ao salvar
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
