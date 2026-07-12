import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { signupSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    const existingUser = await db.employee.findUnique({
      where: { email },
    });

    /*
     * We explicitly prevent duplicate registration to preserve the unique 
     * email constraint at the database layer and prevent account collision.
     */
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    const employee = await db.employee.create({
      data: {
        name,
        email,
        password: hashPassword(password),
        role: "Employee", // Default role assigned to all signups as requested by spec
        status: "Active",
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error occurred during registration" },
      { status: 500 }
    );
  }
}
