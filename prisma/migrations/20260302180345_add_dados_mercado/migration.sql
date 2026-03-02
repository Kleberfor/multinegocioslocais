-- CreateTable
CREATE TABLE "DadosMercado" (
    "id" TEXT NOT NULL,
    "segmento" TEXT NOT NULL,
    "regiao" TEXT,
    "ticketMedio" DECIMAL(10,2) NOT NULL,
    "clientesPotenciaisMes" INTEGER NOT NULL,
    "fatorMultiplicador" DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    "fonteTicket" TEXT,
    "fonteBuscas" TEXT,
    "observacoes" TEXT,
    "atualizadoPorId" TEXT,
    "atualizadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DadosMercado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DadosMercado_segmento_idx" ON "DadosMercado"("segmento");

-- CreateIndex
CREATE INDEX "DadosMercado_regiao_idx" ON "DadosMercado"("regiao");

-- CreateIndex
CREATE UNIQUE INDEX "DadosMercado_segmento_regiao_key" ON "DadosMercado"("segmento", "regiao");
