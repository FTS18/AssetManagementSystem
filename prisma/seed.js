const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting EXPANDED DB Seed...");

  // 1. Create Departments
  const deptEngineering = await prisma.department.upsert({ where: { name: "Engineering" }, update: {}, create: { name: "Engineering", status: "Active" } });
  const deptMarketing = await prisma.department.upsert({ where: { name: "Marketing" }, update: {}, create: { name: "Marketing", status: "Active" } });
  const deptIT = await prisma.department.upsert({ where: { name: "IT Operations" }, update: {}, create: { name: "IT Operations", status: "Active" } });
  const deptDesign = await prisma.department.upsert({ where: { name: "Product Design" }, update: {}, create: { name: "Product Design", status: "Active" } });

  // 2. Create Employees
  const passwordHash = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.employee.upsert({ where: { email: "admin@assetflow.com" }, update: {}, create: { name: "Alice Admin", email: "admin@assetflow.com", password: passwordHash, role: "Admin", departmentId: deptIT.id } });
  const assetManager = await prisma.employee.upsert({ where: { email: "manager@assetflow.com" }, update: {}, create: { name: "Mark Manager", email: "manager@assetflow.com", password: passwordHash, role: "AssetManager", departmentId: deptIT.id } });
  const engHead = await prisma.employee.upsert({ where: { email: "enghead@assetflow.com" }, update: {}, create: { name: "Helen Head (Eng)", email: "enghead@assetflow.com", password: passwordHash, role: "DeptHead", departmentId: deptEngineering.id } });
  const designHead = await prisma.employee.upsert({ where: { email: "designhead@assetflow.com" }, update: {}, create: { name: "Diana Design", email: "designhead@assetflow.com", password: passwordHash, role: "DeptHead", departmentId: deptDesign.id } });
  
  const emp1 = await prisma.employee.upsert({ where: { email: "dev1@assetflow.com" }, update: {}, create: { name: "David Developer", email: "dev1@assetflow.com", password: passwordHash, role: "Employee", departmentId: deptEngineering.id } });
  const emp2 = await prisma.employee.upsert({ where: { email: "market1@assetflow.com" }, update: {}, create: { name: "Mary Marketer", email: "market1@assetflow.com", password: passwordHash, role: "Employee", departmentId: deptMarketing.id } });
  const emp3 = await prisma.employee.upsert({ where: { email: "designer1@assetflow.com" }, update: {}, create: { name: "Danielle Designer", email: "designer1@assetflow.com", password: passwordHash, role: "Employee", departmentId: deptDesign.id } });

  // Assign department heads
  await prisma.department.update({ where: { id: deptEngineering.id }, data: { headId: engHead.id } });
  await prisma.department.update({ where: { id: deptDesign.id }, data: { headId: designHead.id } });

  // 3. Categories
  const catElectronics = await prisma.assetCategory.upsert({ where: { name: "Electronics" }, update: {}, create: { name: "Electronics" } });
  const catVehicles = await prisma.assetCategory.upsert({ where: { name: "Vehicles" }, update: {}, create: { name: "Vehicles" } });
  const catFurniture = await prisma.assetCategory.upsert({ where: { name: "Furniture" }, update: {}, create: { name: "Furniture" } });
  const catSoftware = await prisma.assetCategory.upsert({ where: { name: "Software Licenses" }, update: {}, create: { name: "Software Licenses" } });

  // 4. Assets
  const now = new Date();
  
  const laptop1 = await prisma.asset.upsert({ where: { serialNumber: "MAC-001" }, update: {}, create: { tag: "NEW-AF-001", name: "MacBook Pro 16", serialNumber: "MAC-001", categoryId: catElectronics.id, acquisitionDate: new Date(now.getFullYear(), now.getMonth() - 10, 1), acquisitionCost: 2500, condition: "Good", location: "NY Office", status: "Allocated" } });
  const laptop2 = await prisma.asset.upsert({ where: { serialNumber: "MAC-002" }, update: {}, create: { tag: "NEW-AF-002", name: "MacBook Air M2", serialNumber: "MAC-002", categoryId: catElectronics.id, acquisitionDate: new Date(now.getFullYear(), now.getMonth() - 5, 1), acquisitionCost: 1200, condition: "Good", location: "NY Office", status: "Allocated" } });
  const laptop3 = await prisma.asset.upsert({ where: { serialNumber: "DELL-100" }, update: {}, create: { tag: "NEW-AF-003", name: "Dell XPS 15", serialNumber: "DELL-100", categoryId: catElectronics.id, acquisitionDate: new Date(now.getFullYear() - 1, now.getMonth(), 1), acquisitionCost: 1800, condition: "Fair", location: "NY Office", status: "UnderMaintenance" } });
  
  const projector = await prisma.asset.upsert({ where: { serialNumber: "PROJ-101" }, update: {}, create: { tag: "NEW-AF-004", name: "4K Laser Projector", serialNumber: "PROJ-101", categoryId: catElectronics.id, acquisitionDate: new Date(now.getFullYear(), now.getMonth() - 20, 1), acquisitionCost: 800, condition: "Good", location: "Conference Room A", isBookable: true, status: "Available" } });
  const vehicle = await prisma.asset.upsert({ where: { serialNumber: "VIN-999" }, update: {}, create: { tag: "NEW-AF-005", name: "Company Van (Ford Transit)", serialNumber: "VIN-999", categoryId: catVehicles.id, acquisitionDate: new Date(now.getFullYear() - 2, now.getMonth(), 1), acquisitionCost: 45000, condition: "Good", location: "Basement Parking", isBookable: true, status: "Available" } });
  const desk = await prisma.asset.upsert({ where: { serialNumber: "DESK-42" }, update: {}, create: { tag: "NEW-AF-006", name: "Ergonomic Standing Desk", serialNumber: "DESK-42", categoryId: catFurniture.id, acquisitionDate: new Date(now.getFullYear(), now.getMonth() - 1, 1), acquisitionCost: 650, condition: "New", location: "Floor 2", status: "Allocated" } });
  const figmaLicense = await prisma.asset.upsert({ where: { serialNumber: "FIG-777" }, update: {}, create: { tag: "NEW-AF-007", name: "Figma Enterprise License", serialNumber: "FIG-777", categoryId: catSoftware.id, acquisitionDate: new Date(now.getFullYear(), now.getMonth(), 1), acquisitionCost: 1000, condition: "New", location: "Cloud", status: "Available" } });

  // 5. Allocations & Transfers
  const pastReturnDate = new Date(); pastReturnDate.setDate(pastReturnDate.getDate() - 3);
  const futureReturnDate = new Date(); futureReturnDate.setMonth(futureReturnDate.getMonth() + 6);

  // Active Overdue Allocation for David
  let existingAlloc1 = await prisma.allocation.findFirst({ where: { assetId: laptop2.id, employeeId: emp1.id, status: "Active" } });
  if (!existingAlloc1) {
    await prisma.allocation.create({ data: { assetId: laptop2.id, employeeId: emp1.id, departmentId: deptEngineering.id, expectedReturnDate: pastReturnDate, status: "Active" } });
  }

  // Active Normal Allocation for Danielle
  let existingAlloc2 = await prisma.allocation.findFirst({ where: { assetId: desk.id, employeeId: emp3.id, status: "Active" } });
  if (!existingAlloc2) {
    await prisma.allocation.create({ data: { assetId: desk.id, employeeId: emp3.id, departmentId: deptDesign.id, expectedReturnDate: futureReturnDate, status: "Active" } });
  }

  // Active Allocation for Mary
  let existingAlloc3 = await prisma.allocation.findFirst({ where: { assetId: laptop1.id, employeeId: emp2.id, status: "Active" } });
  if (!existingAlloc3) {
    existingAlloc3 = await prisma.allocation.create({ data: { assetId: laptop1.id, employeeId: emp2.id, departmentId: deptMarketing.id, expectedReturnDate: futureReturnDate, status: "Active" } });
  }

  // Pending Transfer from Mary to David
  const existingTransfer = await prisma.transferRequest.findFirst({ where: { assetId: laptop1.id, status: "Pending" } });
  if (!existingTransfer && existingAlloc3) {
    await prisma.transferRequest.create({
      data: {
        assetId: laptop1.id,
        fromEmployeeId: emp2.id,
        toEmployeeId: emp1.id,
        status: "Pending",
        reason: "Reassigned to new engineering project"
      }
    });
  }

  // 6. Bookings
  const tomorrowStart = new Date(); tomorrowStart.setDate(tomorrowStart.getDate() + 1); tomorrowStart.setHours(10, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrowStart); tomorrowEnd.setHours(12, 0, 0, 0);
  
  const yesterdayStart = new Date(); yesterdayStart.setDate(yesterdayStart.getDate() - 1); yesterdayStart.setHours(14, 0, 0, 0);
  const yesterdayEnd = new Date(yesterdayStart); yesterdayEnd.setHours(16, 0, 0, 0);

  let existingBooking1 = await prisma.resourceBooking.findFirst({ where: { assetId: projector.id, employeeId: emp2.id } });
  if (!existingBooking1) {
    await prisma.resourceBooking.create({ data: { assetId: projector.id, employeeId: emp2.id, startDate: tomorrowStart, endDate: tomorrowEnd, status: "Upcoming" } });
  }

  let existingBooking2 = await prisma.resourceBooking.findFirst({ where: { assetId: vehicle.id, employeeId: engHead.id } });
  if (!existingBooking2) {
    await prisma.resourceBooking.create({ data: { assetId: vehicle.id, employeeId: engHead.id, startDate: yesterdayStart, endDate: yesterdayEnd, status: "Completed" } });
  }

  // 7. Maintenance Requests
  let existingMaint1 = await prisma.maintenanceRequest.findFirst({ where: { assetId: laptop3.id, status: "InProgress" } });
  if (!existingMaint1) {
    await prisma.maintenanceRequest.create({ data: { assetId: laptop3.id, employeeId: engHead.id, description: "Screen flickering heavily", priority: "High", status: "InProgress", assignedTechnicianId: assetManager.id } });
  }

  let existingMaint2 = await prisma.maintenanceRequest.findFirst({ where: { assetId: desk.id, status: "Resolved" } });
  if (!existingMaint2) {
    await prisma.maintenanceRequest.create({ data: { assetId: desk.id, employeeId: emp3.id, description: "Motor stuck on standing desk", priority: "Low", status: "Resolved", assignedTechnicianId: assetManager.id, resolutionNotes: "Replaced fuse in motor." } });
  }

  // 8. Audits
  const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);
  let existingAudit = await prisma.auditCycle.findFirst({ where: { name: "Q3 NY Office Electronics Audit" } });
  if (!existingAudit) {
    await prisma.auditCycle.create({
      data: {
        name: "Q3 NY Office Electronics Audit",
        startDate: new Date(),
        endDate: nextWeek,
        auditorId: assetManager.id,
        status: "Active",
        items: {
          create: [
            { assetId: laptop1.id, status: "Verified", verifiedDate: new Date() },
            { assetId: laptop2.id, status: "Flagged", notes: "Overdue allocation detected." },
            { assetId: projector.id, status: "Pending" },
          ]
        }
      }
    });
  }

  console.log("EXPANDED DB Seed Completed Successfully!");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
