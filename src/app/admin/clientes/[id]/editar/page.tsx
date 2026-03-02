"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

interface Endereco {
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  negocio: string;
  endereco: Endereco | null;
}

export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpfCnpj: "",
    negocio: "",
    endereco: {
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
    },
  });

  useEffect(() => {
    async function fetchCliente() {
      try {
        const response = await fetch(`/api/cliente/${id}`);
        if (!response.ok) throw new Error("Cliente não encontrado");
        
        const cliente: Cliente = await response.json();
        
        setFormData({
          nome: cliente.nome || "",
          email: cliente.email || "",
          telefone: cliente.telefone || "",
          cpfCnpj: formatCpfCnpj(cliente.cpfCnpj || ""),
          negocio: cliente.negocio || "",
          endereco: {
            rua: cliente.endereco?.rua || "",
            numero: cliente.endereco?.numero || "",
            complemento: cliente.endereco?.complemento || "",
            bairro: cliente.endereco?.bairro || "",
            cidade: cliente.endereco?.cidade || "",
            estado: cliente.endereco?.estado || "",
            cep: cliente.endereco?.cep || "",
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar cliente");
      } finally {
        setLoading(false);
      }
    }

    fetchCliente();
  }, [id]);

  const formatCpfCnpj = (value: string) => {
    const clean = value.replace(/\D/g, "");
    if (clean.length <= 11) {
      return clean
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      return clean
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }
  };

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

  const formatCep = (value: string) => {
    const clean = value.replace(/\D/g, "");
    return clean.replace(/(\d{5})(\d)/, "$1-$2");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("endereco.")) {
      const field = name.replace("endereco.", "");
      let formattedValue = value;
      
      if (field === "cep") {
        formattedValue = formatCep(value);
      }
      
      setFormData((prev) => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [field]: formattedValue,
        },
      }));
    } else {
      let formattedValue = value;
      
      if (name === "cpfCnpj") {
        formattedValue = formatCpfCnpj(value);
      } else if (name === "telefone") {
        formattedValue = formatTelefone(value);
      }
      
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/cliente/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar cliente");
      }

      router.push(`/admin/clientes/${id}`);
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
        <Link href={`/admin/clientes/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Cliente</h1>
          <p className="text-muted-foreground">Atualize os dados do cliente</p>
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
            <CardTitle>Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="negocio">Nome do Negócio *</Label>
                <Input
                  id="negocio"
                  name="negocio"
                  value={formData.negocio}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpfCnpj">CPF/CNPJ *</Label>
              <Input
                id="cpfCnpj"
                name="cpfCnpj"
                value={formData.cpfCnpj}
                onChange={handleChange}
                placeholder="000.000.000-00"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="endereco.rua">Rua</Label>
                <Input
                  id="endereco.rua"
                  name="endereco.rua"
                  value={formData.endereco.rua}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco.numero">Número</Label>
                <Input
                  id="endereco.numero"
                  name="endereco.numero"
                  value={formData.endereco.numero}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endereco.complemento">Complemento</Label>
                <Input
                  id="endereco.complemento"
                  name="endereco.complemento"
                  value={formData.endereco.complemento}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco.bairro">Bairro</Label>
                <Input
                  id="endereco.bairro"
                  name="endereco.bairro"
                  value={formData.endereco.bairro}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endereco.cidade">Cidade</Label>
                <Input
                  id="endereco.cidade"
                  name="endereco.cidade"
                  value={formData.endereco.cidade}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco.estado">Estado</Label>
                <Input
                  id="endereco.estado"
                  name="endereco.estado"
                  value={formData.endereco.estado}
                  onChange={handleChange}
                  maxLength={2}
                  placeholder="UF"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco.cep">CEP</Label>
                <Input
                  id="endereco.cep"
                  name="endereco.cep"
                  value={formData.endereco.cep}
                  onChange={handleChange}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/admin/clientes/${id}`}>
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
