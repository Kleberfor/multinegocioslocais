// lib/pdf.ts
// Utilitário para geração de PDFs (relatório de análise e contrato)
// Usa jspdf para geração server-side

import jsPDF from "jspdf";

// Tipos
export interface AnalysisReportData {
  negocio: string;
  endereco?: string;
  dataAnalise: string;
  scoreGeral: number;
  scoreGBP: number;
  scoreSite: number;
  scoreRedes: number;
  problemas: string[];
  oportunidades: string[];
}

export interface ContractData {
  clienteNome: string;
  clienteCpfCnpj: string;
  clienteEndereco: string;
  negocio: string;
  plano: string;
  valorTotal: number;
  parcelas: number;
  dataContrato: string;
  numeroContrato: string;
}

// Cores do tema (tuplas para compatibilidade com jsPDF)
const COLORS: Record<string, [number, number, number]> = {
  primary: [59, 130, 246], // blue-500
  success: [34, 197, 94], // green-500
  warning: [234, 179, 8], // yellow-500
  danger: [239, 68, 68], // red-500
  gray: [107, 114, 128], // gray-500
  dark: [31, 41, 55], // gray-800
};

/**
 * Gera PDF do relatório de análise
 */
export function generateAnalysisReport(data: AnalysisReportData): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Presença Digital", pageWidth / 2, 25, { align: "center" });

  // Subtítulo
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("MultiNegócios Locais", pageWidth / 2, 35, { align: "center" });

  y = 55;

  // Dados do negócio
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(data.negocio, 20, y);

  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
  if (data.endereco) {
    doc.text(data.endereco, 20, y);
    y += 6;
  }
  doc.text(`Análise realizada em: ${data.dataAnalise}`, 20, y);

  y += 15;

  // Score Principal
  const scoreColor = getScoreColor(data.scoreGeral);
  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(20, y, pageWidth - 40, 50, 5, 5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Score de Visibilidade Digital", pageWidth / 2, y + 15, { align: "center" });

  doc.setFontSize(36);
  doc.text(`${data.scoreGeral}`, pageWidth / 2, y + 38, { align: "center" });

  doc.setFontSize(14);
  doc.text("/100", pageWidth / 2 + 25, y + 38);

  y += 65;

  // Scores por Área
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Análise por Área", 20, y);

  y += 10;

  // Barras de progresso
  const scores = [
    { label: "Google Business Profile", score: data.scoreGBP },
    { label: "Site", score: data.scoreSite },
    { label: "Redes Sociais", score: data.scoreRedes },
  ];

  scores.forEach((item) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    doc.text(item.label, 20, y);
    doc.text(`${item.score}/100`, pageWidth - 30, y, { align: "right" });

    y += 5;

    // Barra de fundo
    doc.setFillColor(229, 231, 235);
    doc.roundedRect(20, y, pageWidth - 40, 6, 3, 3, "F");

    // Barra de progresso
    const barWidth = ((pageWidth - 40) * item.score) / 100;
    const itemColor = getScoreColor(item.score);
    doc.setFillColor(itemColor[0], itemColor[1], itemColor[2]);
    doc.roundedRect(20, y, barWidth, 6, 3, 3, "F");

    y += 15;
  });

  y += 10;

  // Problemas Identificados
  if (data.problemas.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    doc.text("Problemas Identificados", 20, y);

    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    data.problemas.forEach((problema) => {
      doc.setFillColor(COLORS.danger[0], COLORS.danger[1], COLORS.danger[2]);
      doc.circle(25, y - 1.5, 2, "F");
      doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
      doc.text(problema, 32, y);
      y += 7;
    });

    y += 5;
  }

  // Oportunidades
  if (data.oportunidades.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    doc.text("Oportunidades de Melhoria", 20, y);

    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    data.oportunidades.forEach((oportunidade) => {
      doc.setFillColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
      doc.circle(25, y - 1.5, 2, "F");
      doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
      doc.text(oportunidade, 32, y);
      y += 7;
    });
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
  doc.text(
    "Este relatório foi gerado automaticamente por MultiNegócios Locais",
    pageWidth / 2,
    pageHeight - 15,
    { align: "center" }
  );
  doc.text(
    "www.multinegocioslocais.com.br",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * Gera PDF do contrato de serviço
 */
export function generateContract(data: ContractData): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS", pageWidth / 2, 20, { align: "center" });

  y = 45;

  // Número do contrato
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Contrato nº: ${data.numeroContrato}`, 20, y);
  doc.text(`Data: ${data.dataContrato}`, pageWidth - 20, y, { align: "right" });

  y += 15;

  // Título da seção
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. DAS PARTES", 20, y);

  y += 10;

  // Contratante
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CONTRATANTE:", 20, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  doc.text(`Nome: ${data.clienteNome}`, 25, y);
  y += 5;
  doc.text(`CPF/CNPJ: ${data.clienteCpfCnpj}`, 25, y);
  y += 5;
  doc.text(`Endereço: ${data.clienteEndereco}`, 25, y);

  y += 12;

  // Contratada
  doc.setFont("helvetica", "bold");
  doc.text("CONTRATADA:", 20, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  doc.text("MultiNegócios Locais Tecnologia LTDA", 25, y);
  y += 5;
  doc.text("CNPJ: XX.XXX.XXX/0001-XX", 25, y);

  y += 15;

  // Objeto
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("2. DO OBJETO", 20, y);

  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const objetoText = `O presente contrato tem por objeto a prestação de serviços de gestão de presença digital para o estabelecimento "${data.negocio}", incluindo otimização de perfil no Google Business Profile, gestão de avaliações, e demais serviços do plano ${data.plano}.`;

  const splitObjeto = doc.splitTextToSize(objetoText, pageWidth - 40);
  doc.text(splitObjeto, 20, y);
  y += splitObjeto.length * 5 + 10;

  // Valor
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("3. DO VALOR E PAGAMENTO", 20, y);

  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Valor Total: R$ ${data.valorTotal.toLocaleString("pt-BR")}`, 20, y);
  y += 6;
  doc.text(`Forma de Pagamento: ${data.parcelas}x de R$ ${(data.valorTotal / data.parcelas).toLocaleString("pt-BR")}`, 20, y);

  y += 15;

  // Vigência
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("4. DA VIGÊNCIA", 20, y);

  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("O presente contrato terá vigência de 12 (doze) meses a partir da data de assinatura.", 20, y);

  y += 15;

  // Cláusulas Gerais
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("5. DAS CLÁUSULAS GERAIS", 20, y);

  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const clausulas = [
    "5.1. A CONTRATADA se compromete a executar os serviços com diligência e qualidade.",
    "5.2. O CONTRATANTE autoriza a CONTRATADA a acessar e gerenciar seu perfil no Google.",
    "5.3. O cancelamento poderá ser solicitado com 30 dias de antecedência.",
    "5.4. Fica eleito o foro da comarca de São Paulo/SP para dirimir eventuais litígios.",
  ];

  clausulas.forEach((clausula) => {
    const splitClausula = doc.splitTextToSize(clausula, pageWidth - 40);
    doc.text(splitClausula, 20, y);
    y += splitClausula.length * 5 + 3;
  });

  y += 20;

  // Assinaturas
  doc.setFontSize(10);
  doc.line(20, y, 90, y);
  doc.line(pageWidth - 90, y, pageWidth - 20, y);

  y += 5;
  doc.text("CONTRATANTE", 55, y, { align: "center" });
  doc.text("CONTRATADA", pageWidth - 55, y, { align: "center" });

  y += 5;
  doc.setFontSize(8);
  doc.text(data.clienteNome, 55, y, { align: "center" });
  doc.text("MultiNegócios Locais", pageWidth - 55, y, { align: "center" });

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
  doc.text("Página 1 de 1", pageWidth / 2, pageHeight - 10, { align: "center" });

  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * Retorna a cor baseada no score
 */
function getScoreColor(score: number): [number, number, number] {
  if (score >= 70) return COLORS.success as [number, number, number];
  if (score >= 40) return COLORS.warning as [number, number, number];
  return COLORS.danger as [number, number, number];
}

/**
 * Converte Buffer para Base64
 */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}

/**
 * Gera URL de dados para exibição no browser
 */
export function bufferToDataUrl(buffer: Buffer): string {
  return `data:application/pdf;base64,${bufferToBase64(buffer)}`;
}
