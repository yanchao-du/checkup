-- CreateTable
CREATE TABLE "nurse_clinics" (
    "id" TEXT NOT NULL,
    "nurse_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nurse_clinics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nurse_clinics_nurse_id_idx" ON "nurse_clinics"("nurse_id");

-- CreateIndex
CREATE INDEX "nurse_clinics_clinic_id_idx" ON "nurse_clinics"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "nurse_clinics_nurse_id_clinic_id_key" ON "nurse_clinics"("nurse_id", "clinic_id");

-- AddForeignKey
ALTER TABLE "nurse_clinics" ADD CONSTRAINT "nurse_clinics_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_clinics" ADD CONSTRAINT "nurse_clinics_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
