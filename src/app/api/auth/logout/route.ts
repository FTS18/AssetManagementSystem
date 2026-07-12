import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    message: "Logged out successfully",
  });

  /*
   * Setting maxAge to 0 forces the client browser to immediately expire 
   * and delete the stored JWT session cookie.
   */
  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
