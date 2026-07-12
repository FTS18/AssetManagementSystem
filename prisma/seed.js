const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Helper to get a random date between two dates
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to pick a random item from an array
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Starting INTENSE DB Seed...");

  // 1. Core Structure: Departments
  const depts = [
    await prisma.department.upsert({ where: { name: "Engineering" }, update: {}, create: { name: "Engineering", status: "Active" } }),
    await prisma.department.upsert({ where: { name: "Marketing" }, update: {}, create: { name: "Marketing", status: "Active" } }),
    await prisma.department.upsert({ where: { name: "IT Operations" }, update: {}, create: { name: "IT Operations", status: "Active" } }),
    await prisma.department.upsert({ where: { name: "Product Design" }, update: {}, create: { name: "Product Design", status: "Active" } }),
    await prisma.department.upsert({ where: { name: "Sales" }, update: {}, create: { name: "Sales", status: "Active" } })
  ];

  // 2. Core Structure: Users
  const passwordHash = await bcrypt.hash("password123", 10);
  
  // Managers
  const admin = await prisma.employee.upsert({ where: { email: "admin@assetflow.com" }, update: {}, create: { name: "Alice Admin", email: "admin@assetflow.com", password: passwordHash, role: "Admin", departmentId: depts[2].id } });
  const manager = await prisma.employee.upsert({ where: { email: "manager@assetflow.com" }, update: {}, create: { name: "Mark Manager", email: "manager@assetflow.com", password: passwordHash, role: "AssetManager", departmentId: depts[2].id } });
  
  // Dept Heads
  const engHead = await prisma.employee.upsert({ where: { email: "enghead@assetflow.com" }, update: {}, create: { name: "Helen Head (Eng)", email: "enghead@assetflow.com", password: passwordHash, role: "DeptHead", departmentId: depts[0].id } });
  const designHead = await prisma.employee.upsert({ where: { email: "designhead@assetflow.com" }, update: {}, create: { name: "Diana Design (Design)", email: "designhead@assetflow.com", password: passwordHash, role: "DeptHead", departmentId: depts[3].id } });
  const salesHead = await prisma.employee.upsert({ where: { email: "saleshead@assetflow.com" }, update: {}, create: { name: "Sam Sales (Sales)", email: "saleshead@assetflow.com", password: passwordHash, role: "DeptHead", departmentId: depts[4].id } });

  // Standard Employees
  const dev1 = await prisma.employee.upsert({ where: { email: "dev1@assetflow.com" }, update: {}, create: { name: "David Developer", email: "dev1@assetflow.com", password: passwordHash, role: "Employee", departmentId: depts[0].id } });
  const market1 = await prisma.employee.upsert({ where: { email: "market1@assetflow.com" }, update: {}, create: { name: "Mary Marketer", email: "market1@assetflow.com", password: passwordHash, role: "Employee", departmentId: depts[1].id } });
  const designer1 = await prisma.employee.upsert({ where: { email: "designer1@assetflow.com" }, update: {}, create: { name: "Danielle Designer", email: "designer1@assetflow.com", password: passwordHash, role: "Employee", departmentId: depts[3].id } });
  const sales1 = await prisma.employee.upsert({ where: { email: "sales1@assetflow.com" }, update: {}, create: { name: "Steve Seller", email: "sales1@assetflow.com", password: passwordHash, role: "Employee", departmentId: depts[4].id } });
  const dev2 = await prisma.employee.upsert({ where: { email: "dev2@assetflow.com" }, update: {}, create: { name: "Derek Developer", email: "dev2@assetflow.com", password: passwordHash, role: "Employee", departmentId: depts[0].id } });

  const allEmployees = [admin, manager, engHead, designHead, salesHead, dev1, market1, designer1, sales1, dev2];
  const standardEmployees = [dev1, market1, designer1, sales1, dev2];

  // 3. Core Structure: Categories
  const catElec = await prisma.assetCategory.upsert({ where: { name: "Electronics" }, update: {}, create: { name: "Electronics" } });
  const catVeh = await prisma.assetCategory.upsert({ where: { name: "Vehicles" }, update: {}, create: { name: "Vehicles" } });
  const catFurn = await prisma.assetCategory.upsert({ where: { name: "Furniture" }, update: {}, create: { name: "Furniture" } });
  const catSoft = await prisma.assetCategory.upsert({ where: { name: "Software Licenses" }, update: {}, create: { name: "Software Licenses" } });
  const categories = [catElec, catVeh, catFurn, catSoft];

  // 4. Generate 40 INTENSE Random Assets
  const assetTemplates = [
    { name: "MacBook Pro M3 Max", cost: 3200, cat: catElec.id, bookable: false },
    { name: "Dell XPS 17", cost: 2400, cat: catElec.id, bookable: false },
    { name: "ThinkPad X1 Carbon", cost: 1800, cat: catElec.id, bookable: false },
    { name: "4K Laser Projector", cost: 950, cat: catElec.id, bookable: true },
    { name: "Standing Desk - Autonomous", cost: 600, cat: catFurn.id, bookable: false },
    { name: "Herman Miller Aeron Chair", cost: 1200, cat: catFurn.id, bookable: false },
    { name: "Company Tesla Model 3", cost: 42000, cat: catVeh.id, bookable: true },
    { name: "Adobe Creative Cloud License", cost: 800, cat: catSoft.id, bookable: false },
    { name: "Figma Enterprise License", cost: 1000, cat: catSoft.id, bookable: false },
    { name: "AWS Production Keys", cost: 0, cat: catSoft.id, bookable: false },
    { name: "iPad Pro 12.9", cost: 1100, cat: catElec.id, bookable: true },
    { name: "Canon EOS R5 Camera", cost: 3899, cat: catElec.id, bookable: true },
  ];

  const locations = ["NY Office Floor 1", "NY Office Floor 2", "London Office", "Remote - US", "Remote - EU", "Server Room B"];
  const conditions = ["New", "Good", "Fair", "Poor"];
  const assetRecords = [];

  for (let i = 0; i < 40; i++) {
    const template = pickRandom(assetTemplates);
    const uniqueId = Math.floor(Math.random() * 90000) + 10000;
    const tag = `INT-${uniqueId}`;
    
    const asset = await prisma.asset.create({
      data: {
        tag: tag,
        name: `${template.name} #${uniqueId}`,
        serialNumber: `SN-${uniqueId}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        categoryId: template.cat,
        acquisitionDate: getRandomDate(new Date(2022, 0, 1), new Date()),
        acquisitionCost: template.cost * (0.9 + Math.random() * 0.2), // slight variance
        condition: pickRandom(conditions),
        location: pickRandom(locations),
        isBookable: template.bookable,
        status: "Available" // We will update this via allocations
      }
    });
    assetRecords.push(asset);
  }

  // 5. Generate Intense Workflows (Allocations, Transfers, Maintenance, Bookings)
  console.log("Generating interlinked workflows...");
  
  const now = new Date();

  // Create 20 Active Allocations (some overdue, some normal)
  for (let i = 0; i < 20; i++) {
    const asset = assetRecords[i];
    const employee = pickRandom(allEmployees);
    
    // 30% chance to be overdue
    const isOverdue = Math.random() > 0.7;
    const expectedReturn = isOverdue ? getRandomDate(new Date(now.getTime() - 30 * 86400000), new Date(now.getTime() - 86400000)) : getRandomDate(new Date(now.getTime() + 86400000), new Date(now.getTime() + 180 * 86400000));

    const alloc = await prisma.allocation.create({
      data: {
        assetId: asset.id,
        employeeId: employee.id,
        departmentId: employee.departmentId,
        expectedReturnDate: expectedReturn,
        status: "Active"
      }
    });

    await prisma.asset.update({ where: { id: asset.id }, data: { status: "Allocated" } });

    // 25% chance of this allocation having a Pending Transfer
    if (Math.random() > 0.75) {
      const targetEmp = pickRandom(allEmployees.filter(e => e.id !== employee.id));
      await prisma.transferRequest.create({
        data: {
          assetId: asset.id,
          fromEmployeeId: employee.id,
          toEmployeeId: targetEmp.id,
          status: "Pending",
          reason: "Project reassignment requirement."
        }
      });
    }
  }

  // Generate 15 Bookings for Bookable assets
  const bookableAssets = assetRecords.filter(a => a.isBookable);
  if (bookableAssets.length > 0) {
    for (let i = 0; i < 15; i++) {
      const asset = pickRandom(bookableAssets);
      const employee = pickRandom(allEmployees);
      
      const isPast = Math.random() > 0.5;
      const start = isPast ? getRandomDate(new Date(now.getTime() - 14 * 86400000), new Date(now.getTime() - 2 * 86400000)) : getRandomDate(new Date(now.getTime() + 86400000), new Date(now.getTime() + 14 * 86400000));
      const end = new Date(start.getTime() + (Math.random() * 5 + 1) * 3600000); // 1-6 hours later

      await prisma.resourceBooking.create({
        data: {
          assetId: asset.id,
          employeeId: employee.id,
          startDate: start,
          endDate: end,
          status: isPast ? "Completed" : "Upcoming"
        }
      });
    }
  }

  // Generate 12 Maintenance Requests
  const maintStatuses = ["Pending", "Approved", "Assigned", "InProgress", "Resolved", "Rejected"];
  const issues = ["Screen glitching constantly", "Battery won't hold charge", "Motor making grinding noise", "Keys sticking (coffee spill)", "System running extremely slow", "Needs OS reinstallation", "Tire pressure warning light on", "Lens auto-focus broken"];
  
  for (let i = 0; i < 12; i++) {
    const asset = pickRandom(assetRecords);
    const employee = pickRandom(standardEmployees); // employees report it
    const status = pickRandom(maintStatuses);
    
    await prisma.maintenanceRequest.create({
      data: {
        assetId: asset.id,
        employeeId: employee.id,
        description: pickRandom(issues),
        priority: pickRandom(["Low", "Medium", "High", "Critical"]),
        status: status,
        assignedTechnicianId: (status === "InProgress" || status === "Resolved" || status === "Assigned") ? manager.id : null,
        resolutionNotes: status === "Resolved" ? "Fixed the issue by replacing the hardware component." : null
      }
    });

    if (status === "InProgress" || status === "Assigned") {
      await prisma.asset.update({ where: { id: asset.id }, data: { status: "UnderMaintenance" } });
    }
  }

  // Generate 2 Heavy Audit Cycles
  const auditWeekStart = getRandomDate(new Date(now.getTime() - 7 * 86400000), now);
  const auditWeekEnd = new Date(auditWeekStart.getTime() + 7 * 86400000);

  const cycle1 = await prisma.auditCycle.create({
    data: {
      name: "Global Q3 Hardware Audit",
      startDate: auditWeekStart,
      endDate: auditWeekEnd,
      auditorId: admin.id,
      status: "Active"
    }
  });

  // Attach 15 assets to the audit
  const auditAssets = [...assetRecords].sort(() => 0.5 - Math.random()).slice(0, 15);
  for (const asset of auditAssets) {
    const isVerified = Math.random() > 0.4;
    const isFlagged = !isVerified && Math.random() > 0.7;
    
    await prisma.auditItem.create({
      data: {
        cycleId: cycle1.id,
        assetId: asset.id,
        status: isFlagged ? "Flagged" : (isVerified ? "Verified" : "Pending"),
        verifiedDate: isVerified ? new Date() : null
      }
    });
  }

  console.log("INTENSE DB Seed Completed! Application is now heavily populated.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
