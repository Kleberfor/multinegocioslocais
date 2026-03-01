"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { formatPhone } from "@/lib/validations";

// Schema de validação
const prospectSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  negocio: z.string().min(2, "Nome do negócio é obrigatório"),
  segmento: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  origem: z.string(),
  observacoes: z.string().optional(),
  valorEstimado: z.string().optional(),
});

type ProspectFormData = z.infer<typeof prospectSchema>;

const SEGMENTOS = [
  "Restaurante",
  "Loja de Roupas",
  "Salão de Beleza",
  "Oficina Mecânica",
  "Clínica Médica",
  "Clínica Odontológica",
  "Academia",
  "Pet Shop",
  "Imobiliária",
  "Escritório de Advocacia",
  "Contabilidade",
  "Outro",
];

const ORIGENS = [
  { value: "CAPTACAO_ATIVA", label: "Captação Ativa" },
  { value: "INDICACAO", label: "Indicação" },
  { value: "LP", label: "Landing Page" },
  { value: "REDES_SOCIAIS", label: "Redes Sociais" },
  { value: "OUTRO", label: "Outro" },
];

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function NovoProspectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProspectFormData>({
    resolver: zodResolver(prospectSchema),
    defaultValues: {
      origem: "CAPTACAO_ATIVA",
    },
  });

  const onSubmit = async (data: ProspectFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          valorEstimado: data.valorEstimado ? parseFloat(data.valorEstimado) : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao cadastrar prospect");
      }

      router.push(`/admin/prospects/${result.id}`);
    } catch (error) {
      console.error("Erro:", error);
      alert(error instanceof Error ? error.message : "Erro ao cadastrar prospect");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/prospects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Novo Prospect</h1>
          <p className="text-muted-foreground">
            Cadastro manual para captação ativa
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Dados do Contato */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Dados do Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                {...register("nome")}
                placeholder="Nome do responsável"
              />
              {errors.nome && (
                <p className="text-sm text-destructive mt-1">
                  {errors.nome.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
              <Input
                id="telefone"
                {...register("telefone")}
                placeholder="(00) 00000-0000"
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setValue("telefone", formatted);
                }}
              />
              {errors.telefone && (
                <p className="text-sm text-destructive mt-1">
                  {errors.telefone.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dados do Negócio */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Dados do Negócio</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="negocio">Nome do Negócio *</Label>
              <Input
                id="negocio"
                {...register("negocio")}
                placeholder="Nome da empresa/estabelecimento"
              />
              {errors.negocio && (
                <p className="text-sm text-destructive mt-1">
                  {errors.negocio.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="segmento">Segmento</Label>
              <Select
                onValueChange={(value) => setValue("segmento", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o segmento" />
                </SelectTrigger>
                <SelectContent>
                  {SEGMENTOS.map((seg) => (
                    <SelectItem key={seg} value={seg}>
                      {seg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="origem">Origem do Contato</Label>
              <Select
                defaultValue="CAPTACAO_ATIVA"
                onValueChange={(value) => setValue("origem", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  {ORIGENS.map((orig) => (
                    <SelectItem key={orig.value} value={orig.value}>
                      {orig.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                {...register("cidade")}
                placeholder="Cidade"
              />
            </div>

            <div>
              <Label htmlFor="estado">Estado</Label>
              <Select
                onValueChange={(value) => setValue("estado", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="valorEstimado">Valor Estimado (R$)</Label>
              <Input
                id="valorEstimado"
                type="number"
                step="0.01"
                {...register("valorEstimado")}
                placeholder="0,00"
              />
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register("observacoes")}
              placeholder="Anotações sobre a reunião, interesse do cliente, próximos passos..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/prospects">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastrar Prospect
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
