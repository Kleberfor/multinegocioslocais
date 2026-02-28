// lib/nfe.ts
// Cliente para integração com APIs de emissão de NFS-e
// Suporta: Focus NFe, Enotas (configurável via env)

// Tipos
export interface TomadorServico {
  cpfCnpj: string;
  razaoSocial: string;
  email: string;
  endereco?: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    codigoMunicipio: string;
  };
}

export interface ServicoNFSe {
  descricao: string;
  valorServicos: number;
  valorDeducoes?: number;
  valorPis?: number;
  valorCofins?: number;
  valorInss?: number;
  valorIr?: number;
  valorCsll?: number;
  issRetido?: boolean;
  valorIss?: number;
  aliquotaIss?: number;
  codigoServico: string; // Código do serviço municipal (LC 116/2003)
}

export interface EmitirNFSeRequest {
  tomador: TomadorServico;
  servico: ServicoNFSe;
  referencia?: string; // ID interno para tracking
  dataEmissao?: string; // ISO date, default: agora
}

export interface NFSeResponse {
  id: string;
  numero?: string;
  codigoVerificacao?: string;
  status: "processando" | "autorizada" | "cancelada" | "erro";
  mensagem?: string;
  pdfUrl?: string;
  xmlUrl?: string;
  dataEmissao?: string;
  valorTotal: number;
}

export interface ConsultaNFSeResponse extends NFSeResponse {
  tomador: {
    cpfCnpj: string;
    nome: string;
  };
  servico: {
    descricao: string;
    valor: number;
  };
}

// Configuração do provider
type NFSeProvider = "focus" | "enotas" | "mock";

const PROVIDER = (process.env.NFSE_PROVIDER as NFSeProvider) || "mock";
const API_TOKEN = process.env.NFSE_API_TOKEN || "";
const EMPRESA_ID = process.env.NFSE_EMPRESA_ID || "";

// URLs das APIs
const API_URLS = {
  focus: process.env.NFSE_FOCUS_URL || "https://api.focusnfe.com.br/v2",
  enotas: "https://api.enotas.com.br/v2",
  mock: "",
};

// Código de serviço padrão (ajustar conforme sua atividade)
const CODIGO_SERVICO_PADRAO = "01.01"; // Análise e desenvolvimento de sistemas

/**
 * Emite uma NFS-e
 */
export async function emitirNFSe(
  request: EmitirNFSeRequest
): Promise<NFSeResponse> {
  switch (PROVIDER) {
    case "focus":
      return emitirFocusNFSe(request);
    case "enotas":
      return emitirEnotasNFSe(request);
    case "mock":
    default:
      return emitirMockNFSe(request);
  }
}

/**
 * Consulta o status de uma NFS-e
 */
export async function consultarNFSe(
  nfseId: string
): Promise<ConsultaNFSeResponse> {
  switch (PROVIDER) {
    case "focus":
      return consultarFocusNFSe(nfseId);
    case "enotas":
      return consultarEnotasNFSe(nfseId);
    case "mock":
    default:
      return consultarMockNFSe(nfseId);
  }
}

/**
 * Cancela uma NFS-e
 */
export async function cancelarNFSe(
  nfseId: string,
  justificativa: string
): Promise<boolean> {
  switch (PROVIDER) {
    case "focus":
      return cancelarFocusNFSe(nfseId, justificativa);
    case "enotas":
      return cancelarEnotasNFSe(nfseId, justificativa);
    case "mock":
    default:
      return cancelarMockNFSe(nfseId);
  }
}

/**
 * Baixa o PDF da NFS-e
 */
export async function downloadNFSePdf(nfseId: string): Promise<Buffer | null> {
  switch (PROVIDER) {
    case "focus":
      return downloadFocusNFSePdf(nfseId);
    case "enotas":
      return downloadEnotasNFSePdf(nfseId);
    case "mock":
    default:
      return null;
  }
}

// ══════════════════════════════════════════════════════════════
// FOCUS NFE
// ══════════════════════════════════════════════════════════════

