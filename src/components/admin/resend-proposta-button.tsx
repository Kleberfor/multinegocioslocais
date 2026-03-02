"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Send, Loader2, CheckCircle } from "lucide-react";

interface ResendPropostaButtonProps {
  tipo: "lead" | "prospect";
  id: string;
  nome: string;
  email: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export function ResendPropostaButton({
  tipo,
  id,
  nome,
  email,
  variant = "outline",
  size = "sm",
  showText = true,
}: ResendPropostaButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/proposta/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tipo, id }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Mensagem especial para serviço não configurado
        if (response.status === 503) {
          throw new Error("Serviço de email não configurado. Configure a variável RESEND_API_KEY no arquivo .env");
        }
        throw new Error(data.error || "Erro ao reenviar proposta");
      }

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao reenviar:", error);
      alert(error instanceof Error ? error.message : "Erro ao reenviar proposta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Send className="w-4 h-4" />
          {showText && "Reenviar Proposta"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {success ? "Proposta Enviada!" : "Reenviar Proposta"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {success ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>A proposta foi reenviada com sucesso para {email}</span>
              </div>
            ) : (
              <>
                Deseja reenviar a proposta para <strong>{nome}</strong>?
                <br /><br />
                Um email será enviado para: <strong>{email}</strong>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {!success && (
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResend}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
