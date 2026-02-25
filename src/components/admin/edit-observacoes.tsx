"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Loader2, Save, X } from "lucide-react";

interface EditObservacoesProps {
  leadId: string;
  observacoes: string | null;
}

export function EditObservacoes({ leadId, observacoes }: EditObservacoesProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [texto, setTexto] = useState(observacoes || "");

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observacoes: texto }),
      });

      if (response.ok) {
        setIsEditing(false);
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Erro ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar observações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTexto(observacoes || "");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-6"
          >
            <Edit className="w-3 h-3 mr-1" />
            Editar
          </Button>
        </div>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {observacoes || "Nenhuma observação registrada. Clique em Editar para adicionar."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Anotações de reuniões, negociações, observações importantes..."
        rows={6}
        className="resize-none"
      />
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="w-3 h-3 mr-1" />
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-3 h-3 mr-1" />
              Salvar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
