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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { role, departmentId } = await request.json();
    const resolvedParams = await params;
    const targetEmployeeId = parseInt(resolvedParams.id);

    if (!role) {
      return NextResponse.json({ error: "Role selection is required" }, { status: 400 });
    }

    const employee = await db.employee.findUnique({
      where: { id: targetEmployeeId },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const updatedEmployee = await db.employee.update({
      where: { id: targetEmployeeId },
      data: {
        role,
        departmentId: departmentId ? parseInt(departmentId) : undefined,
      },
    });

    /*
     * We record role promotions in an append-only log to ensure complete auditing 
     * visibility for security reviews.
     */
    await db.activityLog.create({
      data: {
        employeeId: admin.id,
        action: "PromoteEmployee",
        details: `Promoted ${employee.name} (${employee.email}) to role: ${role}`,
      },
    });

    return NextResponse.json({
      message: "Employee details updated successfully",
      employee: {
        id: updatedEmployee.id,
        name: updatedEmployee.name,
        role: updatedEmployee.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update employee role" }, { status: 500 });
  }
}
