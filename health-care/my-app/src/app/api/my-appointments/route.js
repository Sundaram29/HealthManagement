import { getAuthSession } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session || session.role !== "user") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.appointment.findMany({
      where: {
        userId: session.id,
      },
      include: {
        doctor: true,
        hospital: true,
      },
      orderBy: {
        appointmentDate: "desc",
      },
    });

    return Response.json({ bookings });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
