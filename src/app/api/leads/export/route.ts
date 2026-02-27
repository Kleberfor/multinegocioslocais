import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const segmento = searchParams.get("segmento");

    const where: { status?: string; segmento?: string } = {};
    if (status) where.status = status;
    if (segmento) where.segmento = segmento;

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { pesquisaEm: "desc" },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        whatsapp: true,
        negocio: true,
        siteUrl: true,
        segmento: true,
        enderecoGoogle: true,
        scoreGeral: true,
        scoreGBP: true,
        scoreSite: true,
        scoreRedes: true,
        valorSugerido: true,
        status: true,
        convertido: true,
        origem: true,
        pesquisaEm: true,
        contatadoEm: true,
      },
    });

    // Gerar CSV
    const headers = [
      "ID",
      "Nome",
      "Email",
      "Telefone",
      "WhatsApp",
      "Negócio",
      "Site",
      "Segmento",
      "Endereço",
      "Score Geral",
      "Score Google",
      "Score Site",
      "Score Redes",
      "Valor Sugerido",
      "Status",
      "Convertido",
      "Origem",
      "Data Pesquisa",
      "Data Contato",
    ];

    const rows = leads.map((lead) => [
      lead.id,
      `"${lead.nome}"`,
      lead.email,
      lead.telefone,
      lead.whatsapp || "",
      `"${lead.negocio}"`,
      lead.siteUrl || "",
      lead.segmento,
      `"${lead.enderecoGoogle || ""}"`,
      lead.scoreGeral?.toString() || "",
      lead.scoreGBP?.toString() || "",
      lead.scoreSite?.toString() || "",
      lead.scoreRedes?.toString() || "",
      lead.valorSugerido?.toString() || "",
      lead.status,
      lead.convertido ? "Sim" : "Não",
      lead.origem || "",
      lead.pesquisaEm
        ? new Date(lead.pesquisaEm).toLocaleDateString("pt-BR")
        : "",
      lead.contatadoEm
        ? new Date(lead.contatadoEm).toLocaleDateString("pt-BR")
        : "",
    ]);

    const csv = [headers.join(";"), ...rows.map((row) => row.join(";"))].join(
      "\n"
    );

    // Adicionar BOM para Excel reconhecer UTF-8
    const bom = "\uFEFF";
    const csvWithBom = bom + csv;

    const filename = `leads-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvWithBom, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar leads:", error);
    return NextResponse.json(
      { error: "Erro ao exportar leads" },
      { status: 500 }
    );
  }
}
