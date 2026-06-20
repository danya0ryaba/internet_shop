-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "delivery" TEXT NOT NULL DEFAULT 'pickup',
ADD COLUMN     "payment" TEXT NOT NULL DEFAULT 'card',
ALTER COLUMN "address" DROP NOT NULL;
