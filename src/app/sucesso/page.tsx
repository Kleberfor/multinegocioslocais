"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  CheckCircle,
  Download,
  Mail,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

interface ClienteData {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  negocio: string;
  contratos: {
    id: string;
    valor: number;
    parcelas: number;
    status: string;
  }[];
}

function SucessoContent() {
  const searchParams = useSearchParams();
  const clienteId = searchParams.get("cliente");

  const [cliente, setCliente] = useState<ClienteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      }
    } catch (error) {
      console.error("Erro ao carregar cliente:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background py-12">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="MultiNegócios Locais"
              width={180}
              height={40}
              className="h-10 w-auto mx-auto mb-8"
            />
          </Link>

          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-green-700 mb-2">
            Parabéns! Contratação Realizada
          </h1>
          <p className="text-lg text-muted-foreground">
            Sua jornada para dominar a presença digital começa agora.
          </p>
        </div>

        {/* Detalhes */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">Cliente</span>
                <span className="font-medium">{cliente?.nome}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">Negócio</span>
                <span className="font-medium">{cliente?.negocio}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">Contrato</span>
                <span className="font-medium text-green-600">
                  {cliente?.contratos[0]?.status === "ASSINADO"
                    ? "Assinado"
                    : "Processando"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Valor</span>
                <span className="font-medium text-lg">
                  R${" "}
                  {Number(cliente?.contratos[0]?.valor || 0).toLocaleString(
                    "pt-BR"
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Próximos passos */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Próximos Passos</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Confirmação por E-mail</p>
                  <p className="text-sm text-muted-foreground">
                    Você receberá um e-mail com todos os detalhes do contrato e
                    instruções de acesso.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Contato do Especialista</p>
                  <p className="text-sm text-muted-foreground">
                    Em até 24 horas, um especialista entrará em contato para
                    iniciar a otimização do seu Perfil de Empresa no Google.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Acesso ao Dashboard</p>
                  <p className="text-sm text-muted-foreground">
                    Após a confirmação do pagamento, você terá acesso ao painel
                    para acompanhar suas métricas.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Button variant="outline" className="h-auto py-4">
            <Download className="w-5 h-5 mr-2" />
            <div className="text-left">
              <p className="font-medium">Baixar Contrato</p>
              <p className="text-xs text-muted-foreground">PDF assinado</p>
            </div>
          </Button>

          <Button variant="outline" className="h-auto py-4">
            <Mail className="w-5 h-5 mr-2" />
            <div className="text-left">
              <p className="font-medium">Reenviar E-mail</p>
              <p className="text-xs text-muted-foreground">Confirmação</p>
            </div>
          </Button>
        </div>

        {/* Suporte */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dúvidas?</p>
                <p className="text-sm text-muted-foreground">
                  Fale conosco pelo WhatsApp
                </p>
              </div>
              <Button>
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Voltar */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="ghost">
              Voltar para o início
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SucessoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SucessoContent />
    </Suspense>
  );
}
