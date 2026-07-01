import { prisma } from "../../../../lib/prisma";
import { parseAccountExtra, serializeAccountExtra } from "../../../../lib/accountMeta";
import { setAuthSession, verifyPassword, type SessionPayload } from "../../../../lib/auth";
import { ensureHospitalIdentity, slugify } from "../../../../lib/tenant";

function mapRole(role: string) {
  return role === "blood-bank" ? "blood_bank" : role;
}

async function ensureHospitalExtra(account: {
  id: string;
  extra: string | null;
  name: string;
  email: string;
}) {
  const metadata = parseAccountExtra(account.extra);

  if (metadata?.hospitalId) {
    return account.extra;
  }

  const hospitalRecord =
    (await prisma.hospital.findFirst({
      where: {
        OR: [
          { email: account.email },
          { name: account.name },
        ],
      },
      orderBy: { id: "asc" },
    })) ??
    (await prisma.hospital.create({
      data: {
        name: account.name,
        email: account.email,
        username: slugify(account.email),
        description: "Complete your hospital profile to appear in public searches.",
        specialties: [],
        profileCompleted: false,
      },
    }));
  const hospital = await ensureHospitalIdentity(hospitalRecord);

  const nextExtra = serializeAccountExtra({
    label: metadata?.label ?? account.extra,
    licenseId: metadata?.licenseId ?? metadata?.label ?? account.extra,
    hospitalId: hospital.id,
  });

  if (nextExtra !== account.extra) {
    await prisma.authAccount.update({
      where: { id: account.id },
      data: { extra: nextExtra },
    });
  }

  return nextExtra;
}

async function ensureDoctorExtra(account: {
  id: string;
  extra: string | null;
  name: string;
}) {
  const metadata = parseAccountExtra(account.extra);

  if (metadata?.doctorId) {
    return account.extra;
  }

  const specialty = metadata?.specialty ?? metadata?.label ?? account.extra ?? "General Medicine";
  const doctor = await prisma.doctor.findFirst({
    where: {
      name: account.name,
      specialty,
    },
    orderBy: { id: "asc" },
  });

  if (!doctor) {
    return account.extra;
  }

  const nextExtra = serializeAccountExtra({
    label: specialty,
    specialty,
    doctorId: doctor.id,
    hospitalId: doctor.hospitalId,
  });

  if (nextExtra !== account.extra) {
    await prisma.authAccount.update({
      where: { id: account.id },
      data: { extra: nextExtra },
    });
  }

  return nextExtra;
}

export async function POST(req: Request) {
  try {
    const { role, email, password } = await req.json();

    if (!role || !email || !password) {
      return Response.json({ error: "Email and password required." }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRole = mapRole(String(role).trim());

    const account = await prisma.authAccount.findFirst({
      where: {
        email: normalizedEmail,
        role: normalizedRole,
      },
    });

    if (!account) {
      return Response.json({ error: "Invalid login credentials." }, { status: 401 });
    }

    const validPassword = await verifyPassword(String(password), account.passwordHash);

    if (!validPassword) {
      return Response.json({ error: "Invalid login credentials." }, { status: 401 });
    }

    let resolvedExtra = account.extra;

    if (normalizedRole === "user") {
      await prisma.user.upsert({
        where: { id: account.id },
        update: {
          email: account.email,
          name: account.name,
        },
        create: {
          id: account.id,
          email: account.email,
          name: account.name,
        },
      });
    }

    if (normalizedRole === "hospital") {
      resolvedExtra = await ensureHospitalExtra(account);
    }

    if (normalizedRole === "doctor") {
      resolvedExtra = await ensureDoctorExtra(account);
    }

    const session: SessionPayload = {
      id: account.id,
      role: String(role).trim() as SessionPayload["role"],
      email: account.email,
      name: account.name,
      extra: resolvedExtra,
    };

    await setAuthSession(session);

    return Response.json({ ok: true, session });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to login." }, { status: 500 });
  }
}
