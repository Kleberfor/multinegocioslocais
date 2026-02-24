// Sistema de Follow-up Automático
// Agenda e executa follow-ups para leads

import { prisma } from "./prisma";
import { enviarEmailFollowUp } from "./email";

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type TipoFollowUp =
  | "PRIMEIRO_CONTATO"
  | "SEGUNDO_CONTATO"
  | "TERCEIRO_CONTATO"
  | "PROPOSTA"
  | "FECHAMENTO";

export type StatusFollowUp = "PENDENTE" | "ENVIADO" | "REALIZADO" | "CANCELADO";

export type CanalFollowUp = "EMAIL" | "WHATSAPP" | "TELEFONE";

export type ResultadoFollowUp =
  | "SUCESSO"
  | "SEM_RESPOSTA"
  | "NEGATIVO"
  | "REAGENDAR";

// ═══════════════════════════════════════════════════════════════
// CONFIGURAÇÃO DE SEQUÊNCIA
// ═══════════════════════════════════════════════════════════════

// Sequência padrão de follow-ups
const SEQUENCIA_FOLLOWUP = [
  {
    tipo: "PRIMEIRO_CONTATO" as TipoFollowUp,
    diasApos: 0, // Imediato
    canal: "EMAIL" as CanalFollowUp,
    assunto: "Recebemos sua análise - {negocio}",
    mensagem: `Olá {nome},

Obrigado por fazer a análise de presença digital do {negocio}!

Identificamos alguns pontos importantes que podem estar fazendo você perder clientes todos os dias.

Seu score atual é {scoreGeral}/100 - {statusGeral}.

Principais pontos de atenção:
- Google Business Profile: {scoreGBP}/100
- Site: {scoreSite}/100
- Redes Sociais: {scoreRedes}/100

Gostaria de agendar uma conversa rápida (15 min) para mostrar exatamente o que está impactando seu negócio e como resolver?

Responda este email ou me chame no WhatsApp: (11) 91668-2510

Abraços,
Equipe MultiNegócios Locais`,
  },
  {
    tipo: "SEGUNDO_CONTATO" as TipoFollowUp,
    diasApos: 2, // 2 dias depois
    canal: "EMAIL" as CanalFollowUp,
    assunto: "Você viu sua análise? - {negocio}",
    mensagem: `Olá {nome},

Não sei se você teve a chance de ver, mas enviei a análise completa do {negocio} há alguns dias.

Achei importante destacar: estimamos que você pode estar deixando de faturar R$ {perdaEstimada}/mês por falta de visibilidade digital.

Posso te mostrar exatamente como resolver isso em uma conversa rápida de 15 minutos.

O que acha de agendarmos?

Abraços,
Equipe MultiNegócios Locais`,
  },
  {
    tipo: "TERCEIRO_CONTATO" as TipoFollowUp,
    diasApos: 5, // 5 dias depois do segundo
    canal: "EMAIL" as CanalFollowUp,
    assunto: "Última tentativa - {negocio}",
    mensagem: `Olá {nome},

Essa é minha última tentativa de contato.

Entendo que você deve estar ocupado, mas queria deixar claro: identificamos problemas sérios na presença digital do {negocio} que estão custando clientes todos os dias.

Se mudar de ideia, estou à disposição.

Abraços,
Equipe MultiNegócios Locais

PS: Se preferir, pode acessar diretamente pelo WhatsApp: (11) 91668-2510`,
  },
];

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES PRINCIPAIS
// ═══════════════════════════════════════════════════════════════

/**
 * Agenda a sequência completa de follow-ups para um lead
 */
export async function agendarFollowUpsParaLead(leadId: string): Promise<void> {
  console.log("[FollowUp] Agendando follow-ups para lead:", leadId);

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    console.error("[FollowUp] Lead não encontrado:", leadId);
    return;
  }

  // Verificar se já existem follow-ups para este lead
  const followUpsExistentes = await prisma.followUp.count({
    where: { leadId },
  });

  if (followUpsExistentes > 0) {
    console.log("[FollowUp] Lead já tem follow-ups agendados, pulando");
    return;
  }

  const agora = new Date();
  let dataReferencia = agora;

  // Criar follow-ups na sequência
  for (const followUp of SEQUENCIA_FOLLOWUP) {
    const dataAgendada = new Date(dataReferencia);
    dataAgendada.setDate(dataAgendada.getDate() + followUp.diasApos);
    dataAgendada.setHours(10, 0, 0, 0); // 10:00 AM

    // Substituir variáveis no assunto e mensagem
    const analise = (lead.analiseCompleta as any)?.analisePublica || {};
    const variaveis = {
      nome: lead.nome.split(" ")[0], // Primeiro nome
      negocio: lead.negocio,
      scoreGeral: lead.scoreGeral?.toString() || "0",
      scoreGBP: lead.scoreGBP?.toString() || "0",
      scoreSite: lead.scoreSite?.toString() || "0",
      scoreRedes: lead.scoreRedes?.toString() || "0",
      statusGeral: analise.statusGeral || "crítico",
      perdaEstimada: analise.perdaPotencial?.toLocaleString("pt-BR") || "0",
    };

    const assunto = substituirVariaveis(followUp.assunto, variaveis);
    const mensagem = substituirVariaveis(followUp.mensagem, variaveis);

    await prisma.followUp.create({
      data: {
        leadId,
        tipo: followUp.tipo,
        agendadoPara: dataAgendada,
        canal: followUp.canal,
        assunto,
        mensagem,
        status: "PENDENTE",
      },
    });

    // Próximo follow-up é relativo ao anterior
    dataReferencia = dataAgendada;
  }

  console.log("[FollowUp] Follow-ups agendados com sucesso para lead:", leadId);
}

