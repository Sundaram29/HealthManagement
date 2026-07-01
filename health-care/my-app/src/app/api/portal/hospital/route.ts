import { getCurrentAuthAccount } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { resolveHospitalRecord } from "../../../../lib/roleRecords";

function profileComplete(profile: {
  city?: string | null;
  state?: string | null;
  address?: string | null;
  phone?: string | null;
  description?: string | null;
}) {
  return Boolean(profile.city?.trim() && profile.state?.trim() && profile.address?.trim() && profile.phone?.trim() && profile.description?.trim());
}

async function requireHospital() {
  const auth = await getCurrentAuthAccount();

  if (!auth || auth.session.role !== "hospital") {
    return null;
  }

  const hospital = await resolveHospitalRecord(auth.account);
  return { auth, hospital };
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function nullableText(value: unknown) {
  const next = text(value);
  return next || null;
}

export async function GET() {
  const context = await requireHospital();

  if (!context) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { auth, hospital } = context;
    const [doctors, patients, appointments, bloodBanks, requests] = await Promise.all([
      prisma.doctor.findMany({
        where: { hospitalId: hospital.id },
        orderBy: [{ specialty: "asc" }, { name: "asc" }],
      }),
      prisma.patient.findMany({
        where: { hospitalId: hospital.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.appointment.findMany({
        where: { hospitalId: hospital.id },
        include: { doctor: true, user: true },
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
          OR: [
            { hospitalId: hospital.id },
            { requesterEmail: auth.account.email },
          ],
        },
        include: { bloodBank: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const requestStats = {
      pending: requests.filter((item: { status: string }) => item.status === "pending").length,
      approved: requests.filter((item: { status: string }) => item.status === "approved").length,
      rejected: requests.filter((item: { status: string }) => item.status === "rejected").length,
      delivered: requests.filter((item: { status: string }) => item.status === "delivered").length,
    };

    return Response.json({
      session: auth.session,
      hospital,
      doctors,
      patients,
      appointments,
      bloodBanks,
      requests,
      stats: {
        doctors: doctors.length,
        patients: patients.length,
        appointments: appointments.length,
        pendingAppointments: appointments.filter((item: { status: string }) => item.status === "pending").length,
        bloodRequests: requests.length,
        ...requestStats,
      },
    });
  } catch (error) {
    console.error("Failed to load hospital portal:", error);
    return Response.json({ error: "Failed to load hospital portal." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const context = await requireHospital();

  if (!context) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const action = text(body?.action || "profile");
    const { hospital } = context;

    if (action === "profile") {
      const specialties = Array.isArray(body?.specialties)
        ? body.specialties.map((item: unknown) => text(item)).filter(Boolean)
        : text(body?.specialties)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

      const profile = {
        city: nullableText(body?.city),
        state: nullableText(body?.state),
        address: nullableText(body?.address),
        pincode: nullableText(body?.pincode),
        phone: nullableText(body?.phone),
        website: nullableText(body?.website),
        description: nullableText(body?.description),
      };

      const updatedHospital = await prisma.hospital.update({
        where: { id: hospital.id },
        data: {
          ...profile,
          specialties,
          isOpen24Hours: Boolean(body?.isOpen24Hours),
          profileCompleted: profileComplete(profile),
        },
      });

      return Response.json({ ok: true, hospital: updatedHospital });
    }

    if (action === "doctor") {
      const doctorId = Number(body?.id);
      const name = text(body?.name);
      const specialty = text(body?.specialty || body?.specialization);

      if (!Number.isInteger(doctorId) || doctorId <= 0 || !name || !specialty) {
        return Response.json({ error: "Doctor name and specialization are required." }, { status: 400 });
      }

      const result = await prisma.doctor.updateMany({
        where: { id: doctorId, hospitalId: hospital.id },
        data: {
          name,
          specialty,
          department: nullableText(body?.department),
          contact: nullableText(body?.contact),
          available: text(body?.available) || "Availability update pending",
          experience: text(body?.experience) || "Experience update pending",
          qualification: text(body?.qualification) || "Qualification update pending",
          college: text(body?.college) || "Institution update pending",
          tags: [specialty],
          conditions: [specialty],
        },
      });

      if (result.count === 0) {
        return Response.json({ error: "Doctor not found for this hospital." }, { status: 404 });
      }

      const doctor = await prisma.doctor.findFirst({ where: { id: doctorId, hospitalId: hospital.id } });
      return Response.json({ ok: true, doctor });
    }

    return Response.json({ error: "Unsupported update action." }, { status: 400 });
  } catch (error) {
    console.error("Failed to update hospital portal:", error);
    return Response.json({ error: "Failed to update hospital portal." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const context = await requireHospital();

  if (!context) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { auth, hospital } = context;
    const body = await req.json();
    const action = text(body?.action || "blood-request");

    if (action === "doctor") {
      const name = text(body?.name);
      const specialty = text(body?.specialty || body?.specialization);

      if (!name || !specialty) {
        return Response.json({ error: "Doctor name and specialization are required." }, { status: 400 });
      }

      const doctor = await prisma.doctor.create({
        data: {
          name,
          specialty,
          department: nullableText(body?.department),
          contact: nullableText(body?.contact),
          available: text(body?.available) || "Mon-Fri, 10:00 AM - 4:00 PM",
          experience: text(body?.experience) || "Experience update pending",
          rating: 5,
          reviews: 0,
          qualification: text(body?.qualification) || "Qualification update pending",
          college: text(body?.college) || "Institution update pending",
          tags: [specialty],
          conditions: [specialty],
          hospitalId: hospital.id,
        },
      });

      return Response.json({ ok: true, doctor });
    }

    if (action === "patient") {
      const name = text(body?.name);

      if (!name) {
        return Response.json({ error: "Patient name is required." }, { status: 400 });
      }

      const age = Number(body?.age);
      const patient = await prisma.patient.create({
        data: {
          name,
          age: Number.isFinite(age) && age > 0 ? Math.floor(age) : null,
          gender: nullableText(body?.gender),
          phone: nullableText(body?.phone),
          email: nullableText(body?.email),
          address: nullableText(body?.address),
          bloodGroup: nullableText(body?.bloodGroup),
          primaryConcern: nullableText(body?.primaryConcern),
          hospitalId: hospital.id,
        },
      });

      return Response.json({ ok: true, patient });
    }

    if (action === "blood-request") {
      const bloodBankId = Number(body?.bloodBankId);
      const requestedUnits = Number(body?.requestedUnits);
      const requesterPhone = text(body?.requesterPhone || hospital.phone);
      const patientName = text(body?.patientName);
      const bloodType = text(body?.bloodType);
      const component = text(body?.component);
      const urgency = text(body?.urgency) || "routine";
      const reason = text(body?.reason);
      const requiredDateValue = text(body?.requiredDate);
      const requiredDate = requiredDateValue ? new Date(requiredDateValue) : null;
      const message = text(body?.message);

      if (!Number.isInteger(bloodBankId) || bloodBankId <= 0) {
        return Response.json({ error: "Select a blood bank." }, { status: 400 });
      }

      if (!bloodType || !component || !patientName || !requesterPhone || !Number.isFinite(requestedUnits) || requestedUnits <= 0) {
        return Response.json({ error: "Patient name, blood type, component, contact phone, and units are required." }, { status: 400 });
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
          urgency,
          reason: reason || null,
          requiredDate: requiredDate && !Number.isNaN(requiredDate.getTime()) ? requiredDate : null,
          message: message || reason || `Request sent by ${hospital.name}.`,
          bloodBankId,
          hospitalId: hospital.id,
          status: "pending",
        },
        include: { bloodBank: true },
      });

      return Response.json({ ok: true, request: requestRecord });
    }

    return Response.json({ error: "Unsupported create action." }, { status: 400 });
  } catch (error) {
    console.error("Failed to create hospital portal record:", error);
    return Response.json({ error: "Failed to create hospital portal record." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const context = await requireHospital();

  if (!context) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { hospital } = context;
    const body = await req.json();
    const action = text(body?.action);
    const id = Number(body?.id);

    if (action !== "doctor" || !Number.isInteger(id) || id <= 0) {
      return Response.json({ error: "Invalid delete request." }, { status: 400 });
    }

    const result = await prisma.doctor.deleteMany({
      where: { id, hospitalId: hospital.id },
    });

    if (result.count === 0) {
      return Response.json({ error: "Doctor not found for this hospital." }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete hospital portal record:", error);
    return Response.json({ error: "Failed to delete hospital portal record." }, { status: 500 });
  }
}
