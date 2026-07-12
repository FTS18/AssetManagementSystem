import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No active session found" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired session token" },
        { status: 401 }
      );
    }

    const employee = await db.employee.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!employee || employee.status !== "Active") {
      return NextResponse.json(
        { error: "User account is suspended or no longer exists" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user: employee });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error occurred fetching session profile" },
      { status: 500 }
    );
  }
}
