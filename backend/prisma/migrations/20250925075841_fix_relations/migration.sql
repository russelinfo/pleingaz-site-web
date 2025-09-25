/*
  Warnings:

  - You are about to drop the column `currency` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `customerEmail` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `customerPhone` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `notchData` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Transaction" DROP COLUMN "currency",
DROP COLUMN "customerEmail",
DROP COLUMN "customerName",
DROP COLUMN "customerPhone",
DROP COLUMN "notchData",
DROP COLUMN "updatedAt",
ADD COLUMN     "orderId" INTEGER,
ALTER COLUMN "status" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "image" TEXT NOT NULL,
    "fullPrice" INTEGER,
    "emptyPrice" INTEGER,
    "price" INTEGER,
    "isGasBottle" BOOLEAN NOT NULL DEFAULT false,
    "inStock" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" SERIAL NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "deliveryAddress" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
