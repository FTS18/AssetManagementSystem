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
      return NextResponse.json({ error: "Forbidden: Asset Manager or Admin privileges required" }, { status: 403 });
    }

    const { conditionOnCheckIn } = await request.json();
    const resolvedParams = await params;
    const allocationId = parseInt(resolvedParams.id);

    const allocation = await db.allocation.findUnique({
      where: { id: allocationId },
    });

    if (!allocation) {
      return NextResponse.json({ error: "Allocation record not found" }, { status: 404 });
    }

    if (allocation.status === "Returned") {
      return NextResponse.json({ error: "Asset has already been returned" }, { status: 400 });
    }

    const updatedAllocation = await db.$transaction(async (tx) => {
      // Mark allocation returned
      const updated = await tx.allocation.update({
        where: { id: allocationId },
        data: {
          returnedDate: new Date(),
          conditionOnCheckIn,
          status: "Returned",
        },
      });

      // Revert asset to Available
      await tx.asset.update({
        where: { id: allocation.assetId },
        data: { status: "Available" },
      });

      return updated;
    });

    await db.activityLog.create({
      data: {
        employeeId: user.id,
        action: "ReturnAsset",
        details: `Returned asset ID: ${allocation.assetId} (Allocation ID: ${allocationId}) with check-in notes: ${conditionOnCheckIn || "none"}`,
      },
    });

    return NextResponse.json({ message: "Asset returned successfully", allocation: updatedAllocation });
  } catch (error) {
    return NextResponse.json({ error: "Failed to return asset" }, { status: 500 });
  }
}
