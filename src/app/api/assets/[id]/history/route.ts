import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const assetId = parseInt(resolvedParams.id);

    const asset = await db.asset.findUnique({
      where: { id: assetId },
      include: {
        category: true,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const allocations = await db.allocation.findMany({
      where: { assetId },
      include: {
        employee: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true } },
      },
      orderBy: { allocatedDate: "desc" },
    });

    const maintenance = await db.maintenanceRequest.findMany({
      where: { assetId },
      include: {
        employee: { select: { id: true, name: true } },
      },
      orderBy: { createdDate: "desc" },
    });

    // Merge timelines and sort chronologically
    const history: any[] = [];

    allocations.forEach((alloc) => {
      history.push({
        type: "allocation",
        date: alloc.allocatedDate,
        returnedDate: alloc.returnedDate,
        details: alloc.employee
          ? `Allocated to employee: ${alloc.employee.name}`
          : `Allocated to department: ${alloc.department?.name}`,
        notes: alloc.conditionOnCheckIn ? `Check-in notes: ${alloc.conditionOnCheckIn}` : null,
        status: alloc.status,
      });
    });

    maintenance.forEach((maint) => {
      history.push({
        type: "maintenance",
        date: maint.createdDate,
        details: `Maintenance request: ${maint.description} (Priority: ${maint.priority})`,
        notes: maint.resolutionNotes ? `Resolution notes: ${maint.resolutionNotes}` : null,
        status: maint.status,
      });
    });

    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ asset, history });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch asset history" }, { status: 500 });
  }
}
