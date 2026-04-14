import { prisma } from "../../../../lib/prisma";
import { serializeAccountExtra } from "../../../../lib/accountMeta";
import { hashPassword, setAuthSession, type SessionPayload } from "../../../../lib/auth";

function normalizeRole(role: string) {
  return role === "blood-bank" ? "blood_bank" : role;
}

export async function POST(req: Request) {
  try {
    const { role, name, email, password, extra, hospitalId } = await req.json();

    if (!role || !name || !email || !password) {
      return Response.json({ error: "Required fields are missing." }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRole = normalizeRole(String(role).trim());

    const existing = await prisma.authAccount.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existing) {
      return Response.json({ error: "Account already exists with this email." }, { status: 409 });
    }

    const passwordHash = await hashPassword(String(password));

    const normalizedName = String(name).trim();
    const extraValue = extra ? String(extra).trim() : null;
    const selectedHospitalId = Number(hospitalId);

    if (normalizedRole === "blood_bank" && !extraValue) {
      return Response.json({ error: "License or center ID is required." }, { status: 400 });
    }

    const account = await prisma.$transaction(async (tx: any) => {
      const createdAccount = await tx.authAccount.create({
        data: {
          role: normalizedRole,
          name: normalizedName,
          email: normalizedEmail,
          passwordHash,
          extra:
            normalizedRole === "blood_bank"
              ? extraValue
              : null,
        },
      });

      if (normalizedRole === "user") {
        await tx.user.create({
          data: {
            id: createdAccount.id,
            email: createdAccount.email,
            name: createdAccount.name,
          },
        });

        return createdAccount;
      }

      if (normalizedRole === "hospital") {
        const hospitalRecord = await tx.hospital.create({
          data: {
            name: normalizedName,
            email: normalizedEmail,
            username: normalizedEmail.replace(/[^a-z0-9]+/gi, "-").toLowerCase(),
            description: "Complete your hospital profile to appear in public searches.",
            specialties: [],
            profileCompleted: false,
          },
        });

        return tx.authAccount.update({
          where: { id: createdAccount.id },
          data: {
            extra: serializeAccountExtra({
              label: extraValue,
              licenseId: extraValue,
              hospitalId: hospitalRecord.id,
            }),
          },
        });
      }

      if (normalizedRole === "doctor") {
        if (!Number.isInteger(selectedHospitalId) || selectedHospitalId <= 0) {
          throw new Error("DOCTOR_HOSPITAL_REQUIRED");
        }

        const hospitalRecord = await tx.hospital.findUnique({
          where: { id: selectedHospitalId },
          select: { id: true },
        });

        if (!hospitalRecord) {
          throw new Error("HOSPITAL_NOT_FOUND");
        }

        const specialty = extraValue || "General Medicine";
        const doctorRecord = await tx.doctor.create({
          data: {
            name: normalizedName,
            specialty,
            experience: "Experience update pending",
            rating: 5,
            reviews: 0,
            qualification: "Qualification update pending",
            college: "Institution update pending",
            tags: [specialty],
            available: "Mon-Fri, 10:00 AM - 4:00 PM",
            conditions: [specialty],
            hospitalId: hospitalRecord.id,
          },
        });

        return tx.authAccount.update({
          where: { id: createdAccount.id },
          data: {
            extra: serializeAccountExtra({
              label: specialty,
              specialty,
              hospitalId: hospitalRecord.id,
              doctorId: doctorRecord.id,
            }),
          },
        });
      }

      return createdAccount;
    });

    const session: SessionPayload = {
      id: account.id,
      role: String(role).trim() as SessionPayload["role"],
      email: account.email,
      name: account.name,
      extra: account.extra,
    };

    await setAuthSession(session);

    return Response.json({ ok: true, session });
  } catch (error) {
    if (error instanceof Error && error.message === "DOCTOR_HOSPITAL_REQUIRED") {
      return Response.json({ error: "Select a hospital before creating a doctor account." }, { status: 400 });
    }

    if (error instanceof Error && error.message === "HOSPITAL_NOT_FOUND") {
      return Response.json({ error: "Selected hospital was not found." }, { status: 404 });
    }

    console.error(error);
    return Response.json({ error: "Failed to register account." }, { status: 500 });
  }
}
