"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";

interface AddInteracaoFormProps {
  prospectId?: string;
  leadId?: string;
}

const TIPOS_INTERACAO = [
  { value: "NOTA", label: "Nota" },
  { value: "LIGACAO", label: "Ligação" },
  { value: "EMAIL", label: "Email" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "REUNIAO", label: "Reunião" },
];

export function AddInteracaoForm({ prospectId, leadId }: AddInteracaoFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tipo, setTipo] = useState("NOTA");
  const [descricao, setDescricao] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!descricao.trim()) {
      alert("Descrição é obrigatória");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/interacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId,
          leadId,
          tipo,
          descricao: descricao.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao adicionar interação");
      }

      setDescricao("");
      setTipo("NOTA");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Erro:", error);
      alert(error instanceof Error ? error.message : "Erro ao adicionar interação");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Interação
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-muted/30">
      <div className="mb-3">
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de interação" />
          </SelectTrigger>
          <SelectContent>
            {TIPOS_INTERACAO.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-3">
        <Textarea
          placeholder="Descreva a interação..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setIsOpen(false);
            setDescricao("");
          }}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar"
          )}
        </Button>
      </div>
    </form>
  );
}
