-- CreateTable
CREATE TABLE "Facility" (
    "seq" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "provinceEn" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "currentLoad" INTEGER NOT NULL,
    "operator" TEXT NOT NULL,
    "lastUpdated" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Sensor" (
    "seq" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "province" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "bod" REAL NOT NULL,
    "cod" REAL NOT NULL,
    "ph" REAL NOT NULL,
    "tss" REAL NOT NULL,
    "timestamp" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Report" (
    "seq" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id" TEXT NOT NULL,
    "systemInfo" TEXT NOT NULL,
    "identifiedIssues" TEXT NOT NULL,
    "laoActivities" TEXT NOT NULL,
    "communityParticipation" TEXT NOT NULL,
    "laoId" TEXT NOT NULL,
    "laoName" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT,
    "reportedBy" TEXT,
    "reportedByEmail" TEXT,
    "attachments" TEXT NOT NULL DEFAULT '[]'
);

-- CreateTable
CREATE TABLE "Cooperation" (
    "seq" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "localPlan" TEXT NOT NULL,
    "expectedOutcome" TEXT NOT NULL,
    "laoId" TEXT NOT NULL,
    "laoName" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT,
    "reportedBy" TEXT,
    "attachments" TEXT NOT NULL DEFAULT '[]'
);

-- CreateIndex
CREATE UNIQUE INDEX "Facility_id_key" ON "Facility"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_id_key" ON "Sensor"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Report_id_key" ON "Report"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Cooperation_id_key" ON "Cooperation"("id");
