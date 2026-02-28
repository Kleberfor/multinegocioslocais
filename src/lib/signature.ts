// lib/signature.ts
// Cliente para integração com serviços de assinatura digital
// Suporta: Autentique, Clicksign (configurável via env)

// Tipos
export interface SignerInfo {
  email: string;
  name: string;
  cpf?: string;
  phone?: string;
}

export interface SignatureRequest {
  documentName: string;
  documentBase64: string;
  signers: SignerInfo[];
  message?: string;
  externalId?: string;
}

export interface SignatureResponse {
  id: string;
  documentId: string;
  status: "pending" | "signed" | "cancelled" | "expired";
  signUrl: string;
  signers: {
    email: string;
    status: "pending" | "signed";
    signedAt?: string;
  }[];
  createdAt: string;
  expiresAt?: string;
}

export interface WebhookPayload {
  event: "document.signed" | "document.cancelled" | "signer.signed";
  documentId: string;
  signerId?: string;
  timestamp: string;
}

// Configuração do provider
type SignatureProvider = "autentique" | "clicksign" | "mock";

const PROVIDER = (process.env.SIGNATURE_PROVIDER as SignatureProvider) || "mock";
const API_KEY = process.env.SIGNATURE_API_KEY || "";
const WEBHOOK_URL = process.env.SIGNATURE_WEBHOOK_URL || "";

// URLs das APIs
const API_URLS = {
  autentique: "https://api.autentique.com.br/v2/graphql",
  clicksign: "https://api.clicksign.com/v2",
  mock: "",
};

/**
 * Cria uma solicitação de assinatura
 */
export async function createSignatureRequest(
  request: SignatureRequest
): Promise<SignatureResponse> {
  switch (PROVIDER) {
    case "autentique":
      return createAutentiqueRequest(request);
    case "clicksign":
      return createClicksignRequest(request);
    case "mock":
    default:
      return createMockRequest(request);
  }
}

/**
 * Consulta o status de uma solicitação de assinatura
 */
export async function getSignatureStatus(
  documentId: string
): Promise<SignatureResponse> {
  switch (PROVIDER) {
    case "autentique":
      return getAutentiqueStatus(documentId);
    case "clicksign":
      return getClicksignStatus(documentId);
    case "mock":
    default:
      return getMockStatus(documentId);
  }
}

/**
 * Cancela uma solicitação de assinatura
 */
export async function cancelSignature(documentId: string): Promise<boolean> {
  switch (PROVIDER) {
    case "autentique":
      return cancelAutentiqueSignature(documentId);
    case "clicksign":
      return cancelClicksignSignature(documentId);
    case "mock":
    default:
      return true;
  }
}

/**
 * Valida o webhook de assinatura
 */
export function validateWebhook(
  signature: string,
  payload: string
): boolean {
  // Cada provider tem sua própria validação
  // Por segurança, implementar conforme documentação do provider
  if (PROVIDER === "mock") return true;

  // TODO: Implementar validação real do webhook
  console.log("Validating webhook signature:", signature);
  return true;
}

// ══════════════════════════════════════════════════════════════
// AUTENTIQUE
// ══════════════════════════════════════════════════════════════

async function createAutentiqueRequest(
  request: SignatureRequest
): Promise<SignatureResponse> {
  const mutation = `
    mutation CreateDocument($document: DocumentInput!) {
      createDocument(document: $document) {
        id
        name
        created_at
        signatures {
          public_id
          name
          email
          action { name }
          link { short_link }
        }
      }
    }
  `;

  const variables = {
    document: {
      name: request.documentName,
      content_base64: request.documentBase64,
      signers: request.signers.map((signer) => ({
        email: signer.email,
        action: "SIGN",
        positions: [
          {
            x: "75%",
            y: "90%",
            z: 1,
          },
        ],
      })),
      message: request.message,
    },
  };

  const response = await fetch(API_URLS.autentique, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ query: mutation, variables }),
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(`Autentique error: ${JSON.stringify(data.errors)}`);
  }

  const doc = data.data.createDocument;

  return {
    id: doc.id,
    documentId: doc.id,
    status: "pending",
    signUrl: doc.signatures[0]?.link?.short_link || "",
    signers: doc.signatures.map((sig: { email: string }) => ({
      email: sig.email,
      status: "pending" as const,
    })),
    createdAt: doc.created_at,
  };
}

async function getAutentiqueStatus(
  documentId: string
): Promise<SignatureResponse> {
  const query = `
    query GetDocument($id: ID!) {
      document(id: $id) {
        id
        name
        created_at
        signatures {
          public_id
          name
          email
          signed { created_at }
          action { name }
          link { short_link }
        }
      }
    }
  `;

  const response = await fetch(API_URLS.autentique, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ query, variables: { id: documentId } }),
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(`Autentique error: ${JSON.stringify(data.errors)}`);
  }

  const doc = data.data.document;
  const allSigned = doc.signatures.every(
    (sig: { signed?: { created_at: string } }) => sig.signed
  );

  return {
    id: doc.id,
    documentId: doc.id,
    status: allSigned ? "signed" : "pending",
    signUrl: doc.signatures[0]?.link?.short_link || "",
    signers: doc.signatures.map(
      (sig: { email: string; signed?: { created_at: string } }) => ({
        email: sig.email,
        status: sig.signed ? ("signed" as const) : ("pending" as const),
        signedAt: sig.signed?.created_at,
      })
    ),
    createdAt: doc.created_at,
  };
}

