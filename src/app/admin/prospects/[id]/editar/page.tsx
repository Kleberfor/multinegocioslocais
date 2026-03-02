"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

interface Prospect {
  id: string;
  nome: string;
  negocio: string | null;
  telefone: string | null;
  email: string | null;
  segmento: string | null;
  cidade: string | null;
  estado: string | null;
  observacoes: string | null;
  valorEstimado: number | null;
}

export default function EditarProspectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    nome: "",
    negocio: "",
    telefone: "",
    email: "",
    segmento: "",
    cidade: "",
    estado: "",
    observacoes: "",
    valorEstimado: "",
  });

  useEffect(() => {
    async function fetchProspect() {
      try {
        const response = await fetch(`/api/prospects/${id}`);
        if (!response.ok) throw new Error("Prospect não encontrado");
        
        const prospect: Prospect = await response.json();
        
        setFormData({
          nome: prospect.nome || "",
          negocio: prospect.negocio || "",
          telefone: prospect.telefone || "",
          email: prospect.email || "",
          segmento: prospect.segmento || "",
          cidade: prospect.cidade || "",
          estado: prospect.estado || "",
          observacoes: prospect.observacoes || "",
          valorEstimado: prospect.valorEstimado ? String(prospect.valorEstimado) : "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar prospect");
      } finally {
        setLoading(false);
      }
    }

    fetchProspect();
  }, [id]);

  const formatTelefone = (value: string) => {
    const clean = value.replace(/\D/g, "");
    if (clean.length <= 10) {
      return clean
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      return clean
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    if (name === "telefone") {
      formattedValue = formatTelefone(value);
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/prospects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          valorEstimado: formData.valorEstimado ? Number(formData.valorEstimado) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar prospect");
      }

      router.push(`/admin/prospects/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/prospects/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Prospect</h1>
          <p className="text-muted-foreground">Atualize os dados do prospect</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Dados do Prospect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="negocio">Nome do Negócio</Label>
                <Input
                  id="negocio"
                  name="negocio"
                  value={formData.negocio}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="segmento">Segmento</Label>
                <Input
                  id="segmento"
                  name="segmento"
                  value={formData.segmento}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valorEstimado">Valor Estimado (R$)</Label>
                <Input
                  id="valorEstimado"
                  name="valorEstimado"
                  type="number"
                  value={formData.valorEstimado}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Localização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  maxLength={2}
                  placeholder="UF"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows={4}
              placeholder="Anotações sobre o prospect..."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/admin/prospects/${id}`}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
