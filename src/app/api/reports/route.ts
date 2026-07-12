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
    if (!user || (user.role !== "Admin" && user.role !== "AssetManager")) {
      return NextResponse.json({ error: "Forbidden: Admin or AssetManager privileges required to view system analytics" }, { status: 403 });
    }

    // Execute all 14 database queries concurrently to minimize HTTP network round-trips to Turso
    const [
      statusCounts,
      deptAllocations,
      departments,
      bookingCounts,
      assets,
      maintenanceCounts,
      allAssets,
      allBookings,
      portfolioByCat,
      allCategories,
      portfolioByStatus,
      maintenanceToday,
      pendingTransfers,
      upcomingReturns
    ] = await Promise.all([
      db.asset.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      db.allocation.groupBy({
        by: ["departmentId"],
        where: { status: "Active", departmentId: { not: null } },
        _count: { _all: true },
      }),
      db.department.findMany({
        select: { id: true, name: true },
      }),
      db.resourceBooking.groupBy({
        by: ["assetId"],
        _count: { _all: true },
      }),
      db.asset.findMany({
        select: { id: true, name: true, tag: true },
      }),
      db.maintenanceRequest.groupBy({
        by: ["priority"],
        _count: { _all: true },
      }),
      db.asset.findMany({
        include: {
          category: { select: { name: true } },
          _count: {
            select: { allocations: true, bookings: true },
          },
        },
      }),
      db.resourceBooking.findMany({
        where: { status: { in: ["Upcoming", "Ongoing", "Completed"] } },
      }),
      db.asset.groupBy({
        by: ["categoryId"],
        _sum: { acquisitionCost: true },
        _count: { _all: true },
      }),
      db.assetCategory.findMany({
        select: { id: true, name: true },
      }),
      db.asset.groupBy({
        by: ["status"],
        _sum: { acquisitionCost: true },
        _count: { _all: true },
      }),
      db.maintenanceRequest.count({
        where: {
          status: { in: ["Approved", "InProgress"] },
        },
      }),
      db.transferRequest.count({
        where: {
          status: "Pending",
        },
      }),
      db.allocation.count({
        where: {
          status: "Active",
          expectedReturnDate: {
            gte: new Date(),
            lte: (() => {
              const d = new Date();
              d.setDate(d.getDate() + 3);
              return d;
            })(),
          },
        },
      })
    ]);

    // Process Department-wise allocations
    const deptStats = deptAllocations.map((item) => {
      const deptName = departments.find((d) => d.id === item.departmentId)?.name || "Unknown";
      return {
        department: deptName,
        count: item._count._all,
      };
    });

    // Process Resource booking frequencies
    const bookingStats = bookingCounts.map((item) => {
      const asset = assets.find((a) => a.id === item.assetId);
      return {
        assetName: asset ? `${asset.name} (${asset.tag})` : "Unknown",
        count: item._count._all,
      };
    });

    // Process Maintenance requests priorities
    const maintenanceStats = maintenanceCounts.map((item) => ({
      priority: item.priority,
      count: item._count._all,
    }));

    // Process Utilization Trends (Most Used vs Idle Assets)
    const utilization = allAssets.map((a) => ({
      tag: a.tag,
      name: a.name,
      count: a._count.allocations + a._count.bookings,
    }));

    const mostUsed = [...utilization].sort((a, b) => b.count - a.count).slice(0, 5);
    const idle = [...utilization].sort((a, b) => a.count - b.count).slice(0, 5);

    // Process Assets Nearing Retirement
    const now = new Date();
    const nearingRetirement = allAssets
      .map((a) => {
        let lifespanMonths = 60; // default 5 years
        const catName = a.category?.name || "";
        if (catName.includes("Electronics")) lifespanMonths = 36;
        else if (catName.includes("Furniture")) lifespanMonths = 84;
        else if (catName.includes("Vehicles")) lifespanMonths = 120;
        else if (catName.includes("Office") || catName.includes("Space")) lifespanMonths = 240;

        const retirementDate = new Date(a.acquisitionDate);
        retirementDate.setMonth(retirementDate.getMonth() + lifespanMonths);
        
        // Approximate difference in months
        const diffTime = retirementDate.getTime() - now.getTime();
        const monthsRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24 * 30.4));

        return {
          tag: a.tag,
          name: a.name,
          retirementDate: retirementDate.toISOString().split("T")[0],
          monthsRemaining,
        };
      })
      .sort((a, b) => a.monthsRemaining - b.monthsRemaining)
      .slice(0, 8);

    // Process Booking Heatmap (by UTC Hour)
    const hourlyCounts = Array(24).fill(0);
    allBookings.forEach((b) => {
      const hour = new Date(b.startDate).getUTCHours();
      hourlyCounts[hour]++;
    });

    const heatmap = hourlyCounts.map((count, hour) => ({
      hour: `${String(hour).padStart(2, "0")}:00`,
      count,
    }));

    // Process Portfolio / Book Value by Category
    const portfolioByCategory = portfolioByCat.map((item) => ({
      category: allCategories.find((c) => c.id === item.categoryId)?.name || "Unknown",
      totalValue: item._sum.acquisitionCost ?? 0,
      assetCount: item._count._all,
    }));

    const portfolioByStatusMapped = portfolioByStatus.map((item) => ({
      status: item.status,
      totalValue: item._sum.acquisitionCost ?? 0,
      assetCount: item._count._all,
    }));

    const totalPortfolioValue = portfolioByCategory.reduce(
      (sum, item) => sum + item.totalValue,
      0
    );

    return NextResponse.json({
      statusCounts: statusCounts.map((item) => ({
        status: item.status,
        count: item._count._all,
      })),
      departmentAllocations: deptStats,
      resourceBookings: bookingStats,
      maintenanceRequests: maintenanceStats,
      mostUsed,
      idle,
      nearingRetirement,
      heatmap,
      maintenanceToday,
      pendingTransfers,
      upcomingReturns,
      portfolioByCategory,
      portfolioByStatus: portfolioByStatusMapped,
      totalPortfolioValue,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reports and analytics" }, { status: 500 });
  }
}

