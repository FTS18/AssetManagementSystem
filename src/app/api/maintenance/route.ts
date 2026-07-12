import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { maintenanceSchema } from "@/lib/validations";

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

    const isManager = user.role === "Admin" || user.role === "AssetManager";
    
    const requests = await db.maintenanceRequest.findMany({
      where: isManager ? undefined : { employeeId: user.id },
      include: {
        asset: { select: { id: true, tag: true, name: true, status: true } },
        employee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdDate: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch maintenance requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = maintenanceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { assetId, description, priority } = result.data;

    // Verify asset exists
    const asset = await db.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const req = await db.maintenanceRequest.create({
      data: {
        assetId,
        employeeId: user.id,
        description,
        priority,
        status: "Pending",
      },
    });

    await db.activityLog.create({
      data: {
        employeeId: user.id,
        action: "RaiseMaintenance",
        details: `Raised maintenance request for asset ID: ${assetId} (Priority: ${priority})`,
      },
    });

    return NextResponse.json({ message: "Maintenance request raised successfully", request: req }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to raise maintenance request" }, { status: 500 });
  }
}
