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
import { Loader2, User, Building, MapPin, CreditCard, CheckCircle, Settings } from "lucide-react";

// Interface para dados da proposta
interface PropostaData {
  valorImplantacao: number;
  valorMensal: number;
  parcelamento: { parcelas: number; valorParcela: number }[];
}

interface LeadData {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  negocio: string;
  proposta: PropostaData | null;
  valorSugerido: number | null;
}

function DadosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prospectId = searchParams.get("prospect");
  const leadId = searchParams.get("lead");
  const fromSource = searchParams.get("from");
  const fromAdmin = fromSource === "admin";
  const fromProposta = fromSource === "proposta";

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLead, setIsLoadingLead] = useState(false);
  const [selectedParcelas, setSelectedParcelas] = useState<number>(1);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [valorCustomizado, setValorCustomizado] = useState<string>("");
  const [incluirGestaoMensal, setIncluirGestaoMensal] = useState<boolean>(false);

  // Determinar tipo de fluxo
  const isAdminFlow = fromAdmin && leadId;
  const isPropostaFlow = fromProposta && leadId;

  // Valores da proposta - valores padrão acessíveis para negócios locais
  const VALOR_PADRAO = 1500; // Valor mínimo de implantação
  const VALOR_MAXIMO = 3000; // Valor máximo de implantação
  const VALOR_MENSAL_PADRAO = 300; // Valor mínimo mensal
  const proposta = leadData?.proposta;

  // Calcular valor base a partir de proposta ou valorSugerido
  const valorBruto = proposta?.valorImplantacao || Number(leadData?.valorSugerido) || VALOR_PADRAO;
  // SEMPRE limitar entre VALOR_PADRAO (1500) e VALOR_MAXIMO (3000)
  const valorImplantacao = Math.min(Math.max(valorBruto, VALOR_PADRAO), VALOR_MAXIMO);
  const valorMensal = Math.max(proposta?.valorMensal || VALOR_MENSAL_PADRAO, VALOR_MENSAL_PADRAO);

  // Calcular opções de parcelamento baseadas na proposta
  const opcoesPagamento = [
    { parcelas: 1, valorParcela: valorImplantacao, label: "À Vista", desconto: true },
    { parcelas: 6, valorParcela: Math.round(valorImplantacao / 6), label: "6x sem juros" },
    { parcelas: 12, valorParcela: Math.round((valorImplantacao * 1.1) / 12), label: "12x (10% juros)", total: Math.round(valorImplantacao * 1.1) },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      endereco: {
        estado: "",
      },
      planoId: "plano-proposta", // Valor padrão
    },
  });

  // Atualizar planoId baseado no fluxo
  useEffect(() => {
    if (fromProposta) {
      setValue("planoId", "plano-proposta");
    } else if (fromAdmin) {
      setValue("planoId", "plano-customizado");
    }
  }, [fromProposta, fromAdmin, setValue]);

  // Carregar dados do prospect se existir
  useEffect(() => {
    if (prospectId) {
      setValue("prospectId", prospectId);
      // Aqui poderia buscar dados do prospect para pré-preencher
    }
  }, [prospectId, setValue]);

  // Carregar dados do lead se vier do admin ou da proposta
  useEffect(() => {
    if (leadId && (fromAdmin || fromProposta)) {
      setIsLoadingLead(true);
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

            if (fromAdmin) {
              // Admin: definir plano como customizado
              setValue("planoId", "plano-customizado");
            } else if (fromProposta) {
              // Proposta: usar valores da proposta
              setValue("planoId", "plano-proposta");
            }
          }
        })
        .catch((err) => console.error("Erro ao carregar lead:", err))
        .finally(() => setIsLoadingLead(false));
    }
  }, [leadId, fromAdmin, fromProposta, setValue]);

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
      // Calcular valores baseados no fluxo
      let valorTotal = 0;
      let parcelas = 1;
      let valorGestaoMensal = 0;

      if (isPropostaFlow && valorImplantacao > 0) {
        // Fluxo da proposta: usar valores calculados
        const opcaoSelecionada = opcoesPagamento.find(o => o.parcelas === selectedParcelas);
        valorTotal = opcaoSelecionada?.total || valorImplantacao;
        parcelas = selectedParcelas;
        valorGestaoMensal = incluirGestaoMensal ? valorMensal : 0;
      } else if (valorCustomizado) {
        // Admin: valor personalizado
        valorTotal = Number(valorCustomizado);
        parcelas = 12;
      }

      const submitData = {
        ...data,
        leadId: leadId || undefined,
        valorTotal,
        parcelas,
        valorGestaoMensal,
        fromProposta: isPropostaFlow,
      };

      const response = await fetch("/api/cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.details || result.error || "Erro ao salvar dados";
        throw new Error(errorMsg);
      }

      // Redirecionar para página de contrato
      router.push(`/contratar/contrato?cliente=${result.id}`);
    } catch (error) {
      console.error("Erro:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      alert(`Erro ao salvar dados: ${errorMessage}`);
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

          {/* Seleção de Forma de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="w-5 h-5 mr-2" />
                {isPropostaFlow ? "Escolha a Forma de Pagamento" : isAdminFlow ? "Valor do Contrato" : "Escolha seu Plano"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Fluxo da Proposta: Mostrar formas de pagamento */}
              {isPropostaFlow && (
                <>
                  {/* Resumo do valor */}
                  <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Valor da Implantação</p>
                    <p className="text-3xl font-bold text-primary">
                      R$ {valorImplantacao.toLocaleString("pt-BR")}
                    </p>
                  </div>

                  {/* Opções de parcelamento */}
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    {opcoesPagamento.map((opcao) => (
                      <div
                        key={opcao.parcelas}
                        onClick={() => setSelectedParcelas(opcao.parcelas)}
                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                          selectedParcelas === opcao.parcelas
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50"
                        }`}
                      >
                        {opcao.desconto && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                            Melhor opção
                          </span>
                        )}
                        {selectedParcelas === opcao.parcelas && (
                          <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-primary" />
                        )}
                        <p className="font-bold text-2xl mb-1">
                          {opcao.parcelas}x
                        </p>
                        <p className="text-lg font-semibold text-primary">
                          R$ {opcao.valorParcela.toLocaleString("pt-BR")}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {opcao.label}
                        </p>
                        {opcao.total && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Total: R$ {opcao.total.toLocaleString("pt-BR")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Opção de Gestão Mensal */}
                  <div className={`p-4 rounded-lg border-2 ${
                    incluirGestaoMensal ? "border-primary bg-primary/5" : "border-muted"
                  }`}>
                    <label className="flex items-start gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={incluirGestaoMensal}
                        onChange={(e) => setIncluirGestaoMensal(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Settings className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">Gestão Mensal</h3>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Opcional
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Inclui manutenção do sistema, gestão de redes sociais, relatórios de acompanhamento e suporte técnico.
                        </p>
                        <p className="text-xl font-bold text-primary">
                          R$ {valorMensal.toLocaleString("pt-BR")}/mês
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Resumo do total */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span>Implantação ({selectedParcelas}x)</span>
                      <span className="font-semibold">
                        R$ {(opcoesPagamento.find(o => o.parcelas === selectedParcelas)?.total || valorImplantacao).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    {incluirGestaoMensal && (
                      <div className="flex justify-between items-center mb-2 text-sm">
                        <span>+ Gestão Mensal (a partir do 2º mês)</span>
                        <span>R$ {valorMensal.toLocaleString("pt-BR")}/mês</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2 flex justify-between items-center">
                      <span className="font-semibold">Primeiro pagamento</span>
                      <span className="text-xl font-bold text-primary">
                        R$ {(opcoesPagamento.find(o => o.parcelas === selectedParcelas)?.valorParcela || valorImplantacao).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Fluxo Admin: Valor personalizado */}
              {isAdminFlow && (
                <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">Valor Negociado</h3>
                      <p className="text-sm text-muted-foreground">
                        Valor acordado na negociação
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium">R$</span>
                    <Input
                      type="number"
                      placeholder="Ex: 5000"
                      value={valorCustomizado || leadData?.valorSugerido || ""}
                      onChange={(e) => {
                        setValorCustomizado(e.target.value);
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
              )}

              {/* Fluxo sem lead: mostrar aviso */}
              {!isPropostaFlow && !isAdminFlow && (
                <div className="p-6 text-center border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground">
                    Para ver as opções de pagamento, primeiro faça a análise do seu negócio.
                  </p>
                  <Link href="/analisar">
                    <Button className="mt-4">
                      Analisar Meu Negócio
                    </Button>
                  </Link>
                </div>
              )}

              {/* Loading do lead */}
              {isLoadingLead && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                  <span>Carregando dados da proposta...</span>
                </div>
              )}

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
