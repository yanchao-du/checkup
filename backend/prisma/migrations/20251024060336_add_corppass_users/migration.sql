-- CreateTable
CREATE TABLE "corppass_users" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "corppass_sub" TEXT NOT NULL,
    "uen" TEXT,
    "nric" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corppass_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "corppass_users_corppass_sub_key" ON "corppass_users"("corppass_sub");

-- CreateIndex
CREATE INDEX "corppass_users_user_id_idx" ON "corppass_users"("user_id");

-- CreateIndex
CREATE INDEX "corppass_users_corppass_sub_idx" ON "corppass_users"("corppass_sub");

-- AddForeignKey
ALTER TABLE "corppass_users" ADD CONSTRAINT "corppass_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
