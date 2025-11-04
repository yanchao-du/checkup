-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EventType" ADD VALUE 'assigned';
ALTER TYPE "EventType" ADD VALUE 'reassigned';
ALTER TYPE "EventType" ADD VALUE 'claimed';

-- AlterEnum
ALTER TYPE "SubmissionStatus" ADD VALUE 'in_progress';

-- AlterTable
ALTER TABLE "medical_submissions" ADD COLUMN     "assigned_at" TIMESTAMP(3),
ADD COLUMN     "assigned_by_id" TEXT,
ADD COLUMN     "assigned_to_id" TEXT,
ADD COLUMN     "assigned_to_role" "UserRole";

-- CreateIndex
CREATE INDEX "medical_submissions_assigned_to_id_idx" ON "medical_submissions"("assigned_to_id");

-- AddForeignKey
ALTER TABLE "medical_submissions" ADD CONSTRAINT "medical_submissions_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_submissions" ADD CONSTRAINT "medical_submissions_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