/**
 * Processa todos os follow-ups pendentes que já passaram da hora
 */
export async function processarFollowUpsPendentes(): Promise<{
  processados: number;
  erros: number;
}> {
  console.log("[FollowUp] Processando follow-ups pendentes...");

  const agora = new Date();

  // Buscar follow-ups pendentes que já passaram da hora
  const followUpsPendentes = await prisma.followUp.findMany({
    where: {
      status: "PENDENTE",
      agendadoPara: {
        lte: agora,
      },
    },
    orderBy: {
      agendadoPara: "asc",
    },
    take: 50, // Processar em lotes
  });

  console.log(
    `[FollowUp] Encontrados ${followUpsPendentes.length} follow-ups para processar`
  );

  let processados = 0;
  let erros = 0;

  for (const followUp of followUpsPendentes) {
    try {
      // Buscar dados do lead
      const lead = await prisma.lead.findUnique({
        where: { id: followUp.leadId },
      });

      if (!lead) {
        console.error("[FollowUp] Lead não encontrado:", followUp.leadId);
        await marcarFollowUpCancelado(followUp.id, "Lead não encontrado");
        erros++;
        continue;
      }

      // Verificar se lead já foi convertido ou perdido
      if (lead.convertido || lead.status === "PERDIDO") {
        await marcarFollowUpCancelado(
          followUp.id,
          "Lead já convertido ou perdido"
        );
        continue;
      }

      // Executar follow-up baseado no canal
      let sucesso = false;

      if (followUp.canal === "EMAIL") {
        sucesso = await enviarFollowUpEmail(lead, followUp);
      } else if (followUp.canal === "WHATSAPP") {
        // WhatsApp será manual por enquanto
        sucesso = true;
        console.log("[FollowUp] WhatsApp marcado para envio manual");
      }

      if (sucesso) {
        await prisma.followUp.update({
          where: { id: followUp.id },
          data: {
            status: "ENVIADO",
            executadoEm: new Date(),
            tentativas: followUp.tentativas + 1,
            ultimaTentativa: new Date(),
          },
        });
        processados++;
      } else {
        await prisma.followUp.update({
          where: { id: followUp.id },
          data: {
            tentativas: followUp.tentativas + 1,
            ultimaTentativa: new Date(),
          },
        });
        erros++;
      }
    } catch (error) {
      console.error("[FollowUp] Erro ao processar follow-up:", error);
      erros++;
    }
  }

  console.log(`[FollowUp] Processamento concluído: ${processados} enviados, ${erros} erros`);

  return { processados, erros };
}

/**
 * Envia follow-up por email
 */
async function enviarFollowUpEmail(
  lead: any,
  followUp: any
): Promise<boolean> {
  try {
    const resultado = await enviarEmailFollowUp({
      para: lead.email,
      nome: lead.nome,
      assunto: followUp.assunto || "Follow-up - MultiNegócios Locais",
      mensagem: followUp.mensagem || "",
    });

    return resultado.success;
  } catch (error) {
    console.error("[FollowUp] Erro ao enviar email:", error);
    return false;
  }
}

/**
 * Marca follow-up como cancelado
 */
async function marcarFollowUpCancelado(
  followUpId: string,
  motivo: string
): Promise<void> {
  await prisma.followUp.update({
    where: { id: followUpId },
    data: {
      status: "CANCELADO",
      observacoes: motivo,
    },
  });
}

/**
 * Substitui variáveis em uma string
 */
function substituirVariaveis(
  texto: string,
  variaveis: Record<string, string>
): string {
  let resultado = texto;
  for (const [chave, valor] of Object.entries(variaveis)) {
    resultado = resultado.replace(new RegExp(`\\{${chave}\\}`, "g"), valor);
  }
  return resultado;
}

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES DE CONSULTA
// ═══════════════════════════════════════════════════════════════

/**
 * Lista follow-ups de um lead
 */
export async function listarFollowUpsDoLead(leadId: string) {
  return prisma.followUp.findMany({
    where: { leadId },
    orderBy: { agendadoPara: "asc" },
  });
}

/**
 * Lista próximos follow-ups pendentes
 */
export async function listarProximosFollowUps(limite = 20) {
  return prisma.followUp.findMany({
    where: {
      status: "PENDENTE",
    },
    orderBy: { agendadoPara: "asc" },
    take: limite,
  });
}

/**
 * Estatísticas de follow-ups
 */
export async function obterEstatisticasFollowUp() {
  const [pendentes, enviados, realizados, cancelados] = await Promise.all([
    prisma.followUp.count({ where: { status: "PENDENTE" } }),
    prisma.followUp.count({ where: { status: "ENVIADO" } }),
    prisma.followUp.count({ where: { status: "REALIZADO" } }),
    prisma.followUp.count({ where: { status: "CANCELADO" } }),
  ]);

  return {
    pendentes,
    enviados,
    realizados,
    cancelados,
    total: pendentes + enviados + realizados + cancelados,
  };
}

/**
 * Marca follow-up como realizado com resultado
 */
export async function marcarFollowUpRealizado(
  followUpId: string,
  resultado: ResultadoFollowUp,
  observacoes?: string
): Promise<void> {
  await prisma.followUp.update({
    where: { id: followUpId },
    data: {
      status: "REALIZADO",
      resultado,
      observacoes,
      executadoEm: new Date(),
    },
  });
}

/**
 * Cancela todos os follow-ups pendentes de um lead
 */
export async function cancelarFollowUpsDoLead(
  leadId: string,
  motivo: string
): Promise<void> {
  await prisma.followUp.updateMany({
    where: {
      leadId,
      status: "PENDENTE",
    },
    data: {
      status: "CANCELADO",
      observacoes: motivo,
    },
  });
}
