import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { bookingSchema } from "@/lib/validations";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get("assetId");

    const where: any = {};
    if (assetId) where.assetId = parseInt(assetId);

    const bookings = await db.resourceBooking.findMany({
      where,
      include: {
        employee: { select: { id: true, name: true, email: true } },
        asset: { select: { id: true, tag: true, name: true } },
      },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Inject employeeId from the authenticated token to prevent client spoofing
    body.employeeId = user.id;

    const result = bookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { assetId, startDate, endDate } = result.data;

    // Check if the asset exists and is bookable
    const asset = await db.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    if (!asset.isBookable) {
      return NextResponse.json({ error: "This asset is not flagged as a shared bookable resource" }, { status: 400 });
    }

    /*
     * We run a transaction and scan for existing active bookings overlapping the 
     * requested interval (NewStart < ExistingEnd AND NewEnd > ExistingStart) 
     * to prevent double-booking down to the millisecond.
     */
    const booking = await db.$transaction(async (tx) => {
      const overlappingBookings = await tx.resourceBooking.findFirst({
        where: {
          assetId,
          status: { in: ["Upcoming", "Ongoing"] },
          AND: [
            { startDate: { lt: endDate } },
            { endDate: { gt: startDate } },
          ],
        },
        include: {
          employee: { select: { name: true } },
        },
      });

      if (overlappingBookings) {
        throw new Error(
          `Schedule overlap. This slot is currently booked by ${overlappingBookings.employee.name} (${overlappingBookings.startDate.toISOString().substring(11, 16)} - ${overlappingBookings.endDate.toISOString().substring(11, 16)})`
        );
      }

      const newBooking = await tx.resourceBooking.create({
        data: {
          assetId,
          employeeId: user.id,
          startDate,
          endDate,
          status: "Upcoming",
        },
      });

      return newBooking;
    });

    await db.activityLog.create({
      data: {
        employeeId: user.id,
        action: "BookResource",
        details: `Booked shared resource ID: ${assetId} from ${startDate.toISOString()} to ${endDate.toISOString()}`,
      },
    });

    return NextResponse.json({ message: "Booking confirmed successfully", booking }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to book resource" }, { status: 500 });
  }
}
