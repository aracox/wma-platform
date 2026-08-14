-- CreateTable
CREATE TABLE "Facility" (
    "seq" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "provinceEn" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "currentLoad" INTEGER NOT NULL,
    "operator" TEXT NOT NULL,
    "lastUpdated" TEXT NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("seq")
);

-- CreateTable
CREATE TABLE "Sensor" (
    "seq" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "province" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "bod" DOUBLE PRECISION NOT NULL,
    "cod" DOUBLE PRECISION NOT NULL,
    "ph" DOUBLE PRECISION NOT NULL,
    "tss" DOUBLE PRECISION NOT NULL,
    "timestamp" TEXT NOT NULL,

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("seq")
);

-- CreateTable
CREATE TABLE "Report" (
    "seq" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "systemInfo" TEXT NOT NULL,
    "identifiedIssues" TEXT NOT NULL,
    "laoActivities" TEXT NOT NULL,
    "communityParticipation" TEXT NOT NULL,
    "laoId" TEXT NOT NULL,
    "laoName" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT,
    "reportedBy" TEXT,
    "reportedByEmail" TEXT,
    "attachments" TEXT NOT NULL DEFAULT '[]',

    CONSTRAINT "Report_pkey" PRIMARY KEY ("seq")
);

-- CreateTable
CREATE TABLE "Cooperation" (
    "seq" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "localPlan" TEXT NOT NULL,
    "expectedOutcome" TEXT NOT NULL,
    "laoId" TEXT NOT NULL,
    "laoName" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT,
    "reportedBy" TEXT,
    "attachments" TEXT NOT NULL DEFAULT '[]',

    CONSTRAINT "Cooperation_pkey" PRIMARY KEY ("seq")
);

-- CreateIndex
CREATE UNIQUE INDEX "Facility_id_key" ON "Facility"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_id_key" ON "Sensor"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Report_id_key" ON "Report"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Cooperation_id_key" ON "Cooperation"("id");
