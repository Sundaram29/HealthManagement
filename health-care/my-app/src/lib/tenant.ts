import { prisma } from "./prisma";

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function codeFromId(id: number) {
  return `HSP-${String(id).padStart(5, "0")}`;
}

async function uniqueSlug(base: string, id: number) {
  const seed = slugify(base) || "hospital";
  let candidate = seed;
  let suffix = 2;

  while (true) {
    const existing = await prisma.hospital.findFirst({
      where: {
        slug: candidate,
        NOT: { id },
      },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${seed}-${suffix}`;
    suffix += 1;
  }
}

export async function ensureHospitalIdentity(hospital: {
  id: number;
  name: string;
  code?: string | null;
  slug?: string | null;
}) {
  const code = hospital.code || codeFromId(hospital.id);
  const slug = hospital.slug || (await uniqueSlug(hospital.name, hospital.id));

  if (code === hospital.code && slug === hospital.slug) {
    return hospital;
  }

  return prisma.hospital.update({
    where: { id: hospital.id },
    data: { code, slug },
  });
}
