/*
  Warnings:

  - A unique constraint covering the columns `[nric]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "nric" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_nric_key" ON "users"("nric");

-- CreateIndex
CREATE INDEX "users_nric_idx" ON "users"("nric");
