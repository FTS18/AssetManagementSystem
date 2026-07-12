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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user || (user.role !== "AssetManager" && user.role !== "Admin")) {
      return NextResponse.json({ error: "Forbidden: Manager or Admin privileges required" }, { status: 403 });
    }

    const resolvedParams = await params;
    const cycleId = parseInt(resolvedParams.id);

    const cycle = await db.auditCycle.findUnique({
      where: { id: cycleId },
      include: { items: true },
    });

    if (!cycle) {
      return NextResponse.json({ error: "Audit cycle not found" }, { status: 404 });
    }

    if (cycle.status === "Closed") {
      return NextResponse.json({ error: "Audit cycle is already closed" }, { status: 400 });
    }

    const closedCycle = await db.$transaction(async (tx) => {
      // 1. Close cycle status
      const closed = await tx.auditCycle.update({
        where: { id: cycleId },
        data: { status: "Closed" },
      });

      // 2. Identify missing items
      const missingItems = cycle.items.filter((item) => item.status === "Missing");

      // 3. Automatically transition confirmed missing assets to Lost state
      if (missingItems.length > 0) {
        await tx.asset.updateMany({
          where: {
            id: { in: missingItems.map((item) => item.assetId) },
          },
          data: { status: "Lost" },
        });
      }

      return closed;
    });

    // Generate summary numbers
    const total = cycle.items.length;
    const verified = cycle.items.filter((item) => item.status === "Verified").length;
    const missing = cycle.items.filter((item) => item.status === "Missing").length;
    const damaged = cycle.items.filter((item) => item.status === "Damaged").length;
    const pending = cycle.items.filter((item) => item.status === "Pending").length;

    await db.activityLog.create({
      data: {
        employeeId: user.id,
        action: "CloseAuditCycle",
        details: `Closed audit cycle ID: ${cycleId}. Stats: ${verified}/${total} Verified, ${missing} Missing, ${damaged} Damaged, ${pending} Pending`,
      },
    });

    return NextResponse.json({
      message: "Audit cycle locked and discrepancies updated successfully",
      stats: { total, verified, missing, damaged, pending },
      cycle: closedCycle,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to close audit cycle" }, { status: 500 });
  }
}
