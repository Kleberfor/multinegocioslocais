"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Loader2, Save } from "lucide-react";

interface EditPropostaProps {
  leadId: string;
  valorSugerido: number | null;
  proposta: {
    valorMensal?: number;
    roiEstimado?: {
      retornoInvestimentoMeses?: number;
      clientesAdicionaisMes?: number;
    };
  } | null;
}

export function EditProposta({ leadId, valorSugerido, proposta }: EditPropostaProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [valor, setValor] = useState(valorSugerido?.toString() || "");
  const [valorMensal, setValorMensal] = useState(proposta?.valorMensal?.toString() || "");

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Atualizar valorSugerido
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valorSugerido: valor ? parseFloat(valor) : null,
        }),
      });

      if (response.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Erro ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar alterações");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Edit className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Valores da Proposta</DialogTitle>
          <DialogDescription>
            Ajuste os valores para negociação com o cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="valor">Valor Total Negociado (R$)</Label>
            <Input
              id="valor"
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ex: 3000"
            />
            <p className="text-xs text-muted-foreground">
              Este é o valor que será usado na proposta e contrato.
            </p>
          </div>

          {proposta?.valorMensal && (
            <div className="space-y-2">
              <Label>Valor Mensal Original</Label>
              <p className="text-sm text-muted-foreground">
                R$ {proposta.valorMensal.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-muted-foreground">
                Valor sugerido pelo sistema baseado na análise.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
