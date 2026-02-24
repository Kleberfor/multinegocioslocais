import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { realizarAnaliseCombinada } from "@/lib/combined-analysis";
import { auth } from "@/lib/auth";
import { enviarNotificacaoNovoLead } from "@/lib/email";
import { agendarFollowUpsParaLead } from "@/lib/followup";

// POST: Criar novo lead com análise
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      nome,
      email,
      telefone,
      whatsapp,
      negocio,
      siteUrl,
      segmento,
      placeId,
      origem,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    // Validação básica
    if (!nome || !email || !telefone || !negocio || !segmento || !placeId) {
      return NextResponse.json(
        { error: "Campos obrigatórios: nome, email, telefone, negocio, segmento, placeId" },
        { status: 400 }
      );
    }

    // Verificar se já existe lead com este email E mesmo placeId
    const leadExistente = await prisma.lead.findFirst({
      where: {
        email,
        placeId,
      },
    });

    if (leadExistente) {
      // Normalizar novo siteUrl
      const novoSiteUrl = siteUrl && siteUrl.trim() !== '' ? siteUrl.trim() : null;

      // Condições para refazer a análise:
      // 1. Lead não tinha siteUrl e agora tem
      // 2. Lead tinha siteUrl mas scoreSite é 0 (análise falhou antes)
      // 3. siteUrl mudou
      const siteUrlMudou = !leadExistente.siteUrl && novoSiteUrl;
      const analiseDoSiteFalhou = leadExistente.siteUrl && leadExistente.scoreSite === 0;
      const siteUrlDiferente = novoSiteUrl && leadExistente.siteUrl !== novoSiteUrl;

      const deveRefazerAnalise = siteUrlMudou || analiseDoSiteFalhou || siteUrlDiferente;

      if (deveRefazerAnalise) {
        console.log('[leads] Refazendo análise - motivo:', {
          siteUrlMudou,
          analiseDoSiteFalhou,
          siteUrlDiferente,
          siteUrlAntigo: leadExistente.siteUrl,
          siteUrlNovo: novoSiteUrl,
        });
        // Usar o siteUrl do request ou manter o existente
        const siteUrlParaAnalise = novoSiteUrl || leadExistente.siteUrl;

        // Refazer análise com o site URL
        const analiseAtualizada = await realizarAnaliseCombinada(
          placeId,
          siteUrlParaAnalise,
          segmento
        );

        console.log('[leads] Nova análise do site - scoreSite:', analiseAtualizada.analisePublica.scoreSite);

        // Atualizar lead com nova análise
        const leadAtualizado = await prisma.lead.update({
          where: { id: leadExistente.id },
          data: {
            siteUrl: siteUrlParaAnalise,
            scoreGeral: analiseAtualizada.analisePublica.scoreGeral,
            scoreGBP: analiseAtualizada.analisePublica.scoreGBP,
            scoreSite: analiseAtualizada.analisePublica.scoreSite,
            scoreRedes: analiseAtualizada.analisePublica.scoreRedes,
            analiseCompleta: JSON.parse(JSON.stringify(analiseAtualizada)),
            argumentosFechamento: JSON.parse(JSON.stringify(analiseAtualizada.argumentosFechamento)),
            planoAcao: JSON.parse(JSON.stringify(analiseAtualizada.planoAcao)),
            proposta: JSON.parse(JSON.stringify(analiseAtualizada.proposta)),
            valorSugerido: analiseAtualizada.proposta.valorImplantacao,
          },
        });

        return NextResponse.json({
          id: leadAtualizado.id,
          analisePublica: analiseAtualizada.analisePublica,
          mensagem: "Análise atualizada com dados do site",
        });
      }

      // Mesmo usuário analisando o mesmo negócio sem mudança no site - retornar análise existente
      return NextResponse.json({
        id: leadExistente.id,
        analisePublica: {
          scoreGeral: leadExistente.scoreGeral,
          scoreGBP: leadExistente.scoreGBP,
          scoreSite: leadExistente.scoreSite,
          scoreRedes: leadExistente.scoreRedes,
        },
        mensagem: "Análise já realizada para este negócio",
      });
    }

    // Normalizar siteUrl (remover espaços, garantir que não seja string vazia)
    const siteUrlNormalizado = siteUrl && siteUrl.trim() !== '' ? siteUrl.trim() : null;

    // Realizar análise combinada (novo negócio ou novo usuário)
    const analiseCompleta = await realizarAnaliseCombinada(
      placeId,
      siteUrlNormalizado,
      segmento
    );

    // Criar lead no banco
    const lead = await prisma.lead.create({
      data: {
        nome,
        email,
        telefone,
        whatsapp,
        negocio,
        siteUrl: siteUrlNormalizado,
        segmento,
        placeId,
        enderecoGoogle: analiseCompleta.dadosGBP.endereco,

        // Scores públicos
        scoreGeral: analiseCompleta.analisePublica.scoreGeral,
        scoreGBP: analiseCompleta.analisePublica.scoreGBP,
        scoreSite: analiseCompleta.analisePublica.scoreSite,
        scoreRedes: analiseCompleta.analisePublica.scoreRedes,

        // Análise interna (JSON)
        analiseCompleta: JSON.parse(JSON.stringify(analiseCompleta)),
        argumentosFechamento: JSON.parse(JSON.stringify(analiseCompleta.argumentosFechamento)),
        planoAcao: JSON.parse(JSON.stringify(analiseCompleta.planoAcao)),

        // Proposta
        proposta: JSON.parse(JSON.stringify(analiseCompleta.proposta)),
        valorSugerido: analiseCompleta.proposta.valorImplantacao,

        // Rastreamento
        origem,
        utmSource,
        utmMedium,
        utmCampaign,

        // Status inicial
        status: "NOVO",
        pesquisaEm: new Date(),
      },
    });

    // Enviar notificação por email (não bloqueia a resposta)
    enviarNotificacaoNovoLead({
      id: lead.id,
      nome,
      email,
      telefone,
      negocio,
      segmento,
      scoreGeral: analiseCompleta.analisePublica.scoreGeral,
      scoreGBP: analiseCompleta.analisePublica.scoreGBP,
      scoreSite: analiseCompleta.analisePublica.scoreSite,
      valorSugerido: analiseCompleta.proposta.valorImplantacao,
    }).catch((err) => console.error("[Leads] Erro ao enviar email:", err));

    // Agendar follow-ups automáticos (não bloqueia a resposta)
    agendarFollowUpsParaLead(lead.id).catch((err) =>
      console.error("[Leads] Erro ao agendar follow-ups:", err)
    );

    // Retornar apenas dados públicos para o cliente
    return NextResponse.json({
      id: lead.id,
      analisePublica: analiseCompleta.analisePublica,
    });

  } catch (error) {
    console.error("Erro ao criar lead:", error);
    return NextResponse.json(
      { error: "Erro ao processar análise" },
      { status: 500 }
    );
  }
}

// GET: Listar leads (apenas para admin autenticado)
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "Não autorizado" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where = status ? { status } : {};

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { pesquisaEm: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          negocio: true,
          segmento: true,
          scoreGeral: true,
          scoreGBP: true,
          scoreSite: true,
          valorSugerido: true,
          status: true,
          convertido: true,
          pesquisaEm: true,
          contatadoEm: true,
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      total,
      limit,
      offset,
    });

  } catch (error) {
    console.error("Erro ao listar leads:", error);
    return NextResponse.json(
      { error: "Erro ao buscar leads" },
      { status: 500 }
    );
  }
}
