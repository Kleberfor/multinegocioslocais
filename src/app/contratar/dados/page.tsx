"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  clienteSchema,
  ClienteFormData,
  formatCpfCnpj,
  formatPhone,
  formatCep,
} from "@/lib/validations";
import { Loader2, User, Building, MapPin, CreditCard } from "lucide-react";

// Planos disponíveis (temporário - depois virá do banco)
const PLANOS = [
  {
    id: "plano-6-meses",
    nome: "Plano 6 Meses",
    descricao: "Ideal para começar",
    implantacao: 3000,
    mensalidade: 500,
    parcelas: 6,
    total: 6000,
  },
  {
    id: "plano-12-meses",
    nome: "Plano 12 Meses",
    descricao: "Melhor custo-benefício",
    implantacao: 3000,
    mensalidade: 500,
    parcelas: 12,
    total: 9000,
    destaque: true,
  },
];

function DadosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prospectId = searchParams.get("prospect");
  const leadId = searchParams.get("lead");
  const fromAdmin = searchParams.get("from") === "admin";

  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlano, setSelectedPlano] = useState<string>("");
  const [prospectData, setProspectData] = useState<any>(null);
  const [leadData, setLeadData] = useState<any>(null);
  const [valorCustomizado, setValorCustomizado] = useState<string>("");

  // Se vier de admin com lead, não precisa mostrar seleção de plano
  const isAdminFlow = fromAdmin && leadId;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      endereco: {
        estado: "",
      },
    },
  });

  // Carregar dados do prospect se existir
  useEffect(() => {
    if (prospectId) {
      setValue("prospectId", prospectId);
      // Aqui poderia buscar dados do prospect para pré-preencher
    }
  }, [prospectId, setValue]);

  // Carregar dados do lead se vier do admin
  useEffect(() => {
    if (leadId && fromAdmin) {
      fetch(`/api/leads/${leadId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setLeadData(data);
            // Pré-preencher formulário com dados do lead
            if (data.nome) setValue("nome", data.nome);
            if (data.email) setValue("email", data.email);
            if (data.telefone) setValue("telefone", data.telefone);
            if (data.negocio) setValue("negocio", data.negocio);
            // Definir plano como customizado (admin)
            setValue("planoId", "plano-customizado");
            setSelectedPlano("plano-customizado");
          }
        })
        .catch((err) => console.error("Erro ao carregar lead:", err));
    }
  }, [leadId, fromAdmin, setValue]);

  // Buscar CEP
  const handleCepBlur = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );
      const data = await response.json();

      if (!data.erro) {
        setValue("endereco.logradouro", data.logradouro);
        setValue("endereco.bairro", data.bairro);
        setValue("endereco.cidade", data.localidade);
        setValue("endereco.estado", data.uf);
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const onSubmit = async (data: ClienteFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar dados");
      }

      // Redirecionar para página de contrato
      router.push(`/contratar/contrato?cliente=${result.id}`);
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar dados. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="MultiNegócios Locais"
              width={180}
              height={40}
              className="h-10 w-auto mx-auto mb-6"
            />
          </Link>
          <h1 className="text-2xl font-bold">Complete seus dados</h1>
          <p className="text-muted-foreground mt-2">
            Preencha as informações abaixo para gerar seu contrato
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium">Dados</span>
            </div>
            <div className="w-12 h-0.5 bg-muted" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm text-muted-foreground">
                Contrato
              </span>
            </div>
            <div className="w-12 h-0.5 bg-muted" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm text-muted-foreground">
                Pagamento
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="w-5 h-5 mr-2" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  {...register("nome")}
                  placeholder="Seu nome completo"
                />
                {errors.nome && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.nome.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="seu@email.com"
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

              <div>
                <Label htmlFor="cpfCnpj">CPF ou CNPJ *</Label>
                <Input
                  id="cpfCnpj"
                  {...register("cpfCnpj")}
                  placeholder="000.000.000-00"
                  onChange={(e) => {
                    const formatted = formatCpfCnpj(e.target.value);
                    setValue("cpfCnpj", formatted);
                  }}
                />
                {errors.cpfCnpj && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.cpfCnpj.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dados do Negócio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Building className="w-5 h-5 mr-2" />
                Dados do Negócio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="negocio">Nome do Negócio *</Label>
                <Input
                  id="negocio"
                  {...register("negocio")}
                  placeholder="Nome da sua empresa"
                />
                {errors.negocio && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.negocio.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MapPin className="w-5 h-5 mr-2" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-6">
              <div className="md:col-span-2">
                <Label htmlFor="cep">CEP *</Label>
                <Input
                  id="cep"
                  {...register("endereco.cep")}
                  placeholder="00000-000"
                  onChange={(e) => {
                    const formatted = formatCep(e.target.value);
                    setValue("endereco.cep", formatted);
                  }}
                  onBlur={(e) => handleCepBlur(e.target.value)}
                />
                {errors.endereco?.cep && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.endereco.cep.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-4">
                <Label htmlFor="logradouro">Logradouro *</Label>
                <Input
                  id="logradouro"
                  {...register("endereco.logradouro")}
                  placeholder="Rua, Avenida, etc."
                />
                {errors.endereco?.logradouro && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.endereco.logradouro.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-1">
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  {...register("endereco.numero")}
                  placeholder="123"
                />
                {errors.endereco?.numero && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.endereco.numero.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  {...register("endereco.complemento")}
                  placeholder="Sala, Apt, etc."
                />
              </div>

              <div className="md:col-span-3">
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  {...register("endereco.bairro")}
                  placeholder="Bairro"
                />
                {errors.endereco?.bairro && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.endereco.bairro.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-4">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  {...register("endereco.cidade")}
                  placeholder="Cidade"
                />
                {errors.endereco?.cidade && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.endereco.cidade.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="estado">Estado *</Label>
                <Input
                  id="estado"
                  {...register("endereco.estado")}
                  placeholder="UF"
                  maxLength={2}
                  className="uppercase"
                />
                {errors.endereco?.estado && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.endereco.estado.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seleção de Plano */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="w-5 h-5 mr-2" />
                {isAdminFlow ? "Valor do Contrato" : "Escolha seu Plano"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isAdminFlow && (
                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  {PLANOS.map((plano) => (
                    <div
                      key={plano.id}
                      onClick={() => {
                        setSelectedPlano(plano.id);
                        setValue("planoId", plano.id);
                        setValorCustomizado("");
                      }}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPlano === plano.id
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      {plano.destaque && (
                        <span className="absolute -top-2 left-4 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                          Mais Popular
                        </span>
                      )}
                      <h3 className="font-semibold">{plano.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        {plano.descricao}
                      </p>
                      <div className="mt-3">
                        <p className="text-sm">
                          Implantação:{" "}
                          <strong>
                            R$ {plano.implantacao.toLocaleString("pt-BR")}
                          </strong>
                        </p>
                        <p className="text-sm">
                          + {plano.parcelas}x de{" "}
                          <strong>
                            R$ {plano.mensalidade.toLocaleString("pt-BR")}
                          </strong>
                        </p>
                        <p className="text-lg font-bold text-primary mt-2">
                          Total: R$ {plano.total.toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Opção de valor personalizado */}
              <div className={`p-4 rounded-lg border-2 ${
                selectedPlano === "plano-customizado" || isAdminFlow
                  ? "border-primary bg-primary/5"
                  : "border-muted"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">
                      {isAdminFlow ? "Valor Negociado" : "Valor Personalizado"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isAdminFlow
                        ? "Valor acordado na negociação"
                        : "Digite um valor diferente dos planos acima"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">R$</span>
                  <Input
                    type="number"
                    placeholder="Ex: 5000"
                    value={valorCustomizado || (isAdminFlow ? leadData?.valorSugerido || "" : "")}
                    onChange={(e) => {
                      setValorCustomizado(e.target.value);
                      setSelectedPlano("plano-customizado");
                      setValue("planoId", "plano-customizado");
                    }}
                    className="text-lg font-medium"
                  />
                </div>
                {valorCustomizado && (
                  <p className="text-lg font-bold text-primary mt-2">
                    Total: R$ {Number(valorCustomizado).toLocaleString("pt-BR")}
                  </p>
                )}
              </div>

              {errors.planoId && (
                <p className="text-sm text-destructive mt-2">
                  {errors.planoId.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-between">
            <Link href={prospectId ? `/resultado/${prospectId}` : "/"}>
              <Button type="button" variant="outline">
                Voltar
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Continuar para Contrato"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DadosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <DadosContent />
    </Suspense>
  );
}
