-- CreateTable
CREATE TABLE "Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Employee',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "departmentId" INTEGER,
    CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Department" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "headId" INTEGER,
    "parentId" INTEGER,
    CONSTRAINT "Department_headId_fkey" FOREIGN KEY ("headId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Department_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssetCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "customFields" TEXT NOT NULL DEFAULT '[]'
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "acquisitionDate" DATETIME NOT NULL,
    "acquisitionCost" REAL NOT NULL,
    "condition" TEXT NOT NULL DEFAULT 'Good',
    "location" TEXT NOT NULL,
    "photoUrl" TEXT,
    "documentUrl" TEXT,
    "isBookable" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'Available',
    CONSTRAINT "Asset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AssetCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Allocation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assetId" INTEGER NOT NULL,
    "employeeId" INTEGER,
    "departmentId" INTEGER,
    "allocatedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedReturnDate" DATETIME,
    "returnedDate" DATETIME,
    "conditionOnCheckIn" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    CONSTRAINT "Allocation_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Allocation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Allocation_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TransferRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assetId" INTEGER NOT NULL,
    "fromEmployeeId" INTEGER NOT NULL,
    "toEmployeeId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "approvedById" INTEGER,
    "approvedDate" DATETIME,
    CONSTRAINT "TransferRequest_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransferRequest_fromEmployeeId_fkey" FOREIGN KEY ("fromEmployeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransferRequest_toEmployeeId_fkey" FOREIGN KEY ("toEmployeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransferRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResourceBooking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assetId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Upcoming',
    CONSTRAINT "ResourceBooking_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ResourceBooking_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaintenanceRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assetId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "assignedTechnicianId" INTEGER,
    "photoUrl" TEXT,
    "resolutionNotes" TEXT,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MaintenanceRequest_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditCycle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "auditorId" INTEGER NOT NULL,
    CONSTRAINT "AuditCycle_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cycleId" INTEGER NOT NULL,
    "assetId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "verifiedDate" DATETIME,
    CONSTRAINT "AuditItem_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "AuditCycle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AuditItem_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE INDEX "Employee_email_idx" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_headId_key" ON "Department"("headId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetCategory_name_key" ON "AssetCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_tag_key" ON "Asset"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_serialNumber_key" ON "Asset"("serialNumber");

