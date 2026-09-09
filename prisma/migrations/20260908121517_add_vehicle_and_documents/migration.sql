-- AlterTable
ALTER TABLE "User" ADD COLUMN "aadharImage" TEXT;
ALTER TABLE "User" ADD COLUMN "aadharNumber" TEXT;
ALTER TABLE "User" ADD COLUMN "dlImage" TEXT;
ALTER TABLE "User" ADD COLUMN "dlNumber" TEXT;

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fuel" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "regNumber" TEXT,
    "year" INTEGER,
    "emissionGPerKm" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distanceKm" REAL NOT NULL,
    "routeName" TEXT,
    "notes" TEXT,
    "emissionKg" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
