import { getCurrentAuthAccount } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/prisma";
import { resolveDoctorRecord } from "../../../../../../lib/roleRecords";

const ALLOWED_STATUSES = new Set(["confirmed", "completed", "cancelled"]);

export async function PATCH(
  req: Request,
  context: { params: Promise<{ appointmentId: string }> },
) {
  const auth = await getCurrentAuthAccount();

  if (!auth || auth.session.role !== "doctor") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const doctor = await resolveDoctorRecord(auth.account);

    if (!doctor) {
      return Response.json({ error: "Doctor profile not found." }, { status: 404 });
    }

    const { appointmentId } = await context.params;
    const id = Number(appointmentId);
    const body = await req.json();
    const status = String(body?.status ?? "").trim().toLowerCase();

    if (!Number.isInteger(id) || id <= 0 || !ALLOWED_STATUSES.has(status)) {
      return Response.json({ error: "Invalid appointment update." }, { status: 400 });
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        doctorId: doctor.id,
      },
    });

    if (!appointment) {
      return Response.json({ error: "Appointment not found." }, { status: 404 });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: status as "confirmed" | "completed" | "cancelled",
      },
      include: {
        hospital: true,
        user: true,
      },
    });

    return Response.json({ ok: true, appointment: updatedAppointment });
  } catch (error) {
    console.error("Failed to update appointment:", error);
    return Response.json({ error: "Failed to update appointment." }, { status: 500 });
  }
}
