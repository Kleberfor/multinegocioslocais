"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ProspectStatusSelectProps {
  prospectId: string;
  currentStatus: string;
}

const STATUS_OPTIONS = [
  { value: "NOVO", label: "Novo" },
  { value: "EM_CONTATO", label: "Em Contato" },
  { value: "REUNIAO_AGENDADA", label: "Reunião Agendada" },
  { value: "PROPOSTA_ENVIADA", label: "Proposta Enviada" },
  { value: "NEGOCIANDO", label: "Negociando" },
  { value: "CONTRATO_ENVIADO", label: "Contrato Enviado" },
  { value: "ASSINADO", label: "Assinado" },
  { value: "PAGO", label: "Pago" },
  { value: "PERDIDO", label: "Perdido" },
  { value: "INATIVO", label: "Inativo" },
];

export function ProspectStatusSelect({
  prospectId,
  currentStatus,
}: ProspectStatusSelectProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/prospects/${prospectId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar status");
      }

      router.refresh();
    } catch (error) {
      console.error("Erro:", error);
      alert(error instanceof Error ? error.message : "Erro ao atualizar status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Select
        defaultValue={currentStatus}
        onValueChange={handleStatusChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      )}
    </div>
  );
}
