-- AlterTable
ALTER TABLE "medical_submissions" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "medical_submissions_deleted_at_idx" ON "medical_submissions"("deleted_at");
