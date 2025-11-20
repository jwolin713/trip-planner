-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "imageUrl" TEXT,
    "propertyUrl" TEXT,
    "notes" TEXT,
    "airportCode" TEXT,
    "distanceFromAirportMiles" REAL,
    "driveTimeFromAirportMin" INTEGER,
    "avgHighTempF" REAL,
    "avgLowTempF" REAL,
    "weatherSummary" TEXT,
    "nightlyCostTotalUsd" REAL,
    "nightlyCostPerPersonUsd" REAL,
    "distanceFromHoustonMiles" REAL,
    "flightDurationHours" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
