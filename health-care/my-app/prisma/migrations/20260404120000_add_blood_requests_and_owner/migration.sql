ALTER TABLE "BloodBank" ADD COLUMN "authAccountId" TEXT;

CREATE UNIQUE INDEX "BloodBank_authAccountId_key" ON "BloodBank"("authAccountId");

ALTER TABLE "BloodBank"
ADD CONSTRAINT "BloodBank_authAccountId_fkey"
FOREIGN KEY ("authAccountId") REFERENCES "AuthAccount"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TYPE "BloodRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE "BloodRequest" (
    "id" SERIAL NOT NULL,
    "requesterName" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "requesterPhone" TEXT,
    "patientName" TEXT,
    "bloodType" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "requestedUnits" INTEGER NOT NULL,
    "message" TEXT,
    "status" "BloodRequestStatus" NOT NULL DEFAULT 'pending',
    "reviewedAt" TIMESTAMP(3),
    "bloodBankId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BloodRequest_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "BloodRequest"
ADD CONSTRAINT "BloodRequest_bloodBankId_fkey"
FOREIGN KEY ("bloodBankId") REFERENCES "BloodBank"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
