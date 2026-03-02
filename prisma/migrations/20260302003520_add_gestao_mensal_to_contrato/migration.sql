-- AlterTable
ALTER TABLE "Contrato" ADD COLUMN     "incluiGestaoMensal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "valorMensal" DECIMAL(10,2);
