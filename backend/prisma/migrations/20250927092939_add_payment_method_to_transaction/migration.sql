/*
  Warnings:

  - You are about to drop the column `email` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Transaction" DROP COLUMN "email",
DROP COLUMN "phone";
