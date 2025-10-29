-- DropForeignKey
ALTER TABLE "public"."audit_logs" DROP CONSTRAINT "audit_logs_submission_id_fkey";

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "medical_submissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
