-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "imageUrl" TEXT,
    "propertyUrl" TEXT,
    "notes" TEXT,
    "airportCode" TEXT,
    "distanceFromAirportMiles" DOUBLE PRECISION,
    "driveTimeFromAirportMin" INTEGER,
    "avgHighTempF" DOUBLE PRECISION,
    "avgLowTempF" DOUBLE PRECISION,
    "weatherSummary" TEXT,
    "nightlyCostTotalUsd" DOUBLE PRECISION,
    "nightlyCostPerPersonUsd" DOUBLE PRECISION,
    "distanceFromHoustonMiles" DOUBLE PRECISION,
    "flightDurationHours" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);
