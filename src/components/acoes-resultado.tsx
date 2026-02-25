"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle, Share2, FileText } from "lucide-react";
import { BotaoDownloadPDF } from "./relatorio-pdf";

interface AcoesResultadoProps {
  negocio: string;
  endereco: string;
  scoreGeral: number;
  scoreGBP: number;
  scoreSite: number;
  scoreRedes: number;
  temSite: boolean;
  perdaEstimada: number;
  whatsappNumero: string;
  leadId?: string;
  temProposta?: boolean;
}

export function AcoesResultado({
  negocio,
  endereco,
  scoreGeral,
  scoreGBP,
  scoreSite,
  scoreRedes,
  temSite,
  perdaEstimada,
  whatsappNumero,
  leadId,
  temProposta,
}: AcoesResultadoProps) {
  const mensagemWhatsApp = encodeURIComponent(
    `Olá! Fiz a análise do meu negócio ${negocio} e gostaria de saber mais sobre como melhorar minha presença digital.`
  );

  const compartilharWhatsApp = () => {
    const urlAnalise = process.env.NEXT_PUBLIC_APP_URL || "https://multinegocioslocais.com.br";
    const texto = encodeURIComponent(
      `Acabei de analisar a presença digital do meu negócio "${negocio}" e descobri que meu score é ${scoreGeral}/100. Faça a sua análise gratuita também!\n\n${urlAnalise}/analisar`
    );
    window.open(`https://wa.me/?text=${texto}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Botões principais */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {temProposta && leadId && (
          <Link href={`/proposta/${leadId}`}>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto font-semibold">
              <FileText className="w-5 h-5 mr-2" />
              Ver Proposta Personalizada
            </Button>
          </Link>
        )}
        <a
          href={`https://wa.me/${whatsappNumero}?text=${mensagemWhatsApp}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="lg" variant={temProposta ? "outline" : "secondary"} className="w-full sm:w-auto font-semibold bg-white/20 border-white/50 text-white hover:bg-white/30">
            <MessageCircle className="w-5 h-5 mr-2" />
            Falar com Especialista
          </Button>
        </a>
      </div>

      {/* Botões secundários */}
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <BotaoDownloadPDF
          data={{
            negocio,
            endereco,
            scoreGeral,
            scoreGBP,
            scoreSite,
            scoreRedes,
            temSite,
            perdaEstimada,
          }}
          className="bg-white/20 border-white/50 text-white hover:bg-white/30"
        />

        <Button
          onClick={compartilharWhatsApp}
          variant="outline"
          className="gap-2 bg-white/20 border-white/50 text-white hover:bg-white/30"
        >
          <Share2 className="w-4 h-4" />
          Compartilhar
        </Button>
      </div>
    </div>
  );
}
