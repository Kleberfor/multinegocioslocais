import { NextResponse } from "next/server";
import { processarFollowUpsPendentes, obterEstatisticasFollowUp } from "@/lib/followup";

// Chave secreta para proteger o endpoint
const CRON_SECRET = process.env.CRON_SECRET || "default-cron-secret";

/**
 * POST /api/followup/process
 * Processa follow-ups pendentes
 * Deve ser chamado por um cron job (ex: Vercel Cron, Railway Cron)
 */
export async function POST(request: Request) {
  try {
    // Verificar autorização
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      console.error("[API] Acesso não autorizado ao processamento de follow-ups");
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    console.log("[API] Iniciando processamento de follow-ups...");

    const resultado = await processarFollowUpsPendentes();

    return NextResponse.json({
      success: true,
      ...resultado,
      processadoEm: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] Erro ao processar follow-ups:", error);
    return NextResponse.json(
      { error: "Erro ao processar follow-ups" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/followup/process
 * Retorna estatísticas de follow-ups
 */
export async function GET(request: Request) {
  try {
    // Verificar autorização
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const estatisticas = await obterEstatisticasFollowUp();

    return NextResponse.json({
      success: true,
      estatisticas,
    });
  } catch (error) {
    console.error("[API] Erro ao obter estatísticas:", error);
    return NextResponse.json(
      { error: "Erro ao obter estatísticas" },
      { status: 500 }
    );
  }
}
