import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { SEGMENTOS_LIST } from "@/lib/segmentos";

// GET - Listar todos os dados de mercado
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }

    // Buscar dados do banco
    const dadosBanco = await prisma.dadosMercado.findMany({
      orderBy: [{ segmento: "asc" }, { regiao: "asc" }],
    });

    // Criar mapa de dados existentes
    const dadosMap = new Map<string, typeof dadosBanco[0]>();
    dadosBanco.forEach((d) => {
      const key = d.regiao ? `${d.segmento}:${d.regiao}` : d.segmento;
      dadosMap.set(key, d);
    });

    // Mesclar com lista completa de segmentos (para mostrar todos, mesmo sem dados no banco)
    const resultado = SEGMENTOS_LIST.map((seg) => {
      const dadoBanco = dadosMap.get(seg.value);

      return {
        segmento: seg.value,
        nome: seg.label,
        regiao: null,
        ticketMedio: dadoBanco ? Number(dadoBanco.ticketMedio) : null,
        clientesPotenciaisMes: dadoBanco?.clientesPotenciaisMes || null,
        fatorMultiplicador: dadoBanco ? Number(dadoBanco.fatorMultiplicador) : null,
        fonteTicket: dadoBanco?.fonteTicket || null,
        fonteBuscas: dadoBanco?.fonteBuscas || null,
        observacoes: dadoBanco?.observacoes || null,
        atualizadoEm: dadoBanco?.updatedAt || null,
        atualizadoPor: dadoBanco?.atualizadoPor || null,
        existeNoBanco: !!dadoBanco,
      };
    });

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Erro ao buscar dados de mercado:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar ou criar dados de mercado
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      segmento,
      regiao,
      ticketMedio,
      clientesPotenciaisMes,
      fatorMultiplicador,
      fonteTicket,
      fonteBuscas,
      observacoes,
    } = body;

    if (!segmento) {
      return NextResponse.json(
        { error: "Segmento é obrigatório" },
        { status: 400 }
      );
    }

    if (!ticketMedio || !clientesPotenciaisMes) {
      return NextResponse.json(
        { error: "Ticket médio e clientes potenciais são obrigatórios" },
        { status: 400 }
      );
    }

    // Upsert - cria ou atualiza
    const dados = await prisma.dadosMercado.upsert({
      where: {
        segmento_regiao: {
          segmento,
          regiao: regiao || null,
        },
      },
      update: {
        ticketMedio,
        clientesPotenciaisMes: parseInt(clientesPotenciaisMes),
        fatorMultiplicador: fatorMultiplicador || 1.0,
        fonteTicket,
        fonteBuscas,
        observacoes,
        atualizadoPorId: user.id,
        atualizadoPor: user.name || user.email,
      },
      create: {
        segmento,
        regiao: regiao || null,
        ticketMedio,
        clientesPotenciaisMes: parseInt(clientesPotenciaisMes),
        fatorMultiplicador: fatorMultiplicador || 1.0,
        fonteTicket,
        fonteBuscas,
        observacoes,
        atualizadoPorId: user.id,
        atualizadoPor: user.name || user.email,
      },
    });

    return NextResponse.json({
      success: true,
      dados,
    });
  } catch (error) {
    console.error("Erro ao salvar dados de mercado:", error);
    return NextResponse.json(
      { error: "Erro ao salvar dados" },
      { status: 500 }
    );
  }
}
