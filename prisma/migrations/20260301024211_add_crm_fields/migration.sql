-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "vendedorId" TEXT;

-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "estado" TEXT,
ADD COLUMN     "negocio" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "origem" TEXT NOT NULL DEFAULT 'CAPTACAO_ATIVA',
ADD COLUMN     "proximoContato" TIMESTAMP(3),
ADD COLUMN     "segmento" TEXT,
ADD COLUMN     "statusPipeline" TEXT NOT NULL DEFAULT 'NOVO',
ADD COLUMN     "valorEstimado" DECIMAL(10,2),
ADD COLUMN     "vendedorId" TEXT,
ALTER COLUMN "placeId" DROP NOT NULL,
ALTER COLUMN "score" DROP NOT NULL,
ALTER COLUMN "analise" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "role" SET DEFAULT 'vendedor';

-- CreateTable
CREATE TABLE "Interacao" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT,
    "leadId" TEXT,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criadoPorId" TEXT NOT NULL,
    "criadoPor" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Interacao_prospectId_idx" ON "Interacao"("prospectId");

-- CreateIndex
CREATE INDEX "Interacao_leadId_idx" ON "Interacao"("leadId");

-- CreateIndex
CREATE INDEX "Interacao_tipo_idx" ON "Interacao"("tipo");

-- CreateIndex
CREATE INDEX "Interacao_createdAt_idx" ON "Interacao"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_vendedorId_idx" ON "Lead"("vendedorId");

-- CreateIndex
CREATE INDEX "Prospect_vendedorId_idx" ON "Prospect"("vendedorId");

-- CreateIndex
CREATE INDEX "Prospect_statusPipeline_idx" ON "Prospect"("statusPipeline");

-- CreateIndex
CREATE INDEX "Prospect_origem_idx" ON "Prospect"("origem");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_ativo_idx" ON "User"("ativo");

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interacao" ADD CONSTRAINT "Interacao_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interacao" ADD CONSTRAINT "Interacao_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
