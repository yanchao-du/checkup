-- AlterTable
ALTER TABLE "users" ADD COLUMN     "default_doctor_id" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_default_doctor_id_fkey" FOREIGN KEY ("default_doctor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
