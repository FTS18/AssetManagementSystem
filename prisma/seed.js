const { PrismaClient } = require("@prisma/client");
const { PrismaLibSQL } = require("@prisma/adapter-libsql");
const bcrypt = require("bcryptjs");
require("dotenv").config();

let prisma;
if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
  const adapter = new PrismaLibSQL({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

// Helper to get a random date between two dates
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to pick a random item from an array
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Starting INTENSE DB Seed with Historical Data for Visualizations...");

  // 1. Core Structure: Departments
  const depts = [
    await prisma.department.upsert({ where: { name: "Engineering" }, update: {}, create: { name: "Engineering", status: "Active" } }),
    await prisma.department.upsert({ where: { name: "Marketing" }, update: {}, create: { name: "Marketing", status: "Active" } }),
    await prisma.department.upsert({ where: { name: "IT Operations" }, update: {}, create: { name: "IT Operations", status: "Active" } }),
    await prisma.department.upsert({ where: { name: "Product Design" }, update: {}, create: { name: "Product Design", status: "Active" } }),
    await prisma.department.upsert({ where: { name: "Sales" }, update: {}, create: { name: "Sales", status: "Active" } })
  ];

  // Fetch ALL existing employees to distribute data to them!
  const allEmployees = await prisma.employee.findMany();
  
  if (allEmployees.length === 0) {
    console.error("No employees found in the DB. Please create some users first.");
    return;
  }

  console.log("Wiping old asset data to re-seed...");
  await prisma.auditItem.deleteMany();
  await prisma.auditCycle.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.resourceBooking.deleteMany();
  await prisma.transferRequest.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.assetCategory.deleteMany();

  const adminOrManager = allEmployees.find(e => e.role === "Admin" || e.role === "AssetManager") || allEmployees[0];

  // 3. Core Structure: Categories
  const catElec = await prisma.assetCategory.upsert({ where: { name: "Electronics" }, update: {}, create: { name: "Electronics" } });
  const catVeh = await prisma.assetCategory.upsert({ where: { name: "Vehicles" }, update: {}, create: { name: "Vehicles" } });
  const catFurn = await prisma.assetCategory.upsert({ where: { name: "Furniture" }, update: {}, create: { name: "Furniture" } });
  const catSoft = await prisma.assetCategory.upsert({ where: { name: "Software Licenses" }, update: {}, create: { name: "Software Licenses" } });
  
  // 4. Generate 150 INTENSE Random Assets
  const assetTemplates = [
    { name: "MacBook Pro M3 Max", cost: 280000, cat: catElec.id, bookable: false },
    { name: "Dell XPS 17", cost: 210000, cat: catElec.id, bookable: false },
    { name: "Lenovo ThinkPad X1", cost: 160000, cat: catElec.id, bookable: false },
    { name: "Epson 4K Laser Projector", cost: 85000, cat: catElec.id, bookable: true },
    { name: "Godrej Interio Standing Desk", cost: 45000, cat: catFurn.id, bookable: false },
    { name: "Featherlite Ergonomic Chair", cost: 18000, cat: catFurn.id, bookable: false },
    { name: "Company Mahindra XUV700", cost: 2200000, cat: catVeh.id, bookable: true },
    { name: "Tata Nexon EV (Fleet)", cost: 1500000, cat: catVeh.id, bookable: true },
    { name: "Adobe Creative Cloud License", cost: 70000, cat: catSoft.id, bookable: false },
    { name: "Figma Enterprise License", cost: 90000, cat: catSoft.id, bookable: false },
    { name: "AWS Mumbai Region Keys", cost: 0, cat: catSoft.id, bookable: false },
    { name: "iPad Pro 12.9", cost: 95000, cat: catElec.id, bookable: true },
    { name: "Sony Alpha A7 IV Camera", cost: 210000, cat: catElec.id, bookable: true },
  ];

  const locations = ["Mumbai HQ - Floor 1", "Mumbai HQ - Floor 2", "Bengaluru Tech Park", "Pune Office", "Delhi NCR Branch", "Remote - IN"];
  const conditions = ["New", "Good", "Fair", "Poor"];
  const assetRecords = [];

  for (let i = 0; i < 150; i++) {
    const template = pickRandom(assetTemplates);
    const uniqueId = Math.floor(Math.random() * 90000) + 10000;
    const tag = `INT-${uniqueId}`;
    
    const asset = await prisma.asset.create({
      data: {
        tag: tag,
        name: `${template.name} #${uniqueId}`,
        serialNumber: `SN-${uniqueId}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        categoryId: template.cat,
        acquisitionDate: getRandomDate(new Date(2021, 0, 1), new Date()),
        acquisitionCost: template.cost * (0.8 + Math.random() * 0.4),
        condition: pickRandom(conditions),
        location: pickRandom(locations),
        isBookable: template.bookable,
        status: "Available"
      }
    });
    assetRecords.push(asset);
  }

  // 5. Generate Intense Workflows
  const now = new Date();
  let assetIndex = 0;

  for (const employee of allEmployees) {
    if (assetIndex + 10 >= assetRecords.length) assetIndex = 0;

    // Guaranteed Allocations
    await prisma.allocation.create({
      data: {
        assetId: assetRecords[assetIndex++].id, employeeId: employee.id, departmentId: employee.departmentId || depts[0].id,
        expectedReturnDate: getRandomDate(new Date(now.getTime() + 86400000), new Date(now.getTime() + 180 * 86400000)), status: "Active"
      }
    });
    await prisma.asset.update({ where: { id: assetRecords[assetIndex - 1].id }, data: { status: "Allocated" } });

    await prisma.allocation.create({
      data: {
        assetId: assetRecords[assetIndex++].id, employeeId: employee.id, departmentId: employee.departmentId || depts[0].id,
        expectedReturnDate: getRandomDate(new Date(now.getTime() - 30 * 86400000), new Date(now.getTime() - 86400000)), status: "Active"
      }
    });
    await prisma.asset.update({ where: { id: assetRecords[assetIndex - 1].id }, data: { status: "Allocated" } });

    // Historical Bookings
    for (let j = 0; j < 3; j++) {
      const start = getRandomDate(new Date(now.getTime() - 60 * 86400000), now);
      const end = new Date(start.getTime() + (Math.random() * 5 + 1) * 86400000);
      await prisma.resourceBooking.create({
        data: {
          assetId: assetRecords[assetIndex].id, employeeId: employee.id, startDate: start, endDate: end, status: "Completed"
        }
      });
    }
    // Future Booking
    await prisma.resourceBooking.create({
      data: {
        assetId: assetRecords[assetIndex++].id, employeeId: employee.id,
        startDate: getRandomDate(now, new Date(now.getTime() + 14 * 86400000)),
        endDate: getRandomDate(new Date(now.getTime() + 15 * 86400000), new Date(now.getTime() + 20 * 86400000)),
        status: "Upcoming"
      }
    });

    // Historical Maintenance
    for (let j = 0; j < 2; j++) {
      const created = getRandomDate(new Date(now.getTime() - 180 * 86400000), new Date(now.getTime() - 10 * 86400000));
      const resolved = new Date(created.getTime() + (Math.random() * 20 + 1) * 86400000); // 1 to 21 days to resolve
      await prisma.maintenanceRequest.create({
        data: {
          assetId: assetRecords[assetIndex].id, employeeId: employee.id, description: "Routine servicing / Historical repair.",
          priority: pickRandom(["Low", "Medium", "High", "Critical"]),
          status: "Resolved",
          cost: Math.floor(Math.random() * 15000),
          createdDate: created,
          resolvedAt: resolved,
          resolvedById: adminOrManager.id,
          resolutionNotes: "Fixed successfully."
        }
      });
    }
    // Active Maintenance
    await prisma.maintenanceRequest.create({
      data: {
        assetId: assetRecords[assetIndex++].id, employeeId: employee.id, description: "Hardware component failure requiring immediate technician assistance.",
        priority: "High", status: "Pending"
      }
    });
  }

  // 6. Generate Heavy Audit Cycles
  const auditWeekStart = getRandomDate(new Date(now.getTime() - 7 * 86400000), now);
  const auditWeekEnd = new Date(auditWeekStart.getTime() + 7 * 86400000);

  const cycle1 = await prisma.auditCycle.create({
    data: { name: "Global Q3 Hardware Audit", startDate: auditWeekStart, endDate: auditWeekEnd, auditorId: adminOrManager.id, status: "Active" }
  });

  const auditAssets = [...assetRecords].sort(() => 0.5 - Math.random()).slice(0, 40);
  for (const asset of auditAssets) {
    const rand = Math.random();
    let status = "Pending";
    let date = null;
    if (rand < 0.6) { status = "Verified"; date = new Date(); }
    else if (rand < 0.8) { status = "Missing"; }
    else { status = "Flagged"; }
    
    await prisma.auditItem.create({
      data: { cycleId: cycle1.id, assetId: asset.id, status: status, verifiedDate: date }
    });
  }

  console.log("INTENSE DB Seed Completed! Application is now heavily populated with historical data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
