-- AlterTable
ALTER TABLE "medical_submissions" ADD COLUMN     "assigned_doctor_id" TEXT;

-- AddForeignKey
ALTER TABLE "medical_submissions" ADD CONSTRAINT "medical_submissions_assigned_doctor_id_fkey" FOREIGN KEY ("assigned_doctor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
