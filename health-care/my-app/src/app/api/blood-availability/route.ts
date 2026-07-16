import { BLOOD_TYPES } from "../../../lib/blood";
import { prisma } from "../../../lib/prisma";

type BloodStockRow = {
  type: string;
  component: string;
  units: number;
  available: boolean;
  lastUpdated: Date;
};

type BloodCentreRow = {
  id: number;
  centreType: string;
  hospitalName: string;
  state: string;
  district: string;
  city: string;
  address: string;
  contact: string;
  bloodGroups: BloodStockRow[];
};

function clean(value: string | null) {
  return String(value ?? "").trim();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const state = clean(searchParams.get("state"));
    const district = clean(searchParams.get("district"));
    const bloodGroup = clean(searchParams.get("bloodGroup"));
    const component = clean(searchParams.get("component"));

    if (bloodGroup && !BLOOD_TYPES.includes(bloodGroup as (typeof BLOOD_TYPES)[number])) {
      return Response.json({ error: "Invalid blood group." }, { status: 400 });
    }

    const centres = (await prisma.bloodBank.findMany({
      where: {
        ...(state ? { state } : {}),
        ...(district ? { district } : {}),
        ...(bloodGroup
          ? {
              bloodGroups: {
                some: {
                  type: bloodGroup,
                  ...(component ? { component } : {}),
                  units: { gt: 0 },
                  available: true,
                },
              },
            }
          : {}),
      },
      include: {
        bloodGroups: {
          where: {
            ...(bloodGroup ? { type: bloodGroup } : {}),
            ...(component ? { component } : {}),
          },
          orderBy: [{ type: "asc" }, { component: "asc" }],
        },
      },
      orderBy: [{ state: "asc" }, { district: "asc" }, { hospitalName: "asc" }],
    })) as BloodCentreRow[];

    const results = centres.map((centre) => {
      const matchingStock = centre.bloodGroups.filter((stock) => (bloodGroup ? stock.type === bloodGroup : true));
      const unitsAvailable = matchingStock.reduce((sum, stock) => sum + Math.max(0, stock.units), 0);
      const latestUpdate = matchingStock.reduce<Date | null>((latest, stock) => {
        if (!latest || stock.lastUpdated > latest) {
          return stock.lastUpdated;
        }

        return latest;
      }, null);

      return {
        id: centre.id,
        name: centre.hospitalName,
        type: centre.centreType,
        state: centre.state,
        district: centre.district,
        city: centre.city,
        address: centre.address,
        contact: centre.contact,
        bloodGroup: bloodGroup || "All",
        unitsAvailable,
        stock: matchingStock,
        lastUpdated: latestUpdate,
      };
    });

    return Response.json({ results });
  } catch (error) {
    console.error("Blood availability API error:", error);
    return Response.json({ error: "Failed to fetch blood availability." }, { status: 500 });
  }
}
