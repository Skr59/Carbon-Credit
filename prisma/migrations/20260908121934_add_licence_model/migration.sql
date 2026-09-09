-- CreateTable
CREATE TABLE "Licence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'vehicle',
    "co2OffsetKg" REAL NOT NULL,
    "credits" REAL NOT NULL,
    "totalValueINR" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "purchasedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Licence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
