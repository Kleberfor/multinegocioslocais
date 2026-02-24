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
  Shield,
  Lock,
  Copy,
  ExternalLink,
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

type PaymentMethod = "pix" | "credit_card";

interface PixData {
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl: string;
  pagamentoId: string;
}


function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteId = searchParams.get("cliente");

  const [cliente, setCliente] = useState<ClienteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [paymentGenerated, setPaymentGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Polling para verificar status do pagamento PIX
  useEffect(() => {
    if (pixData?.pagamentoId) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/payment/status/${pixData.pagamentoId}`);
          const data = await response.json();

          if (data.status === "PAGO") {
            clearInterval(interval);
            router.push(`/sucesso?cliente=${clienteId}`);
          }
        } catch (error) {
          console.error("Erro ao verificar status:", error);
        }
      }, 5000); // Verificar a cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [pixData, clienteId, router]);

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

  const handlePixPayment = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch("/api/payment/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId,
          contratoId: cliente?.contratos[0]?.id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.qrCode) {
        setPixData({
          qrCode: data.qrCode,
          qrCodeBase64: data.qrCodeBase64,
          ticketUrl: data.ticketUrl,
          pagamentoId: data.pagamentoId,
        });
        setPaymentGenerated(true);
      } else {
        alert(data.error || "Erro ao gerar PIX. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao gerar PIX:", error);
      alert("Erro ao gerar PIX. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };


  const handleCardPayment = async () => {
    setIsProcessing(true);

    try {
      // Para cartão, redirecionar para página de sucesso após processamento
      // Em produção, usaria MercadoPago.js para tokenizar o cartão
      const response = await fetch("/api/payment/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId,
          contratoId: cliente?.contratos[0]?.id,
          token: "TEST-TOKEN", // Em produção, seria o token do cartão
          installments: cliente?.contratos[0]?.parcelas || 1,
          paymentMethodId: "visa",
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "approved") {
        router.push(`/sucesso?cliente=${clienteId}`);
      } else if (data.status === "in_process") {
        alert("Pagamento em processamento. Você receberá uma confirmação por e-mail.");
        router.push(`/sucesso?cliente=${clienteId}`);
      } else {
        alert(data.statusDetail || "Pagamento não aprovado. Verifique os dados do cartão.");
      }
    } catch (error) {
      console.error("Erro ao processar cartão:", error);
      alert("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    switch (paymentMethod) {
      case "pix":
        await handlePixPayment();
        break;
      case "credit_card":
        await handleCardPayment();
        break;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            {paymentGenerated
              ? "Complete o pagamento para finalizar"
              : "Escolha a forma de pagamento para finalizar sua contratação"}
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
            {!paymentGenerated ? (
              <>
                {/* Seleção de método */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Forma de Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
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
                    </div>
                  </CardContent>
                </Card>

                {/* Detalhes do pagamento */}
                <Card>
                  <CardContent className="pt-6">
                    {paymentMethod === "pix" && (
                      <div className="text-center py-8">
                        <QrCode className="w-24 h-24 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium mb-2">
                          Pague instantaneamente com PIX
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Após gerar o código, escaneie com o app do seu banco
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
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* PIX Gerado */}
                {pixData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <QrCode className="w-5 h-5 mr-2" />
                        Pague com PIX
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        {pixData.qrCodeBase64 ? (
                          <img
                            src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                            alt="QR Code PIX"
                            className="w-64 h-64 mx-auto border rounded-lg"
                          />
                        ) : (
                          <div className="w-64 h-64 mx-auto border rounded-lg flex items-center justify-center bg-muted">
                            <QrCode className="w-32 h-32 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div>
                        <Label>Código PIX (Copia e Cola)</Label>
                        <div className="flex mt-2">
                          <Input
                            value={pixData.qrCode}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            variant="outline"
                            className="ml-2"
                            onClick={() => copyToClipboard(pixData.qrCode)}
                          >
                            {copied ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Aguardando pagamento...</strong>
                          <br />
                          Após o pagamento, você será redirecionado automaticamente.
                        </p>
                      </div>

                      <div className="flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>

                      {/* Botões de ação */}
                      <div className="flex flex-col gap-3 pt-4 border-t">
                        {/* Botão Simular Pagamento - só em modo teste */}
                        {process.env.NEXT_PUBLIC_TEST_MODE === "true" && (
                          <Button
                            onClick={async () => {
                              setIsProcessing(true);
                              try {
                                // Simular aprovação do pagamento
                                const response = await fetch("/api/payment/simulate", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ pagamentoId: pixData.pagamentoId }),
                                });
                                if (response.ok) {
                                  router.push(`/sucesso?cliente=${clienteId}`);
                                }
                              } catch (error) {
                                console.error("Erro ao simular:", error);
                              } finally {
                                setIsProcessing(false);
                              }
                            }}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Simular Pagamento Aprovado (Teste)
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          onClick={() => {
                            setPaymentGenerated(false);
                            setPixData(null);
                          }}
                        >
                          Voltar e escolher outra forma de pagamento
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

              </>
            )}
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
