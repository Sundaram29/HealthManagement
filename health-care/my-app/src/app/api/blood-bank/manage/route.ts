import { getCurrentAuthAccount } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

function normalizeInventoryEntries(inventory: unknown) {
  if (!Array.isArray(inventory)) {
    return [];
  }

  return inventory
    .map((entry) => {
      const item = entry as Record<string, unknown>;
      return {
        type: String(item.type ?? "").trim(),
        component: String(item.component ?? "").trim(),
        units: Number(item.units ?? 0),
      };
    })
    .filter((entry) => entry.type && entry.component)
    .map((entry) => ({
      ...entry,
      units: Number.isFinite(entry.units) && entry.units > 0 ? Math.floor(entry.units) : 0,
      available: Number.isFinite(entry.units) && entry.units > 0,
      lastUpdated: new Date(),
    }));
}

async function findOwnedBloodBank(accountId: string, fallbackName: string) {
  return prisma.bloodBank.findFirst({
    where: {
      OR: [
        { authAccountId: accountId },
        { authAccountId: null, hospitalName: fallbackName },
      ],
    },
    include: {
      bloodGroups: {
        orderBy: [{ type: "asc" }, { component: "asc" }],
      },
      requests: {
        include: {
          hospital: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function GET() {
  const auth = await getCurrentAuthAccount();

  if (!auth || auth.session.role !== "blood-bank") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bloodBank = await findOwnedBloodBank(auth.account.id, auth.account.name);
    return Response.json({
      bloodBank,
      session: auth.session,
    });
  } catch (error) {
    console.error("Failed to load blood bank portal:", error);
    return Response.json({ error: "Failed to load blood bank data." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await getCurrentAuthAccount();

  if (!auth || auth.session.role !== "blood-bank") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const profile = body?.profile ?? {};
    const inventory = normalizeInventoryEntries(body?.inventory);

    const hospitalName = String(profile.hospitalName ?? auth.account.name).trim();
    const state = String(profile.state ?? "").trim();
    const district = String(profile.district ?? "").trim();
    const address = String(profile.address ?? "").trim();
    const contact = String(profile.contact ?? "").trim();

    if (!hospitalName || !state || !district || !address || !contact) {
      return Response.json({ error: "Blood bank name, state, city/district, address, and contact are required." }, { status: 400 });
    }

    if (inventory.length === 0) {
      return Response.json({ error: "Add at least one blood inventory entry." }, { status: 400 });
    }

    const existing = await findOwnedBloodBank(auth.account.id, auth.account.name);

    const bloodBank = existing
      ? await prisma.bloodBank.update({
          where: { id: existing.id },
          data: {
            authAccountId: auth.account.id,
            hospitalName,
            state,
            district,
            address,
            contact,
            bloodGroups: {
              deleteMany: {},
              createMany: {
                data: inventory,
              },
            },
          },
          include: {
            bloodGroups: {
              orderBy: [{ type: "asc" }, { component: "asc" }],
            },
            requests: {
              include: {
                hospital: true,
              },
              orderBy: { createdAt: "desc" },
            },
          },
        })
      : await prisma.bloodBank.create({
          data: {
            authAccountId: auth.account.id,
            hospitalName,
            state,
            district,
            address,
            contact,
            bloodGroups: {
              createMany: {
                data: inventory,
              },
            },
          },
          include: {
            bloodGroups: {
              orderBy: [{ type: "asc" }, { component: "asc" }],
            },
            requests: {
              include: {
                hospital: true,
              },
              orderBy: { createdAt: "desc" },
            },
          },
        });

    return Response.json({ ok: true, bloodBank });
  } catch (error) {
    console.error("Failed to save blood bank data:", error);
    return Response.json({ error: "Failed to save blood bank data." }, { status: 500 });
  }
}
