"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CheckCircle,
  CreditCard,
  QrCode,
  Barcode,
  Shield,
  Lock,
} from "lucide-react";

interface ClienteData {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  negocio: string;
  planoId: string;
  contratos: {
    id: string;
    valor: number;
    parcelas: number;
    status: string;
  }[];
}

type PaymentMethod = "pix" | "credit_card" | "boleto";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteId = searchParams.get("cliente");

  const [cliente, setCliente] = useState<ClienteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

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

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Simular processamento de pagamento
      // TODO: Integrar com Mercado Pago no E-4
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Criar pagamento no banco
      const response = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId,
          contratoId: cliente?.contratos[0]?.id,
          method: paymentMethod,
        }),
      });

      if (response.ok) {
        router.push(`/sucesso?cliente=${clienteId}`);
      } else {
        alert("Erro ao processar pagamento. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const clean = value.replace(/\D/g, "");
    const formatted = clean.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted.substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    const clean = value.replace(/\D/g, "");
    if (clean.length >= 2) {
      return `${clean.substring(0, 2)}/${clean.substring(2, 4)}`;
    }
    return clean;
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
  const valorTotal = Number(contrato?.valor || 0);
  const parcelas = contrato?.parcelas || 1;
  const valorParcela = valorTotal / parcelas;

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
          <h1 className="text-2xl font-bold">Pagamento</h1>
          <p className="text-muted-foreground mt-2">
            Escolha a forma de pagamento para finalizar sua contratação
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
            <div className="w-12 h-0.5 bg-green-500" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium">Contrato</span>
            </div>
            <div className="w-12 h-0.5 bg-primary" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium">Pagamento</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Resumo do pedido */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{cliente.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Negócio</p>
                  <p className="font-medium">{cliente.negocio}</p>
                </div>
                <hr />
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {valorTotal.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parcelamento</p>
                  <p className="font-medium">
                    {parcelas}x de R$ {valorParcela.toLocaleString("pt-BR")}
                  </p>
                </div>
                <hr />
                <div className="flex items-center text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 mr-2" />
                  Pagamento 100% seguro
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Lock className="w-4 h-4 mr-2" />
                  Dados protegidos
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formas de pagamento */}
          <div className="lg:col-span-2 order-1 lg:order-2 space-y-6">
            {/* Seleção de método */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <button
                    onClick={() => setPaymentMethod("pix")}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      paymentMethod === "pix"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <QrCode className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">PIX</p>
                    <p className="text-xs text-muted-foreground">
                      Aprovação instantânea
                    </p>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("credit_card")}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      paymentMethod === "credit_card"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <CreditCard className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">Cartão de Crédito</p>
                    <p className="text-xs text-muted-foreground">
                      Até {parcelas}x sem juros
                    </p>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("boleto")}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      paymentMethod === "boleto"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <Barcode className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">Boleto</p>
                    <p className="text-xs text-muted-foreground">
                      Vencimento em 3 dias
                    </p>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes do pagamento */}
            <Card>
              <CardContent className="pt-6">
                {paymentMethod === "pix" && (
                  <div className="text-center py-8">
                    <QrCode className="w-32 h-32 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">
                      QR Code PIX será gerado após confirmar
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Escaneie o código com o app do seu banco para pagar
                      instantaneamente
                    </p>
                  </div>
                )}

                {paymentMethod === "credit_card" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(formatCardNumber(e.target.value))
                        }
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardName">Nome no Cartão</Label>
                      <Input
                        id="cardName"
                        value={cardName}
                        onChange={(e) =>
                          setCardName(e.target.value.toUpperCase())
                        }
                        placeholder="NOME COMO NO CARTÃO"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="cardExpiry">Validade</Label>
                        <Input
                          id="cardExpiry"
                          value={cardExpiry}
                          onChange={(e) =>
                            setCardExpiry(formatExpiry(e.target.value))
                          }
                          placeholder="MM/AA"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardCvv">CVV</Label>
                        <Input
                          id="cardCvv"
                          value={cardCvv}
                          onChange={(e) =>
                            setCardCvv(e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="000"
                          maxLength={4}
                          type="password"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Parcelamento em {parcelas}x de R${" "}
                      {valorParcela.toLocaleString("pt-BR")} sem juros
                    </p>
                  </div>
                )}

                {paymentMethod === "boleto" && (
                  <div className="text-center py-8">
                    <Barcode className="w-32 h-32 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">
                      Boleto será gerado após confirmar
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vencimento em 3 dias úteis. O acesso será liberado após
                      confirmação do pagamento (até 3 dias úteis).
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botões */}
            <div className="flex justify-between">
              <Link href={`/contratar/contrato?cliente=${clienteId}`}>
                <Button type="button" variant="outline">
                  Voltar
                </Button>
              </Link>
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    {paymentMethod === "pix" && "Gerar QR Code PIX"}
                    {paymentMethod === "credit_card" && "Pagar com Cartão"}
                    {paymentMethod === "boleto" && "Gerar Boleto"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
