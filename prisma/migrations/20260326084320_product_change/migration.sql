/*
  Warnings:

  - You are about to drop the column `pizzaType` on the `ProductItem` table. All the data in the column will be lost.
  - You are about to drop the `Ingredient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CartItemToIngredient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_IngredientToProduct` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CartItemToIngredient" DROP CONSTRAINT "_CartItemToIngredient_A_fkey";

-- DropForeignKey
ALTER TABLE "_CartItemToIngredient" DROP CONSTRAINT "_CartItemToIngredient_B_fkey";

-- DropForeignKey
ALTER TABLE "_IngredientToProduct" DROP CONSTRAINT "_IngredientToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_IngredientToProduct" DROP CONSTRAINT "_IngredientToProduct_B_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL,
ADD COLUMN     "size" INTEGER;

-- AlterTable
ALTER TABLE "ProductItem" DROP COLUMN "pizzaType";

-- DropTable
DROP TABLE "Ingredient";

-- DropTable
DROP TABLE "_CartItemToIngredient";

-- DropTable
DROP TABLE "_IngredientToProduct";
