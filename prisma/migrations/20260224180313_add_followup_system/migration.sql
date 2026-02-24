-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "agendadoPara" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "executadoEm" TIMESTAMP(3),
    "assunto" TEXT,
    "mensagem" TEXT,
    "canal" TEXT NOT NULL DEFAULT 'EMAIL',
    "resultado" TEXT,
    "observacoes" TEXT,
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "ultimaTentativa" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUpTemplate" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "assunto" TEXT,
    "mensagem" TEXT NOT NULL,
    "diasAposEvento" INTEGER NOT NULL DEFAULT 1,
    "horaEnvio" TEXT NOT NULL DEFAULT '10:00',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUpTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FollowUp_leadId_idx" ON "FollowUp"("leadId");

-- CreateIndex
CREATE INDEX "FollowUp_status_idx" ON "FollowUp"("status");

-- CreateIndex
CREATE INDEX "FollowUp_agendadoPara_idx" ON "FollowUp"("agendadoPara");

-- CreateIndex
CREATE INDEX "FollowUp_tipo_idx" ON "FollowUp"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "FollowUpTemplate_nome_key" ON "FollowUpTemplate"("nome");

-- CreateIndex
CREATE INDEX "FollowUpTemplate_tipo_idx" ON "FollowUpTemplate"("tipo");

-- CreateIndex
CREATE INDEX "FollowUpTemplate_ativo_idx" ON "FollowUpTemplate"("ativo");
