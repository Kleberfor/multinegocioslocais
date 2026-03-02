-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN "prospectId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_prospectId_key" ON "Cliente"("prospectId");

-- CreateIndex
CREATE INDEX "Cliente_prospectId_idx" ON "Cliente"("prospectId");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;
