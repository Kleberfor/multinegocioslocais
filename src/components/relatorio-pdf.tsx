"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

interface RelatorioData {
  negocio: string;
  endereco: string;
  scoreGeral: number;
  scoreGBP: number;
  scoreSite: number;
  scoreRedes: number;
  temSite: boolean;
  perdaEstimada: number;
}

export function BotaoDownloadPDF({ data }: { data: RelatorioData }) {
  const [gerando, setGerando] = useState(false);

  const gerarPDF = async () => {
    setGerando(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Cores
      const corPrimaria = [37, 99, 235]; // Azul
      const corCritico = [220, 38, 38]; // Vermelho
      const corRegular = [234, 179, 8]; // Amarelo
      const corBom = [22, 163, 74]; // Verde

      const getCorScore = (score: number): number[] => {
        if (score >= 70) return corBom;
        if (score >= 40) return corRegular;
        return corCritico;
      };

      const getStatusScore = (score: number): string => {
        if (score >= 70) return "Bom";
        if (score >= 40) return "Regular";
        return "Crítico";
      };

      // Header
      doc.setFillColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
      doc.rect(0, 0, pageWidth, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório de Visibilidade Digital", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("MultiNegócios Locais", pageWidth / 2, 32, { align: "center" });

      // Info do negócio
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(data.negocio, 20, 55);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(data.endereco, 20, 62);

      // Data do relatório
      const dataAtual = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      doc.text(`Gerado em: ${dataAtual}`, 20, 70);

      // Score Principal
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(20, 80, pageWidth - 40, 50, 3, 3, "F");

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Score Geral de Visibilidade", pageWidth / 2, 92, { align: "center" });

      const corScoreGeral = getCorScore(data.scoreGeral);
      doc.setTextColor(corScoreGeral[0], corScoreGeral[1], corScoreGeral[2]);
      doc.setFontSize(36);
      doc.setFont("helvetica", "bold");
      doc.text(`${data.scoreGeral}/100`, pageWidth / 2, 115, { align: "center" });

      doc.setFontSize(12);
      doc.text(getStatusScore(data.scoreGeral), pageWidth / 2, 125, { align: "center" });

      // Scores por área
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Análise por Área", 20, 150);

      const desenharBarraScore = (label: string, score: number, y: number) => {
        const corBarra = getCorScore(score);
        const larguraMaxima = pageWidth - 80;
        const larguraBarra = (score / 100) * larguraMaxima;

        // Label
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text(label, 20, y);

        // Score
        doc.setTextColor(corBarra[0], corBarra[1], corBarra[2]);
        doc.setFont("helvetica", "bold");
        doc.text(`${score}/100`, pageWidth - 20, y, { align: "right" });

        // Barra de fundo
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(20, y + 2, larguraMaxima, 6, 2, 2, "F");

        // Barra de progresso
        if (score > 0) {
          doc.setFillColor(corBarra[0], corBarra[1], corBarra[2]);
          doc.roundedRect(20, y + 2, larguraBarra, 6, 2, 2, "F");
        }
      };

      desenharBarraScore("Google Business Profile", data.scoreGBP, 160);
      desenharBarraScore("Site", data.temSite ? data.scoreSite : 0, 180);
      desenharBarraScore("Redes Sociais", data.scoreRedes, 200);

      // Alerta de perda (se score < 70)
      if (data.scoreGeral < 70) {
        doc.setFillColor(254, 242, 242);
        doc.roundedRect(20, 220, pageWidth - 40, 35, 3, 3, "F");

        doc.setDrawColor(220, 38, 38);
        doc.setLineWidth(0.5);
        doc.roundedRect(20, 220, pageWidth - 40, 35, 3, 3, "S");

        doc.setTextColor(153, 27, 27);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Você está perdendo clientes", 30, 233);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Estimativa de perda mensal:", 30, 243);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 38, 38);
        doc.text(`R$ ${data.perdaEstimada.toLocaleString("pt-BR")}/mês`, 90, 243);
      }

      // Problemas identificados
      const yProblemas = data.scoreGeral < 70 ? 270 : 230;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Problemas Identificados", 20, yProblemas);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);

      let yItem = yProblemas + 12;
      const problemas: string[] = [];

      if (data.scoreGBP < 70) {
        problemas.push("• Seu Google Business Profile precisa de otimização");
      }
      if (data.scoreSite < 50) {
        problemas.push(data.temSite
          ? "• Seu site tem problemas de performance"
          : "• Você não possui site profissional"
        );
      }
      if (data.scoreRedes < 50) {
        problemas.push("• Sua presença em redes sociais pode melhorar");
      }
      problemas.push("• Há oportunidades para aumentar suas avaliações");

      problemas.forEach((problema) => {
        doc.text(problema, 25, yItem);
        yItem += 8;
      });

      // CTA
      const yCTA = yItem + 15;
      doc.setFillColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
      doc.roundedRect(20, yCTA, pageWidth - 40, 30, 3, 3, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Quer resolver esses problemas?", pageWidth / 2, yCTA + 12, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Fale com um especialista: (11) 91668-2510", pageWidth / 2, yCTA + 22, { align: "center" });

      // Footer
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text(
        "© MultiNegócios Locais - Todos os direitos reservados",
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );

      // Salvar
      const nomeArquivo = `relatorio-${data.negocio.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      doc.save(nomeArquivo);

    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setGerando(false);
    }
  };

  return (
    <Button
      onClick={gerarPDF}
      disabled={gerando}
      variant="outline"
      className="gap-2"
    >
      {gerando ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Baixar Relatório PDF
        </>
      )}
    </Button>
  );
}
