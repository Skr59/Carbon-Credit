-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'farmer',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "village" TEXT,
    "state" TEXT,
    "upiId" TEXT,
    "acHolderName" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "ifsc" TEXT,
    "aadharNumber" TEXT,
    "aadharImage" TEXT,
    "dlNumber" TEXT,
    "dlImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("aadharImage", "aadharNumber", "acHolderName", "accountNumber", "bankName", "createdAt", "dlImage", "dlNumber", "email", "id", "ifsc", "name", "passwordHash", "phone", "role", "state", "upiId", "village") SELECT "aadharImage", "aadharNumber", "acHolderName", "accountNumber", "bankName", "createdAt", "dlImage", "dlNumber", "email", "id", "ifsc", "name", "passwordHash", "phone", "role", "state", "upiId", "village" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
