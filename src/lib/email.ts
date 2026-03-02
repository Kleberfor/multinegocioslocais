import { Resend } from "resend";

// Inicializar Resend (API key via env)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Email do admin que receberá as notificações
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@multinegocioslocais.com.br";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@multinegocioslocais.com.br";

interface NovoLeadData {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  negocio: string;
  segmento: string;
  scoreGeral: number;
  scoreGBP: number;
  scoreSite: number;
  valorSugerido?: number;
}

/**
 * Envia notificação de novo lead para o admin
 */
export async function enviarNotificacaoNovoLead(lead: NovoLeadData) {
  if (!resend) {
    console.log("[Email] Resend não configurado, pulando notificação");
    return { success: false, error: "Email não configurado" };
  }

  const scoreStatus =
    lead.scoreGeral >= 70
      ? "🟢 Bom"
      : lead.scoreGeral >= 40
      ? "🟡 Regular"
      : "🔴 Crítico";

  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://multinegocioslocais.vercel.app"}/admin/leads/${lead.id}`;
  const whatsappUrl = `https://wa.me/55${lead.telefone.replace(/\D/g, "")}`;

  try {
    const { data, error } = await resend.emails.send({
      from: `MultiNegócios Locais <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      subject: `🆕 Novo Lead: ${lead.negocio} (Score ${lead.scoreGeral}/100)`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

            <!-- Header -->
            <div style="background-color: #2563eb; color: white; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Novo Lead Recebido!</h1>
            </div>

            <!-- Score Badge -->
            <div style="padding: 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <div style="display: inline-block; padding: 16px 32px; border-radius: 50%; border: 4px solid ${lead.scoreGeral >= 70 ? "#22c55e" : lead.scoreGeral >= 40 ? "#eab308" : "#ef4444"}; background-color: ${lead.scoreGeral >= 70 ? "#f0fdf4" : lead.scoreGeral >= 40 ? "#fefce8" : "#fef2f2"};">
                <span style="font-size: 36px; font-weight: bold; color: ${lead.scoreGeral >= 70 ? "#16a34a" : lead.scoreGeral >= 40 ? "#ca8a04" : "#dc2626"};">${lead.scoreGeral}</span>
                <span style="font-size: 14px; color: #6b7280;">/100</span>
              </div>
              <p style="margin: 12px 0 0 0; font-size: 14px; color: #6b7280;">${scoreStatus}</p>
            </div>

            <!-- Lead Info -->
            <div style="padding: 24px;">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111827;">${lead.negocio}</h2>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; width: 120px;">Nome:</td>
                  <td style="padding: 8px 0; font-weight: 500;">${lead.nome}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${lead.email}" style="color: #2563eb;">${lead.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Telefone:</td>
                  <td style="padding: 8px 0;"><a href="tel:${lead.telefone}" style="color: #2563eb;">${lead.telefone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Segmento:</td>
                  <td style="padding: 8px 0;">${lead.segmento}</td>
                </tr>
              </table>

              <!-- Scores -->
              <div style="margin-top: 20px; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
                <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; text-transform: uppercase;">Scores</h3>
                <div style="display: flex; gap: 16px;">
                  <div style="flex: 1; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: ${lead.scoreGBP >= 70 ? "#16a34a" : lead.scoreGBP >= 40 ? "#ca8a04" : "#dc2626"};">${lead.scoreGBP}</div>
                    <div style="font-size: 12px; color: #6b7280;">Google</div>
                  </div>
                  <div style="flex: 1; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: ${lead.scoreSite >= 70 ? "#16a34a" : lead.scoreSite >= 40 ? "#ca8a04" : "#dc2626"};">${lead.scoreSite}</div>
                    <div style="font-size: 12px; color: #6b7280;">Site</div>
                  </div>
                  ${lead.valorSugerido ? `
                  <div style="flex: 1; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #2563eb;">R$ ${lead.valorSugerido.toLocaleString("pt-BR")}</div>
                    <div style="font-size: 12px; color: #6b7280;">Valor Sugerido</div>
                  </div>
                  ` : ""}
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div style="padding: 24px; background-color: #f9fafb; text-align: center;">
              <a href="${whatsappUrl}" style="display: inline-block; padding: 12px 24px; background-color: #25d366; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; margin-right: 8px;">
                💬 WhatsApp
              </a>
              <a href="${adminUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
                📋 Ver Detalhes
              </a>
            </div>

            <!-- Footer -->
            <div style="padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
              MultiNegócios Locais - Sistema de Gestão de Leads
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("[Email] Erro ao enviar:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Notificação enviada:", data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("[Email] Erro ao enviar notificação:", error);
    return { success: false, error: String(error) };
  }
}

interface FollowUpEmailData {
  para: string;
  nome: string;
  assunto: string;
  mensagem: string;
}

/**
 * Envia email de follow-up para um lead
 */
interface ContratoEmailData {
  para: string;
  nome: string;
  negocio: string;
  contratoId: string;
  valor: number;
}

/**
 * Envia email de confirmação de contrato para o cliente
 */
export async function enviarEmailContrato(data: ContratoEmailData) {
  if (!resend) {
    console.log("[Email] Resend não configurado, pulando confirmação de contrato");
    return { success: false, error: "Email não configurado" };
  }

  try {
    const { data: resultado, error } = await resend.emails.send({
      from: `MultiNegócios Locais <${FROM_EMAIL}>`,
      to: [data.para],
      subject: `Contrato #${data.contratoId} - Confirmação de Contratação`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

            <!-- Header -->
            <div style="background-color: #16a34a; color: white; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Contratação Confirmada!</h1>
            </div>

            <!-- Content -->
            <div style="padding: 32px;">
              <p style="font-size: 18px; margin: 0 0 24px 0;">Olá, <strong>${data.nome}</strong>!</p>

              <p style="color: #374151; line-height: 1.6;">
                Parabéns! Sua contratação foi realizada com sucesso. Estamos muito felizes em tê-lo(a) conosco!
              </p>

              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #166534;">Detalhes do Contrato</h3>
                <table style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Contrato Nº:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${data.contratoId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Negócio:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${data.negocio}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Valor Total:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #16a34a;">R$ ${data.valor.toLocaleString("pt-BR")}</td>
                  </tr>
                </table>
              </div>

              <h3 style="color: #111827;">Próximos Passos:</h3>
              <ol style="color: #374151; line-height: 1.8;">
                <li>Em até 24 horas, um especialista entrará em contato para iniciar a otimização do seu Perfil de Empresa no Google.</li>
                <li>Você receberá acesso ao painel de métricas após a confirmação do pagamento.</li>
                <li>Qualquer dúvida, entre em contato pelo WhatsApp.</li>
              </ol>

              <div style="text-align: center; margin-top: 32px;">
                <a href="https://wa.me/5511916682510" style="display: inline-block; padding: 14px 28px; background-color: #25d366; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
                  💬 Falar no WhatsApp
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 24px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                MultiNegócios Locais - Transformando negócios locais
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                WhatsApp: (11) 91668-2510 | multinegocioslocais.com.br
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("[Email] Erro ao enviar confirmação de contrato:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Confirmação de contrato enviada:", resultado?.id);
    return { success: true, id: resultado?.id };
  } catch (error) {
    console.error("[Email] Erro ao enviar confirmação de contrato:", error);
    return { success: false, error: String(error) };
  }
}

interface ScoreEmailData {
  para: string;
  nome: string;
  score: number;
  publicUrl: string;
}

/**
 * Envia email com o score de presença digital para o prospect
 */
export async function enviarEmailScore(data: ScoreEmailData) {
  if (!resend) {
    console.log("[Email] Resend não configurado, pulando envio de score");
    return { success: false, error: "Email não configurado" };
  }

  const primeiroNome = data.nome.split(" ")[0];
  const scoreStatus =
    data.score >= 70
      ? { label: "Bom", color: "#16a34a", bgColor: "#f0fdf4" }
      : data.score >= 40
      ? { label: "Regular", color: "#ca8a04", bgColor: "#fefce8" }
      : { label: "Precisa de Atenção", color: "#dc2626", bgColor: "#fef2f2" };

  try {
    const { data: resultado, error } = await resend.emails.send({
      from: `MultiNegócios Locais <${FROM_EMAIL}>`,
      to: [data.para],
      subject: `Seu Score de Presença Digital: ${data.score}/100`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

            <!-- Header -->
            <div style="background-color: #2563eb; color: white; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Análise de Presença Digital</h1>
            </div>

            <!-- Score Badge -->
            <div style="padding: 32px; text-align: center; background-color: ${scoreStatus.bgColor};">
              <div style="display: inline-block; width: 120px; height: 120px; border-radius: 50%; border: 6px solid ${scoreStatus.color}; background-color: white; line-height: 108px;">
                <span style="font-size: 48px; font-weight: bold; color: ${scoreStatus.color};">${data.score}</span>
              </div>
              <p style="margin: 16px 0 0 0; font-size: 18px; font-weight: 600; color: ${scoreStatus.color};">${scoreStatus.label}</p>
            </div>

            <!-- Content -->
            <div style="padding: 32px;">
              <p style="font-size: 18px; margin: 0 0 16px 0;">Olá, <strong>${primeiroNome}</strong>!</p>

              <p style="color: #374151; line-height: 1.6;">
                Conforme combinado, realizamos a análise de presença digital do seu negócio.
                ${data.score < 70
                  ? "Identificamos oportunidades importantes de melhoria que podem ajudar você a atrair mais clientes."
                  : "Sua presença digital está boa, mas sempre há espaço para melhorar ainda mais!"
                }
              </p>

              <p style="color: #374151; line-height: 1.6;">
                Clique no botão abaixo para ver o resultado completo da análise:
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${data.publicUrl}" style="display: inline-block; padding: 16px 32px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  📊 Ver Análise Completa
                </a>
              </div>

              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 24px;">
                <p style="margin: 0; color: #374151; font-weight: 500;">
                  🚀 Quer melhorar seu negócio?
                </p>
                <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">
                  Podemos ajudar você a aumentar sua visibilidade online e atrair mais clientes para seu negócio.
                </p>
                <div style="text-align: center; margin-top: 16px;">
                  <a href="https://wa.me/5511916682510?text=${encodeURIComponent(`Olá! Recebi minha análise de presença digital e quero melhorar meu negócio!`)}" style="display: inline-block; padding: 12px 24px; background-color: #25d366; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
                    💬 Quero Melhorar Meu Negócio
                  </a>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 24px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                MultiNegócios Locais - Transformando negócios locais
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                WhatsApp: (11) 91668-2510 | multinegocioslocais.com.br
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("[Email] Erro ao enviar score:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Score enviado:", resultado?.id);
    return { success: true, id: resultado?.id };
  } catch (error) {
    console.error("[Email] Erro ao enviar score:", error);
    return { success: false, error: String(error) };
  }
}

interface ReenvioPropostaData {
  para: string;
  nome: string;
  negocio: string;
  propostaUrl: string;
  valorEstimado?: number;
}

/**
 * Reenvia email com link da proposta para prospect/lead
 */
export async function enviarReenvioProposta(data: ReenvioPropostaData) {
  if (!resend) {
    console.log("[Email] Resend não configurado, pulando reenvio de proposta");
    return { success: false, error: "Email não configurado" };
  }

  const primeiroNome = data.nome.split(" ")[0];

  try {
    const { data: resultado, error } = await resend.emails.send({
      from: `MultiNegócios Locais <${FROM_EMAIL}>`,
      to: [data.para],
      subject: `${primeiroNome}, sua proposta personalizada está disponível!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

            <!-- Header -->
            <div style="background-color: #2563eb; color: white; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Sua Proposta Está Pronta!</h1>
            </div>

            <!-- Content -->
            <div style="padding: 32px;">
              <p style="font-size: 18px; margin: 0 0 16px 0;">Olá, <strong>${primeiroNome}</strong>!</p>

              <p style="color: #374151; line-height: 1.6;">
                Estamos reenviando a proposta personalizada para o seu negócio <strong>${data.negocio}</strong>.
              </p>

              <p style="color: #374151; line-height: 1.6;">
                Analisamos a presença digital do seu negócio e preparamos um plano de ação completo para ajudá-lo a atrair mais clientes.
              </p>

              ${data.valorEstimado ? `
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                <p style="margin: 0 0 8px 0; color: #166534; font-size: 14px;">Investimento a partir de</p>
                <p style="margin: 0; font-size: 32px; font-weight: bold; color: #16a34a;">
                  R$ ${data.valorEstimado.toLocaleString("pt-BR")}
                </p>
              </div>
              ` : ""}

              <div style="text-align: center; margin: 32px 0;">
                <a href="${data.propostaUrl}" style="display: inline-block; padding: 16px 32px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  📋 Ver Minha Proposta
                </a>
              </div>

              <div style="background-color: #fefce8; border: 1px solid #fde047; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <p style="margin: 0; color: #854d0e; font-size: 14px;">
                  ⏰ <strong>Proposta com condições especiais!</strong> Entre em contato para garantir as melhores condições.
                </p>
              </div>

              <div style="margin-top: 24px; text-align: center;">
                <a href="https://wa.me/5511916682510?text=${encodeURIComponent(`Olá! Recebi a proposta para ${data.negocio} e gostaria de saber mais!`)}" style="display: inline-block; padding: 12px 24px; background-color: #25d366; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
                  💬 Falar com Especialista
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 24px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                MultiNegócios Locais - Transformando negócios locais
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                WhatsApp: (11) 91668-2510 | multinegocioslocais.com.br
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("[Email] Erro ao reenviar proposta:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Proposta reenviada:", resultado?.id);
    return { success: true, id: resultado?.id };
  } catch (error) {
    console.error("[Email] Erro ao reenviar proposta:", error);
    return { success: false, error: String(error) };
  }
}

export async function enviarEmailFollowUp(data: FollowUpEmailData) {
  if (!resend) {
    console.log("[Email] Resend não configurado, pulando follow-up");
    return { success: false, error: "Email não configurado" };
  }

  try {
    // Converter quebras de linha em HTML
    const mensagemHtml = data.mensagem
      .split("\n")
      .map((linha) => (linha.trim() === "" ? "<br>" : `<p style="margin: 0 0 8px 0;">${linha}</p>`))
      .join("");

    const { data: resultado, error } = await resend.emails.send({
      from: `MultiNegócios Locais <${FROM_EMAIL}>`,
      to: [data.para],
      subject: data.assunto,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

            <!-- Header -->
            <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL || "https://multinegocioslocais.vercel.app"}/logo-white.png" alt="MultiNegócios Locais" style="max-height: 32px;">
            </div>

            <!-- Content -->
            <div style="padding: 32px; color: #374151; font-size: 16px; line-height: 1.6;">
              ${mensagemHtml}
            </div>

            <!-- Footer -->
            <div style="padding: 24px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                MultiNegócios Locais - Transformando negócios locais
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                WhatsApp: (11) 91668-2510 | multinegocioslocais.com.br
              </p>
            </div>
          </div>

          <!-- Unsubscribe -->
          <div style="text-align: center; padding: 20px;">
            <p style="color: #9ca3af; font-size: 11px;">
              Você está recebendo este email porque fez uma análise de presença digital conosco.
              <br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(data.para)}" style="color: #9ca3af;">Cancelar inscrição</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("[Email] Erro ao enviar follow-up:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Follow-up enviado:", resultado?.id);
    return { success: true, id: resultado?.id };
  } catch (error) {
    console.error("[Email] Erro ao enviar follow-up:", error);
    return { success: false, error: String(error) };
  }
}
