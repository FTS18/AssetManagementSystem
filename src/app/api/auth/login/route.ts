import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const employee = await db.employee.findUnique({
      where: { email },
    });

    /*
     * We use a generic rejection message to prevent user enumeration attacks 
     * where malicious actors scan for registered emails.
     */
    if (!employee || !comparePassword(password, employee.password)) {
      return NextResponse.json(
        { error: "Invalid email address or password" },
        { status: 401 }
      );
    }

    if (employee.status !== "Active") {
      return NextResponse.json(
        { error: "Your account is currently suspended or inactive" },
        { status: 403 }
      );
    }

    const token = signToken({
      id: employee.id,
      email: employee.email,
      role: employee.role,
    });

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
    });

    /*
     * Using httpOnly and sameSite: strict parameters protects the token cookie 
     * from cross-site scripting (XSS) and cross-site request forgery (CSRF) vulnerabilities.
     */
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[LOGIN ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error occurred during login" },
      { status: 500 }
    );
  }
}
