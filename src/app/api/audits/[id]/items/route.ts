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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, status } = await request.json();
    const resolvedParams = await params;
    const cycleId = parseInt(resolvedParams.id);

    if (!itemId || !status) {
      return NextResponse.json({ error: "Item ID and status verification are required" }, { status: 400 });
    }

    // Verify cycle exists
    const cycle = await db.auditCycle.findUnique({
      where: { id: cycleId },
    });

    if (!cycle) {
      return NextResponse.json({ error: "Audit cycle not found" }, { status: 404 });
    }

    if (cycle.status === "Closed") {
      return NextResponse.json({ error: "Cannot modify items of a closed audit cycle" }, { status: 400 });
    }

    /*
     * We allow both the explicitly assigned auditor and administrative/manager roles 
     * to check off items to avoid locking out operational support.
     */
    if (cycle.auditorId !== user.id && user.role !== "Admin" && user.role !== "AssetManager") {
      return NextResponse.json({ error: "Forbidden: You are not the assigned auditor for this cycle" }, { status: 403 });
    }

    const updatedItem = await db.auditItem.update({
      where: { id: parseInt(itemId) },
      data: {
        status,
        verifiedDate: new Date(),
      },
    });

    return NextResponse.json({ message: "Audit item updated successfully", item: updatedItem });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update audit item status" }, { status: 500 });
  }
}
