-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExamType" ADD VALUE 'Driving Licence Medical Examination Report (TP)';
ALTER TYPE "ExamType" ADD VALUE 'Driving Licence and Vocational Licence (TP & LTA)';
ALTER TYPE "ExamType" ADD VALUE 'Vocational Licence Medical Examination (LTA)';
