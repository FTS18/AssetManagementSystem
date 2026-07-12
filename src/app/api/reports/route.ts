import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Asset status counts
    const statusCounts = await db.asset.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    // 2. Department-wise allocations
    const deptAllocations = await db.allocation.groupBy({
      by: ["departmentId"],
      where: { status: "Active", departmentId: { not: null } },
      _count: { _all: true },
    });

    const departments = await db.department.findMany({
      select: { id: true, name: true },
    });

    const deptStats = deptAllocations.map((item) => {
      const deptName = departments.find((d) => d.id === item.departmentId)?.name || "Unknown";
      return {
        department: deptName,
        count: item._count._all,
      };
    });

    // 3. Resource booking frequencies
    const bookingCounts = await db.resourceBooking.groupBy({
      by: ["assetId"],
      _count: { _all: true },
    });

    const assets = await db.asset.findMany({
      select: { id: true, name: true, tag: true },
    });

    const bookingStats = bookingCounts.map((item) => {
      const asset = assets.find((a) => a.id === item.assetId);
      return {
        assetName: asset ? `${asset.name} (${asset.tag})` : "Unknown",
        count: item._count._all,
      };
    });

    // 4. Maintenance requests priorities
    const maintenanceCounts = await db.maintenanceRequest.groupBy({
      by: ["priority"],
      _count: { _all: true },
    });

    const maintenanceStats = maintenanceCounts.map((item) => ({
      priority: item.priority,
      count: item._count._all,
    }));

    return NextResponse.json({
      statusCounts: statusCounts.map((item) => ({
        status: item.status,
        count: item._count._all,
      })),
      departmentAllocations: deptStats,
      resourceBookings: bookingStats,
      maintenanceRequests: maintenanceStats,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reports and analytics" }, { status: 500 });
  }
}
