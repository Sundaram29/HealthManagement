import { getAuthSession } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

function normalizeAppointmentDate(value) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Date(
    Date.UTC(
      parsedDate.getUTCFullYear(),
      parsedDate.getUTCMonth(),
      parsedDate.getUTCDate()
    )
  );
}

export async function POST(req) {
  try {
    const session = await getAuthSession();

    if (!session || session.role !== "user") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      doctorId,
      hospitalId,
      name,
      email,
      phone,
      selectedDate,
      selectedSlot,
      symptoms,
    } = body;

    const doctorIdNumber = Number(doctorId);
    const hospitalIdNumber = Number(hospitalId);

    if (
      !doctorId ||
      !hospitalId ||
      !name ||
      !email ||
      !phone ||
      !selectedDate ||
      !selectedSlot ||
      !symptoms
    ) {
      return Response.json({ error: "All fields are required" }, { status: 400 });
    }

    const appointmentDate = normalizeAppointmentDate(selectedDate);

    if (!appointmentDate) {
      return Response.json({ error: "Invalid appointment date" }, { status: 400 });
    }

    if (Number.isNaN(doctorIdNumber) || Number.isNaN(hospitalIdNumber)) {
      return Response.json({ error: "Invalid doctor or hospital id" }, { status: 400 });
    }

    const [hospital, doctor] = await Promise.all([
      prisma.hospital.findUnique({
        where: { id: hospitalIdNumber },
        select: { id: true },
      }),
      prisma.doctor.findUnique({
        where: { id: doctorIdNumber },
        select: { id: true, hospitalId: true },
      }),
    ]);

    if (!hospital) {
      return Response.json(
        { error: "Selected hospital was not found. Please reload and try again." },
        { status: 404 }
      );
    }

    if (!doctor) {
      return Response.json(
        { error: "Selected doctor was not found. Please reload and try again." },
        { status: 404 }
      );
    }

    if (doctor.hospitalId !== hospitalIdNumber) {
      return Response.json(
        { error: "Selected doctor does not belong to this hospital." },
        { status: 400 }
      );
    }

    await prisma.user.upsert({
      where: { id: session.id },
      update: {
        email: session.email ?? email,
        name: session.name ?? name,
      },
      create: {
        id: session.id,
        email: session.email ?? email,
        name: session.name ?? name,
      },
    });

    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId: doctorIdNumber,
        appointmentDate,
        appointmentTime: selectedSlot,
      },
      select: { id: true },
    });

    if (existing) {
      return Response.json({ error: "This slot is already booked" }, { status: 409 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: session.id,
        doctorId: doctorIdNumber,
        hospitalId: hospitalIdNumber,
        name,
        email,
        phone,
        appointmentDate,
        appointmentTime: selectedSlot,
        problem: symptoms,
        status: "pending",
      },
    });

    return Response.json(appointment);
  } catch (err) {
    console.error("Booking API error:", err);

    if (err?.code === "P2002") {
      return Response.json({ error: "This slot is already booked" }, { status: 409 });
    }

    if (err?.code === "P2003") {
      return Response.json({ error: "Doctor or hospital reference is invalid" }, { status: 400 });
    }

    if (err?.code === "P2021") {
      return Response.json(
        { error: "Database tables are missing. Run prisma db push." },
        { status: 500 }
      );
    }

    if (err?.code === "P1017") {
      return Response.json(
        { error: "Database connection was closed. Please retry after the database is available." },
        { status: 503 }
      );
    }

    return Response.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
