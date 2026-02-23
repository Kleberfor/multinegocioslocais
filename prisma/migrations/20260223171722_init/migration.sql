-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "score" INTEGER NOT NULL,
    "analise" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "negocio" TEXT NOT NULL,
    "endereco" JSONB,
    "planoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "parcelas" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "pdfUrl" TEXT,
    "assinadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "parcela" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "mpId" TEXT,
    "nfeUrl" TEXT,
    "nfeNumero" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plano" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "implantacao" DECIMAL(10,2) NOT NULL,
    "mensalidade" DECIMAL(10,2) NOT NULL,
    "parcelas" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prospect_placeId_idx" ON "Prospect"("placeId");

-- CreateIndex
CREATE INDEX "Prospect_createdAt_idx" ON "Prospect"("createdAt");

-- CreateIndex
CREATE INDEX "Cliente_email_idx" ON "Cliente"("email");

-- CreateIndex
CREATE INDEX "Cliente_cpfCnpj_idx" ON "Cliente"("cpfCnpj");

-- CreateIndex
CREATE INDEX "Contrato_clienteId_idx" ON "Contrato"("clienteId");

-- CreateIndex
CREATE INDEX "Contrato_status_idx" ON "Contrato"("status");

-- CreateIndex
CREATE INDEX "Pagamento_contratoId_idx" ON "Pagamento"("contratoId");

-- CreateIndex
CREATE INDEX "Pagamento_status_idx" ON "Pagamento"("status");

-- CreateIndex
CREATE INDEX "Pagamento_mpId_idx" ON "Pagamento"("mpId");

-- CreateIndex
CREATE INDEX "Plano_ativo_idx" ON "Plano"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
