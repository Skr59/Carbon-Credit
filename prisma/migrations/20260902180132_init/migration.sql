-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'farmer',
    "village" TEXT,
    "state" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Land" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "areaHa" REAL NOT NULL,
    "areaAcres" REAL NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "polygons" TEXT,
    "vegetationType" TEXT NOT NULL,
    "cropType" TEXT,
    "soilType" TEXT,
    "waterSource" TEXT,
    "estCreditsPerHa" REAL NOT NULL,
    "estTotalCredits" REAL NOT NULL,
    "estValueINR" REAL NOT NULL,
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Land_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tree" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "landId" TEXT,
    "species" TEXT NOT NULL,
    "ageYears" INTEGER NOT NULL,
    "heightM" REAL NOT NULL,
    "imageBase64" TEXT,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "locationName" TEXT,
    "estCO2Kg" REAL NOT NULL,
    "estValueINR" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tree_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Tree_landId_fkey" FOREIGN KEY ("landId") REFERENCES "Land" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "landId" TEXT,
    "credits" REAL NOT NULL,
    "pricePerCreditINR" REAL NOT NULL,
    "totalValueINR" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "listedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
