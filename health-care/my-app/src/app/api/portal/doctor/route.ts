import { getCurrentAuthAccount } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { resolveDoctorRecord } from "../../../../lib/roleRecords";

export async function GET() {
  const auth = await getCurrentAuthAccount();

  if (!auth || auth.session.role !== "doctor") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const doctor = await resolveDoctorRecord(auth.account);

    if (!doctor) {
      return Response.json(
        { error: "Doctor profile not found. Register again to create a linked doctor profile." },
        { status: 404 },
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
      },
      include: {
        hospital: true,
        user: true,
      },
      orderBy: [{ appointmentDate: "asc" }, { appointmentTime: "asc" }],
    });

    return Response.json({
      session: auth.session,
      doctor,
      appointments,
      stats: {
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter((item: { status: string }) => item.status === "pending").length,
        confirmedAppointments: appointments.filter((item: { status: string }) => item.status === "confirmed").length,
        completedAppointments: appointments.filter((item: { status: string }) => item.status === "completed").length,
      },
    });
  } catch (error) {
    console.error("Failed to load doctor portal:", error);
    return Response.json({ error: "Failed to load doctor portal." }, { status: 500 });
  }
}
