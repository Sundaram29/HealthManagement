import { getCurrentAuthAccount } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { resolveHospitalRecord } from "../../../../lib/roleRecords";

function isProfileComplete(profile: {
  city?: string | null;
  state?: string | null;
  address?: string | null;
  phone?: string | null;
  description?: string | null;
}) {
  return Boolean(
    profile.city?.trim() &&
      profile.state?.trim() &&
      profile.address?.trim() &&
      profile.phone?.trim() &&
      profile.description?.trim(),
  );
}

export async function GET() {
  const auth = await getCurrentAuthAccount();

  if (!auth || auth.session.role !== "hospital") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const hospital = await resolveHospitalRecord(auth.account);

    const [doctors, appointments, bloodBanks, requests] = await Promise.all([
      prisma.doctor.findMany({
        where: { hospitalId: hospital.id },
        orderBy: [{ specialty: "asc" }, { name: "asc" }],
      }),
      prisma.appointment.findMany({
        where: { hospitalId: hospital.id },
        include: {
          doctor: true,
          user: true,
        },
        orderBy: [{ appointmentDate: "asc" }, { appointmentTime: "asc" }],
      }),
      prisma.bloodBank.findMany({
        include: {
          bloodGroups: {
            orderBy: [{ type: "asc" }, { component: "asc" }],
          },
        },
        orderBy: [{ district: "asc" }, { hospitalName: "asc" }],
      }),
      prisma.bloodRequest.findMany({
        where: {
          requesterEmail: auth.account.email,
        },
        include: {
          bloodBank: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return Response.json({
      session: auth.session,
      hospital,
      doctors,
      appointments,
      bloodBanks,
      requests,
      stats: {
        doctors: doctors.length,
        appointments: appointments.length,
        pendingAppointments: appointments.filter((item: { status: string }) => item.status === "pending").length,
        bloodRequests: requests.length,
      },
    });
  } catch (error) {
    console.error("Failed to load hospital portal:", error);
    return Response.json({ error: "Failed to load hospital portal." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await getCurrentAuthAccount();

  if (!auth || auth.session.role !== "hospital") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const hospital = await resolveHospitalRecord(auth.account);
    const body = await req.json();
    const specialtiesInput = Array.isArray(body?.specialties)
      ? body.specialties
      : String(body?.specialties ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    const updatedHospital = await prisma.hospital.update({
      where: { id: hospital.id },
      data: {
        city: String(body?.city ?? "").trim() || null,
        state: String(body?.state ?? "").trim() || null,
        address: String(body?.address ?? "").trim() || null,
        pincode: String(body?.pincode ?? "").trim() || null,
        phone: String(body?.phone ?? "").trim() || null,
        website: String(body?.website ?? "").trim() || null,
        description: String(body?.description ?? "").trim() || null,
        specialties: specialtiesInput,
        isOpen24Hours: Boolean(body?.isOpen24Hours),
        profileCompleted: isProfileComplete({
          city: String(body?.city ?? "").trim() || null,
          state: String(body?.state ?? "").trim() || null,
          address: String(body?.address ?? "").trim() || null,
          phone: String(body?.phone ?? "").trim() || null,
          description: String(body?.description ?? "").trim() || null,
        }),
      },
    });

    return Response.json({ ok: true, hospital: updatedHospital });
  } catch (error) {
    console.error("Failed to update hospital profile:", error);
    return Response.json({ error: "Failed to update hospital profile." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await getCurrentAuthAccount();

  if (!auth || auth.session.role !== "hospital") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const hospital = await resolveHospitalRecord(auth.account);
    const body = await req.json();
    const bloodBankId = Number(body?.bloodBankId);
    const requestedUnits = Number(body?.requestedUnits);
    const requesterPhone = String(body?.requesterPhone ?? hospital.phone ?? "").trim();
    const patientName = String(body?.patientName ?? "").trim();
    const bloodType = String(body?.bloodType ?? "").trim();
    const component = String(body?.component ?? "").trim();
    const message = String(body?.message ?? "").trim();

    if (!Number.isInteger(bloodBankId) || bloodBankId <= 0) {
      return Response.json({ error: "Select a blood bank." }, { status: 400 });
    }

    if (!bloodType || !component || !patientName || !requesterPhone || !Number.isFinite(requestedUnits) || requestedUnits <= 0) {
      return Response.json(
        { error: "Patient name, blood type, component, contact phone, and units are required." },
        { status: 400 },
      );
    }

    const bloodBank = await prisma.bloodBank.findUnique({
      where: { id: bloodBankId },
      select: { id: true },
    });

    if (!bloodBank) {
      return Response.json({ error: "Selected blood bank was not found." }, { status: 404 });
    }

    const requestRecord = await prisma.bloodRequest.create({
      data: {
        requesterName: hospital.name,
        requesterEmail: auth.account.email,
        requesterPhone,
        patientName,
        bloodType,
        component,
        requestedUnits: Math.floor(requestedUnits),
        message: message || `Request sent by ${hospital.name}.`,
        bloodBankId,
        status: "pending",
      },
      include: {
        bloodBank: true,
      },
    });

    return Response.json({ ok: true, request: requestRecord });
  } catch (error) {
    console.error("Failed to create blood request:", error);
    return Response.json({ error: "Failed to create blood request." }, { status: 500 });
  }
}
