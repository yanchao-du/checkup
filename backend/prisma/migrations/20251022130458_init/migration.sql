-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('doctor', 'nurse', 'admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('Six-monthly Medical Exam for Migrant Domestic Workers (MOM)', 'Full Medical Exam for Work Permit (MOM)', 'Medical Exam for Aged Drivers (SPF)');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('draft', 'pending_approval', 'submitted', 'rejected');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('created', 'updated', 'submitted', 'approved', 'rejected', 'deleted');

-- CreateTable
CREATE TABLE "clinics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registration_number" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_submissions" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "exam_type" "ExamType" NOT NULL,
    "patient_name" TEXT NOT NULL,
    "patient_nric" TEXT NOT NULL,
    "patient_dob" DATE NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'draft',
    "form_data" JSONB NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_date" TIMESTAMP(3),
    "approved_date" TIMESTAMP(3),
    "rejected_reason" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_type" "EventType" NOT NULL,
    "changes" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinics_registration_number_key" ON "clinics"("registration_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_clinic_id_idx" ON "users"("clinic_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "medical_submissions_clinic_id_idx" ON "medical_submissions"("clinic_id");

-- CreateIndex
CREATE INDEX "medical_submissions_created_by_idx" ON "medical_submissions"("created_by");

-- CreateIndex
CREATE INDEX "medical_submissions_status_idx" ON "medical_submissions"("status");

-- CreateIndex
CREATE INDEX "medical_submissions_patient_nric_idx" ON "medical_submissions"("patient_nric");

-- CreateIndex
CREATE INDEX "medical_submissions_exam_type_idx" ON "medical_submissions"("exam_type");

-- CreateIndex
CREATE INDEX "medical_submissions_created_date_idx" ON "medical_submissions"("created_date" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_submission_id_idx" ON "audit_logs"("submission_id");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp" DESC);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_submissions" ADD CONSTRAINT "medical_submissions_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_submissions" ADD CONSTRAINT "medical_submissions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_submissions" ADD CONSTRAINT "medical_submissions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "medical_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
