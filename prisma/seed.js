// One-time seed: populates the SQLite database from the legacy JSON fixtures
// in src/data/. Safe to re-run - skips any table that already has rows, so it
// never overwrites data that came in through the app after the first seed.
const { PrismaClient } = require("@prisma/client");
const facilities = require("../src/data/facilities.json");
const sensors = require("../src/data/sensors.json");
const reports = require("../src/data/reports.json");
const cooperation = require("../src/data/cooperation.json");

const prisma = new PrismaClient();

function withAttachments(record) {
  const { attachments, ...rest } = record;
  return { ...rest, attachments: JSON.stringify(attachments || []) };
}

async function seedTable(name, model, rows, mapRow) {
  const count = await model.count();
  if (count > 0) {
    console.log(`skip ${name}: already has ${count} rows`);
    return;
  }
  for (const row of rows) {
    await model.create({ data: mapRow ? mapRow(row) : row });
  }
  console.log(`seeded ${name}: ${rows.length} rows`);
}

async function main() {
  await seedTable("facilities", prisma.facility, facilities);
  await seedTable("sensors", prisma.sensor, sensors);
  await seedTable("reports", prisma.report, reports, withAttachments);
  await seedTable("cooperation", prisma.cooperation, cooperation, withAttachments);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
