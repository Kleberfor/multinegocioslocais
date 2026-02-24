-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "negocio" TEXT NOT NULL,
    "siteUrl" TEXT,
    "segmento" TEXT NOT NULL,
    "placeId" TEXT,
    "enderecoGoogle" TEXT,
    "scoreGeral" INTEGER,
    "scoreGBP" INTEGER,
    "scoreSite" INTEGER,
    "scoreRedes" INTEGER,
    "analiseCompleta" JSONB,
    "argumentosFechamento" JSONB,
    "planoAcao" JSONB,
    "proposta" JSONB,
    "valorSugerido" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'NOVO',
    "motivoPerda" TEXT,
    "observacoes" TEXT,
    "convertido" BOOLEAN NOT NULL DEFAULT false,
    "clienteId" TEXT,
    "origem" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "pesquisaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contatadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_clienteId_key" ON "Lead"("clienteId");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_convertido_idx" ON "Lead"("convertido");

-- CreateIndex
CREATE INDEX "Lead_pesquisaEm_idx" ON "Lead"("pesquisaEm");

-- CreateIndex
CREATE INDEX "Lead_segmento_idx" ON "Lead"("segmento");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
