"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, CheckCircle, Download } from "lucide-react";

interface ClienteData {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  negocio: string;
  endereco: any;
  planoId: string;
  contratos: {
    id: string;
    valor: number;
    parcelas: number;
    status: string;
  }[];
}

function ContratoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteId = searchParams.get("cliente");

  const [cliente, setCliente] = useState<ClienteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [contractHtml, setContractHtml] = useState("");

  useEffect(() => {
    if (clienteId) {
      loadCliente();
    }
  }, [clienteId]);

  const loadCliente = async () => {
    try {
      const response = await fetch(`/api/cliente/${clienteId}`);
      const data = await response.json();

      if (response.ok) {
        setCliente(data);
        loadContract(data);
      }
    } catch (error) {
      console.error("Erro ao carregar cliente:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContract = async (clienteData: ClienteData) => {
    try {
      const response = await fetch("/api/contract/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId: clienteData.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setContractHtml(data.html);
      }
    } catch (error) {
      console.error("Erro ao gerar contrato:", error);
    }
  };

  const handleAccept = async () => {
    if (!accepted) {
      alert("Você precisa marcar que leu e concorda com o contrato.");
      return;
    }

    setIsAccepting(true);

    try {
      // Atualizar status do contrato para ASSINADO
      const response = await fetch(`/api/contract/${cliente?.contratos[0]?.id}/sign`, {
        method: "POST",
      });

      if (response.ok) {
        router.push(`/contratar/checkout?cliente=${clienteId}`);
      }
    } catch (error) {
      console.error("Erro ao aceitar contrato:", error);
      alert("Erro ao processar. Tente novamente.");
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Cliente não encontrado</p>
          <Link href="/contratar/dados">
            <Button>Voltar</Button>
          </Link>
        </div>
      </div>
    );
  }

  const contrato = cliente.contratos[0];

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
          <h1 className="text-2xl font-bold">Contrato de Serviços</h1>
          <p className="text-muted-foreground mt-2">
            Leia atentamente e aceite os termos para continuar
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium">Dados</span>
            </div>
            <div className="w-12 h-0.5 bg-primary" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium">Contrato</span>
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

        {/* Resumo */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Resumo do Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Contratante</p>
                <p className="font-medium">{cliente.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Negócio</p>
                <p className="font-medium">{cliente.negocio}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="font-medium text-lg text-primary">
                  R$ {Number(contrato?.valor || 0).toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Parcelas</p>
                <p className="font-medium">{contrato?.parcelas}x</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contrato */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="w-5 h-5 mr-2" />
              Termos do Contrato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none max-h-96 overflow-y-auto border rounded-lg p-4 bg-white"
              dangerouslySetInnerHTML={{ __html: contractHtml }}
            />
          </CardContent>
        </Card>

        {/* Aceite */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">
                Li e concordo com os termos do contrato de prestação de serviços
                acima. Declaro que todas as informações fornecidas são
                verdadeiras e me comprometo a cumprir com as obrigações
                estabelecidas.
              </span>
            </label>
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex justify-between">
          <Link href={`/contratar/dados`}>
            <Button type="button" variant="outline">
              Voltar
            </Button>
          </Link>
          <Button
            onClick={handleAccept}
            disabled={isAccepting || !accepted}
          >
            {isAccepting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              "Aceitar e Continuar para Pagamento"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ContratoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ContratoContent />
    </Suspense>
  );
}
