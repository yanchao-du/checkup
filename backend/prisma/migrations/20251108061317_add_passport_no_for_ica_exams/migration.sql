-- AlterTable
ALTER TABLE "medical_submissions" ADD COLUMN     "patient_passport_no" TEXT,
ALTER COLUMN "patient_nric" DROP NOT NULL;
