import { BLOOD_TYPES } from "../../../lib/blood";
import { getCurrentAuthAccount } from "../../../lib/auth";
import { parseAccountExtra } from "../../../lib/accountMeta";
import { prisma } from "../../../lib/prisma";

const CENTRE_TYPES = new Set(["HOSPITAL", "STANDALONE_BLOOD_BANK"]);

type InventoryEntry = {
  type: string;
  component: string;
  units: number;
  available: boolean;
  lastUpdated: Date;
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeCentreType(value: unknown) {
  const centreType = clean(value).toUpperCase();
  return CENTRE_TYPES.has(centreType) ? centreType : "STANDALONE_BLOOD_BANK";
}

function normalizeUnits(value: unknown) {
  const units = Number(value ?? 0);
  return Number.isFinite(units) && units > 0 ? Math.floor(units) : 0;
}

function normalizeInventory(body: Record<string, unknown>) {
  const rawInventory = body.inventory;

  if (Array.isArray(rawInventory)) {
    return rawInventory
      .map((entry) => {
        const row = entry as Record<string, unknown>;
        const units = normalizeUnits(row.units);

        return {
          type: clean(row.type),
          component: clean(row.component) || "Whole Blood",
          units,
          available: units > 0,
          lastUpdated: new Date(),
        };
      })
      .filter((entry): entry is InventoryEntry => BLOOD_TYPES.includes(entry.type as (typeof BLOOD_TYPES)[number]));
  }

  const stock = (body.stock ?? {}) as Record<string, unknown>;

  return BLOOD_TYPES.map((type) => {
    const units = normalizeUnits(stock[type]);

    return {
      type,
      component: "Whole Blood",
      units,
      available: units > 0,
      lastUpdated: new Date(),
    };
  });
}

export async function POST(req: Request) {
  try {
    const auth = await getCurrentAuthAccount();
    const body = (await req.json()) as Record<string, unknown>;

    const centreType = normalizeCentreType(body.type ?? body.centreType);
    const name = clean(body.name ?? body.hospitalName);
    const state = clean(body.state);
    const district = clean(body.district);
    const city = clean(body.city);
    const address = clean(body.address);
    const contact = clean(body.contact ?? body.phone);
    const inventory = normalizeInventory(body);

    if (!name || !state || !district || !city || !address || !contact) {
      return Response.json(
        { error: "Name, state, district, city, address, and contact details are required." },
        { status: 400 },
      );
    }

    if (inventory.length === 0) {
      return Response.json({ error: "At least one valid blood stock row is required." }, { status: 400 });
    }

    const extra = parseAccountExtra(auth?.account.extra);
    const linkedHospitalId = Number(body.hospitalId ?? extra?.hospitalId);
    const hospitalId = Number.isInteger(linkedHospitalId) && linkedHospitalId > 0 ? linkedHospitalId : null;
    const authAccountId = auth?.session.role === "blood-bank" ? auth.account.id : null;

    const existing = await prisma.bloodBank.findFirst({
      where: {
        OR: [
          authAccountId ? { authAccountId } : undefined,
          hospitalId ? { hospitalId } : undefined,
          { hospitalName: name, state, district, address },
        ].filter(Boolean) as object[],
      },
      select: { id: true },
    });

    const bloodCentre = existing
      ? await prisma.bloodBank.update({
          where: { id: existing.id },
          data: {
            centreType,
            hospitalName: name,
            state,
            district,
            city,
            address,
            contact,
            ...(authAccountId ? { authAccountId } : {}),
            ...(hospitalId ? { hospitalId } : {}),
            bloodGroups: {
              deleteMany: {},
              createMany: { data: inventory },
            },
          },
          include: { bloodGroups: true, hospital: true },
        })
      : await prisma.bloodBank.create({
          data: {
            centreType,
            hospitalName: name,
            state,
            district,
            city,
            address,
            contact,
            ...(authAccountId ? { authAccountId } : {}),
            ...(hospitalId ? { hospitalId } : {}),
            bloodGroups: {
              createMany: { data: inventory },
            },
          },
          include: { bloodGroups: true, hospital: true },
        });

    if (auth?.session.role === "hospital" && hospitalId) {
      await prisma.hospital.update({
        where: { id: hospitalId },
        data: {
          name,
          state,
          city,
          address,
          phone: contact,
          profileCompleted: true,
        },
      });
    }

    return Response.json({ ok: true, bloodCentre }, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("Failed to save blood centre:", error);
    return Response.json({ error: "Failed to save blood centre registration." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const centres = await prisma.bloodBank.findMany({
      orderBy: [{ state: "asc" }, { district: "asc" }, { hospitalName: "asc" }],
      select: {
        id: true,
        centreType: true,
        hospitalName: true,
        state: true,
        district: true,
        city: true,
        address: true,
        contact: true,
      },
    });

    return Response.json({ centres });
  } catch (error) {
    console.error("Failed to fetch blood centres:", error);
    return Response.json({ error: "Failed to fetch blood centres." }, { status: 500 });
  }
}
