-- CreateEnum
CREATE TYPE "BloodCentreType" AS ENUM ('HOSPITAL', 'STANDALONE_BLOOD_BANK');

-- AlterTable
ALTER TABLE "BloodBank"
ADD COLUMN "centreType" "BloodCentreType" NOT NULL DEFAULT 'STANDALONE_BLOOD_BANK',
ADD COLUMN "city" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "BloodInventory_type_component_idx" ON "BloodInventory"("type", "component");

-- CreateIndex
CREATE INDEX "BloodInventory_bloodBankId_type_idx" ON "BloodInventory"("bloodBankId", "type");
