import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

// Configuração do cliente Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export const paymentClient = new Payment(client);
export const preferenceClient = new Preference(client);

// Tipos
export interface CreatePixPaymentData {
  amount: number;
  description: string;
  email: string;
  firstName: string;
  lastName: string;
  cpf: string;
  contratoId: string;
}

export interface CreateCardPaymentData {
  amount: number;
  description: string;
  email: string;
  firstName: string;
  lastName: string;
  cpf: string;
  contratoId: string;
  token: string;
  installments: number;
  paymentMethodId: string;
}

export interface CreateBoletoPaymentData {
  amount: number;
  description: string;
  email: string;
  firstName: string;
  lastName: string;
  cpf: string;
  contratoId: string;
}

// Criar pagamento PIX
export async function createPixPayment(data: CreatePixPaymentData) {
  try {
    const cpfLimpo = data.cpf.replace(/\D/g, "");
    const identificationType = cpfLimpo.length === 14 ? "CNPJ" : "CPF";

    const payment = await paymentClient.create({
      body: {
        transaction_amount: data.amount,
        description: data.description,
        payment_method_id: "pix",
        payer: {
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          identification: {
            type: identificationType,
            number: cpfLimpo,
          },
        },
        external_reference: data.contratoId,
      },
    });

    return {
      id: payment.id,
      status: payment.status,
      qrCode: payment.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
      ticketUrl: payment.point_of_interaction?.transaction_data?.ticket_url,
      expirationDate: payment.date_of_expiration,
    };
  } catch (error: unknown) {
    console.error("Erro Mercado Pago PIX:", JSON.stringify(error, null, 2));

    // Extrair mensagem de erro do Mercado Pago
    if (error && typeof error === "object") {
      const errorObj = error as Record<string, unknown>;

      // Log completo do erro
      console.error("Erro detalhado:", {
        message: errorObj.message,
        cause: errorObj.cause,
        status: errorObj.status,
        name: errorObj.name,
      });

      // Tentar extrair causa
      if ("cause" in errorObj && errorObj.cause) {
        const cause = errorObj.cause as Record<string, unknown>;
        console.error("Causa do erro:", JSON.stringify(cause, null, 2));

        if (cause.message) {
          throw new Error(`Mercado Pago: ${cause.message}`);
        }
      }

      // Tentar extrair mensagem
      if (errorObj.message) {
        throw new Error(`Mercado Pago: ${errorObj.message}`);
      }
    }

    throw error;
  }
}

// Criar pagamento com Cartão
export async function createCardPayment(data: CreateCardPaymentData) {
  const payment = await paymentClient.create({
    body: {
      transaction_amount: data.amount,
      description: data.description,
      payment_method_id: data.paymentMethodId,
      token: data.token,
      installments: data.installments,
      payer: {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        identification: {
          type: "CPF",
          number: data.cpf.replace(/\D/g, ""),
        },
      },
      external_reference: data.contratoId,
    },
  });

  return {
    id: payment.id,
    status: payment.status,
    statusDetail: payment.status_detail,
  };
}

// Criar pagamento Boleto
export async function createBoletoPayment(data: CreateBoletoPaymentData) {
  const payment = await paymentClient.create({
    body: {
      transaction_amount: data.amount,
      description: data.description,
      payment_method_id: "bolbradesco", // Boleto Bradesco
      payer: {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        identification: {
          type: "CPF",
          number: data.cpf.replace(/\D/g, ""),
        },
      },
      external_reference: data.contratoId,
    },
  });

  return {
    id: payment.id,
    status: payment.status,
    boletoUrl: payment.transaction_details?.external_resource_url,
    barcode: (payment as any).barcode?.content,
    expirationDate: payment.date_of_expiration,
  };
}

// Consultar status do pagamento
export async function getPaymentStatus(paymentId: number) {
  const payment = await paymentClient.get({ id: paymentId });

  return {
    id: payment.id,
    status: payment.status,
    statusDetail: payment.status_detail,
    externalReference: payment.external_reference,
    transactionAmount: payment.transaction_amount,
    dateApproved: payment.date_approved,
  };
}

// Mapear status do Mercado Pago para status interno
export function mapPaymentStatus(mpStatus: string): string {
  const statusMap: Record<string, string> = {
    pending: "PENDENTE",
    approved: "PAGO",
    authorized: "PROCESSANDO",
    in_process: "PROCESSANDO",
    in_mediation: "PROCESSANDO",
    rejected: "FALHOU",
    cancelled: "CANCELADO",
    refunded: "REEMBOLSADO",
    charged_back: "ESTORNADO",
  };

  return statusMap[mpStatus] || "PENDENTE";
}
