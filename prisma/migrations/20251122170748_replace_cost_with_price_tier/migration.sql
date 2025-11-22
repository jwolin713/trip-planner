-- CreateEnum
CREATE TYPE "PriceRange" AS ENUM ('BUDGET', 'MODERATE', 'EXPENSIVE', 'LUXURY');

-- AlterTable
ALTER TABLE "Destination" ADD COLUMN     "priceRange" "PriceRange";

-- AlterTable
ALTER TABLE "Destination" DROP COLUMN "nightlyCostTotalUsd",
DROP COLUMN "nightlyCostPerPersonUsd";
