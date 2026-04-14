import { prisma } from "./prisma";
import { parseAccountExtra, serializeAccountExtra } from "./accountMeta";

type AccountLike = {
  id: string;
  name: string;
  email: string;
  extra: string | null;
};

export async function resolveHospitalRecord(account: AccountLike) {
  const metadata = parseAccountExtra(account.extra);

  const hospital =
    (metadata?.hospitalId
      ? await prisma.hospital.findUnique({
          where: { id: metadata.hospitalId },
        })
      : null) ??
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
        username: account.email.replace(/[^a-z0-9]+/gi, "-").toLowerCase(),
        description: "Complete your hospital profile to appear in public searches.",
        specialties: [],
        profileCompleted: false,
      },
    }));

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

  return hospital;
}

export async function resolveDoctorRecord(account: AccountLike) {
  const metadata = parseAccountExtra(account.extra);

  const doctor =
    (metadata?.doctorId
      ? await prisma.doctor.findUnique({
          where: { id: metadata.doctorId },
          include: {
            hospital: true,
          },
        })
      : null) ??
    (await prisma.doctor.findFirst({
      where: {
        name: account.name,
        specialty: metadata?.specialty ?? metadata?.label ?? undefined,
      },
      include: {
        hospital: true,
      },
      orderBy: { id: "asc" },
    }));

  if (!doctor) {
    return null;
  }

  const nextExtra = serializeAccountExtra({
    label: metadata?.specialty ?? metadata?.label ?? doctor.specialty,
    specialty: metadata?.specialty ?? metadata?.label ?? doctor.specialty,
    hospitalId: doctor.hospitalId,
    doctorId: doctor.id,
  });

  if (nextExtra !== account.extra) {
    await prisma.authAccount.update({
      where: { id: account.id },
      data: { extra: nextExtra },
    });
  }

  return doctor;
}
