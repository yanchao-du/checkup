/*
  Warnings:

  - A unique constraint covering the columns `[hci_code]` on the table `clinics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mcr_number]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "clinics" ADD COLUMN     "hci_code" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "mcr_number" TEXT;

-- CreateTable
CREATE TABLE "doctor_clinics" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_clinics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "doctor_clinics_doctor_id_idx" ON "doctor_clinics"("doctor_id");

-- CreateIndex
CREATE INDEX "doctor_clinics_clinic_id_idx" ON "doctor_clinics"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_clinics_doctor_id_clinic_id_key" ON "doctor_clinics"("doctor_id", "clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "clinics_hci_code_key" ON "clinics"("hci_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_mcr_number_key" ON "users"("mcr_number");

-- CreateIndex
CREATE INDEX "users_default_doctor_id_idx" ON "users"("default_doctor_id");

-- AddForeignKey
ALTER TABLE "doctor_clinics" ADD CONSTRAINT "doctor_clinics_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_clinics" ADD CONSTRAINT "doctor_clinics_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