async function emitirFocusNFSe(
  request: EmitirNFSeRequest
): Promise<NFSeResponse> {
  const referencia = request.referencia || `nfse_${Date.now()}`;

  const body = {
    // Prestador já configurado na Focus NFe
    tomador: {
      cpf_cnpj: formatCpfCnpj(request.tomador.cpfCnpj),
      razao_social: request.tomador.razaoSocial,
      email: request.tomador.email,
      endereco: request.tomador.endereco
        ? {
            logradouro: request.tomador.endereco.logradouro,
            numero: request.tomador.endereco.numero,
            complemento: request.tomador.endereco.complemento,
            bairro: request.tomador.endereco.bairro,
            codigo_municipio: request.tomador.endereco.codigoMunicipio,
            uf: request.tomador.endereco.uf,
            cep: request.tomador.endereco.cep.replace(/\D/g, ""),
          }
        : undefined,
    },
    servico: {
      aliquota: request.servico.aliquotaIss || 5,
      discriminacao: request.servico.descricao,
      iss_retido: request.servico.issRetido ? "1" : "2",
      item_lista_servico: request.servico.codigoServico || CODIGO_SERVICO_PADRAO,
      valor_servicos: request.servico.valorServicos,
    },
  };

  const response = await fetch(`${API_URLS.focus}/nfse?ref=${referencia}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${API_TOKEN}:`).toString("base64")}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Focus NFe error:", data);
    return {
      id: referencia,
      status: "erro",
      mensagem: data.message || JSON.stringify(data.erros),
      valorTotal: request.servico.valorServicos,
    };
  }

  return {
    id: referencia,
    status: "processando",
    mensagem: "NFS-e enviada para processamento",
    valorTotal: request.servico.valorServicos,
  };
}

async function consultarFocusNFSe(
  nfseId: string
): Promise<ConsultaNFSeResponse> {
  const response = await fetch(`${API_URLS.focus}/nfse/${nfseId}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${API_TOKEN}:`).toString("base64")}`,
    },
  });

  const data = await response.json();

  let status: NFSeResponse["status"] = "processando";
  if (data.status === "autorizado") status = "autorizada";
  else if (data.status === "cancelado") status = "cancelada";
  else if (data.status === "erro_autorizacao") status = "erro";

  return {
    id: nfseId,
    numero: data.numero,
    codigoVerificacao: data.codigo_verificacao,
    status,
    mensagem: data.mensagem_sefaz,
    pdfUrl: data.caminho_danfse,
    xmlUrl: data.caminho_xml_nota_fiscal,
    dataEmissao: data.data_emissao,
    valorTotal: data.valor_total || 0,
    tomador: {
      cpfCnpj: data.tomador?.cpf_cnpj,
      nome: data.tomador?.razao_social,
    },
    servico: {
      descricao: data.servico?.discriminacao,
      valor: data.servico?.valor_servicos,
    },
  };
}

async function cancelarFocusNFSe(
  nfseId: string,
  justificativa: string
): Promise<boolean> {
  const response = await fetch(`${API_URLS.focus}/nfse/${nfseId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${API_TOKEN}:`).toString("base64")}`,
    },
    body: JSON.stringify({ justificativa }),
  });

  return response.ok;
}

async function downloadFocusNFSePdf(nfseId: string): Promise<Buffer | null> {
  const nfse = await consultarFocusNFSe(nfseId);

  if (!nfse.pdfUrl) return null;

  const response = await fetch(nfse.pdfUrl);
  if (!response.ok) return null;

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ══════════════════════════════════════════════════════════════
// ENOTAS
// ══════════════════════════════════════════════════════════════

async function emitirEnotasNFSe(
  request: EmitirNFSeRequest
): Promise<NFSeResponse> {
  const body = {
    tipo: "NFS-e",
    idExterno: request.referencia || `nfse_${Date.now()}`,
    cliente: {
      tipoPessoa: request.tomador.cpfCnpj.length > 11 ? "J" : "F",
      cpfCnpj: formatCpfCnpj(request.tomador.cpfCnpj),
      nome: request.tomador.razaoSocial,
      email: request.tomador.email,
      endereco: request.tomador.endereco
        ? {
            logradouro: request.tomador.endereco.logradouro,
            numero: request.tomador.endereco.numero,
            complemento: request.tomador.endereco.complemento,
            bairro: request.tomador.endereco.bairro,
            cidade: request.tomador.endereco.cidade,
            uf: request.tomador.endereco.uf,
            cep: request.tomador.endereco.cep,
          }
        : undefined,
    },
    servico: {
      descricao: request.servico.descricao,
      codigoInternoServico: request.servico.codigoServico || CODIGO_SERVICO_PADRAO,
      valorTotal: request.servico.valorServicos,
      issRetidoFonte: request.servico.issRetido || false,
    },
  };

  const response = await fetch(
    `${API_URLS.enotas}/empresas/${EMPRESA_ID}/nfes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${API_TOKEN}`,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return {
      id: body.idExterno,
      status: "erro",
      mensagem: data.mensagem || JSON.stringify(data),
      valorTotal: request.servico.valorServicos,
    };
  }

  return {
    id: data.nfeId || body.idExterno,
    status: "processando",
    mensagem: "NFS-e enviada para processamento",
    valorTotal: request.servico.valorServicos,
  };
}

async function consultarEnotasNFSe(
  nfseId: string
): Promise<ConsultaNFSeResponse> {
  const response = await fetch(
    `${API_URLS.enotas}/empresas/${EMPRESA_ID}/nfes/${nfseId}`,
    {
      headers: {
        Authorization: `Basic ${API_TOKEN}`,
      },
    }
  );

  const data = await response.json();

  let status: NFSeResponse["status"] = "processando";
  if (data.status === "Autorizada") status = "autorizada";
  else if (data.status === "Cancelada") status = "cancelada";
  else if (data.status === "Rejeitada") status = "erro";

  return {
    id: nfseId,
    numero: data.numero,
    codigoVerificacao: data.codigoVerificacao,
    status,
    mensagem: data.motivoStatus,
    pdfUrl: data.linkDownloadPDF,
    xmlUrl: data.linkDownloadXML,
    dataEmissao: data.dataEmissao,
    valorTotal: data.servico?.valorTotal || 0,
    tomador: {
      cpfCnpj: data.cliente?.cpfCnpj,
      nome: data.cliente?.nome,
    },
    servico: {
      descricao: data.servico?.descricao,
      valor: data.servico?.valorTotal,
    },
  };
}

async function cancelarEnotasNFSe(
  nfseId: string,
  justificativa: string
): Promise<boolean> {
  const response = await fetch(
    `${API_URLS.enotas}/empresas/${EMPRESA_ID}/nfes/${nfseId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${API_TOKEN}`,
      },
      body: JSON.stringify({ motivoCancelamento: justificativa }),
    }
  );

  return response.ok;
}

