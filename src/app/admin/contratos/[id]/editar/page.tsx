"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Contrato {
  id: string;
  valor: number;
  parcelas: number;
  status: string;
  valorMensal: number | null;
  incluiGestaoMensal: boolean;
  cliente: {
    id: string;
    nome: string;
    negocio: string;
  };
}

export default function EditarContratoPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [contrato, setContrato] = useState<Contrato | null>(null);

  const [formData, setFormData] = useState({
    valor: "",
    parcelas: "",
    status: "",
    valorMensal: "",
    incluiGestaoMensal: false,
  });

  useEffect(() => {
    async function fetchContrato() {
      try {
        const response = await fetch(`/api/contratos/${id}`);
        if (!response.ok) {
          throw new Error("Contrato não encontrado");
        }
        const data = await response.json();
        setContrato(data);
        setFormData({
          valor: String(Number(data.valor)),
          parcelas: String(data.parcelas),
          status: data.status,
          valorMensal: data.valorMensal ? String(Number(data.valorMensal)) : "",
          incluiGestaoMensal: data.incluiGestaoMensal || false,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar contrato");
      } finally {
        setIsLoading(false);
      }
    }

    fetchContrato();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/contratos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          valor: parseFloat(formData.valor),
          parcelas: parseInt(formData.parcelas),
          status: formData.status,
          valorMensal: formData.valorMensal ? parseFloat(formData.valorMensal) : null,
          incluiGestaoMensal: formData.incluiGestaoMensal,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao atualizar contrato");
      }

      router.push(`/admin/contratos/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar contrato");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !contrato) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">{error}</p>
            <div className="flex justify-center mt-4">
              <Link href="/admin/contratos">
                <Button variant="outline">Voltar</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/contratos/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Contrato</h1>
          <p className="text-muted-foreground">
            {contrato?.cliente.nome} - {contrato?.cliente.negocio}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor Total (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parcelas">Parcelas</Label>
                <Input
                  id="parcelas"
                  type="number"
                  min="1"
                  max="24"
                  value={formData.parcelas}
                  onChange={(e) =>
                    setFormData({ ...formData, parcelas: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="ASSINADO">Assinado</SelectItem>
                  <SelectItem value="PAGO">Pago</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Gestão Mensal (Opcional)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorMensal">Valor Mensal (R$)</Label>
                  <Input
                    id="valorMensal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valorMensal}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        valorMensal: e.target.value,
                        incluiGestaoMensal: e.target.value ? true : false,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href={`/admin/contratos/${id}`}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
