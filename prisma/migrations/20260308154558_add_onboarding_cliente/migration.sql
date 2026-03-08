-- CreateTable
CREATE TABLE "OnboardingCliente" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "etapaAtual" INTEGER NOT NULL DEFAULT 1,
    "etapa1Completa" BOOLEAN NOT NULL DEFAULT false,
    "etapa2Completa" BOOLEAN NOT NULL DEFAULT false,
    "horarioAbertura" TEXT,
    "horarioFechamento" TEXT,
    "diasFuncionamento" JSONB,
    "servicos" JSONB,
    "diferenciais" TEXT,
    "etapa3Completa" BOOLEAN NOT NULL DEFAULT false,
    "instagram" TEXT,
    "facebook" TEXT,
    "linkedin" TEXT,
    "twitter" TEXT,
    "tiktok" TEXT,
    "youtube" TEXT,
    "etapa4Completa" BOOLEAN NOT NULL DEFAULT false,
    "gbpConectado" BOOLEAN NOT NULL DEFAULT false,
    "gbpUrl" TEXT,
    "gbpStatus" TEXT,
    "etapa5Completa" BOOLEAN NOT NULL DEFAULT false,
    "objetivoPrincipal" TEXT,
    "metaClientes" INTEGER,
    "metaFaturamento" DECIMAL(10,2),
    "prazoMeta" TEXT,
    "etapa6Completa" BOOLEAN NOT NULL DEFAULT false,
    "notificacaoEmail" BOOLEAN NOT NULL DEFAULT true,
    "notificacaoWhatsApp" BOOLEAN NOT NULL DEFAULT true,
    "frequenciaRelatorio" TEXT,
    "melhorHorario" TEXT,
    "etapa7Completa" BOOLEAN NOT NULL DEFAULT false,
    "tourRealizado" BOOLEAN NOT NULL DEFAULT false,
    "consultoriaAgendada" BOOLEAN NOT NULL DEFAULT false,
    "dataConsultoria" TIMESTAMP(3),
    "iniciadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completadoEm" TIMESTAMP(3),
    "tempoTotalMinutos" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingCliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingCliente_clienteId_key" ON "OnboardingCliente"("clienteId");

-- CreateIndex
CREATE INDEX "OnboardingCliente_clienteId_idx" ON "OnboardingCliente"("clienteId");

-- CreateIndex
CREATE INDEX "OnboardingCliente_completado_idx" ON "OnboardingCliente"("completado");

-- CreateIndex
CREATE INDEX "OnboardingCliente_etapaAtual_idx" ON "OnboardingCliente"("etapaAtual");

-- AddForeignKey
ALTER TABLE "OnboardingCliente" ADD CONSTRAINT "OnboardingCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