async function cancelAutentiqueSignature(documentId: string): Promise<boolean> {
  const mutation = `
    mutation DeleteDocument($id: ID!) {
      deleteDocument(id: $id)
    }
  `;

  const response = await fetch(API_URLS.autentique, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ query: mutation, variables: { id: documentId } }),
  });

  const data = await response.json();
  return !data.errors;
}

// ══════════════════════════════════════════════════════════════
// CLICKSIGN
// ══════════════════════════════════════════════════════════════

async function createClicksignRequest(
  request: SignatureRequest
): Promise<SignatureResponse> {
  // 1. Upload do documento
  const uploadResponse = await fetch(`${API_URLS.clicksign}/documents?access_token=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      document: {
        path: `/${request.documentName}.pdf`,
        content_base64: request.documentBase64,
      },
    }),
  });

  const uploadData = await uploadResponse.json();
  const documentKey = uploadData.document.key;

  // 2. Adicionar signatários
  const signerKeys: string[] = [];

  for (const signer of request.signers) {
    const signerResponse = await fetch(
      `${API_URLS.clicksign}/signers?access_token=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signer: {
            email: signer.email,
            name: signer.name,
            phone_number: signer.phone,
            documentation: signer.cpf,
            auths: ["email"],
            delivery: "email",
          },
        }),
      }
    );

    const signerData = await signerResponse.json();
    signerKeys.push(signerData.signer.key);
  }

  // 3. Associar signatários ao documento
  for (const signerKey of signerKeys) {
    await fetch(`${API_URLS.clicksign}/lists?access_token=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        list: {
          document_key: documentKey,
          signer_key: signerKey,
          sign_as: "sign",
        },
      }),
    });
  }

  // 4. Enviar para assinatura
  await fetch(
    `${API_URLS.clicksign}/documents/${documentKey}/notify?access_token=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: request.message || "Por favor, assine o documento.",
      }),
    }
  );

  return {
    id: documentKey,
    documentId: documentKey,
    status: "pending",
    signUrl: `https://app.clicksign.com/sign/${documentKey}`,
    signers: request.signers.map((signer) => ({
      email: signer.email,
      status: "pending" as const,
    })),
    createdAt: new Date().toISOString(),
  };
}

async function getClicksignStatus(
  documentId: string
): Promise<SignatureResponse> {
  const response = await fetch(
    `${API_URLS.clicksign}/documents/${documentId}?access_token=${API_KEY}`
  );

  const data = await response.json();
  const doc = data.document;

  const allSigned = doc.signers?.every(
    (s: { signed_at?: string }) => s.signed_at
  );

  return {
    id: doc.key,
    documentId: doc.key,
    status: allSigned ? "signed" : doc.status === "cancelled" ? "cancelled" : "pending",
    signUrl: `https://app.clicksign.com/sign/${doc.key}`,
    signers:
      doc.signers?.map((s: { email: string; signed_at?: string }) => ({
        email: s.email,
        status: s.signed_at ? ("signed" as const) : ("pending" as const),
        signedAt: s.signed_at,
      })) || [],
    createdAt: doc.created_at,
    expiresAt: doc.deadline_at,
  };
}

async function cancelClicksignSignature(documentId: string): Promise<boolean> {
  const response = await fetch(
    `${API_URLS.clicksign}/documents/${documentId}?access_token=${API_KEY}`,
    { method: "DELETE" }
  );

  return response.ok;
}

// ══════════════════════════════════════════════════════════════
// MOCK (para desenvolvimento)
// ══════════════════════════════════════════════════════════════

const mockDocuments: Map<string, SignatureResponse> = new Map();

async function createMockRequest(
  request: SignatureRequest
): Promise<SignatureResponse> {
  const id = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const response: SignatureResponse = {
    id,
    documentId: id,
    status: "pending",
    signUrl: `http://localhost:3000/mock-sign/${id}`,
    signers: request.signers.map((signer) => ({
      email: signer.email,
      status: "pending" as const,
    })),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  mockDocuments.set(id, response);

  console.log("[MOCK] Criada solicitação de assinatura:", {
    id,
    documentName: request.documentName,
    signers: request.signers.map((s) => s.email),
  });

  return response;
}

async function getMockStatus(documentId: string): Promise<SignatureResponse> {
  const doc = mockDocuments.get(documentId);

  if (!doc) {
    throw new Error(`Document not found: ${documentId}`);
  }

  return doc;
}

/**
 * Simula a assinatura de um documento (apenas para testes)
 */
export async function mockSignDocument(documentId: string): Promise<void> {
  const doc = mockDocuments.get(documentId);

  if (!doc) {
    throw new Error(`Document not found: ${documentId}`);
  }

  doc.status = "signed";
  doc.signers = doc.signers.map((signer) => ({
    ...signer,
    status: "signed" as const,
    signedAt: new Date().toISOString(),
  }));

  mockDocuments.set(documentId, doc);

  console.log("[MOCK] Documento assinado:", documentId);
}

/**
 * Helper: Gera ID externo único para tracking
 */
export function generateExternalId(prefix: string = "sig"): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 6);
  return `${prefix}_${timestamp}_${random}`;
}
