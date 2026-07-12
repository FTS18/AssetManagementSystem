import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== "Admin") return null;
  return decoded;
}

export async function GET() {
  try {
    const departments = await db.department.findMany({
      include: {
        head: {
          select: { id: true, name: true, email: true },
        },
        parent: {
          select: { id: true, name: true },
        },
      },
    });
    return NextResponse.json({ departments });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { name, headId, parentId } = await request.json();

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Department name is required" }, { status: 400 });
    }

    const department = await db.department.create({
      data: {
        name,
        headId: headId ? parseInt(headId) : null,
        parentId: parentId ? parseInt(parentId) : null,
      },
    });

    await db.activityLog.create({
      data: {
        employeeId: admin.id,
        action: "CreateDepartment",
        details: `Created department: ${name}`,
      },
    });

    return NextResponse.json({ department }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}
