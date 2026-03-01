"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Loader2, Check, Copy } from "lucide-react";

interface SendScoreButtonsProps {
  prospectId: string;
  prospectNome: string;
  prospectEmail: string | null;
  prospectTelefone: string | null;
  score: number;
  publicUrl: string;
}

export function SendScoreButtons({
  prospectId,
  prospectNome,
  prospectEmail,
  prospectTelefone,
  score,
  publicUrl,
}: SendScoreButtonsProps) {
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const primeiroNome = prospectNome.split(" ")[0];

  // Mensagem padrão para WhatsApp
  const mensagemWhatsApp = encodeURIComponent(
    `Olá ${primeiroNome}! 👋\n\n` +
      `Conforme conversamos, finalizei a análise de presença digital do seu negócio.\n\n` +
      `📊 *Score: ${score}/100*\n\n` +
      `Veja o resultado completo e as oportunidades de melhoria:\n` +
      `${publicUrl}\n\n` +
      `Se quiser melhorar sua presença digital e atrair mais clientes, estou à disposição! 🚀`
  );

  const handleSendWhatsApp = () => {
    if (!prospectTelefone) return;

    const telefoneFormatado = prospectTelefone.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/55${telefoneFormatado}?text=${mensagemWhatsApp}`;

    window.open(whatsappUrl, "_blank");
  };

  const handleSendEmail = async () => {
    if (!prospectEmail) return;

    setIsSendingEmail(true);

    try {
      const response = await fetch("/api/email/send-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId,
          email: prospectEmail,
          nome: prospectNome,
          score,
          publicUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao enviar email");
      }

      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (error) {
      console.error("Erro:", error);
      alert(error instanceof Error ? error.message : "Erro ao enviar email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Não foi possível copiar o link");
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Botão WhatsApp */}
      {prospectTelefone ? (
        <Button
          onClick={handleSendWhatsApp}
          className="bg-green-600 hover:bg-green-700"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Enviar por WhatsApp
        </Button>
      ) : (
        <Button disabled variant="outline">
          <MessageSquare className="w-4 h-4 mr-2" />
          WhatsApp não disponível
        </Button>
      )}

      {/* Botão Email */}
      {prospectEmail ? (
        <Button
          onClick={handleSendEmail}
          disabled={isSendingEmail}
          variant="outline"
        >
          {isSendingEmail ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : emailSent ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-600" />
              Email Enviado!
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Enviar por Email
            </>
          )}
        </Button>
      ) : (
        <Button disabled variant="outline">
          <Mail className="w-4 h-4 mr-2" />
          Email não disponível
        </Button>
      )}

      {/* Botão Copiar Link */}
      <Button onClick={handleCopyLink} variant="ghost">
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2 text-green-600" />
            Copiado!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copiar Link
          </>
        )}
      </Button>
    </div>
  );
}