async function downloadEnotasNFSePdf(nfseId: string): Promise<Buffer | null> {
  const nfse = await consultarEnotasNFSe(nfseId);

  if (!nfse.pdfUrl) return null;

  const response = await fetch(nfse.pdfUrl, {
    headers: {
      Authorization: `Basic ${API_TOKEN}`,
    },
  });

  if (!response.ok) return null;

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ══════════════════════════════════════════════════════════════
// MOCK (para desenvolvimento)
// ══════════════════════════════════════════════════════════════

const mockNFSes: Map<string, ConsultaNFSeResponse> = new Map();

async function emitirMockNFSe(
  request: EmitirNFSeRequest
): Promise<NFSeResponse> {
  const id = request.referencia || `mock_nfse_${Date.now()}`;
  const numero = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");

  const nfse: ConsultaNFSeResponse = {
    id,
    numero,
    codigoVerificacao: `CV${Date.now().toString(36).toUpperCase()}`,
    status: "autorizada",
    mensagem: "NFS-e autorizada com sucesso (MOCK)",
    pdfUrl: `http://localhost:3000/mock-nfse/${id}.pdf`,
    xmlUrl: `http://localhost:3000/mock-nfse/${id}.xml`,
    dataEmissao: new Date().toISOString(),
    valorTotal: request.servico.valorServicos,
    tomador: {
      cpfCnpj: request.tomador.cpfCnpj,
      nome: request.tomador.razaoSocial,
    },
    servico: {
      descricao: request.servico.descricao,
      valor: request.servico.valorServicos,
    },
  };

  mockNFSes.set(id, nfse);

  console.log("[MOCK] NFS-e emitida:", {
    id,
    numero,
    tomador: request.tomador.razaoSocial,
    valor: request.servico.valorServicos,
  });

  return nfse;
}

async function consultarMockNFSe(
  nfseId: string
): Promise<ConsultaNFSeResponse> {
  const nfse = mockNFSes.get(nfseId);

  if (!nfse) {
    return {
      id: nfseId,
      status: "erro",
      mensagem: "NFS-e não encontrada",
      valorTotal: 0,
      tomador: { cpfCnpj: "", nome: "" },
      servico: { descricao: "", valor: 0 },
    };
  }

  return nfse;
}

async function cancelarMockNFSe(nfseId: string): Promise<boolean> {
  const nfse = mockNFSes.get(nfseId);

  if (nfse) {
    nfse.status = "cancelada";
    nfse.mensagem = "NFS-e cancelada (MOCK)";
    mockNFSes.set(nfseId, nfse);
    console.log("[MOCK] NFS-e cancelada:", nfseId);
    return true;
  }

  return false;
}

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

/**
 * Remove formatação do CPF/CNPJ
 */
function formatCpfCnpj(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Gera referência única para NFS-e
 */
export function generateNFSeReference(prefix: string = "nfse"): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 6);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Formata valor para exibição
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
