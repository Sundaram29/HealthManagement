import { prisma } from "../../../lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const hospitalId = searchParams.get("hospitalId");
    const specialty = searchParams.get("specialty");
    const query = searchParams.get("query");

    const doctors = await prisma.doctor.findMany({
      where: {
        hospitalId: hospitalId ? parseInt(hospitalId) : undefined,
        specialty: specialty
          ? {
              contains: specialty,
              mode: "insensitive",
            }
          : undefined,
        OR: query
          ? [
              {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                specialty: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                conditions: {
                  has: query,
                },
              },
            ]
          : undefined,
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: [{ specialty: "asc" }, { rating: "desc" }, { name: "asc" }],
    });

    return Response.json({ doctors });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
